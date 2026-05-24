import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '.env') });

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(url, key);

async function testInsert() {
  console.log("Attempting to insert a test expense...");
  
  const testExpense = {
    amount: 10,
    sector: 'other',
    note: 'Test from node',
    date: new Date().toISOString().split('T')[0]
  };

  const { data, error } = await supabase.from('expenses').insert([testExpense]).select();
  
  if (error) {
    console.error("INSERT FAILED:");
    console.error(error);
  } else {
    console.log("INSERT SUCCEEDED:");
    console.log(data);
  }
}

testInsert();
