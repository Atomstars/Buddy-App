import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '.env') });

const url = process.env.VITE_SUPABASE_URL || 'https://rufnqsyejgtxiizklcow.supabase.co';
const key = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_syfc-S_FoUPs4q0JPP0eSA_ixmJm_AJ';

const supabase = createClient(url, key);

async function testAnonymousAuth() {
  console.log("Attempting to sign in anonymously...");
  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) {
    console.error("Anonymous sign-in failed:", error.message);
  } else {
    console.log("Anonymous sign-in succeeded!", data);
  }
}

testAnonymousAuth();
