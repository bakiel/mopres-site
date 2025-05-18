// File: scripts/apply-admin-migration.js
// Purpose: Apply the admin-related database migrations to Supabase

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase URL or Service Role Key environment variables.');
  console.error('Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file.');
  process.exit(1);
}

// Create a Supabase client with admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    const migrationFile = path.join(__dirname, '../supabase/migrations/20250517123456_admin_schema.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');
    
    console.log('Applying admin schema migration...');
    
    // Execute the SQL migration
    const { data, error } = await supabase.rpc('pgmigration', {
      sql: sql
    });
    
    if (error) {
      throw error;
    }
    
    console.log('Migration applied successfully:', data);
  } catch (error) {
    console.error('Error applying migration:', error);
    
    // Alternative approach using raw SQL if RPC fails
    console.log('Trying alternative approach with direct SQL...');
    
    try {
      const migrationFile = path.join(__dirname, '../supabase/migrations/20250517123456_admin_schema.sql');
      const sql = fs.readFileSync(migrationFile, 'utf8');
      
      // Split into separate statements and execute each
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      for (const statement of statements) {
        console.log(`Executing statement: ${statement.substring(0, 50)}...`);
        const { error } = await supabase.rpc('exec_sql', { 
          sql_string: statement + ';' 
        });
        
        if (error) {
          console.error('Error executing statement:', error);
        }
      }
      
      console.log('Migration completed using alternative approach.');
    } catch (altError) {
      console.error('Error with alternative approach:', altError);
      console.log('Please apply the migration manually through the Supabase dashboard SQL editor.');
    }
  }
}

applyMigration();
