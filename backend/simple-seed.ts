import { supabaseAdmin } from './src/config/supabase';

async function simpleSeed() {
  console.log('🌱 Quick seeding for revision system...');

  // Find demo student
  const { data: student } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', 'student_demo@cognivia.com')
    .single();

  if (!student) {
    console.error('❌ Demo student not found');
    return;
  }

  const studentId = student.id;
  console.log(`✓ Student ID: ${studentId}`);

  // Find or create educator
  let { data: educator } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', 'educator_demo@cognivia.com')
    .single();

  let educatorId = educator?.id;

  // Create a course
  const { data: course, error: courseError } = await supabaseAdmin
    .from('courses')
    .insert({
      name: 'Data Structures & Algorithms',
      code: 'CS101',
      description: 'Core computer science concepts',
      educator_id: educatorId
    })
    .select()
    .single();

  if (courseError && courseError.code !== '23505') { // ignore duplicate
    console.error('❌ Course error:', courseError);
    return;
  }

  const courseId = course?.id;
  console.log(`✓ Course ID: ${courseId || 'existing'}`);

  // Get or use existing course
  if (!courseId) {
    const { data: existing } = await supabaseAdmin
      .from('courses')
      .select('id')
      .eq('code', 'CS101')
      .single();
    
    if (!existing) {
      console.error('❌ Could not find or create course');
      return;
    }
  }

  const { data: courses } = await supabaseAdmin
    .from('courses')
    .select('id')
    .limit(1)
    .single();

  const useCourseId = courses?.id;

  // Create lesson
  const { data: lesson, error: lessonError } = await supabaseAdmin
    .from('lessons')
    .insert({
      course_id: useCourseId,
      title: 'Algorithm Fundamentals',
      description: 'Introduction to algorithms and complexity',
      order_number: 1
    })
    .select()
    .single();

  if (lessonError) {
    // Try to get existing lesson
    const { data: existingLesson } = await supabaseAdmin
      .from('lessons')
      .select('id')
      .eq('course_id', useCourseId)
      .limit(1)
      .single();
    
    if (!existingLesson) {
      console.error('❌ No lesson found or created:', lessonError);
      return;
    }
    
    console.log(`✓ Using existing lesson: ${existingLesson.id}`);
  } else {
    console.log(`✓ Created lesson: ${lesson.id}`);
  }

  const lessonId = lesson?.id || (await supabaseAdmin.from('lessons').select('id').eq('course_id', useCourseId).limit(1).single()).data?.id;
  
  if (!lessonId) {
    console.error('❌ No lesson ID');
    return;
  }

  // Create concepts
  const conceptData = [
    { name: 'Arrays', description: 'Basic data structure', difficulty: 'beginner' },
    { name: 'Binary Search', description: 'Efficient searching', difficulty: 'intermediate' },
    { name: 'Big-O Notation', description: 'Algorithm complexity', difficulty: 'intermediate' },
    { name: 'Recursion', description: 'Self-referential functions', difficulty: 'advanced' },
    { name: 'Hash Tables', description: 'Key-value storage', difficulty: 'intermediate' },
    { name: 'Sorting Algorithms', description: 'Ordering data', difficulty: 'intermediate' },
  ];

  const concepts = [];
  for (const c of conceptData) {
    const { data } = await supabaseAdmin
      .from('concepts')
      .insert({ ...c, lesson_id: lessonId })
      .select()
      .single();
    
    if (data) concepts.push(data);
  }

  console.log(`✓ Created ${concepts.length} concepts`);

  // Create mastery scores
  const scores = [35, 48, 52, 88, 42, 65]; // Mix of scores
  for (let i = 0; i < concepts.length; i++) {
    await supabaseAdmin
      .from('mastery_scores')
      .upsert({
        student_id: studentId,
        concept_id: concepts[i].id,
        score: scores[i]
      }, { onConflict: 'student_id,concept_id' });
  }

  console.log(`✓ Created mastery scores`);

  // Create confusion signals for low-scoring concepts
  for (let i = 0; i < concepts.length; i++) {
    if (scores[i] < 60) {
      await supabaseAdmin
        .from('confusion_signals')
        .insert({
          student_id: studentId,
          concept_id: concepts[i].id,
          signal: 'Confused'
        });
    }
  }

  console.log(`✓ Created confusion signals`);

  // Enroll student in course
  await supabaseAdmin
    .from('course_enrollments')
    .upsert({
      student_id: studentId,
      course_id: useCourseId
    }, { onConflict: 'student_id,course_id' });

  console.log('\n✅ Seeding complete! Now try the revision plan generator.');
}

simpleSeed()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
