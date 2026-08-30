-- Migration: Add Projects Table for CSE4271 Major Project
-- This table tracks student capstone projects separately from the lesson/concept schema

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'submitted', 'graded')),
  milestones JSONB DEFAULT '[]'::jsonb, -- Array of milestone objects: [{name, completed, deadline}]
  grade NUMERIC(5,2), -- Final grade (0-100)
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id) -- Each student has one major project
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read projects
CREATE POLICY "Allow all authenticated read" ON public.projects 
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Students can update their own projects
CREATE POLICY "Allow user update own" ON public.projects 
  FOR UPDATE USING (auth.uid() = student_id);

-- Policy: Students can insert their own projects
CREATE POLICY "Allow user insert own" ON public.projects 
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION update_projects_updated_at();

-- Seed demo project for demo student
INSERT INTO public.projects (student_id, title, description, status, milestones)
VALUES (
  '00000000-0000-0000-0000-000000000002', -- Demo student Ada Lovelace
  'Cognitive Learning Platform Prototype',
  'Building an AI-powered adaptive learning system with real-time confusion detection and personalized revision plans.',
  'in_progress',
  '[
    {"name": "Proposal & Scoping", "completed": true, "deadline": "2024-02-15"},
    {"name": "Literature Review", "completed": true, "deadline": "2024-03-01"},
    {"name": "System Design", "completed": true, "deadline": "2024-03-20"},
    {"name": "Core Implementation", "completed": false, "deadline": "2024-04-30"},
    {"name": "Testing & Evaluation", "completed": false, "deadline": "2024-05-20"},
    {"name": "Final Report & Presentation", "completed": false, "deadline": "2024-06-10"}
  ]'::jsonb
)
ON CONFLICT (student_id) DO NOTHING;
