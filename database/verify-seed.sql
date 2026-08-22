-- Verification Queries for Extended Curriculum Seed Data

-- 1. Count all courses (should be 8: CS101/CSE2101 + 7 new)
SELECT 'Course Count' AS metric, COUNT(*) AS count FROM public.courses;

-- 2. List all courses
SELECT code, name FROM public.courses ORDER BY code;

-- 3. Count lessons per course
SELECT 
  c.code,
  c.name,
  COUNT(l.id) AS lesson_count
FROM public.courses c
LEFT JOIN public.lessons l ON c.id = l.course_id
GROUP BY c.id, c.code, c.name
ORDER BY c.code;

-- 4. Count concepts per course
SELECT 
  c.code,
  c.name,
  COUNT(co.id) AS concept_count
FROM public.courses c
LEFT JOIN public.lessons l ON c.id = l.course_id
LEFT JOIN public.concepts co ON l.id = co.lesson_id
GROUP BY c.id, c.code, c.name
ORDER BY c.code;

-- 5. Total counts
SELECT 
  'Total Lessons' AS metric, COUNT(*) AS count FROM public.lessons
UNION ALL
SELECT 
  'Total Concepts' AS metric, COUNT(*) AS count FROM public.concepts
UNION ALL
SELECT 
  'Total Dependencies' AS metric, COUNT(*) AS count FROM public.concept_dependencies;

-- 6. Verify cross-course dependencies (critical!)
-- These should show concepts from different courses
SELECT 
  c1.name AS concept,
  course1.code AS concept_course,
  c2.name AS prerequisite,
  course2.code AS prerequisite_course
FROM public.concept_dependencies cd
JOIN public.concepts c1 ON cd.concept_id = c1.id
JOIN public.concepts c2 ON cd.prerequisite_id = c2.id
JOIN public.lessons l1 ON c1.lesson_id = l1.id
JOIN public.lessons l2 ON c2.lesson_id = l2.id
JOIN public.courses course1 ON l1.course_id = course1.id
JOIN public.courses course2 ON l2.course_id = course2.id
WHERE course1.id != course2.id
ORDER BY course1.code, course2.code;

-- 7. Verify projects table exists and has demo seed
SELECT 
  p.title,
  p.status,
  jsonb_array_length(p.milestones) AS milestone_count,
  pr.name AS student_name
FROM public.projects p
JOIN public.profiles pr ON p.student_id = pr.id;

-- 8. Check course enrollments for demo student
SELECT 
  pr.name AS student,
  c.code,
  c.name AS course_name
FROM public.course_enrollments ce
JOIN public.profiles pr ON ce.student_id = pr.id
JOIN public.courses c ON ce.course_id = c.id
WHERE pr.role = 'student'
ORDER BY c.code;
