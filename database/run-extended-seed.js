/**
 * Script to run the extended curriculum seed data and verify results
 * Run with: node database/run-extended-seed.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runSQL(filePath, description) {
  console.log(`\n📄 Running ${description}...`);
  try {
    const sql = fs.readFileSync(filePath, 'utf-8');
    
    // Supabase doesn't have a direct SQL execution endpoint via the JS client
    // We need to use the REST API directly
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      // Try alternative: execute via psql command if available
      console.log('   Note: Direct SQL execution via REST API not available.');
      console.log('   You can run this SQL file manually in Supabase SQL Editor:');
      console.log(`   ${filePath}`);
      return false;
    }

    console.log(`✅ ${description} completed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Error running ${description}:`, error.message);
    return false;
  }
}

async function verifyData() {
  console.log('\n🔍 Verifying seeded data...\n');

  try {
    // 1. Count courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('code, name', { count: 'exact' });
    
    if (coursesError) throw coursesError;
    
    console.log('📊 Courses:', courses.length);
    courses.forEach(c => console.log(`   - ${c.code}: ${c.name}`));

    // 2. Count lessons
    const { count: lessonCount } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true });
    
    console.log('\n📊 Total Lessons:', lessonCount);

    // 3. Count concepts
    const { count: conceptCount } = await supabase
      .from('concepts')
      .select('*', { count: 'exact', head: true });
    
    console.log('📊 Total Concepts:', conceptCount);

    // 4. Count dependencies
    const { count: depCount } = await supabase
      .from('concept_dependencies')
      .select('*', { count: 'exact', head: true });
    
    console.log('📊 Total Dependencies:', depCount);

    // 5. Check for cross-course dependencies
    const { data: allDeps } = await supabase
      .from('concept_dependencies')
      .select(`
        concept_id,
        prerequisite_id,
        concept:concepts!concept_dependencies_concept_id_fkey(name, lesson:lessons(course:courses(code))),
        prereq:concepts!concept_dependencies_prerequisite_id_fkey(name, lesson:lessons(course:courses(code)))
      `);

    const crossCourseDeps = allDeps?.filter(dep => {
      const conceptCourse = dep.concept?.lesson?.course?.code;
      const prereqCourse = dep.prereq?.lesson?.course?.code;
      return conceptCourse && prereqCourse && conceptCourse !== prereqCourse;
    }) || [];

    console.log('\n📊 Cross-Course Dependencies:', crossCourseDeps.length);
    crossCourseDeps.forEach(dep => {
      const conceptCourse = dep.concept?.lesson?.course?.code;
      const prereqCourse = dep.prereq?.lesson?.course?.code;
      console.log(`   - ${dep.concept?.name} (${conceptCourse}) ← ${dep.prereq?.name} (${prereqCourse})`);
    });

    // 6. Check projects table
    const { data: projects, error: projError } = await supabase
      .from('projects')
      .select('title, status, milestones');
    
    if (!projError && projects?.length > 0) {
      console.log('\n📊 Projects:', projects.length);
      projects.forEach(p => {
        const milestones = p.milestones || [];
        console.log(`   - ${p.title} (${p.status}) - ${milestones.length} milestones`);
      });
    } else {
      console.log('\n⚠️  Projects table not found or empty (run migration 002)');
    }

    // 7. Check enrollments
    const { count: enrollCount } = await supabase
      .from('course_enrollments')
      .select('*', { count: 'exact', head: true });
    
    console.log('\n📊 Course Enrollments:', enrollCount);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ VERIFICATION COMPLETE');
    console.log('='.repeat(60));
    console.log(`Courses: ${courses.length} (expected: 8)`);
    console.log(`Lessons: ${lessonCount} (expected: 32+)`);
    console.log(`Concepts: ${conceptCount} (expected: 70+)`);
    console.log(`Dependencies: ${depCount} (expected: 30+)`);
    console.log(`Cross-Course Dependencies: ${crossCourseDeps.length} (expected: 6+)`);
    console.log(`Projects: ${projects?.length || 0} (expected: 1)`);
    console.log('='.repeat(60));

    if (courses.length >= 8 && lessonCount >= 32 && conceptCount >= 70 && crossCourseDeps.length >= 6) {
      console.log('✅ All verifications passed!');
      return true;
    } else {
      console.log('⚠️  Some counts are lower than expected. Review the seed data.');
      return false;
    }

  } catch (error) {
    console.error('❌ Verification error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Extended Curriculum Seed Data Runner');
  console.log('=' .repeat(60));

  console.log('\n⚠️  IMPORTANT: This script verifies the data only.');
  console.log('To apply the seed data, you need to:');
  console.log('1. Open Supabase Dashboard > SQL Editor');
  console.log('2. Run: database/seed.sql');
  console.log('3. Run: database/migrations/002_add_projects_table.sql');
  console.log('\nPress Ctrl+C to cancel or wait 3 seconds to verify existing data...');

  await new Promise(resolve => setTimeout(resolve, 3000));

  const success = await verifyData();
  
  if (success) {
    console.log('\n✅ Setup complete! Your Cogniva curriculum is ready.');
  } else {
    console.log('\n⚠️  Please run the SQL files manually in Supabase SQL Editor.');
  }
}

main().catch(console.error);
