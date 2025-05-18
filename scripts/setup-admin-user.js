// Simplified script to create an admin user with appropriate app_metadata
const { createClient } = require('@supabase/supabase-js')

// Supabase connection details
const supabaseUrl = 'https://gfbedvoexpulmmfitxje.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmYmVkdm9leHB1bG1tZml0eGplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTI0NjU1MCwiZXhwIjoyMDYwODIyNTUwfQ.I3wR6D-H9_BBJRjjY1CiD2pnX7aRgRbkgnOzCnmh70s'

// Admin user details
const adminEmail = 'admin@mopres.co.za'
const adminPassword = 'secureAdminPassword123'

// Create the client with service role - disabling auth persistence for server-side use
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})

async function setupAdminUser() {
  try {
    console.log('Setting up admin user...')
    
    // First check if the user already exists
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      throw listError
    }
    
    const existingUser = users.find(user => user.email === adminEmail)
    
    if (existingUser) {
      console.log('User already exists, updating role metadata...')
      
      // Update user's metadata to include admin role
      const { data, error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        { 
          user_metadata: { name: 'Admin User' },
          app_metadata: { role: 'admin' },
          email_confirm: true
        }
      )
      
      if (updateError) {
        throw updateError
      }
      
      console.log('User metadata updated successfully')
    } else {
      console.log('Creating new admin user...')
      
      // Create new user with admin role
      const { data, error: createError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { name: 'Admin User' },
        app_metadata: { role: 'admin' }
      })
      
      if (createError) {
        throw createError
      }
      
      console.log('User created successfully with ID:', data.user.id)
    }
    
    console.log('----------------------------------')
    console.log('Admin user setup completed successfully!')
    console.log('Email:', adminEmail)
    console.log('Password:', adminPassword)
    console.log('Login at: http://localhost:3001/admin/login')
    
  } catch (error) {
    console.error('Error setting up admin user:', error)
  }
}

// Run the function
setupAdminUser()
