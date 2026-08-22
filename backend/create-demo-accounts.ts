import { supabaseAdmin } from './src/config/supabase';

const demoAccounts = [
  { name: 'Demo Student', email: 'student_demo@cognivia.com', password: 'password123!', role: 'student' },
  { name: 'Demo Educator', email: 'educator_demo@cognivia.com', password: 'password123!', role: 'educator' },
  { name: 'Demo Backup', email: 'backup_demo@cognivia.com', password: 'password123!', role: 'student' }
];

async function createAccounts() {
  for (const acc of demoAccounts) {
    console.log(`Creating ${acc.email}...`);
    // Delete if exists
    const { data: users, error: searchError } = await supabaseAdmin.auth.admin.listUsers();
    if (searchError) {
      console.error(searchError);
      continue;
    }
    const existing = users.users.find(u => u.email === acc.email);
    if (existing) {
      console.log(`User ${acc.email} exists, deleting...`);
      await supabaseAdmin.auth.admin.deleteUser(existing.id);
      
      // Need a small delay after deletion
      await new Promise(r => setTimeout(r, 1000));
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: acc.email,
      password: acc.password,
      email_confirm: true,
      user_metadata: { name: acc.name, role: acc.role }
    });

    if (authError) {
      console.error('Auth Error:', authError.message);
      continue;
    }

    const userId = authData.user.id;

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        name: acc.name,
        email: acc.email,
        role: acc.role,
        avatar: null
      });

    if (profileError) {
      console.error('Profile Error:', profileError.message);
    } else {
      console.log(`Created ${acc.email} successfully.`);
    }
  }
}

createAccounts().catch(console.error);
