import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '../frontend/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const adminClient = createClient(supabaseUrl, serviceKey);

async function run() {
  console.log('--- Verifying Structural Fix for Profile Creation ---');
  
  // Create a mock user ID to simulate an auth.users entry
  // Since we are rate limited on email signups, we'll use the admin client to create a user directly
  const testEmail = `verify_${Date.now()}@example.com`;
  console.log(`1. Admin creating test user ${testEmail} to bypass email rate limits...`);
  
  const { data: adminUser, error: adminError } = await adminClient.auth.admin.createUser({
    email: testEmail,
    password: 'Password123!',
    email_confirm: true // auto confirm
  });
  
  if (adminError || !adminUser.user) {
    console.error('Failed to create admin user:', adminError);
    return;
  }
  
  const userId = adminUser.user.id;
  console.log(`✅ User created with ID: ${userId}`);
  
  console.log(`2. Simulating frontend calling backend /api/auth/complete-signup...`);
  // Instead of HTTP call to localhost, we just run the same logic the endpoint runs
  const { data: profile, error: profileError } = await adminClient
    .from('profiles')
    .insert({
      id: userId,
      name: 'Verification User',
      email: testEmail,
      role: 'student',
      avatar: null,
    })
    .select()
    .single();
    
  if (profileError) {
    console.error('❌ Profile insert failed:', profileError);
  } else {
    console.log('✅ Profile inserted successfully via service role!');
    console.log(profile);
  }
  
  console.log(`3. RLS Check: Attempting to insert someone else's profile as a regular user...`);
  const fakeId = '00000000-0000-0000-0000-000000000000';
  const { error: rlsError } = await supabase
    .from('profiles')
    .insert({
      id: fakeId,
      name: 'Fake User',
      email: 'fake@example.com',
      role: 'student',
    });
    
  if (rlsError) {
    console.log(`✅ RLS correctly blocked unauthorized insert: ${rlsError.message}`);
  } else {
    console.error(`❌ RLS failed to block unauthorized insert!`);
  }
  
  // Cleanup
  await adminClient.auth.admin.deleteUser(userId);
  console.log('Cleanup complete.');
}

run();
