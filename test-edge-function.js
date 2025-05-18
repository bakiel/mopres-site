/**
 * Test the Supabase edge function directly
 * 
 * This script tests sending an email through the Supabase edge function
 * Run with: node test-edge-function.js
 */

require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

// Constants
const supabaseUrl = 'https://gfbedvoexpulmmfitxje.supabase.co';
const orderId = '871b1e20-5a8b-4737-9ed8-46d25855941a';
const apiKey = 'invoice-mopres-api-key-2025';

async function main() {
  try {
    console.log('📧 Testing Supabase edge function directly...');
    console.log(`Order ID: ${orderId}`);
    
    // Call the edge function directly with our API key
    const response = await fetch(`${supabaseUrl}/functions/v1/send-invoice-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ orderId })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP Error: ${response.status} ${response.statusText}`);
      console.error(`Response: ${errorText}`);
      return;
    }
    
    const result = await response.json();
    
    console.log('✅ Edge function response:');
    console.log(result);
    console.log('\n🎉 Test completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('This could be due to the edge function not being deployed yet.');
    console.log('\nTo deploy the edge functions, use the Supabase CLI:');
    console.log('supabase login');
    console.log('supabase link --project-ref gfbedvoexpulmmfitxje');
    console.log('supabase functions deploy send-invoice-email');
  }
}

main();
