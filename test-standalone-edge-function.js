#!/usr/bin/env node

/**
 * Test script for the standalone email Edge Function
 * This script helps diagnose if the issue is with the API or with the client code
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Get command line args
const orderRef = process.argv[2];
const testEmail = process.argv[3]; // Optional test email

// Validate arguments
if (!orderRef) {
  console.error('\x1b[31m%s\x1b[0m', 'Error: Missing order reference number');
  console.log('Usage:');
  console.log('  node test-standalone-edge-function.js <orderRef> [test-email@example.com]');
  process.exit(1);
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('\x1b[31m%s\x1b[0m', 'Error: Missing Supabase environment variables');
  console.log('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log('\x1b[36m%s\x1b[0m', '--- Testing Standalone Email Edge Function ---');
  console.log(`Order Reference: ${orderRef}`);
  console.log(`Test Email: ${testEmail || '(Using customer email)'}`);
  console.log('-'.repeat(50));
  
  try {
    console.log('Calling edge function "send-invoice-email-standalone"...');
    
    const { data, error } = await supabase.functions.invoke('send-invoice-email-standalone', {
      body: {
        orderRef: orderRef,
        includeInvoice: true,
        testEmail: testEmail || undefined, // Only include if provided
      }
    });
    
    if (error) {
      console.error('\x1b[31m%s\x1b[0m', 'Edge function error:');
      console.error(error);
      process.exit(1);
    }
    
    console.log('\x1b[32m%s\x1b[0m', '✅ Success! Edge function response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\x1b[32m%s\x1b[0m', '🎉 Email was sent successfully!');
      console.log(`Message: ${data.message}`);
      console.log(`Sent to: ${data.order?.sent_to || 'Unknown'}`);
      console.log(`Email ID: ${data.email?.id || 'Not available'}`);
      console.log(`Included attachment: ${data.email?.included_attachment ? 'Yes' : 'No'}`);
    } else {
      console.error('\x1b[31m%s\x1b[0m', '❌ Email sending failed:');
      console.error(`Error: ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'Error calling edge function:');
    console.error(error);
    
    // Check if edge function exists
    console.log('\n\x1b[33m%s\x1b[0m', 'This could be due to the edge function not being deployed yet.');
    console.log('To deploy the edge function, use the Supabase CLI:');
    console.log('supabase functions deploy send-invoice-email-standalone');
  }
}

main();
