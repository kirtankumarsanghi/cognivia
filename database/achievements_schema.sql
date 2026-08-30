-- Achievements System Schema
-- Add this to your existing database after schema.sql

-- 16. Achievements Definition Table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE, -- unique identifier like 'first_lesson', 'ml_explorer'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL, -- material icon name
  category TEXT NOT NULL CHECK (category IN ('learning', 'practice', 'ml_insights', 'mastery', 'engagement', 'social')),
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  points INTEGER NOT NULL DEFAULT 10,
  criteria JSONB NOT NULL, -- stores unlock conditions
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. Student Achievements (unlocked achievements per student)
CREATE TABLE IF NOT EXISTS public.student_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  progress JSONB DEFAULT '{}', -- tracks partial progress toward achievement
  UNIQUE(student_id, achievement_id)
);

-- 18. ML Insights Tracking (for ML-driven achievements)
CREATE TABLE IF NOT EXISTS public.ml_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('profile', 'early_warning', 'confusion_risk', 'recommendation', 'concept_difficulty', 'learning_risk', 'nlp')),
  model_name TEXT NOT NULL,
  result JSONB NOT NULL,
  confidence NUMERIC(5,4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_insights ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read achievements
CREATE POLICY "Allow all authenticated read achievements" ON public.achievements 
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow users to read their own unlocked achievements
CREATE POLICY "Allow user read own achievements" ON public.student_achievements 
  FOR SELECT USING (auth.uid() = student_id);

-- Allow users to insert their own achievements (when unlocked by backend)
CREATE POLICY "Allow user insert own achievements" ON public.student_achievements 
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Allow users to read their own ML insights
CREATE POLICY "Allow user read own insights" ON public.ml_insights 
  FOR SELECT USING (auth.uid() = student_id);

-- Allow users to insert their own ML insights
CREATE POLICY "Allow user insert own insights" ON public.ml_insights 
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Seed initial achievements
INSERT INTO public.achievements (code, title, description, icon, category, rarity, points, criteria) VALUES
  ('first_lesson', 'First Steps', 'Complete your first lesson.', 'star', 'learning', 'common', 10, '{"type": "lesson_complete", "count": 1}'),
  ('confusion_clearer', 'Confusion Clearer', 'Resolve a confusion signal using the AI Tutor.', 'psychology', 'learning', 'common', 15, '{"type": "tutor_usage", "count": 1}'),
  ('streak_7', '7-Day Streak', 'Log in and study for 7 days in a row.', 'local_fire_department', 'engagement', 'rare', 50, '{"type": "streak", "days": 7}'),
  ('mastery_100', 'Master of Algorithms', 'Score 100% mastery in any module.', 'workspace_premium', 'mastery', 'epic', 100, '{"type": "mastery_perfect", "threshold": 100}'),
  ('ml_explorer', 'ML Explorer', 'Run your first ML insight analysis.', 'memory', 'ml_insights', 'common', 20, '{"type": "ml_run", "count": 1}'),
  ('ml_enthusiast', 'ML Enthusiast', 'Run all 6 ML models at least once.', 'smart_toy', 'ml_insights', 'rare', 75, '{"type": "ml_all_models", "count": 6}'),
  ('risk_aware', 'Risk Aware', 'Check your early warning risk score.', 'crisis_alert', 'ml_insights', 'common', 15, '{"type": "ml_early_warning', "count": 1}'),
  ('profile_discovered', 'Self-Aware Learner', 'Discover your cognitive learning profile.', 'account_circle', 'ml_insights', 'common', 15, '{"type": "ml_profile", "count": 1}'),
  ('practice_champion', 'Practice Champion', 'Complete 50 practice questions.', 'fitness_center', 'practice', 'rare', 60, '{"type": "practice_complete", "count": 50}'),
  ('perfect_practice', 'Perfect Practice', 'Score 100% on 10 practice sessions.', 'stars', 'practice', 'epic', 80, '{"type": "practice_perfect", "count": 10}'),
  ('revision_master', 'Revision Master', 'Complete 20 revision plans.', 'library_books', 'learning', 'rare', 50, '{"type": "revision_complete", "count": 20}'),
  ('confusion_conquered', 'Confusion Conquered', 'Resolve 10 confusion signals.', 'check_circle', 'learning', 'rare', 40, '{"type": "confusion_resolved', "count": 10}'),
  ('knowledge_seeker', 'Knowledge Seeker', 'Ask the AI Tutor 25 questions.', 'help', 'learning', 'rare', 35, '{"type": "tutor_questions", "count": 25}'),
  ('early_bird', 'Early Bird', 'Study before 7 AM.', 'wb_sunny', 'engagement', 'rare', 30, '{"type": "time_of_day", "hour_before": 7}'),
  ('night_owl', 'Night Owl', 'Study after 10 PM.', 'nights_stay', 'engagement', 'rare', 30, '{"type": "time_of_day", "hour_after": 22}'),
  ('mastery_80_plus', 'Proficient Scholar', 'Reach 80%+ mastery on 10 concepts.', 'school', 'mastery', 'rare', 55, '{"type": "mastery_threshold", "threshold": 80, "count": 10}')
ON CONFLICT (code) DO NOTHING;

-- Function to check and unlock achievements
CREATE OR REPLACE FUNCTION check_and_unlock_achievement(
  p_student_id UUID,
  p_achievement_code TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_achievement_id UUID;
  v_already_unlocked BOOLEAN;
BEGIN
  -- Get achievement ID
  SELECT id INTO v_achievement_id
  FROM public.achievements
  WHERE code = p_achievement_code;

  IF v_achievement_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if already unlocked
  SELECT EXISTS(
    SELECT 1 FROM public.student_achievements
    WHERE student_id = p_student_id AND achievement_id = v_achievement_id
  ) INTO v_already_unlocked;

  IF v_already_unlocked THEN
    RETURN FALSE;
  END IF;

  -- Unlock achievement
  INSERT INTO public.student_achievements (student_id, achievement_id)
  VALUES (p_student_id, v_achievement_id);

  -- Create notification
  INSERT INTO public.notifications (user_id, type, message, read)
  VALUES (
    p_student_id,
    'achievement',
    (SELECT 'Achievement Unlocked: ' || title || '! +' || points || ' points' FROM public.achievements WHERE id = v_achievement_id),
    FALSE
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Index for performance
CREATE INDEX idx_student_achievements_student ON public.student_achievements(student_id);
CREATE INDEX idx_ml_insights_student ON public.ml_insights(student_id);
CREATE INDEX idx_ml_insights_type ON public.ml_insights(insight_type);
