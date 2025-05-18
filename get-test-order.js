/**
 * Quick script to get a random order from the database
 * 
 * This script will fetch a random order from the Supabase database,
 * so you can use its order_ref for testing the order confirmation page.
 * 
 * Run with: node get-test-order.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gfbedvoexpulmmfitxje.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function getRandomOrder() {
  console.log('🔍 Looking up a sample order for testing...');
  try {
    // First try to get most recent order
    const { data: latestOrder, error: latestError } = await supabase
      .from('orders')
      .select('id, order_ref, customer_email, total_amount, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (latestOrder) {
      console.log('\n✅ Found recent order:');
      console.log(`  - ID: ${latestOrder.id}`);
      console.log(`  - Reference: ${latestOrder.order_ref}`);
      console.log(`  - Email: ${latestOrder.customer_email}`);
      console.log(`  - Amount: R${latestOrder.total_amount.toFixed(2)}`);
      console.log(`  - Created: ${new Date(latestOrder.created_at).toLocaleString()}`);
      console.log('\n🔗 Test URL:');
      console.log(`  http://localhost:3010/checkout/confirmation?orderRef=${latestOrder.order_ref}`);
      return;
    }
    
    // Otherwise, get any order
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, order_ref, customer_email, total_amount, created_at')
      .limit(5);
    
    if (error) {
      console.error('❌ Error fetching orders:', error);
      return;
    }
    
    if (!orders || orders.length === 0) {
      console.log('❌ No orders found in the database');
      console.log('Please create a test order first');
      return;
    }
    
    // Just take the first order
    const testOrder = orders[0];
    
    console.log('\n✅ Found test order:');
    console.log(`  - ID: ${testOrder.id}`);
    console.log(`  - Reference: ${testOrder.order_ref}`);
    console.log(`  - Email: ${testOrder.customer_email}`);
    console.log(`  - Amount: R${testOrder.total_amount.toFixed(2)}`);
    console.log(`  - Created: ${new Date(testOrder.created_at).toLocaleString()}`);
    
    console.log('\n🔗 Test URL:');
    console.log(`  http://localhost:3010/checkout/confirmation?orderRef=${testOrder.order_ref}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the function
getRandomOrder();
