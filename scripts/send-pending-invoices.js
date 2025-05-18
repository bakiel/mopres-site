/**
 * Bulk Invoice Email Sender
 * 
 * This script automatically sends invoice emails for all recent orders
 * Run with: node scripts/send-pending-invoices.js
 * 
 * Usage: Set the days parameter to control how many days back to check for orders
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// Initialize Supabase client
const supabaseUrl = 'https://gfbedvoexpulmmfitxje.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Config
const API_KEY = 'invoice-mopres-api-key-2025';
const DAYS_BACK = 30; // Process orders from the last 30 days

async function main() {
  try {
    console.log(`🔍 Looking for orders in the last ${DAYS_BACK} days...`);
    
    // Calculate date range (last X days)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - DAYS_BACK);
    const startDateStr = startDate.toISOString();
    
    // Get orders
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, order_ref, customer_email, created_at')
      .gte('created_at', startDateStr)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching orders: ${error.message}`);
    }
    
    console.log(`✅ Found ${orders.length} orders in the last ${DAYS_BACK} days`);
    
    // Process each order
    for (const order of orders) {
      try {
        console.log(`\nProcessing order: ${order.order_ref} (${order.id})`);
        
        // Check if invoice exists
        console.log(`- Checking if invoice exists...`);
        const { data: existsData } = await supabase
          .storage
          .from('invoices')
          .list('', {
            search: `invoice_${order.order_ref}.pdf`
          });
        
        const invoiceExists = existsData && existsData.length > 0 && 
          existsData.some(file => file.name === `invoice_${order.order_ref}.pdf`);
        
        if (!invoiceExists) {
          console.log(`- ⚠️ No invoice found. Skipping...`);
          continue;
        }
        
        console.log(`- ✅ Invoice found`);
        
        // Send email
        console.log(`- 📧 Sending invoice email...`);
        const response = await fetch(`${supabaseUrl}/functions/v1/send-invoice-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
          },
          body: JSON.stringify({ orderId: order.id })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          console.error(`- ❌ Failed to send email for order ${order.order_ref}: ${result.error || response.statusText}`);
          continue;
        }
        
        console.log(`- ✅ Email sent successfully to ${order.customer_email}`);
        
      } catch (error) {
        console.error(`- ❌ Error processing order ${order.order_ref}: ${error.message}`);
      }
      
      // Sleep for 1 second to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🎉 Bulk invoice email sending completed!');
    
  } catch (error) {
    console.error(`\n❌ Error in main process: ${error.message}`);
  }
}

main();
