/**
 * Quick test for the invoice email API endpoint
 * 
 * Run with: node test-local-api.js
 */

const fetch = require('node-fetch');

// Our verified order ID
const orderId = '871b1e20-5a8b-4737-9ed8-46d25855941a';

async function main() {
  try {
    console.log('🧪 Testing invoice email API endpoint...');
    console.log(`Using order ID: ${orderId}`);
    
    // Call the API endpoint
    const response = await fetch('http://localhost:4000/api/invoices/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invoice-mopres-api-key-2025'
      },
      body: JSON.stringify({ orderId })
    });
    
    // Get the response text
    const text = await response.text();
    
    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Response is not valid JSON:', text);
      return;
    }
    
    if (!response.ok) {
      console.error('❌ API Error:', data.error || response.statusText);
      return;
    }
    
    console.log('✅ Email sent successfully!');
    console.log(data);
    console.log('\nCheck your email inbox for the invoice email.');
  } catch (error) {
    console.error('❌ Error calling API:', error.message);
    console.log('\nMake sure the Next.js server is running on port 4000.');
  }
}

main();
