/**
 * Test script for the invoice email API endpoint
 * 
 * This script tests the Next.js API route for invoice email functionality
 * Run with: node test-api.js
 */

const fetch = require('node-fetch');

// Mock order ID - CHANGE THIS to a real order ID from your database
const TEST_ORDER_ID = '871b1e20-5a8b-4737-9ed8-46d25855941a';

async function main() {
  console.log('🧪 Testing Invoice Email API endpoint...');
  
  try {
    const response = await fetch('http://localhost:3000/api/invoices/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invoice-mopres-api-key-2025'
      },
      body: JSON.stringify({ orderId: TEST_ORDER_ID })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', data.error);
      return;
    }
    
    console.log('✅ API call successful!');
    console.log(data);
  } catch (error) {
    console.error('❌ Error making API request:', error.message);
    console.log('\nMake sure your Next.js development server is running:');
    console.log('npm run dev');
  }
}

main();
