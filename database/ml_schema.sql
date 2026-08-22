-- ML Layer Schema Additions

-- 1. User Learning Profiles (Stores clustering & risk ensemble outputs)
CREATE TABLE public.user_learning_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  learning_pattern TEXT NOT NULL,         -- Cluster name (e.g., 'Fast Mastery')
  confidence_score FLOAT NOT NULL,        -- Model confidence in cluster
  risk_score FLOAT NOT NULL,              -- Ensemble risk score (0-100)
  at_risk BOOLEAN NOT NULL DEFAULT false, -- If risk_score >= 70
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)                         -- One profile per user
);

-- 2. Concept Difficulties (Stores aggregated difficulty ratings)
CREATE TABLE public.concept_difficulties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concept_id UUID REFERENCES public.concepts(id) ON DELETE CASCADE,
  difficulty_score FLOAT NOT NULL,        -- 0-100
  average_time FLOAT NOT NULL,            -- In seconds
  confusion_frequency FLOAT NOT NULL,     -- Normalised frequency
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(concept_id)                      -- One score per concept
);

-- 3. ML Predictions Log (For audit, offline evaluation, and retraining)
CREATE TABLE public.ml_predictions_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_name TEXT NOT NULL,
  entity_id UUID,                         -- ID of user or concept involved
  input_data JSONB NOT NULL,
  output_data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security (RLS) Enablement

ALTER TABLE public.user_learning_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concept_difficulties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_predictions_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- user_learning_profiles: Users can view their own; Educators can view all students in their courses
CREATE POLICY "Users can view their own learning profile"
  ON public.user_learning_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Educators can view all learning profiles"
  ON public.user_learning_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'educator'
    )
  );

-- ML Service (Service Role) bypassing RLS handles INSERT/UPDATE operations, so we don't need
-- explicit policies for them as long as we use the service role key from the backend.

-- concept_difficulties: Anyone can read
CREATE POLICY "Anyone can read concept difficulties"
  ON public.concept_difficulties FOR SELECT
  USING (true);

-- ml_predictions_log: Only admins/educators can view
CREATE POLICY "Educators can view prediction logs"
  ON public.ml_predictions_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('educator', 'admin')
    )
  );
