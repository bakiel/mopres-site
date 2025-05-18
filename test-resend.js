/**
 * Quick test for Resend API connection
 * 
 * This script tests your Resend API key by sending a test email
 * Run with: node test-resend.js
 */

require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email address to test with - CHANGE THIS!
const TEST_EMAIL = 'bakielisrael@gmail.com';

async function main() {
  console.log('🧪 Testing Resend API connection...');
  console.log(`Using API key: ${process.env.RESEND_API_KEY.substring(0, 8)}...`);

  try {
    const { data, error } = await resend.emails.send({
      from: 'MoPres Test <onboarding@resend.dev>', // Use onboarding domain for initial test
      to: [TEST_EMAIL],
      subject: 'MoPres Invoice System Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h1 style="color: #AF8F53;">MoPres Invoice Email Test</h1>
          <p>This is a test of the invoice email system.</p>
          <p>If you're receiving this, the Resend API connection is working correctly!</p>
          <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <small>Test sent: ${new Date().toISOString()}</small>
          </p>
        </div>
      `
    });

    if (error) {
      console.error('❌ Error sending test email:');
      console.error(error);
      return;
    }

    console.log('✅ Test email sent successfully!');
    console.log(`📧 Email ID: ${data.id}`);
    console.log(`📬 Sent to: ${TEST_EMAIL}`);
    console.log('\nNext steps:');
    console.log('1. Check your email inbox for the test message');
    console.log('2. Run the full setup script: ./setup-invoice-email.sh');
    console.log('3. Test the complete system: node scripts/test-invoice-email.js');
  } catch (error) {
    console.error('❌ Error connecting to Resend API:');
    console.error(error);
    console.log('\nPossible solutions:');
    console.log('- Check your API key in .env.local');
    console.log('- Verify your Resend account status');
    console.log('- Check network connectivity');
  }
}

main();
