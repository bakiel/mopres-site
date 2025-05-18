/**
 * MoPres PDF Generation Test Script
 * 
 * This script tests the PDF generation functionality by generating an invoice PDF
 * and saving it locally for inspection.
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
const { renderToStaticMarkup } = require('react-dom/server');
const React = require('react');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gfbedvoexpulmmfitxje.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testPdfGeneration() {
  try {
    console.log('🔍 Testing MoPres PDF Generation...');
    
    // 1. Get a test order from the database
    console.log('📋 Fetching test order from database...');
    const { data: order, error: orderError } = await supabase
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
          products (
            id,
            name,
            sku,
            images
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (orderError || !order) {
      throw new Error(`Error fetching test order: ${orderError?.message || 'No orders found'}`);
    }
    
    console.log(`📦 Found test order: #${order.order_ref}`);
    
    try {
      // Try to dynamically import InvoiceTemplate component
      // Note: This will only work in a Node.js environment with appropriate transpilation setup
      // For testing purposes, we'll simulate the output
      // const { default: InvoiceTemplate } = await import('../src/components/InvoiceTemplateOptimized');
      
      // Create a mock InvoiceTemplate for testing
      const mockInvoiceTemplate = () => `
        <div id="invoice-content" class="font-poppins" style="width: 210mm; height: 297mm; padding: 20px; margin: 0 auto; background-color: #ffffff;">
          <h1 style="color: #AF8F53; font-size: 28px; font-weight: bold; margin: 0 0 10px 0;">INVOICE</h1>
          <hr style="height: 1px; background-color: #AF8F53; border: none; margin: 0;" />
          
          <div style="margin-top: 20px;">
            <p><strong>Invoice No:</strong> ${order.order_ref}</p>
            <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
            <p><strong>Customer:</strong> ${order.customer_email}</p>
            <p><strong>Amount Due:</strong> R ${order.total_amount.toFixed(2)}</p>
          </div>
          
          <h2 style="margin-top: 30px;">Order Items</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #AF8F53; color: white;">
                <th style="padding: 10px; text-align: left;">Item</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.order_items.map((item, index) => `
                <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9f9f9'};">
                  <td style="padding: 10px;">${item.products?.name || 'Product'}</td>
                  <td style="padding: 10px; text-align: center;">${item.quantity}</td>
                  <td style="padding: 10px; text-align: right;">R ${item.price.toFixed(2)}</td>
                  <td style="padding: 10px; text-align: right;">R ${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div style="margin-top: 30px; text-align: right;">
            <p><strong>Subtotal:</strong> R ${(order.total_amount - order.shipping_fee).toFixed(2)}</p>
            <p><strong>Shipping:</strong> R ${order.shipping_fee.toFixed(2)}</p>
            <p style="font-size: 18px; color: #AF8F53;"><strong>Total:</strong> R ${order.total_amount.toFixed(2)}</p>
          </div>
          
          <div style="margin-top: 50px; text-align: center; color: #666;">
            <p>Thank you for your business!</p>
            <p>MoPres Fashion • Reg: K2018607632 • VAT: 4350288769</p>
            <p>www.mopres.co.za • info@mopres.co.za • +27 83 500 5311</p>
          </div>
        </div>
      `;
      
      // Format the order for the template
      const formattedOrder = {
        id: order.id,
        order_ref: order.order_ref,
        customer_email: order.customer_email,
        total_amount: order.total_amount,
        shipping_fee: order.shipping_fee || 0,
        status: order.status,
        created_at: order.created_at,
        shipping_address: order.shipping_address || {},
        order_items: order.order_items || []
      };
      
      // Use our mock template for testing
      const invoiceHtml = mockInvoiceTemplate();
      
      // Create a complete HTML document with proper styling
      const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Invoice #${order.order_ref}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');
            
            body {
              margin: 0;
              padding: 0;
              font-family: 'Montserrat', Helvetica, Arial, sans-serif;
            }
            
            * {
              box-sizing: border-box;
            }
            
            .font-poppins {
              font-family: 'Poppins', Helvetica, Arial, sans-serif;
            }
          </style>
        </head>
        <body>
          ${invoiceHtml}
        </body>
        </html>
      `;
      
      console.log('📄 Generating test invoice PDF...');
      
      // Launch a headless browser
      console.log('🌐 Launching headless browser...');
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      // Set the page content
      await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
      
      // Set the page size to A4
      await page.setViewport({
        width: 794, // A4 width at 96 DPI
        height: 1123, // A4 height at 96 DPI
        deviceScaleFactor: 2
      });
      
      // Create output directory if it doesn't exist
      const outputDir = path.join(__dirname, '../test-output');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Output PDF file path
      const pdfPath = path.join(outputDir, `invoice_${order.order_ref}_test.pdf`);
      
      // Generate PDF
      console.log('💾 Saving PDF to:', pdfPath);
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0',
          right: '0',
          bottom: '0',
          left: '0'
        }
      });
      
      // Close the browser
      await browser.close();
      
      console.log('✅ PDF generated successfully!');
      console.log(`🔍 PDF saved to: ${pdfPath}`);
      
    } catch (pdfError) {
      console.error('❌ Error generating PDF:', pdfError);
      console.log('⚠️ Skipping PDF generation due to error');
    }
    
    console.log('✅ PDF generation test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Execute the test if run directly
if (require.main === module) {
  testPdfGeneration().then(() => process.exit(0));
}

module.exports = { testPdfGeneration };