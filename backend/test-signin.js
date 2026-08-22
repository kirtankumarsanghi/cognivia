const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testSignin() {
  console.log('Attempting signin...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'student@cognivia.demo',
    password: 'password123'
  });
  console.log('Result:', { data: !!data.user, error });
}

testSignin();
