-- This script should be run AFTER auth users are created via Supabase Auth UI / API.
-- For demo purposes, we will assume we create standard demo users and mock their UUIDs,
-- but since auth.users is managed by Supabase, we can't easily seed it directly with raw SQL.
-- INSTEAD, we will use mock UUIDs here just for the relational data, and the backend will have a "Demo Mode" fallback,
-- or we can assume the developer will create the users in Supabase Auth and map their IDs.
-- Let's use fixed UUIDs for the demo data.

DO $$
DECLARE
  educator_id UUID := '00000000-0000-0000-0000-000000000001';
  student_id UUID := '00000000-0000-0000-0000-000000000002';
  course_id UUID := '11111111-1111-1111-1111-111111111111';
  lesson1_id UUID := '22222222-2222-2222-2222-222222222221';
  
  c_arrays UUID := '33333333-3333-3333-3333-333333333331';
  c_searching UUID := '33333333-3333-3333-3333-333333333332';
  c_logarithms UUID := '33333333-3333-3333-3333-333333333333';
  c_bigo UUID := '33333333-3333-3333-3333-333333333334';
  c_binary_search UUID := '33333333-3333-3333-3333-333333333335';
  c_recursion UUID := '33333333-3333-3333-3333-333333333336';
  c_sorting UUID := '33333333-3333-3333-3333-333333333337';
BEGIN

  -- 1. Profiles (We will insert directly into public.profiles for demo purposes, 
  -- but note these won't be able to login unless also in auth.users)
  INSERT INTO public.profiles (id, name, email, role)
  VALUES 
    (educator_id, 'Prof. Alan Turing', 'educator@cogniva.edu', 'educator'),
    (student_id, 'Ada Lovelace', 'student@cogniva.edu', 'student')
  ON CONFLICT (id) DO NOTHING;

  -- 2. Course
  INSERT INTO public.courses (id, name, code, description, educator_id)
  VALUES (course_id, 'Data Structures & Algorithms', 'CS101', 'Core computer science concepts.', educator_id)
  ON CONFLICT (id) DO NOTHING;

  -- 3. Lesson
  INSERT INTO public.lessons (id, course_id, title, description, order_number)
  VALUES (lesson1_id, course_id, 'Searching and Complexity', 'Introduction to searching algorithms and Big-O.', 1)
  ON CONFLICT (id) DO NOTHING;

  -- 4. Concepts
  INSERT INTO public.concepts (id, lesson_id, name, description, difficulty)
  VALUES 
    (c_arrays, lesson1_id, 'Arrays', 'Contiguous memory allocation.', 'beginner'),
    (c_searching, lesson1_id, 'Searching', 'Finding items in a collection.', 'beginner'),
    (c_logarithms, lesson1_id, 'Logarithms', 'The inverse operation to exponentiation.', 'intermediate'),
    (c_bigo, lesson1_id, 'Big-O Complexity', 'Asymptotic notation for algorithm performance.', 'intermediate'),
    (c_binary_search, lesson1_id, 'Binary Search', 'O(log n) search on sorted arrays.', 'advanced'),
    (c_recursion, lesson1_id, 'Recursion', 'Functions calling themselves.', 'intermediate'),
    (c_sorting, lesson1_id, 'Sorting', 'Arranging elements in order.', 'advanced')
  ON CONFLICT (id) DO NOTHING;

  -- 5. Concept Dependencies
  INSERT INTO public.concept_dependencies (concept_id, prerequisite_id)
  VALUES 
    (c_searching, c_arrays),
    (c_bigo, c_searching),
    (c_bigo, c_logarithms),
    (c_binary_search, c_arrays),
    (c_binary_search, c_bigo),
    (c_binary_search, c_logarithms)
  ON CONFLICT DO NOTHING;

  -- 6. Demo Confusion Signals
  INSERT INTO public.confusion_signals (student_id, concept_id, signal, created_at)
  VALUES 
    (student_id, c_bigo, 'Confused', NOW() - INTERVAL '2 hours'),
    (student_id, c_binary_search, 'Partially Clear', NOW() - INTERVAL '1 day')
  ON CONFLICT DO NOTHING;

  -- 7. Mastery Scores
  INSERT INTO public.mastery_scores (student_id, concept_id, score)
  VALUES 
    (student_id, c_arrays, 95.0),
    (student_id, c_searching, 85.0),
    (student_id, c_logarithms, 40.0),
    (student_id, c_bigo, 30.0),
    (student_id, c_binary_search, 10.0)
  ON CONFLICT DO NOTHING;

  -- 8. Revision Plans
  INSERT INTO public.revision_plans (student_id, concept_id, priority, minutes)
  VALUES 
    (student_id, c_logarithms, 'High', 6),
    (student_id, c_bigo, 'High', 8),
    (student_id, c_binary_search, 'Medium', 12)
  ON CONFLICT DO NOTHING;

END $$;
