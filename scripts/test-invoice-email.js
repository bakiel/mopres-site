/**
 * Test script for the invoice email system
 * 
 * Usage:
 * node scripts/test-invoice-email.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    console.log('📧 Testing Invoice Email System...');
    
    // Use a specific known order ID instead of fetching a random one
    const orderId = '871b1e20-5a8b-4737-9ed8-46d25855941a';
    console.log(`\n✅ Using order ID: ${orderId}`);
    
    // Check if invoice exists in storage
    console.log('\n🔍 Checking if invoice exists in storage...');
    const invoiceFileName = `invoice_MP-676330.pdf`;
    const { data: existsData } = await supabase
      .storage
      .from('invoices')
      .list('', {
        search: invoiceFileName
      });
    
    const invoiceExists = existsData && existsData.length > 0 && 
      existsData.some(file => file.name === invoiceFileName);
    
    if (!invoiceExists) {
      console.log('⚠️ Invoice not found in storage. We need to upload it first.');
      console.log('   You need to implement this part or manually upload the invoice.');
      console.log('   For now, we\'ll skip this step and try to send the email.');
    } else {
      console.log(`✅ Invoice found: ${invoiceFileName}`);
    }
    
    // 3. Test sending the invoice email
    console.log('\n📤 Testing invoice email sending...');
    
    const invoiceApiKey = process.env.NEXT_PUBLIC_INVOICE_API_KEY;
    if (!invoiceApiKey) {
      throw new Error('NEXT_PUBLIC_INVOICE_API_KEY is not set in .env file');
    }
    
    // Use fetch to call our API endpoint
    const response = await fetch(`${supabaseUrl}/functions/v1/send-invoice-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${invoiceApiKey}`
      },
      body: JSON.stringify({ orderId: orderId })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`API error: ${result.error || response.statusText}`);
    }
    
    console.log(`✅ Email sent successfully: ${result.message}`);
    console.log(`📧 Email ID: ${result.emailId}`);
    
    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error(error);
    process.exit(1);
  }
}

main();
