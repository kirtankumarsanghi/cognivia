-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'educator', 'admin')),
  avatar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Courses
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  educator_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Lessons
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Concepts
CREATE TABLE public.concepts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Concept Dependencies (Graph)
CREATE TABLE public.concept_dependencies (
  concept_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  prerequisite_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  PRIMARY KEY (concept_id, prerequisite_id)
);

-- 6. Confusion Signals
CREATE TABLE public.confusion_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  concept_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  signal TEXT NOT NULL CHECK (signal IN ('Confused', 'Partially Clear', 'Clear')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Mastery Scores
CREATE TABLE public.mastery_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  concept_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  score NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, concept_id)
);

-- 8. AI Conversations
CREATE TABLE public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  concept_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer JSONB NOT NULL, -- structured response
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Revision Plans
CREATE TABLE public.revision_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  concept_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  priority TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High')),
  minutes INTEGER NOT NULL DEFAULT 5,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, concept_id)
);

-- 10. Practice Attempts
CREATE TABLE public.practice_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  concept_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  correct BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Learning Sessions (track engagement)
CREATE TABLE public.learning_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('lesson', 'practice', 'revision', 'tutor')),
  duration_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Saved Explanations
CREATE TABLE public.saved_explanations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  concept_id UUID REFERENCES public.concepts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Course Enrollments
CREATE TABLE public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

-- 15. Practice Questions (seeded content)
CREATE TABLE public.practice_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concept_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'true_false', 'short_answer')),
  question_text TEXT NOT NULL,
  options JSONB, -- for MCQ: ["option1", "option2", ...]
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS setup (simple permissive for MVP, real implementation would restrict by student_id)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concept_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.confusion_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mastery_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_explanations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_questions ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read everything (for MVP demo simplicity)
CREATE POLICY "Allow all authenticated read" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated read" ON public.courses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated read" ON public.lessons FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated read" ON public.concepts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated read" ON public.concept_dependencies FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated read" ON public.confusion_signals FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated read" ON public.mastery_scores FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated read" ON public.ai_conversations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated read" ON public.revision_plans FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated read" ON public.practice_attempts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated read" ON public.learning_sessions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated read" ON public.saved_explanations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated read" ON public.notifications FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated read" ON public.course_enrollments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all authenticated read" ON public.practice_questions FOR SELECT USING (auth.role() = 'authenticated');

-- Allow students to insert/update their own records
CREATE POLICY "Allow user insert own" ON public.confusion_signals FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Allow user insert own" ON public.ai_conversations FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Allow user insert own" ON public.practice_attempts FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Allow user insert own" ON public.learning_sessions FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Allow user insert own" ON public.saved_explanations FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Allow user delete own" ON public.saved_explanations FOR DELETE USING (auth.uid() = student_id);

CREATE POLICY "Allow user update own" ON public.mastery_scores FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Allow user insert own" ON public.mastery_scores FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Allow user update own" ON public.revision_plans FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Allow user insert own" ON public.revision_plans FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Allow user update own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow user insert own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow user update own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow user insert own" ON public.course_enrollments FOR INSERT WITH CHECK (auth.uid() = student_id);
