import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  try {
    console.log('Testing admin login...\n');
    
    // Test with the new credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'superadmin@mopres.co.za',
      password: 'MoPres2024Admin!'
    });
    
    if (error) {
      console.error('Login failed:', error.message);
      console.error('Error details:', error);
    } else {
      console.log('Login successful!');
      console.log('User:', data.user?.email);
      console.log('Role:', data.user?.user_metadata?.role);
      console.log('Session:', data.session ? 'Active' : 'No session');
    }
    
    // Also test the old credentials
    console.log('\nTesting original credentials...');
    const { data: data2, error: error2 } = await supabase.auth.signInWithPassword({
      email: 'admin@mopres.co.za',
      password: 'secureAdminPassword123'
    });
    
    if (error2) {
      console.error('Login failed:', error2.message);
    } else {
      console.log('Login successful!');
      console.log('User:', data2.user?.email);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

testLogin();