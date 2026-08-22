-- Quick Status Check for Cogniva Database
-- Run this in Supabase SQL Editor to see current state

-- 1. Course Summary
SELECT 
  '📚 COURSES' AS section,
  code,
  name,
  (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) AS lessons,
  (SELECT COUNT(*) 
   FROM concepts co 
   JOIN lessons l ON co.lesson_id = l.id 
   WHERE l.course_id = c.id) AS concepts
FROM courses c
ORDER BY code;

-- 2. Dependency Summary
SELECT 
  '🔗 DEPENDENCIES' AS section,
  'Same-Course Dependencies' AS type,
  COUNT(*) AS count
FROM concept_dependencies cd
JOIN concepts c1 ON cd.concept_id = c1.id
JOIN concepts c2 ON cd.prerequisite_id = c2.id
JOIN lessons l1 ON c1.lesson_id = l1.id
JOIN lessons l2 ON c2.lesson_id = l2.id
WHERE l1.course_id = l2.course_id

UNION ALL

SELECT 
  '🔗 DEPENDENCIES' AS section,
  'Cross-Course Dependencies' AS type,
  COUNT(*) AS count
FROM concept_dependencies cd
JOIN concepts c1 ON cd.concept_id = c1.id
JOIN concepts c2 ON cd.prerequisite_id = c2.id
JOIN lessons l1 ON c1.lesson_id = l1.id
JOIN lessons l2 ON c2.lesson_id = l2.id
WHERE l1.course_id != l2.course_id;

-- 3. Demo Student Status
SELECT 
  '👤 DEMO STUDENT' AS section,
  name,
  email,
  role,
  (SELECT COUNT(*) FROM course_enrollments WHERE student_id = p.id) AS enrolled_courses,
  (SELECT COUNT(*) FROM mastery_scores WHERE student_id = p.id) AS mastery_records,
  (SELECT COUNT(*) FROM confusion_signals WHERE student_id = p.id) AS confusion_signals,
  (SELECT COUNT(*) FROM projects WHERE student_id = p.id) AS projects
FROM profiles p
WHERE role = 'student'
LIMIT 1;

-- 4. Overall Totals
SELECT 
  '📊 TOTALS' AS section,
  'Courses' AS item,
  COUNT(*)::text AS count
FROM courses

UNION ALL
SELECT '📊 TOTALS', 'Lessons', COUNT(*)::text FROM lessons
UNION ALL
SELECT '📊 TOTALS', 'Concepts', COUNT(*)::text FROM concepts
UNION ALL
SELECT '📊 TOTALS', 'Dependencies', COUNT(*)::text FROM concept_dependencies
UNION ALL
SELECT '📊 TOTALS', 'Practice Questions', COUNT(*)::text FROM practice_questions
UNION ALL
SELECT '📊 TOTALS', 'Projects', COUNT(*)::text FROM projects;

-- 5. Cross-Course Dependency Details
SELECT 
  '🎯 CROSS-COURSE DEPS' AS section,
  c1.name AS concept,
  course1.code AS from_course,
  c2.name AS prerequisite,
  course2.code AS prereq_course
FROM concept_dependencies cd
JOIN concepts c1 ON cd.concept_id = c1.id
JOIN concepts c2 ON cd.prerequisite_id = c2.id
JOIN lessons l1 ON c1.lesson_id = l1.id
JOIN lessons l2 ON c2.lesson_id = l2.id
JOIN courses course1 ON l1.course_id = course1.id
JOIN courses course2 ON l2.course_id = course2.id
WHERE course1.id != course2.id
ORDER BY course1.code, c1.name;
