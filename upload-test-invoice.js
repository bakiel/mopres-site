/**
 * Upload a test invoice PDF to Supabase storage
 * 
 * This script creates a basic PDF and uploads it for testing
 * Run with: node upload-test-invoice.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { jsPDF } = require('jspdf');
const fs = require('fs');

// Initialize Supabase client
const supabaseUrl = 'https://gfbedvoexpulmmfitxje.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Order reference from our testing
const ORDER_REF = process.argv[2]?.replace('--order-ref=', '') || 'MP-676330';

async function main() {
  try {
    console.log('📄 Creating test invoice PDF...');
    
    // Create a simple PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    // Add some content
    doc.setFontSize(22);
    doc.text('MoPres Fashion Invoice', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text(`Invoice #${ORDER_REF}`, 105, 30, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('This is a test invoice file for the email system', 105, 40, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text('Generated for testing on ' + new Date().toLocaleString(), 105, 50, { align: 'center' });
    
    // Basic styling and more content
    doc.line(20, 60, 190, 60);
    
    doc.setFontSize(12);
    doc.text('Bill To:', 20, 70);
    doc.setFontSize(10);
    doc.text('Israel Bakiel', 20, 78);
    doc.text('bakielisrael@gmail.com', 20, 84);
    
    doc.setFontSize(12);
    doc.text('Order Summary:', 20, 100);
    
    // Table header
    doc.setFillColor(220, 220, 220);
    doc.rect(20, 110, 170, 10, 'F');
    doc.setTextColor(0, 0, 0);
    doc.text('Item', 25, 117);
    doc.text('Quantity', 90, 117);
    doc.text('Price', 125, 117);
    doc.text('Total', 170, 117, { align: 'right' });
    
    // Table row
    doc.text('Test Product', 25, 130);
    doc.text('1', 90, 130);
    doc.text('R 1,499.99', 125, 130);
    doc.text('R 1,499.99', 170, 130, { align: 'right' });
    
    // Total
    doc.line(20, 140, 190, 140);
    doc.text('Total:', 140, 150);
    doc.setFontSize(12);
    doc.text('R 1,499.99', 170, 150, { align: 'right' });
    
    // Footer
    doc.setFontSize(10);
    doc.text('MoPres Fashion | info@mopres.co.za | +27 83 500 5311', 105, 270, { align: 'center' });
    
    // Save the PDF to a temp file
    const pdfPath = './temp-invoice.pdf';
    fs.writeFileSync(pdfPath, Buffer.from(doc.output('arraybuffer')));
    console.log('✅ PDF created');
    
    // Upload to Supabase
    console.log('📤 Uploading to Supabase...');
    const pdfFile = fs.readFileSync(pdfPath);
    
    const { data, error } = await supabase
      .storage
      .from('invoices')
      .upload(`invoice_${ORDER_REF}.pdf`, pdfFile, {
        contentType: 'application/pdf',
        upsert: true
      });
      
    if (error) {
      throw new Error(`Upload error: ${error.message}`);
    }
    
    console.log(`✅ Uploaded invoice_${ORDER_REF}.pdf successfully`);
    
    // Get the public URL
    const { data: urlData } = supabase
      .storage
      .from('invoices')
      .getPublicUrl(`invoice_${ORDER_REF}.pdf`);
      
    console.log('📊 Public URL:');
    console.log(urlData.publicUrl);
    
    // Clean up temp file
    fs.unlinkSync(pdfPath);
    console.log('🧹 Cleaned up temporary files');
    
    console.log('\n🎉 Test invoice created and uploaded successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
