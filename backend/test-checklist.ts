import { supabaseAdmin } from './src/config/supabase';

async function verifyChecklist() {
  console.log('--- Database Verification ---');

  // Verify demo accounts
  const demoEmails = ['student_demo@cognivia.com', 'educator_demo@cognivia.com', 'backup_demo@cognivia.com'];
  const { data: users, error: err1 } = await supabaseAdmin.auth.admin.listUsers();
  if (err1) throw err1;

  for (const email of demoEmails) {
    const user = users.users.find(u => u.email === email);
    if (user) {
      const { data: profile, error: err2 } = await supabaseAdmin.from('profiles').select('*').eq('id', user.id).single();
      if (profile && !err2) {
        console.log(`[PASS] Demo account ${email} exists in auth and profiles.`);
      } else {
        console.log(`[FAIL] Demo account ${email} missing profile!`);
      }
    } else {
      console.log(`[FAIL] Demo account ${email} missing in auth!`);
    }
  }

  console.log('\n--- Frontend API Verification ---');
  // We can't fully simulate rate limits or email confirmation without hitting the actual APIs or the frontend.
  console.log('Checklist backend checks complete.');
}

verifyChecklist().catch(console.error);
