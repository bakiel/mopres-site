// Script to create an admin user in Supabase
const { createClient } = require('@supabase/supabase-js');

// Supabase connection details
const supabaseUrl = 'https://gfbedvoexpulmmfitxje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmYmVkdm9leHB1bG1tZml0eGplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTI0NjU1MCwiZXhwIjoyMDYwODIyNTUwfQ.I3wR6D-H9_BBJRjjY1CiD2pnX7aRgRbkgnOzCnmh70s';

// Admin user details
const adminEmail = 'admin@mopres.co.za';
const adminPassword = 'secureAdminPassword123';

async function createAdminUser() {
  try {
    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('Creating admin user...');
    
    // 1. Create user with email and password
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        role: 'admin' // Set role as admin in metadata
      }
    });
    
    if (createError) {
      throw createError;
    }
    
    console.log('User created successfully:', userData.user.id);
    
    // 2. Insert admin user into admin_users table
    const { error: insertError } = await supabase
      .from('admin_users')
      .insert({
        id: userData.user.id,
        email: adminEmail,
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        permissions: { all: true },
        created_at: new Date().toISOString()
      });
    
    if (insertError) {
      throw insertError;
    }
    
    console.log('Admin user added to admin_users table');
    console.log('----------------------------------');
    console.log('Admin user created successfully!');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('Login at: http://localhost:3001/admin/login');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
    
    // If user exists, attempt to update it
    if (error.message && error.message.includes('already exists')) {
      console.log('User already exists, updating user role...');
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        // Search for user by email
        const { data: { users }, error: searchError } = await supabase.auth.admin.listUsers();
        
        if (searchError) throw searchError;
        
        const existingUser = users.find(u => u.email === adminEmail);
        
        if (!existingUser) {
          console.error('Could not find existing user');
          return;
        }
        
        // Update user metadata
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          { user_metadata: { role: 'admin' } }
        );
        
        if (updateError) throw updateError;
        
        console.log('User role updated successfully');
        
        // Check if user exists in admin_users table
        const { data: adminUser, error: checkError } = await supabase
          .from('admin_users')
          .select()
          .eq('id', existingUser.id)
          .single();
        
        if (checkError && !checkError.message.includes('No rows found')) throw checkError;
        
        if (!adminUser) {
          // Insert into admin_users table
          const { error: insertError } = await supabase
            .from('admin_users')
            .insert({
              id: existingUser.id,
              email: adminEmail,
              first_name: 'Admin',
              last_name: 'User',
              role: 'admin',
              permissions: { all: true },
              created_at: new Date().toISOString()
            });
          
          if (insertError) throw insertError;
          console.log('Admin user added to admin_users table');
        }
        
        console.log('----------------------------------');
        console.log('Admin user updated successfully!');
        console.log('Email:', adminEmail);
        console.log('Password: [unchanged]');
        console.log('Login at: http://localhost:3001/admin/login');
        
      } catch (updateError) {
        console.error('Error updating user:', updateError);
      }
    }
  }
}

// Run the function
createAdminUser();
