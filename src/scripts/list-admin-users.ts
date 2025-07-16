import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function listAdminUsers() {
  try {
    console.log('Fetching all users...\n');
    
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      throw error;
    }
    
    const adminUsers = users.users.filter(u => u.user_metadata?.role === 'admin');
    
    console.log(`Total users: ${users.users.length}`);
    console.log(`Admin users: ${adminUsers.length}\n`);
    
    if (adminUsers.length > 0) {
      console.log('Admin Users:');
      console.log('============');
      adminUsers.forEach(user => {
        console.log(`Email: ${user.email}`);
        console.log(`ID: ${user.id}`);
        console.log(`Created: ${user.created_at}`);
        console.log(`Role: ${user.user_metadata?.role}`);
        console.log(`Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
        console.log('---');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error listing users:', error);
    process.exit(1);
  }
}

listAdminUsers();