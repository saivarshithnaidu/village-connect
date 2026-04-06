import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !serviceRoleKey) {
  console.warn('Supabase URL or Service Role Key is missing. Server-side operations will fail.');
}

// This client uses the SERVICE_ROLE_KEY, which bypasses RLS.
// Use this ONLY in API routes and server-side logic after manual auth verification.
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
