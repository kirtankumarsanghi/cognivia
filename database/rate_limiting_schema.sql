-- Rate Limiting and Anti-Gaming Schema
-- This schema supports the anti-gaming rate limits feature

-- 1. Rate Limit Violations Table
CREATE TABLE IF NOT EXISTS public.rate_limit_violations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  concept_id UUID REFERENCES public.concepts(id) ON DELETE CASCADE,
  violation_type TEXT NOT NULL CHECK (violation_type IN ('cooldown_violation', 'spam_detection', 'coordinated_spike')),
  details JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying violations by student and time
CREATE INDEX IF NOT EXISTS idx_rate_limit_violations_student 
  ON public.rate_limit_violations(student_id, created_at DESC);

-- Index for querying violations by type
CREATE INDEX IF NOT EXISTS idx_rate_limit_violations_type 
  ON public.rate_limit_violations(violation_type, created_at DESC);

-- 2. Practice Attempts Enhanced (add weight column for diminishing returns)
ALTER TABLE public.practice_attempts 
  ADD COLUMN IF NOT EXISTS weight NUMERIC(3,2) DEFAULT 1.0 CHECK (weight >= 0.1 AND weight <= 1.0);

-- Add index for recent attempts lookup (used by anti-gaming middleware)
CREATE INDEX IF NOT EXISTS idx_practice_attempts_recent 
  ON public.practice_attempts(student_id, concept_id, created_at DESC);

-- 3. Rate Limit Configuration Table (for dynamic config)
CREATE TABLE IF NOT EXISTS public.rate_limit_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default configuration
INSERT INTO public.rate_limit_config (config_key, config_value) 
VALUES 
  ('cooldown_seconds', '{"value": 5, "description": "Minimum seconds between attempts"}'::jsonb),
  ('diminishing_window_seconds', '{"value": 60, "description": "Time window for diminishing returns calculation"}'::jsonb),
  ('max_attempts_in_window', '{"value": 10, "description": "Maximum attempts allowed in the diminishing window"}'::jsonb),
  ('spike_threshold', '{"value": 50, "description": "Global attempts per minute threshold for anomaly detection"}'::jsonb)
ON CONFLICT (config_key) DO NOTHING;

-- 4. View for monitoring suspicious activity
CREATE OR REPLACE VIEW public.suspicious_activity AS
SELECT 
  v.student_id,
  p.name as student_name,
  p.email,
  COUNT(*) as violation_count,
  ARRAY_AGG(DISTINCT v.violation_type) as violation_types,
  MAX(v.created_at) as last_violation,
  MIN(v.created_at) as first_violation
FROM public.rate_limit_violations v
JOIN public.profiles p ON v.student_id = p.id
WHERE v.created_at > NOW() - INTERVAL '24 hours'
GROUP BY v.student_id, p.name, p.email
HAVING COUNT(*) >= 5
ORDER BY violation_count DESC;

-- 5. View for anomaly spike monitoring
CREATE OR REPLACE VIEW public.anomaly_spikes AS
SELECT 
  DATE_TRUNC('minute', created_at) as spike_time,
  COUNT(*) as violation_count,
  COUNT(DISTINCT student_id) as affected_students
FROM public.rate_limit_violations
WHERE violation_type = 'coordinated_spike'
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY DATE_TRUNC('minute', created_at)
ORDER BY spike_time DESC;

-- 6. Function to get student rate limit stats
CREATE OR REPLACE FUNCTION public.get_student_rate_limit_stats(
  p_student_id UUID,
  p_time_window INTERVAL DEFAULT INTERVAL '1 hour'
)
RETURNS TABLE(
  total_attempts BIGINT,
  violation_count BIGINT,
  avg_time_between_attempts NUMERIC,
  spam_violations BIGINT,
  cooldown_violations BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT pa.id) as total_attempts,
    COUNT(DISTINCT v.id) as violation_count,
    CASE 
      WHEN COUNT(pa.id) > 1 THEN 
        EXTRACT(EPOCH FROM (MAX(pa.created_at) - MIN(pa.created_at))) / (COUNT(pa.id) - 1)
      ELSE 0
    END as avg_time_between_attempts,
    COUNT(DISTINCT v.id) FILTER (WHERE v.violation_type = 'spam_detection') as spam_violations,
    COUNT(DISTINCT v.id) FILTER (WHERE v.violation_type = 'cooldown_violation') as cooldown_violations
  FROM public.practice_attempts pa
  LEFT JOIN public.rate_limit_violations v ON v.student_id = pa.student_id 
    AND v.created_at > NOW() - p_time_window
  WHERE pa.student_id = p_student_id
    AND pa.created_at > NOW() - p_time_window;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE public.rate_limit_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Students can view their own violations
CREATE POLICY "Students can view own violations" 
  ON public.rate_limit_violations 
  FOR SELECT 
  USING (auth.uid() = student_id);

-- Educators and admins can view all violations
CREATE POLICY "Educators can view all violations" 
  ON public.rate_limit_violations 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('educator', 'admin')
    )
  );

-- System can insert violations (service role)
CREATE POLICY "System can insert violations" 
  ON public.rate_limit_violations 
  FOR INSERT 
  WITH CHECK (true);

-- All authenticated users can read config
CREATE POLICY "All authenticated can read config" 
  ON public.rate_limit_config 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Only admins can update config
CREATE POLICY "Admins can update config" 
  ON public.rate_limit_config 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Comments for documentation
COMMENT ON TABLE public.rate_limit_violations IS 'Stores all rate limit violations for anti-gaming monitoring';
COMMENT ON TABLE public.rate_limit_config IS 'Dynamic configuration for rate limiting parameters';
COMMENT ON VIEW public.suspicious_activity IS 'Shows students with multiple violations in the last 24 hours';
COMMENT ON VIEW public.anomaly_spikes IS 'Shows coordinated spike events in the last hour';
COMMENT ON FUNCTION public.get_student_rate_limit_stats IS 'Returns rate limiting statistics for a student';
