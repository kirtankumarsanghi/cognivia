import { supabaseAdmin } from './src/config/supabase';

async function seedTestData() {
  console.log('🌱 Seeding test data for demo student...');

  // Find the demo student
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', 'student_demo@cognivia.com')
    .single();

  if (!profiles) {
    console.error('❌ Demo student not found. Please create demo accounts first.');
    return;
  }

  const studentId = profiles.id;
  console.log(`✓ Found student: ${studentId}`);

  // Get all concepts
  const { data: concepts } = await supabaseAdmin
    .from('concepts')
    .select('id, name');

  if (!concepts || concepts.length === 0) {
    console.error('❌ No concepts found in database');
    return;
  }

  console.log(`✓ Found ${concepts.length} concepts`);

  // Create varying mastery scores
  const masteryScores = concepts.map((concept, index) => {
    // Create a mix of good, medium, and poor scores
    let score;
    if (index % 3 === 0) {
      score = Math.floor(Math.random() * 30) + 20; // 20-50 (needs attention)
    } else if (index % 3 === 1) {
      score = Math.floor(Math.random() * 25) + 55; // 55-80 (medium)
    } else {
      score = Math.floor(Math.random() * 15) + 85; // 85-100 (mastered)
    }

    return {
      student_id: studentId,
      concept_id: concept.id,
      score
    };
  });

  // Insert mastery scores
  const { error: masteryError } = await supabaseAdmin
    .from('mastery_scores')
    .upsert(masteryScores, { onConflict: 'student_id,concept_id' });

  if (masteryError) {
    console.error('❌ Error inserting mastery scores:', masteryError);
  } else {
    console.log(`✓ Created ${masteryScores.length} mastery scores`);
  }

  // Create some confusion signals for concepts with low scores
  const lowScoreConcepts = masteryScores
    .filter(m => m.score < 60)
    .slice(0, 5);

  const confusionSignals = lowScoreConcepts.flatMap(m => [
    {
      student_id: studentId,
      concept_id: m.concept_id,
      signal: 'Confused',
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      student_id: studentId,
      concept_id: m.concept_id,
      signal: 'Partially Clear',
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);

  const { error: signalError } = await supabaseAdmin
    .from('confusion_signals')
    .insert(confusionSignals);

  if (signalError) {
    console.error('❌ Error inserting confusion signals:', signalError);
  } else {
    console.log(`✓ Created ${confusionSignals.length} confusion signals`);
  }

  // Create some learning sessions
  const sessions = Array.from({ length: 10 }, (_, i) => ({
    student_id: studentId,
    session_type: ['tutor', 'practice', 'revision'][Math.floor(Math.random() * 3)] as 'tutor' | 'practice' | 'revision',
    duration_minutes: Math.floor(Math.random() * 20) + 5,
    created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
  }));

  const { error: sessionError } = await supabaseAdmin
    .from('learning_sessions')
    .insert(sessions);

  if (sessionError) {
    console.error('❌ Error inserting learning sessions:', sessionError);
  } else {
    console.log(`✓ Created ${sessions.length} learning sessions`);
  }

  console.log('\n✅ Test data seeding complete!');
  console.log('📊 Summary:');
  console.log(`   - Mastery scores: ${masteryScores.length}`);
  console.log(`   - Low scores (<60): ${masteryScores.filter(m => m.score < 60).length}`);
  console.log(`   - Medium scores (60-80): ${masteryScores.filter(m => m.score >= 60 && m.score < 80).length}`);
  console.log(`   - High scores (>=80): ${masteryScores.filter(m => m.score >= 80).length}`);
  console.log(`   - Confusion signals: ${confusionSignals.length}`);
  console.log(`   - Learning sessions: ${sessions.length}`);
}

seedTestData()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  });
