import { supabaseAdmin } from './src/config/supabase';

/**
 * Comprehensive data seeding script for Educator Dashboard demo
 * Creates realistic student data with practice attempts, confusion signals,
 * learning sessions, and mastery scores to showcase ML features
 */

interface Student {
  id: string;
  name: string;
  email: string;
  profile: 'struggling' | 'average' | 'excellent' | 'inconsistent';
}

async function seedRealisticData() {
  console.log('🌱 Seeding realistic data for impressive demo...\n');

  try {
    // 1. Get or create course
    let { data: course } = await supabaseAdmin
      .from('courses')
      .select('id')
      .eq('code', 'CS101')
      .single();

    if (!course) {
      const { data: educator } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('role', 'educator')
        .limit(1)
        .single();

      if (!educator) {
        console.error('❌ No educator found. Please create demo accounts first.');
        return;
      }

      const { data: newCourse, error: courseError } = await supabaseAdmin
        .from('courses')
        .insert({
          name: 'Data Structures & Algorithms',
          code: 'CS101',
          description: 'Core CS concepts with real-time learning analytics',
          educator_id: educator.id
        })
        .select()
        .single();

      if (courseError) {
        console.error('❌ Failed to create course:', courseError);
        return;
      }
      course = newCourse;
    }

    console.log(`✅ Using course: CS101 (ID: ${course.id})`);

    // 2. Get all existing students or create more
    const { data: existingStudents } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email')
      .eq('role', 'student');

    console.log(`✅ Found ${existingStudents?.length || 0} existing students`);

    // Create additional demo students if needed
    const studentProfiles: Student[] = [];
    const targetStudentCount = 15;

    if (existingStudents) {
      existingStudents.forEach((s, idx) => {
        const profiles: Array<'struggling' | 'average' | 'excellent' | 'inconsistent'> = ['struggling', 'average', 'excellent', 'inconsistent'];
        studentProfiles.push({
          id: s.id,
          name: s.name || `Student ${idx + 1}`,
          email: s.email || `student${idx}@demo.com`,
          profile: profiles[idx % profiles.length]
        });
      });
    }

    // If we need more students, create mock profiles
    const studentsNeeded = targetStudentCount - studentProfiles.length;
    if (studentsNeeded > 0) {
      console.log(`📝 Creating ${studentsNeeded} additional student profiles...`);
      
      const newStudentNames = [
        'Alex Rivera', 'Jordan Chen', 'Taylor Smith', 'Morgan Davis',
        'Casey Johnson', 'Riley Martinez', 'Avery Garcia', 'Quinn Anderson',
        'Jamie Wilson', 'Drew Thompson', 'Skyler White', 'Cameron Brown',
        'Parker Jones', 'Sage Williams', 'River Lee'
      ];

      for (let i = studentProfiles.length; i < targetStudentCount && i < newStudentNames.length; i++) {
        const name = newStudentNames[i];
        const email = `${name.toLowerCase().replace(' ', '.')}@demo.com`;
        
        // Try to create the student (will skip if already exists)
        const { data: newStudent, error } = await supabaseAdmin.auth.admin.createUser({
          email,
          password: 'Demo1234!',
          email_confirm: true
        });

        if (!error && newStudent.user) {
          await supabaseAdmin
            .from('profiles')
            .upsert({
              id: newStudent.user.id,
              name,
              email,
              role: 'student'
            });

          const profiles: Array<'struggling' | 'average' | 'excellent' | 'inconsistent'> = ['struggling', 'average', 'excellent', 'inconsistent'];
          studentProfiles.push({
            id: newStudent.user.id,
            name,
            email,
            profile: profiles[i % profiles.length]
          });
        }
      }
    }

    console.log(`✅ Total students for seeding: ${studentProfiles.length}`);

    // 3. Get or create lesson and concepts
    let { data: lesson } = await supabaseAdmin
      .from('lessons')
      .select('id')
      .eq('course_id', course.id)
      .limit(1)
      .single();

    if (!lesson) {
      const { data: newLesson, error } = await supabaseAdmin
        .from('lessons')
        .insert({
          course_id: course.id,
          title: 'Algorithm Analysis & Data Structures',
          description: 'Core concepts in computational thinking',
          order_number: 1
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to create lesson:', error);
        return;
      }
      lesson = newLesson;
    }

    console.log(`✅ Using lesson (ID: ${lesson.id})`);

    // 4. Create comprehensive concept set
    const conceptData = [
      { name: 'Big-O Notation', description: 'Time and space complexity analysis', difficulty: 'intermediate' },
      { name: 'Binary Search', description: 'Divide and conquer searching', difficulty: 'intermediate' },
      { name: 'Recursion', description: 'Self-referential problem solving', difficulty: 'advanced' },
      { name: 'Dynamic Programming', description: 'Optimization through memoization', difficulty: 'advanced' },
      { name: 'Hash Tables', description: 'Efficient key-value storage', difficulty: 'intermediate' },
      { name: 'Linked Lists', description: 'Sequential data structures', difficulty: 'beginner' },
      { name: 'Binary Trees', description: 'Hierarchical data organization', difficulty: 'intermediate' },
      { name: 'Graph Algorithms', description: 'Network traversal and analysis', difficulty: 'advanced' },
      { name: 'Sorting Algorithms', description: 'QuickSort, MergeSort, etc.', difficulty: 'intermediate' },
      { name: 'Stack & Queue', description: 'LIFO and FIFO structures', difficulty: 'beginner' },
      { name: 'Greedy Algorithms', description: 'Local optimization strategies', difficulty: 'intermediate' },
      { name: 'Backtracking', description: 'Exhaustive search with pruning', difficulty: 'advanced' },
    ];

    const concepts: any[] = [];
    for (const cData of conceptData) {
      const { data: existing } = await supabaseAdmin
        .from('concepts')
        .select('id, name')
        .eq('name', cData.name)
        .eq('lesson_id', lesson.id)
        .single();

      if (existing) {
        concepts.push(existing);
      } else {
        const { data: newConcept } = await supabaseAdmin
          .from('concepts')
          .insert({ ...cData, lesson_id: lesson.id })
          .select()
          .single();

        if (newConcept) concepts.push(newConcept);
      }
    }

    console.log(`✅ Created/verified ${concepts.length} concepts`);

    // 5. Enroll all students in the course
    for (const student of studentProfiles) {
      await supabaseAdmin
        .from('course_enrollments')
        .upsert({
          student_id: student.id,
          course_id: course.id
        }, { onConflict: 'student_id,course_id' });
    }

    console.log(`✅ Enrolled all students in course`);

    // 6. Generate realistic data for each student based on their profile
    console.log('\n📊 Generating student learning data...');

    let totalSignals = 0;
    let totalPractice = 0;
    let totalSessions = 0;

    for (const student of studentProfiles) {
      console.log(`  Processing ${student.name} (${student.profile})...`);

      // Generate mastery scores based on profile
      const masteryScores = concepts.map((concept, idx) => {
        let score: number;
        
        switch (student.profile) {
          case 'excellent':
            score = 75 + Math.floor(Math.random() * 25); // 75-100
            break;
          case 'average':
            score = 50 + Math.floor(Math.random() * 30); // 50-80
            break;
          case 'struggling':
            score = 20 + Math.floor(Math.random() * 40); // 20-60
            break;
          case 'inconsistent':
            score = Math.random() > 0.5 
              ? 70 + Math.floor(Math.random() * 30) // 70-100
              : 25 + Math.floor(Math.random() * 35); // 25-60
            break;
        }

        return {
          student_id: student.id,
          concept_id: concept.id,
          score: Math.round(score)
        };
      });

      await supabaseAdmin
        .from('mastery_scores')
        .upsert(masteryScores, { onConflict: 'student_id,concept_id' });

      // Generate confusion signals for concepts with low mastery
      const confusedConcepts = masteryScores.filter(m => m.score < 65);
      const signalsToCreate = confusedConcepts.slice(0, Math.floor(Math.random() * 4) + 2); // 2-5 signals

      for (const mc of signalsToCreate) {
        const signalTypes = ['Confused', 'Confused', 'Partially Clear'];
        const signal = signalTypes[Math.floor(Math.random() * signalTypes.length)];
        
        // Create signals from the past 48 hours
        const hoursAgo = Math.floor(Math.random() * 48);
        const created_at = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();

        await supabaseAdmin
          .from('confusion_signals')
          .insert({
            student_id: student.id,
            concept_id: mc.concept_id,
            signal,
            created_at
          });

        totalSignals++;
      }

      // Generate practice attempts
      const practiceCount = Math.floor(Math.random() * 15) + 10; // 10-25 attempts
      for (let i = 0; i < practiceCount; i++) {
        const concept = concepts[Math.floor(Math.random() * concepts.length)];
        const mastery = masteryScores.find(m => m.concept_id === concept.id)!;
        
        // Correct probability based on mastery score
        const correct = Math.random() * 100 < mastery.score;
        
        // Anti-gaming weight (occasionally flag suspicious rapid-fire attempts)
        const weight = Math.random() > 0.9 ? 0.5 : 1.0;
        
        const daysAgo = Math.floor(Math.random() * 7);
        const created_at = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

        await supabaseAdmin
          .from('practice_attempts')
          .insert({
            student_id: student.id,
            concept_id: concept.id,
            correct,
            weight,
            created_at
          });

        totalPractice++;
      }

      // Generate learning sessions (past week)
      const sessionCount = Math.floor(Math.random() * 8) + 3; // 3-10 sessions
      for (let i = 0; i < sessionCount; i++) {
        const types: Array<'tutor' | 'practice' | 'revision'> = ['tutor', 'practice', 'revision'];
        const session_type = types[Math.floor(Math.random() * types.length)];
        const duration_minutes = Math.floor(Math.random() * 30) + 10; // 10-40 min
        
        const daysAgo = Math.floor(Math.random() * 7);
        const created_at = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

        await supabaseAdmin
          .from('learning_sessions')
          .insert({
            student_id: student.id,
            session_type,
            duration_minutes,
            created_at
          });

        totalSessions++;
      }
    }

    console.log(`\n✅ Data generation complete!`);
    console.log(`\n📈 Summary:`);
    console.log(`   • Students: ${studentProfiles.length}`);
    console.log(`   • Concepts: ${concepts.length}`);
    console.log(`   • Confusion Signals: ${totalSignals}`);
    console.log(`   • Practice Attempts: ${totalPractice}`);
    console.log(`   • Learning Sessions: ${totalSessions}`);
    console.log(`\n🎯 Educator Dashboard now has rich, realistic data!`);
    console.log(`   Visit the dashboard to see live confusion heatmaps, ML risk predictions, and more.`);

  } catch (error: any) {
    console.error('❌ Fatal error:', error.message);
    throw error;
  }
}

// Run the seeding
seedRealisticData()
  .then(() => {
    console.log('\n✅ Seeding successful!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Seeding failed:', err);
    process.exit(1);
  });
