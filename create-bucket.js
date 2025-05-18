/**
 * Create the invoices storage bucket in Supabase
 * 
 * This script creates the required storage bucket for invoice PDFs
 * Run with: node create-bucket.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://gfbedvoexpulmmfitxje.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    console.log('🧰 Setting up Supabase storage for invoices...');
    
    // Check if the bucket already exists
    const { data: buckets, error: listError } = await supabase
      .storage
      .listBuckets();
    
    if (listError) {
      throw new Error(`Error listing buckets: ${listError.message}`);
    }
    
    const invoiceBucket = buckets.find(bucket => bucket.name === 'invoices');
    
    if (invoiceBucket) {
      console.log('✅ Invoices bucket already exists');
    } else {
      // Create the bucket
      console.log('Creating invoices bucket...');
      const { data, error } = await supabase
        .storage
        .createBucket('invoices', {
          public: true,
          fileSizeLimit: 10485760, // 10MB limit per file
        });
        
      if (error) {
        throw new Error(`Error creating bucket: ${error.message}`);
      }
      
      console.log('✅ Invoices bucket created successfully');
    }
    
    // Update bucket permissions to be public
    console.log('Setting bucket to public...');
    const { error: updateError } = await supabase
      .storage
      .updateBucket('invoices', {
        public: true,
      });
      
    if (updateError) {
      console.warn(`⚠️ Warning: ${updateError.message}`);
    } else {
      console.log('✅ Bucket permissions updated to public');
    }
    
    console.log('\n🎉 Storage setup complete');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
