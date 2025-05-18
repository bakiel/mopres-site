/**
 * Test script for sending an official invoice email
 * 
 * Run with: node scripts/test-official-invoice.js
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Import necessary modules
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Initialize Supabase client
const supabaseUrl = 'https://gfbedvoexpulmmfitxje.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// API endpoint for sending invoice emails (your server must be running)
const API_ENDPOINT = 'http://localhost:9999/api/invoices/send-email';
const API_KEY = 'invoice-mopres-api-key-2025';

async function generateTestInvoice(orderRef) {
  console.log(`📄 Generating test invoice PDF for ${orderRef}...`);
  
  // We'll create a simple PDF as a test file
  // For real use, you would use a proper PDF library
  const testInvoicePath = path.join(__dirname, `../temp-invoice-${orderRef}.pdf`);
  
  // Check if we have the upload-test-invoice.js script and use it
  try {
    const { execSync } = require('child_process');
    execSync(`node upload-test-invoice.js --order-ref=${orderRef}`, { stdio: 'inherit' });
    console.log('✅ Used upload-test-invoice.js to generate and upload test invoice');
    return true;
  } catch (error) {
    console.log('⚠️ Could not use upload-test-invoice.js, creating basic test file');
    
    // Create a very simple PDF file with minimal content
    const pdfContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 595 842]/Resources<<>>/Contents 4 0 R/Parent 2 0 R>>endobj
4 0 obj<</Length 50>>stream
BT /F1 12 Tf 100 700 Td (MoPres Invoice - ${orderRef}) Tj ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000010 00000 n
0000000053 00000 n
0000000102 00000 n
0000000187 00000 n
trailer<</Size 5/Root 1 0 R>>
startxref
287
%%EOF`;
    
    fs.writeFileSync(testInvoicePath, pdfContent);
    
    try {
      // Upload to Supabase
      const fileBuffer = fs.readFileSync(testInvoicePath);
      const { data, error } = await supabase
        .storage
        .from('invoices')
        .upload(`invoice_${orderRef}.pdf`, fileBuffer, {
          contentType: 'application/pdf',
          upsert: true
        });
      
      if (error) throw error;
      
      console.log(`✅ Basic test invoice uploaded to Supabase`);
      
      // Clean up temporary file
      fs.unlinkSync(testInvoicePath);
      return true;
    } catch (uploadError) {
      console.error(`❌ Failed to upload test invoice: ${uploadError.message}`);
      return false;
    }
  }
}

async function main() {
  try {
    console.log('🧪 Starting official invoice email test...');
    
    // Get a valid order ID for testing
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('id, order_ref, customer_email')
      .limit(1)
      .single();
    
    if (orderError) {
      throw new Error(`Error fetching order data: ${orderError.message}`);
    }
    
    if (!orderData) {
      throw new Error('No orders found in the database. Please create an order first.');
    }
    
    console.log(`✅ Using order reference: ${orderData.order_ref} (${orderData.id})`);
    console.log(`📧 Email will be sent to: ${orderData.customer_email}`);
    
    // Check if invoice PDF exists
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from('invoices')
      .download(`invoice_${orderData.order_ref}.pdf`);
    
    let invoiceExists = true;
    
    if (fileError) {
      console.log('⚠️ Invoice PDF not found. Generating a test invoice...');
      invoiceExists = await generateTestInvoice(orderData.order_ref);
      
      if (!invoiceExists) {
        throw new Error('Failed to generate and upload test invoice');
      }
    } else {
      console.log(`✅ Invoice PDF found for reference: ${orderData.order_ref}`);
    }
    
    if (!invoiceExists) {
      throw new Error('No invoice PDF available for the order. Please generate one first.');
    }
    
    // Send the invoice email using the API endpoint
    console.log(`📤 Sending invoice email through API...`);
    
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        orderId: orderData.id
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`API Error: ${result.error || response.statusText}`);
    }
    
    console.log(`✅ Success! Official invoice email sent.`);
    console.log(result);
    
    console.log(`\n📧 Check ${orderData.customer_email} for the invoice email.`);
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    console.error('Make sure:');
    console.error('1. Your Next.js server is running on port 9999');
    console.error('2. You have valid RESEND_API_KEY in your .env.local file');
    console.error('3. You have verified your domain in Resend');
    console.error('4. The invoices bucket exists in Supabase');
  }
}

main();
