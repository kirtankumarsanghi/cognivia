const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createDemoAccounts() {
  const accounts = [
    { email: 'educator@cognivia.demo', password: 'password123', name: 'Dr. Sarah Demo', role: 'educator' },
    { email: 'student@cognivia.demo', password: 'password123', name: 'Alex Student', role: 'student' }
  ];

  for (const acc of accounts) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: acc.email,
      password: acc.password,
      email_confirm: true,
      user_metadata: { name: acc.name, role: acc.role }
    });
    if (error) {
      console.log(`Failed for ${acc.email}:`, error.message);
    } else {
      console.log(`Created ${acc.email}`);
    }
  }
}

createDemoAccounts();
