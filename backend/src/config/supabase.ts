import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// We use the service role key for the backend to bypass RLS when performing admin actions,
// BUT for user actions, we should ideally instantiate a client using the user's access token,
// OR pass the user's token in headers for RLS.
// For the MVP, we can use the service client and manually filter by student_id in our queries,
// ensuring we validate the student_id against the authenticated user first.

export const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceKey);
