// Test script to check if admin user exists with proper role
const { createClient } = require('@supabase/supabase-js');

// Supabase connection details
const supabaseUrl = 'https://gfbedvoexpulmmfitxje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmYmVkdm9leHB1bG1tZml0eGplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTI0NjU1MCwiZXhwIjoyMDYwODIyNTUwfQ.I3wR6D-H9_BBJRjjY1CiD2pnX7aRgRbkgnOzCnmh70s';

// Admin email to check
const adminEmail = 'admin@mopres.co.za';

// Create the client with service role - disabling auth persistence for server-side use
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

async function checkAdminUser() {
  try {
    console.log('Checking admin user setup...');
    
    // List all users
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      throw listError;
    }
    
    console.log(`Found ${users.length} users in the system`);
    
    // Find the admin user
    const adminUser = users.find(user => user.email === adminEmail);
    
    if (!adminUser) {
      console.error('Admin user not found!');
      return;
    }
    
    console.log('Admin user found:');
    console.log('Email:', adminUser.email);
    console.log('ID:', adminUser.id);
    console.log('Created At:', new Date(adminUser.created_at).toLocaleString());
    console.log('Last Sign In:', adminUser.last_sign_in_at ? new Date(adminUser.last_sign_in_at).toLocaleString() : 'Never');
    console.log('Email Confirmed:', adminUser.email_confirmed_at ? 'Yes' : 'No');
    
    // Check user metadata
    console.log('\nUser Metadata:');
    console.log(JSON.stringify(adminUser.user_metadata, null, 2));
    
    // Check app metadata 
    console.log('\nApp Metadata (should contain admin role):');
    console.log(JSON.stringify(adminUser.app_metadata, null, 2));
    
    // Verify admin role
    const hasAdminRole = adminUser.app_metadata && adminUser.app_metadata.role === 'admin';
    
    if (hasAdminRole) {
      console.log('\n✅ Admin user is properly configured with admin role.');
    } else {
      console.error('\n❌ Admin user does NOT have the admin role in app_metadata!');
      
      // Try to update the role
      console.log('Attempting to fix by updating app_metadata...');
      
      const { data, error: updateError } = await supabase.auth.admin.updateUserById(
        adminUser.id,
        { 
          user_metadata: { name: 'Admin User' },
          app_metadata: { role: 'admin' },
          email_confirm: true
        }
      );
      
      if (updateError) {
        console.error('Failed to update user metadata:', updateError);
      } else {
        console.log('✅ User metadata updated successfully!');
      }
    }
    
    // Try a test login
    console.log('\nAttempting a test login with admin credentials...');
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: 'secureAdminPassword123',
    });
    
    if (signInError) {
      console.error('❌ Test login failed:', signInError);
    } else {
      console.log('✅ Test login successful!');
      console.log('Session expires at:', new Date(signInData.session.expires_at * 1000).toLocaleString());
    }
    
  } catch (error) {
    console.error('Error checking admin user:', error);
  }
}

// Run the check
checkAdminUser();
