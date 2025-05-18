// Direct SQL execution to create admin_users table
const { createClient } = require('@supabase/supabase-js');

// Supabase connection details
const supabaseUrl = 'https://gfbedvoexpulmmfitxje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmYmVkdm9leHB1bG1tZml0eGplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTI0NjU1MCwiZXhwIjoyMDYwODIyNTUwfQ.I3wR6D-H9_BBJRjjY1CiD2pnX7aRgRbkgnOzCnmh70s';

// Create the client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

async function createAdminUsersTable() {
  try {
    console.log('Creating admin_users table...');
    
    // Direct SQL execution
    const { data, error } = await supabase
      .from('_sql')
      .rpc('run', { 
        query: `
        -- Admin users table
        CREATE TABLE IF NOT EXISTS public.admin_users (
          id UUID PRIMARY KEY REFERENCES auth.users(id),
          email VARCHAR NOT NULL UNIQUE,
          first_name VARCHAR,
          last_name VARCHAR,
          role VARCHAR NOT NULL DEFAULT 'viewer',
          permissions JSONB,
          last_login TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Add RLS policies for admin_users
        ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Admin users can read admin_users" 
          ON public.admin_users 
          FOR SELECT 
          USING (
            (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin'
          );

        CREATE POLICY "Admin users can insert admin_users" 
          ON public.admin_users 
          FOR INSERT 
          WITH CHECK (
            (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin'
          );

        CREATE POLICY "Admin users can update admin_users" 
          ON public.admin_users 
          FOR UPDATE 
          USING (
            (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin'
          );
        `
      });
    
    if (error) {
      console.error('Error creating admin_users table:', error);

      console.log('Trying alternative approach...');
      const { data: altData, error: altError } = await supabase
        .from('_schemas')
        .rpc('apply', {
          definition: `
          -- Admin users table
          CREATE TABLE IF NOT EXISTS public.admin_users (
            id UUID PRIMARY KEY REFERENCES auth.users(id),
            email VARCHAR NOT NULL UNIQUE,
            first_name VARCHAR,
            last_name VARCHAR,
            role VARCHAR NOT NULL DEFAULT 'viewer',
            permissions JSONB,
            last_login TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          -- Add RLS policies for admin_users
          ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

          CREATE POLICY "Admin users can read admin_users" 
            ON public.admin_users 
            FOR SELECT 
            USING (
              (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin'
            );

          CREATE POLICY "Admin users can insert admin_users" 
            ON public.admin_users 
            FOR INSERT 
            WITH CHECK (
              (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin'
            );

          CREATE POLICY "Admin users can update admin_users" 
            ON public.admin_users 
            FOR UPDATE 
            USING (
              (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin'
            );
          `
        });

      if (altError) {
        console.error('Alternative approach also failed:', altError);
      } else {
        console.log('Successfully created admin_users table using alternative approach');
      }
    } else {
      console.log('Successfully created admin_users table');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the function
createAdminUsersTable();
