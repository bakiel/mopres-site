// Script to apply all migrations to Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase credentials
const supabaseUrl = 'https://gfbedvoexpulmmfitxje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmYmVkdm9leHB1bG1tZml0eGplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTI0NjU1MCwiZXhwIjoyMDYwODIyNTUwfQ.I3wR6D-H9_BBJRjjY1CiD2pnX7aRgRbkgnOzCnmh70s';

// Create a Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

async function applyAllMigrations() {
  try {
    const migrationsDir = path.join(__dirname, '../supabase/migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Apply migrations in alphabetical order
    
    console.log('Found migration files:', migrationFiles);
    
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      console.log(`Applying migration: ${file}...`);
      
      try {
        // Execute raw SQL directly
        const { error } = await supabase.rpc('exec_sql', { 
          sql_string: sql 
        });
        
        if (error) {
          console.error(`Error applying migration ${file}:`, error);
          
          // Try to execute statement by statement for better error reporting
          console.log(`Attempting to execute ${file} statement by statement...`);
          
          const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);
          
          for (const statement of statements) {
            const truncatedStatement = statement.length > 100 
              ? statement.substring(0, 100) + '...' 
              : statement;
            
            console.log(`Executing: ${truncatedStatement}`);
            
            try {
              const { error: stmtError } = await supabase.rpc('exec_sql', { 
                sql_string: statement + ';' 
              });
              
              if (stmtError) {
                console.error('Statement error:', stmtError);
              }
            } catch (stmtExecError) {
              console.error('Statement execution error:', stmtExecError);
            }
          }
        } else {
          console.log(`Successfully applied migration: ${file}`);
        }
      } catch (executeError) {
        console.error(`Error executing migration ${file}:`, executeError);
      }
    }
    
    console.log('Migration process completed!');
  } catch (error) {
    console.error('Error applying migrations:', error);
  }
}

// Run migrations
applyAllMigrations();
