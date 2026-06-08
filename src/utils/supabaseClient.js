import { createClient } from '@supabase/supabase-js';

// Read from env first; fall back to the existing project values so dev keeps working.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rufnqsyejgtxiizklcow.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_syfc-S_FoUPs4q0JPP0eSA_ixmJm_AJ';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
