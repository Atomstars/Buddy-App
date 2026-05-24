import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rufnqsyejgtxiizklcow.supabase.co';
const supabaseAnonKey = 'sb_publishable_syfc-S_FoUPs4q0JPP0eSA_ixmJm_AJ';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Check your .env file.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);
