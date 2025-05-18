// Login test script
const { createClient } = require('@supabase/supabase-js')

// Supabase connection details
const supabaseUrl = 'https://gfbedvoexpulmmfitxje.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmYmVkdm9leHB1bG1tZml0eGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNDY1NTAsImV4cCI6MjA2MDgyMjU1MH0.pTL-Evqap_O9V7ZbTgjWyXrAPjqcktcd2tdqjxmstt4'

// Admin user details
const adminEmail = 'admin@mopres.co.za'
const adminPassword = 'secureAdminPassword123'

// Create the client with anon key (like browser would use)
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Don't persist session for this test
  },
})

async function testLogin() {
  try {
    console.log('Testing login with admin credentials...')
    console.log('Email:', adminEmail)
    console.log('Password:', adminPassword)
    
    // Try to sign in with password
    const { data, error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    })
    
    if (error) {
      console.error('Login failed with error:', error)
      return
    }
    
    console.log('Login successful!')
    console.log('User data:', data.user)
    console.log('Session:', data.session)
    
    // Specifically check for the admin role
    const userRole = data.user?.app_metadata?.role
    console.log('User role:', userRole)
    
    if (userRole === 'admin') {
      console.log('Verified admin role in app_metadata!')
    } else {
      console.error('User does not have admin role in app_metadata!')
      console.log('app_metadata:', data.user.app_metadata)
    }
    
    // Check user_metadata too
    console.log('user_metadata:', data.user.user_metadata)
    
  } catch (error) {
    console.error('Test failed with error:', error)
  }
}

// Run the test
testLogin()
