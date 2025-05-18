// Supabase Auth Diagnostic Script
// This will diagnose issues with Supabase authentication for admin access

import { createClient } from '@supabase/supabase-js';

// Supabase connection details 
const supabaseUrl = 'https://gfbedvoexpulmmfitxje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmYmVkdm9leHB1bG1tZml0eGplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTI0NjU1MCwiZXhwIjoyMDYwODIyNTUwfQ.I3wR6D-H9_BBJRjjY1CiD2pnX7aRgRbkgnOzCnmh70s';

// Admin credentials
const adminEmail = 'admin@mopres.co.za';
const adminPassword = 'secureAdminPassword123';

// Create the client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

async function diagnoseAuthIssues() {
  console.log('====== SUPABASE AUTHENTICATION DIAGNOSTIC ======');
  console.log('URL:', supabaseUrl);
  console.log('Time:', new Date().toISOString());
  console.log('==============================================');
  
  try {
    // Step 1: List all users and check if admin exists
    console.log('\n1. Checking for admin user...');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`);
    }
    
    console.log(`Found ${users.length} users in the system`);
    
    const adminUser = users.find(user => user.email === adminEmail);
    
    if (!adminUser) {
      console.log('❌ ISSUE: Admin user not found in the database');
      console.log('Attempting to create admin user...');
      
      const { data, error: createError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { name: 'Admin User', role: 'admin' },
        app_metadata: { role: 'admin' }
      });
      
      if (createError) {
        throw new Error(`Failed to create admin user: ${createError.message}`);
      }
      
      console.log('✅ Admin user created successfully with ID:', data.user.id);
    } else {
      console.log('✅ Admin user found:', adminUser.id);
      console.log('Email confirmed:', adminUser.email_confirmed_at ? 'Yes' : 'No');
      console.log('Created at:', new Date(adminUser.created_at).toLocaleString());
      console.log('Last sign in:', adminUser.last_sign_in_at ? new Date(adminUser.last_sign_in_at).toLocaleString() : 'Never');
      
      // Step 2: Check user metadata
      console.log('\n2. Checking user metadata...');
      console.log('app_metadata:', JSON.stringify(adminUser.app_metadata, null, 2));
      console.log('user_metadata:', JSON.stringify(adminUser.user_metadata, null, 2));
      
      const hasAdminRoleInAppMetadata = adminUser.app_metadata?.role === 'admin';
      const hasAdminRoleInUserMetadata = adminUser.user_metadata?.role === 'admin';
      
      if (!hasAdminRoleInAppMetadata) {
        console.log('❌ ISSUE: Admin role missing in app_metadata');
      }
      
      if (!hasAdminRoleInUserMetadata) {
        console.log('❌ ISSUE: Admin role missing in user_metadata');
      }
      
      if (!hasAdminRoleInAppMetadata || !hasAdminRoleInUserMetadata) {
        console.log('Updating user metadata...');
        
        const { data, error: updateError } = await supabase.auth.admin.updateUserById(
          adminUser.id,
          { 
            user_metadata: { ...adminUser.user_metadata, role: 'admin' },
            app_metadata: { ...adminUser.app_metadata, role: 'admin' },
            email_confirm: true
          }
        );
        
        if (updateError) {
          throw new Error(`Failed to update user metadata: ${updateError.message}`);
        }
        
        console.log('✅ User metadata updated successfully');
      } else {
        console.log('✅ Admin role properly set in both metadata fields');
      }
    }
    
    // Step 3: Test authentication
    console.log('\n3. Testing authentication...');
    
    // Create a regular client without service role for testing
    const authClient = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmYmVkdm9leHB1bG1tZml0eGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNDY1NTAsImV4cCI6MjA2MDgyMjU1MH0.pTL-Evqap_O9V7ZbTgjWyXrAPjqcktcd2tdqjxmstt4');
    
    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });
    
    if (authError) {
      throw new Error(`Authentication failed: ${authError.message}`);
    }
    
    console.log('✅ Authentication successful, received session:', authData.session ? 'Yes' : 'No');
    
    if (authData.session) {
      console.log('Access Token:', authData.session.access_token.substring(0, 20) + '...');
      console.log('Refresh Token:', authData.session.refresh_token.substring(0, 10) + '...');
      console.log('Expires At:', new Date(authData.session.expires_at * 1000).toLocaleString());
    }
    
    if (authData.user) {
      console.log('User ID:', authData.user.id);
      console.log('User Email:', authData.user.email);
      console.log('app_metadata:', JSON.stringify(authData.user.app_metadata, null, 2));
      console.log('user_metadata:', JSON.stringify(authData.user.user_metadata, null, 2));
    }
    
    // Step 4: Check database row-level security policies
    console.log('\n4. Checking database RLS policies...');
    
    const { data: policiesData, error: policiesError } = await supabase
      .from('pg_catalog.pg_policy')
      .select('polname, polrelid::regclass as table_name, poldescription')
      .eq('polrelid::regclass::text', 'products'); // Check policies on products table
    
    if (policiesError) {
      console.log('❌ Could not check RLS policies:', policiesError.message);
    } else {
      console.log('Policies for the products table:');
      console.table(policiesData);
    }
    
    console.log('\n==============================================');
    console.log('DIAGNOSIS SUMMARY:');
    
    // Create a fake access URL that includes all the right parameters
    const directAccessUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin?direct_access=true`;
    
    console.log(`
1. Access admin panel directly at: ${directAccessUrl}

2. If you still cannot access the admin panel:
   - Clear your browser cookies and localStorage
   - Use the direct access page at: http://localhost:3000/admin-direct-login.html
   - Run this diagnostic script again to ensure the admin user is properly set up

3. System Status:
   - Admin User: ${adminUser ? '✅ Exists' : '❌ Missing'}
   - Admin Role in app_metadata: ${hasAdminRoleInAppMetadata ? '✅ Exists' : '❌ Missing'}
   - Admin Role in user_metadata: ${hasAdminRoleInUserMetadata ? '✅ Exists' : '❌ Missing'}
   - Authentication: ${authError ? '❌ Failed' : '✅ Working'}
    `);
    
  } catch (error) {
    console.error('DIAGNOSTIC ERROR:', error);
  }
}

// Run the diagnosis
diagnoseAuthIssues();
