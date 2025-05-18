#!/usr/bin/env node

/**
 * Test script for the standalone email service
 * This script tests the direct integration with the email service without going through the Edge Function
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

// Import the standalone email service
const emailService = require('./src/lib/email/standalone-email-service').default;

// Get order reference from command-line arguments
const orderRef = process.argv[2];
const testEmail = process.argv[3]; // Optional test email

// Validate arguments
if (!orderRef) {
  console.error('\x1b[31m%s\x1b[0m', 'Error: Missing order reference number');
  console.log('Usage:');
  console.log('  node test-standalone-email.js <orderRef> [test-email@example.com]');
  process.exit(1);
}

// Function to run the test
async function runTest() {
  console.log('\x1b[36m%s\x1b[0m', '--- MoPres Standalone Email Service Test ---');
  console.log(`Order Reference: ${orderRef}`);
  console.log(`Test Email: ${testEmail || '(Using customer email)'}`);
  console.log('-'.repeat(50));
  
  // Step 1: Test fetching the order
  console.log('\x1b[36m%s\x1b[0m', '1. Fetching order data...');
  const order = await emailService.fetchOrder(orderRef);
  
  if (!order) {
    console.error('\x1b[31m%s\x1b[0m', `❌ Error: Order with reference ${orderRef} not found.`);
    process.exit(1);
  }
  
  console.log('\x1b[32m%s\x1b[0m', '✅ Order found:');
  console.log(`   Customer: ${order.customer_name}`);
  console.log(`   Email: ${order.customer_email}`);
  console.log(`   Amount: R ${order.total_amount.toFixed(2)}`);
  console.log(`   Status: ${order.status}`);
  console.log(`   Items: ${order.order_items.length}`);
  console.log('-'.repeat(50));
  
  // Step 2: Test generating invoice HTML
  console.log('\x1b[36m%s\x1b[0m', '2. Generating invoice HTML...');
  
  try {
    const invoiceHtml = emailService.generateInvoiceHtml(order);
    console.log('\x1b[32m%s\x1b[0m', `✅ Successfully generated invoice HTML (${invoiceHtml.length} characters)`);
    
    // Optionally save the HTML to a file for inspection
    const fs = require('fs');
    const path = require('path');
    const htmlFilePath = path.join(__dirname, `invoice_${orderRef}_test.html`);
    
    fs.writeFileSync(htmlFilePath, invoiceHtml);
    console.log(`   Invoice HTML saved to: ${htmlFilePath}`);
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', `❌ Error generating invoice HTML: ${error.message}`);
  }
  
  console.log('-'.repeat(50));
  
  // Step 3: Test generating confirmation email HTML
  console.log('\x1b[36m%s\x1b[0m', '3. Generating confirmation email HTML...');
  
  try {
    const emailHtml = emailService.generateOrderConfirmationEmailHtml(order, true);
    console.log('\x1b[32m%s\x1b[0m', `✅ Successfully generated confirmation email HTML (${emailHtml.length} characters)`);
    
    // Optionally save the HTML to a file for inspection
    const fs = require('fs');
    const path = require('path');
    const htmlFilePath = path.join(__dirname, `confirmation_${orderRef}_test.html`);
    
    fs.writeFileSync(htmlFilePath, emailHtml);
    console.log(`   Confirmation email HTML saved to: ${htmlFilePath}`);
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', `❌ Error generating confirmation email HTML: ${error.message}`);
  }
  
  console.log('-'.repeat(50));
  
  // Step 4: Test sending the email
  console.log('\x1b[36m%s\x1b[0m', '4. Sending order confirmation email...');
  console.log('   (This will actually send an email, please confirm Y/n)');
  
  // Ask for confirmation before sending
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('   Proceed? ', async (answer) => {
    if (answer.toLowerCase() === 'n' || answer.toLowerCase() === 'no') {
      console.log('\x1b[33m%s\x1b[0m', '⚠️ Email sending skipped.');
      rl.close();
      return;
    }
    
    console.log('   Sending email...');
    
    try {
      const startTime = Date.now();
      const result = await emailService.sendOrderConfirmationEmail(
        orderRef,
        true, // Include invoice
        testEmail
      );
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      if (result.success) {
        console.log('\x1b[32m%s\x1b[0m', `✅ Email sent successfully in ${duration} seconds!`);
        console.log(`   Message: ${result.message}`);
        if (result.data) {
          console.log(`   Email ID: ${result.data.emailId || 'Not available'}`);
          console.log(`   Sent to: ${result.data.sentTo}`);
        }
      } else {
        console.error('\x1b[31m%s\x1b[0m', `❌ Error sending email: ${result.message}`);
      }
    } catch (error) {
      console.error('\x1b[31m%s\x1b[0m', `❌ Exception sending email: ${error.message}`);
    }
    
    rl.close();
  });
}

// Run the test
runTest().catch(error => {
  console.error('\x1b[31m%s\x1b[0m', 'Unhandled error:');
  console.error(error);
  process.exit(1);
});
