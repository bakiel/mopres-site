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

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // First, try to delete any existing user with this email
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingAdmin = existingUsers?.users?.find(u => u.email === 'superadmin@mopres.co.za');
    
    if (existingAdmin) {
      console.log('Deleting existing admin user...');
      await supabase.auth.admin.deleteUser(existingAdmin.id);
    }
    
    // Create the admin user
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'superadmin@mopres.co.za',
      password: 'MoPres2024Admin!',
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        full_name: 'MoPres Super Admin'
      }
    });
    
    if (error) {
      throw error;
    }
    
    console.log('Admin user created successfully!');
    console.log('Email: superadmin@mopres.co.za');
    console.log('Password: MoPres2024Admin!');
    console.log('User ID:', data.user?.id);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();