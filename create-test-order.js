/**
 * Create a test order for development and testing
 * 
 * This script will add a test order to the Supabase database
 * so you can test the order confirmation page and email functionality.
 * 
 * Run with: node create-test-order.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gfbedvoexpulmmfitxje.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Generate a random order reference
const generateOrderRef = () => {
  const prefix = 'TST';
  const randomNum = Math.floor(10000 + Math.random() * 90000); // 5-digit number
  return `${prefix}${randomNum}`;
};

async function createTestOrder() {
  try {
    console.log('🔍 Checking if products exist in the database...');
    
    // First, check if there are any products in the database
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price')
      .limit(3);
    
    if (productsError) {
      console.error('❌ Error fetching products:', productsError);
      return;
    }
    
    if (!products || products.length === 0) {
      console.log('❌ No products found in the database');
      console.log('Please add test products first or modify this script');
      return;
    }
    
    console.log(`✅ Found ${products.length} products`);
    
    // Create order with the first product
    const orderRef = generateOrderRef();
    const testOrder = {
      order_ref: orderRef,
      customer_email: 'test@example.com',
      customer_name: 'Test User',  // Add this line
      total_amount: products[0].price + 100, // Add 100 for shipping
      shipping_fee: 100,
      status: 'processing',
      shipping_address: {
        firstName: 'Test',
        lastName: 'User',
        addressLine1: '123 Test Street',
        city: 'Test City',
        province: 'Gauteng',
        postalCode: '0000',
        country: 'South Africa',
        phone: '+27123456789'
      },
      payment_method: 'card'
    };
    
    console.log('📦 Creating test order...');
    
    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(testOrder)
      .select('id')
      .single();
    
    if (orderError) {
      console.error('❌ Error creating order:', orderError);
      return;
    }
    
    console.log(`✅ Created order with ID: ${order.id}`);
    
    // Create order item for the first product
    const orderItem = {
      order_id: order.id,
      product_id: products[0].id,
      quantity: 1,
      price: products[0].price,
      size: 'M',
      sku: 'TEST-SKU-001',
      name: products[0].name || 'Test Product',
      product_name: products[0].name || 'Test Product',
      product_sku: 'PROD-SKU-001'  // Add this line
    };
    
    // Insert order item
    const { data: item, error: itemError } = await supabase
      .from('order_items')
      .insert(orderItem);
    
    if (itemError) {
      console.error('❌ Error creating order item:', itemError);
      return;
    }
    
    console.log('✅ Added product to order');
    
    // Get the order with its items
    const { data: completeOrder, error: completeError } = await supabase
      .from('orders')
      .select(`
        id,
        order_ref,
        total_amount,
        shipping_fee,
        status,
        created_at,
        customer_email,
        shipping_address,
        payment_method,
        order_items (
          id,
          quantity,
          price,
          size,
          product_id
        )
      `)
      .eq('id', order.id)
      .single();
    
    if (completeError) {
      console.error('❌ Error fetching complete order:', completeError);
      return;
    }
    
    console.log('\n✅ Test order created successfully:');
    console.log(`  - ID: ${completeOrder.id}`);
    console.log(`  - Reference: ${completeOrder.order_ref}`);
    console.log(`  - Email: ${completeOrder.customer_email}`);
    console.log(`  - Amount: R${completeOrder.total_amount.toFixed(2)}`);
    console.log(`  - Created: ${new Date(completeOrder.created_at).toLocaleString()}`);
    
    console.log('\n🔗 Test URL:');
    console.log(`  http://localhost:3010/checkout/confirmation?orderRef=${completeOrder.order_ref}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the function
createTestOrder();
