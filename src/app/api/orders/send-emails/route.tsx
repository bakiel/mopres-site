import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Import the PDF generation function
// This is a simplified version that doesn't rely on external font files
import generateInvoicePdf from './generateInvoicePdf';

// Initialize Resend
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gfbedvoexpulmmfitxje.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-ZA', { 
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// API key for simple authorization
const API_KEY = 'mopres-order-emails-api-key-2025';

export async function POST(req: NextRequest) {
  try {
    console.log('📧 Order emails API endpoint called');
    
    // Verify request authorization
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('⚠️ Unauthorized access attempt to order emails API');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Simple API key validation
    const apiKey = authHeader.split(' ')[1];
    if (apiKey !== API_KEY) {
      console.warn('⚠️ Invalid API key used for order emails API');
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }
    
    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log('Request body:', JSON.stringify(body));
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body - could not parse JSON' },
        { status: 400 }
      );
    }
    
    const { orderId, generateNewInvoice = false } = body;
    
    if (!orderId) {
      console.warn('⚠️ Missing orderId in request');
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }
    
    // Validate Supabase connection and API key
    if (!supabaseServiceKey) {
      console.error('❌ Missing Supabase service role key in environment variables');
      return NextResponse.json(
        { error: 'Database service is not properly configured' },
        { status: 500 }
      );
    }
    
    // Fetch order details with items from Supabase
    console.log(`Fetching order details for orderId: ${orderId}`);
    
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
      .eq('id', orderId)
      .single();
    
    if (orderError) {
      console.error('Error fetching order:', orderError);
      return NextResponse.json(
        { error: `Database error: ${orderError.message}` },
        { status: 500 }
      );
    }
    
    if (!order) {
      console.warn(`Order not found for id: ${orderId}`);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    console.log(`Order found: ${order.order_ref}`);
    
    // Verify customer email
    if (!order.customer_email) {
      console.warn(`Order ${order.order_ref} has no customer email`);
      return NextResponse.json(
        { error: 'Order has no customer email' },
        { status: 400 }
      );
    }
    
    // Get shipping address data
    const shippingAddress = order.shipping_address as any || {
      firstName: 'Valued',
      lastName: 'Customer'
    };
    
    // Check for or create invoice PDF
    console.log(`Processing invoice for order ${order.order_ref} (generate new: ${generateNewInvoice})`);
    
    let invoiceBase64: string;
    
    try {
      if (generateNewInvoice) {
        // Generate new invoice PDF
        console.log('Generating new invoice PDF...');
        invoiceBase64 = await generateInvoicePdf(order);
        
        // Upload to Supabase Storage
        console.log('Uploading invoice to storage...');
        const { error: uploadError } = await supabase
          .storage
          .from('invoices')
          .upload(`invoice_${order.order_ref}.pdf`, 
                  Buffer.from(invoiceBase64, 'base64'), 
                  { contentType: 'application/pdf', upsert: true });
        
        if (uploadError) {
          console.error('Error uploading invoice PDF:', uploadError);
          // Continue anyway, we still have the base64 data for the email
        } else {
          console.log('Invoice uploaded successfully');
        }
      } else {
        // Check if there's an existing invoice in storage
        console.log('Checking for existing invoice...');
        const { data: fileData, error: fileError } = await supabase
          .storage
          .from('invoices')
          .download(`invoice_${order.order_ref}.pdf`);
        
        if (fileError || !fileData) {
          console.log('No existing invoice found, generating new one...');
          // If no existing invoice, generate a new one
          invoiceBase64 = await generateInvoicePdf(order);
          
          // Upload to Supabase Storage
          console.log('Uploading newly generated invoice to storage...');
          const { error: uploadError } = await supabase
            .storage
            .from('invoices')
            .upload(`invoice_${order.order_ref}.pdf`, 
                    Buffer.from(invoiceBase64, 'base64'), 
                    { contentType: 'application/pdf', upsert: true });
          
          if (uploadError) {
            console.error('Error uploading invoice PDF:', uploadError);
            // Continue anyway, we still have the base64 data for the email
          } else {
            console.log('Invoice uploaded successfully');
          }
        } else {
          console.log('Existing invoice found, using it...');
          // Convert the existing PDF blob to base64
          const buffer = Buffer.from(await fileData.arrayBuffer());
          invoiceBase64 = buffer.toString('base64');
          console.log(`Retrieved existing invoice (${buffer.length / 1024} KB)`);
        }
      }
      
      
      // Send both emails
      console.log(`Sending emails to ${order.customer_email}...`);
      
      try {
      // Send a simple text-only email with no attachments
      try {
        // Create a simple email template with no images or attachments
        const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <title>Your MoPres Order Confirmation</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; color: #333;">
              <div style="padding: 20px;">
                <h1 style="color: #AF8F53; margin-bottom: 20px;">MoPres Order #${order.order_ref} Confirmation</h1>
                
                <p>Dear ${shippingAddress.firstName || 'Valued Customer'},</p>
                
                <p>Thank you for your order with MoPres Fashion. We're excited to confirm that your order has been received and is being processed.</p>
                
                <div style="background-color: #f9f9f9; border-left: 4px solid #AF8F53; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0 0 5px 0;"><strong>Order Reference:</strong> ${order.order_ref}</p>
                  <p style="margin: 0 0 5px 0;"><strong>Date:</strong> ${formatDate(order.created_at)}</p>
                  <p style="margin: 0 0 5px 0;"><strong>Total Amount:</strong> R ${order.total_amount.toFixed(2)}</p>
                  <p style="margin: 0;"><strong>Status:</strong> ${order.status}</p>
                </div>
                
                <h3 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Payment Instructions</h3>
                <p>To complete your order, please make payment via EFT to our account:</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; margin: 15px 0; font-family: monospace;">
                  <p style="margin: 0 0 5px 0;"><strong>Bank:</strong> First National Bank (FNB)</p>
                  <p style="margin: 0 0 5px 0;"><strong>Account Name:</strong> MoPres Fashion</p>
                  <p style="margin: 0 0 5px 0;"><strong>Account Number:</strong> 62792142095</p>
                  <p style="margin: 0 0 5px 0;"><strong>Account Type:</strong> GOLD BUSINESS ACCOUNT</p>
                  <p style="margin: 0 0 5px 0;"><strong>Branch Code:</strong> 210648</p>
                  <p style="margin: 0 0 5px 0;"><strong>Branch:</strong> JUBILEE MALL</p>
                  <p style="margin: 0 0 5px 0;"><strong>Reference:</strong> ${order.order_ref}</p>
                </div>
                
                <p>Once payment is received, your order will be processed and shipped to you.</p>
                
                <p>If you have any questions or need assistance, please don't hesitate to contact us at <a href="mailto:info@mopres.co.za" style="color: #AF8F53;">info@mopres.co.za</a> or by phone at +27 83 500 5311.</p>
                
                <p>Thank you for choosing MoPres Fashion!</p>
                
                <p style="margin-top: 30px;">Kind regards,<br>The MoPres Fashion Team</p>
              </div>
              
              <div style="background-color: #f7f7f7; padding: 20px; text-align: center; font-size: 12px; color: #777;">
                <p>&copy; 2025 MoPres Fashion • Reg: K2018607632 • VAT: 4350288769</p>
                <p>6680 Witrugeend Street, 578 Heuwelsig Estates, Cetisdal, Centurion, South Africa</p>
                <p><a href="https://www.mopres.co.za" style="color: #AF8F53;">www.mopres.co.za</a> • <a href="mailto:info@mopres.co.za" style="color: #AF8F53;">info@mopres.co.za</a> • +27 83 500 5311</p>
              </div>
            </body>
          </html>
        `;
        
        // Plain text version as fallback
        const textVersion = `
MoPres Order #${order.order_ref} Confirmation

Dear ${shippingAddress.firstName || 'Valued Customer'},

Thank you for your order with MoPres Fashion. We're excited to confirm that your order has been received and is being processed.

Order Details:
- Order Reference: ${order.order_ref}
- Date: ${formatDate(order.created_at)}
- Total Amount: R ${order.total_amount.toFixed(2)}
- Status: ${order.status}

Payment Instructions:
To complete your order, please make payment via EFT to our account:

Bank: First National Bank (FNB)
Account Name: MoPres Fashion
Account Number: 62792142095
Account Type: GOLD BUSINESS ACCOUNT
Branch Code: 210648
Branch: JUBILEE MALL
Reference: ${order.order_ref}

Once payment is received, your order will be processed and shipped to you.

If you have any questions or need assistance, please don't hesitate to contact us at info@mopres.co.za or by phone at +27 83 500 5311.

Thank you for choosing MoPres Fashion!

Kind regards,
The MoPres Fashion Team

MoPres Fashion • Reg: K2018607632 • VAT: 4350288769
6680 Witrugeend Street, 578 Heuwelsig Estates, Cetisdal, Centurion, South Africa
www.mopres.co.za • info@mopres.co.za • +27 83 500 5311
        `;
        
        // Send email with no attachments
        const { data: emailData, error: emailError } = await resend.emails.send({
          from: `MoPres Fashion <onboarding@resend.dev>`,
          to: [order.customer_email],
          subject: `Your MoPres Order #${order.order_ref} Confirmation`,
          html: emailHtml,
          text: textVersion,
          reply_to: 'info@mopres.co.za'
          // No attachments!
        });
        
        // Check for errors
        if (emailError) {
          console.error('Failed to send email:', emailError);
          
          return NextResponse.json(
            { 
              error: 'Failed to send order email',
              details: emailError
            },
            { status: 500 }
          );
        }
        
        console.log('✅ Email sent successfully');
        return NextResponse.json({
          success: true,
          email_sent: true,
          message: `Email sent to ${order.customer_email}`,
          email: {
            id: emailData?.id
          }
        });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        return NextResponse.json(
          { error: `Failed to send email: ${emailError instanceof Error ? emailError.message : 'Unknown error'}` },
          { status: 500 }
        );
      }
      } catch (emailError) {
        console.error('Error sending emails:', emailError);
        return NextResponse.json(
          { error: `Failed to send emails: ${emailError instanceof Error ? emailError.message : 'Unknown error'}` },
          { status: 500 }
        );
      }
      
    } catch (invoiceError) {
      console.error('Error processing invoice:', invoiceError);
      return NextResponse.json(
        { error: `Failed to process invoice: ${invoiceError instanceof Error ? invoiceError.message : 'Unknown error'}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in order emails API:', error);
    // Enhanced error information for debugging
    let errorMessage = 'Internal server error';
    let errorDetails = {};
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        name: error.name,
        stack: error.stack?.split('\n').slice(0, 3).join('\n') // First 3 lines of stack trace
      };
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    );
  }
}