-- Migration 003: Moment-Linked Recap Feature
-- Adds support for timestamp-linked confusion signals and lecture moments

-- 1. Create class_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.class_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  educator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Add lecture_timestamp_seconds column to confusion_signals
ALTER TABLE public.confusion_signals 
ADD COLUMN IF NOT EXISTS lecture_timestamp_seconds INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.class_sessions(id) ON DELETE SET NULL;

-- 3. Create lecture_moments table for educator's manual moment tagging
CREATE TABLE IF NOT EXISTS public.lecture_moments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.class_sessions(id) ON DELETE CASCADE,
  timestamp_seconds INTEGER NOT NULL,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_class_sessions_course ON public.class_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_educator ON public.class_sessions(educator_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_started ON public.class_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_confusion_signals_session ON public.confusion_signals(session_id);
CREATE INDEX IF NOT EXISTS idx_confusion_signals_timestamp ON public.confusion_signals(lecture_timestamp_seconds);
CREATE INDEX IF NOT EXISTS idx_lecture_moments_session ON public.lecture_moments(session_id);
CREATE INDEX IF NOT EXISTS idx_lecture_moments_timestamp ON public.lecture_moments(timestamp_seconds);

-- Enable RLS for new tables
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lecture_moments ENABLE ROW LEVEL SECURITY;

-- RLS policies for class_sessions
CREATE POLICY "Allow all authenticated read" ON public.class_sessions 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow educator create own" ON public.class_sessions 
  FOR INSERT WITH CHECK (auth.uid() = educator_id);

CREATE POLICY "Allow educator update own" ON public.class_sessions 
  FOR UPDATE USING (auth.uid() = educator_id);

-- RLS policies for lecture_moments
CREATE POLICY "Allow all authenticated read" ON public.lecture_moments 
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow educators insert" ON public.lecture_moments 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.class_sessions 
      WHERE id = session_id AND educator_id = auth.uid()
    )
  );

CREATE POLICY "Allow educators update own" ON public.lecture_moments 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.class_sessions 
      WHERE id = session_id AND educator_id = auth.uid()
    )
  );

-- Add comment for documentation
COMMENT ON TABLE public.class_sessions IS 'Live lecture sessions for tracking moment-linked confusion signals';
COMMENT ON TABLE public.lecture_moments IS 'Educator-tagged moments during live sessions with contextual labels';
COMMENT ON COLUMN public.confusion_signals.lecture_timestamp_seconds IS 'Seconds elapsed from session start when confusion signal was raised';
COMMENT ON COLUMN public.confusion_signals.session_id IS 'Reference to the active class session if signal was raised during live lecture';
