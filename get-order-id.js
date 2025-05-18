/**
 * Get a recent order ID from the database
 * 
 * This script connects to Supabase and finds a recent valid order
 * Run with: node get-order-id.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://gfbedvoexpulmmfitxje.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🔍 Looking for a recent order...');
  
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('id, order_ref, customer_email, created_at')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!data || data.length === 0) {
      console.log('❌ No orders found in the database');
      return;
    }
    
    const order = data[0];
    console.log('✅ Found recent order:');
    console.log('----------------------------------------');
    console.log(`ID: ${order.id}`);
    console.log(`Reference: ${order.order_ref}`);
    console.log(`Email: ${order.customer_email}`);
    console.log(`Date: ${new Date(order.created_at).toLocaleString()}`);
    console.log('----------------------------------------');
    console.log('\nUse this order ID for testing:');
    console.log(`TEST_ORDER_ID = '${order.id}'`);
  } catch (error) {
    console.error('❌ Error connecting to Supabase:', error.message);
  }
}

main();
