#!/usr/bin/env node

/**
 * Standalone script to send order confirmation emails with PDF invoices
 * Usage:
 *   node send-invoice-email.js <orderRef> [--test-email=email@example.com] [--no-invoice] [--verbose]
 */

// Load environment variables from .env files
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { sendOrderConfirmationEmail, fetchOrder } = require('../src/lib/email/standalone-email-service');

// Get command line arguments
const args = process.argv.slice(2);
const orderRef = args[0];

// Parse options
const options = {
  testEmail: null,
  includeInvoice: true,
  verbose: false
};

// Process arguments
args.slice(1).forEach(arg => {
  if (arg.startsWith('--test-email=')) {
    options.testEmail = arg.replace('--test-email=', '');
  } else if (arg === '--no-invoice') {
    options.includeInvoice = false;
  } else if (arg === '--verbose') {
    options.verbose = true;
  }
});

// Validate arguments
if (!orderRef) {
  console.error('\x1b[31m%s\x1b[0m', 'Error: Missing order reference number');
  console.log('Usage:');
  console.log('  node send-invoice-email.js <orderRef> [--test-email=email@example.com] [--no-invoice] [--verbose]');
  process.exit(1);
}

// Log settings
if (options.verbose) {
  console.log('Settings:');
  console.log(`  Order Reference: ${orderRef}`);
  console.log(`  Test Email: ${options.testEmail || 'Not specified (using customer email)'}`);
  console.log(`  Include Invoice: ${options.includeInvoice ? 'Yes' : 'No'}`);
  console.log('');
}

// Main function
async function main() {
  console.log('\x1b[36m%s\x1b[0m', `Sending order confirmation email for order ${orderRef}...`);
  
  try {
    // Verify the order exists before proceeding
    const order = await fetchOrder(orderRef);
    if (!order) {
      console.error('\x1b[31m%s\x1b[0m', `Error: Order with reference ${orderRef} not found.`);
      process.exit(1);
    }
    
    if (options.verbose) {
      console.log('\x1b[36m%s\x1b[0m', 'Order found:');
      console.log(`  Customer: ${order.customer_name}`);
      console.log(`  Email: ${order.customer_email}`);
      console.log(`  Amount: R ${order.total_amount.toFixed(2)}`);
      console.log(`  Status: ${order.status}`);
      console.log(`  Items: ${order.order_items.length}`);
      console.log('');
    }
    
    // Destination email
    const email = options.testEmail || order.customer_email;
    console.log(`Preparing to send email to: ${email}`);
    
    // Send the email
    const startTime = Date.now();
    console.log('Sending email...');
    
    const result = await sendOrderConfirmationEmail(
      orderRef,
      options.includeInvoice,
      options.testEmail
    );
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    if (result.success) {
      console.log('\x1b[32m%s\x1b[0m', `Success! Email sent in ${duration} seconds.`);
      if (options.verbose && result.data) {
        console.log('\x1b[36m%s\x1b[0m', 'Email details:');
        console.log(`  Email ID: ${result.data.emailId || 'Not available'}`);
        console.log(`  Sent to: ${result.data.sentTo}`);
        console.log('');
      }
    } else {
      console.error('\x1b[31m%s\x1b[0m', `Error: ${result.message}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'Error sending email:');
    console.error(error);
    process.exit(1);
  }
}

// Execute the main function
main().catch(error => {
  console.error('\x1b[31m%s\x1b[0m', 'Unhandled error:');
  console.error(error);
  process.exit(1);
});
