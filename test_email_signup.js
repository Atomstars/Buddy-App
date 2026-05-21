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

async function testEmailAuth() {
  const testEmail = `tester_${Math.floor(Math.random() * 100000)}@gmail.com`;
  const testPassword = 'password123';
  
  console.log(`Attempting to sign up a new test user: ${testEmail}...`);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });

  if (signUpError) {
    console.error("Sign-up failed:", signUpError.message);
  } else {
    console.log("Sign-up succeeded!", signUpData);
    
    console.log("Attempting to sign in with the new user...");
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    
    if (signInError) {
      console.error("Sign-in failed:", signInError.message);
    } else {
      console.log("Sign-in succeeded!", signInData);
    }
  }
}

testEmailAuth();
