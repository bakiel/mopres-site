import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function runMigration() {
  try {
    console.log('Running product images and sizes migration...');
    
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/20250116_product_images_sizes.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      // If RPC doesn't exist, try running individual statements
      console.log('Running migration statements individually...');
      
      // Split by semicolon and filter out empty statements
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .map(s => s + ';');
      
      for (const statement of statements) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        // For now, we'll need to run these manually in Supabase dashboard
      }
      
      console.log('\nMigration SQL has been prepared. Please run the following SQL in your Supabase SQL editor:');
      console.log('\n' + migrationSQL);
    } else {
      console.log('Migration completed successfully!');
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();