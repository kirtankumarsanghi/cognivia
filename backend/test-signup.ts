import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '../frontend/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

console.log('Testing signup flow to diagnose profiles insert error...');

async function run() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  
  console.log(`1. Signing up with ${testEmail}`);
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });

  if (authError) {
    console.error('Auth Error:', authError);
    return;
  }
  
  console.log('Auth Data:', JSON.stringify(authData, null, 2));
  console.log('Has Session?', !!authData.session);
  
  const userId = authData.user?.id;
  if (!userId) {
    console.error('No user ID returned');
    return;
  }
  
  console.log(`2. Attempting to insert profile for user ${userId}`);
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      name: 'Test User',
      email: testEmail,
      role: 'student',
    })
    .select()
    .single();
    
  if (profileError) {
    console.error('Profile Insert Error details:', JSON.stringify(profileError, null, 2));
    
    // Also try with service role key to see if it's an RLS issue
    console.log('\n3. Retrying insert with Service Role Key (bypassing RLS)...');
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (serviceKey) {
      const adminClient = createClient(supabaseUrl, serviceKey);
      const { error: adminError } = await adminClient
        .from('profiles')
        .insert({
          id: userId,
          name: 'Test User',
          email: testEmail,
          role: 'student',
        });
      if (adminError) {
        console.error('Admin Insert Error:', JSON.stringify(adminError, null, 2));
      } else {
        console.log('Admin Insert SUCCESS! This confirms it is an RLS/Session issue for the regular client.');
      }
    }
    
    return;
  }
  
  console.log('Profile Insert Success:', profileData);
}

run();
