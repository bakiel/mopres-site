/**
 * API Request Test for Order Emails
 * 
 * This script tests the API endpoint for sending order emails
 */

require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

// Order ID to test with - CHANGE THIS to a real order ID from your database
const TEST_ORDER_ID = 'YOUR_ORDER_ID'; // Replace with a real order ID

async function testApi() {
  console.log('🧪 Testing Order Emails API...');
  
  try {
    const response = await fetch('http://localhost:3010/api/orders/send-emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mopres-order-emails-api-key-2025'
      },
      body: JSON.stringify({
        orderId: TEST_ORDER_ID,
        generateNewInvoice: true
      })
    });
    
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('API Response:', data);
      
      if (response.ok) {
        console.log('✅ API test passed!');
      } else {
        console.error('❌ API error:', data.error || 'Unknown error');
      }
    } else {
      const text = await response.text();
      console.error('❌ Non-JSON response:', text);
      console.error('Status:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Error making API request:', error.message);
  }
}

// Ask for order ID if not provided
if (TEST_ORDER_ID === 'YOUR_ORDER_ID') {
  console.error('Please edit this script to include a real order ID from your database.');
  console.log('Example: const TEST_ORDER_ID = "12345";');
  process.exit(1);
}

testApi();
