/// <reference types="https://esm.sh/v135/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend";
import { Buffer } from "node:buffer";
import { delay } from "https://deno.land/std@0.168.0/async/delay.ts";

// CORS headers for both prod and development environments
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // In production you might want to restrict this
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, origin, accept',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Function to create a static HTML email template to avoid Promise issues
function createStaticEmailTemplate(orderData, formattedItems, pdfAttachment) {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
        <div style="background-color: #000000; padding: 20px; text-align: center;">
          <img src="https://gfbedvoexpulmmfitxje.supabase.co/storage/v1/object/public/images/Mopres_Gold_luxury_lifestyle_logo.png" alt="MoPres Logo" style="max-width: 180px; height: auto;">
        </div>
        
        <div style="padding: 20px;">
          <h1 style="color: #AF8F53; margin-bottom: 20px;">Your Order Confirmation</h1>
          
          <p>Dear ${orderData.customer_name || 'Valued Customer'},</p>
          
          <p>Thank you for your order with MoPres Fashion. We're excited to confirm that your order has been received and is being processed.</p>
          
          <div style="background-color: #f9f9f9; border-left: 4px solid #AF8F53; padding: 15px; margin: 20px 0;">
            <p style="margin: 0 0 5px 0;"><strong>Order Reference:</strong> ${orderData.order_ref}</p>
            <p style="margin: 0 0 5px 0;"><strong>Date:</strong> ${new Date(orderData.created_at).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p style="margin: 0 0 5px 0;"><strong>Total Amount:</strong> R ${orderData.total_amount.toFixed(2)}</p>
            <p style="margin: 0;"><strong>Status:</strong> ${orderData.status}</p>
          </div>
          
          <h3 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Details</h3>
          <p>${formattedItems}</p>
          
          <h3 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Payment Instructions</h3>
          <p>To complete your order, please make payment via EFT to our account:</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; margin: 15px 0; font-family: monospace;">
            <p style="margin: 0 0 5px 0;"><strong>Bank:</strong> First National Bank (FNB)</p>
            <p style="margin: 0 0 5px 0;"><strong>Account Name:</strong> MoPres Fashion</p>
            <p style="margin: 0 0 5px 0;"><strong>Account Number:</strong> 62792142095</p>
            <p style="margin: 0 0 5px 0;"><strong>Account Type:</strong> GOLD BUSINESS ACCOUNT</p>
            <p style="margin: 0 0 5px 0;"><strong>Branch Code:</strong> 210648</p>
            <p style="margin: 0 0 5px 0;"><strong>Branch:</strong> JUBILEE MALL</p>
            <p style="margin: 0 0 5px 0;"><strong>Reference:</strong> ${orderData.order_ref}</p>
          </div>
          
          <p>Once payment is received, your order will be processed and shipped to you.</p>
          
          ${pdfAttachment ? '<p><strong>Note:</strong> Your invoice is attached to this email for your records.</p>' : ''}
          
          <p>If you have any questions or need assistance, please don't hesitate to contact us at <a href="mailto:info@mopres.co.za" style="color: #AF8F53;">info@mopres.co.za</a> or by phone at +27 83 500 5311.</p>
          
          <p>Thank you for choosing MoPres Fashion!</p>
          
          <p>Kind regards,<br>MoPres Team</p>
        </div>
        
        <div style="background-color: #f7f7f7; padding: 20px; text-align: center; font-size: 12px; color: #777;">
          <p>&copy; 2025 MoPres Fashion • Reg: K2018607632 • VAT: 4350288769</p>
          <p>6680 Witrugeend Street, 578 Heuwelsig Estates, Cetisdal, Centurion, South Africa</p>
          <p><a href="https://www.mopres.co.za" style="color: #AF8F53;">www.mopres.co.za</a> • <a href="mailto:info@mopres.co.za" style="color: #AF8F53;">info@mopres.co.za</a> • +27 83 500 5311</p>
        </div>
      </body>
    </html>
  `;
}

serve(async (req: Request) => {
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SB_URL");
    const serviceRoleKey = Deno.env.get("SB_SERVICE_ROLE_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const emailFrom = Deno.env.get("EMAIL_FROM") || "info@mopres.co.za";
    
    // Check if all required variables are set
    const missingVars = [];
    if (!supabaseUrl) missingVars.push('SB_URL');
    if (!serviceRoleKey) missingVars.push('SB_SERVICE_ROLE_KEY');
    if (!resendApiKey) missingVars.push('RESEND_API_KEY');
    
    if (missingVars.length > 0) {
      return new Response(JSON.stringify({
        error: 'Missing environment variables',
        missing: missingVars
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Parse request parameters
    let orderRef = null;
    let includeInvoice = false;
    let testEmail = null;
    let pdfBase64Direct = null;
    let testMode = false;
    
    try {
      const body = await req.json();
      console.log("Received request body:", JSON.stringify(body));
      
      orderRef = body.orderRef;
      includeInvoice = !!body.includeInvoice;
      testEmail = body.testEmail || null;
      pdfBase64Direct = body.pdfBase64 || null;
      testMode = !!body.testMode;
      
      if (!orderRef) {
        return new Response(JSON.stringify({ error: 'Missing orderRef in request body' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      console.log(`Processing order ${orderRef} with includeInvoice=${includeInvoice}`);
      
      if (testMode) {
        return new Response(JSON.stringify({
          success: true,
          message: 'Test mode: email would be sent',
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    } catch (e) {
      return new Response(JSON.stringify({ 
        error: 'Failed to parse JSON body',
        details: e instanceof Error ? e.message : String(e)
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Fetch order data
    let orderData;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, 
          created_at, 
          order_ref,
          total_amount, 
          shipping_fee,
          status,
          customer_email,
          customer_name,
          shipping_address,
          order_items (
            id,
            quantity,
            price,
            size,
            products (
              name, 
              sku
            )
          )
        `)
        .eq('order_ref', orderRef)
        .single();
      
      if (error || !data) {
        return new Response(JSON.stringify({ 
          error: 'Order not found or database error',
          details: error ? error.message : 'No data returned'
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      orderData = data;
    } catch (dbError) {
      return new Response(JSON.stringify({ 
        error: 'Database query error',
        details: dbError instanceof Error ? dbError.message : String(dbError)
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Format order items
    const formattedItems = orderData.order_items.map((item) => {
      const productName = item.products?.name || 'Unknown Product';
      const size = item.size ? ` (Size: ${item.size})` : '';
      return `${productName}${size} x ${item.quantity} - R ${item.price.toFixed(2)}`;
    }).join('<br>');
    
    // Initialize Resend
    const resend = new Resend(resendApiKey);
    
    // Process PDF attachment if needed
    let pdfAttachment = null;
    if (includeInvoice) {
      if (pdfBase64Direct) {
        try {
          // Ensure pdfBase64Direct is not a Promise
          const resolvedPdfBase64 = pdfBase64Direct instanceof Promise 
            ? await pdfBase64Direct 
            : pdfBase64Direct;
          
          pdfAttachment = {
            filename: `MoPres_Invoice_${orderRef}.pdf`,
            content: resolvedPdfBase64
          };
          
          console.log(`Using provided PDF for order ${orderRef}`);
          
          // Save to storage
          try {
            const pdfBlob = Uint8Array.from(atob(resolvedPdfBase64), c => c.charCodeAt(0));
            const filePath = `invoices/invoice_${orderRef}.pdf`;
            
            await supabase.storage
              .from('invoices')
              .upload(filePath, pdfBlob, {
                contentType: 'application/pdf',
                upsert: true
              });
              
            console.log(`Saved PDF to storage at ${filePath}`);
          } catch (uploadError) {
            console.warn(`Failed to save PDF to storage: ${uploadError}`);
          }
        } catch (directPdfError) {
          console.error(`Error processing PDF data: ${directPdfError}`);
        }
      }
      
      // Try to get from storage if not provided directly
      if (!pdfAttachment) {
        try {
          const invoicePath = `invoices/invoice_${orderRef}.pdf`;
          const { data, error } = await supabase.storage.from('invoices').download(invoicePath);
          
          if (error) {
            console.error(`Error downloading invoice: ${error.message}`);
          } else if (data) {
            const arrayBuffer = await data.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString('base64');
            
            pdfAttachment = {
              filename: `MoPres_Invoice_${orderRef}.pdf`,
              content: base64
            };
            
            console.log(`Retrieved PDF from storage for order ${orderRef}`);
          }
        } catch (storageError) {
          console.error(`Storage error: ${storageError}`);
        }
      }
    }
    
    // Create email HTML using the function to avoid Promise issues
    const emailHtml = createStaticEmailTemplate(orderData, formattedItems, pdfAttachment);
    
    // Prepare email options
    const emailOptions = {
      from: `MoPres Fashion <${emailFrom}>`,
      to: [testEmail || orderData.customer_email],
      subject: `Your MoPres Order Confirmation - ${orderData.order_ref}`,
      html: emailHtml,
      reply_to: emailFrom,
    };
    
    // Add attachment if available
    if (pdfAttachment) {
      console.log(`Adding PDF attachment, size: ${pdfAttachment.content.length}`);
      emailOptions.attachments = [pdfAttachment];
    }
    
    // Send email
    try {
      console.log(`Sending email to: ${emailOptions.to}`);
      
      const { data: emailData, error: emailError } = await resend.emails.send(emailOptions);
      
      if (emailError) {
        console.error(`Email error: ${emailError.message}`);
        return new Response(JSON.stringify({ 
          error: 'Failed to send email',
          details: emailError.message,
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      console.log(`Email sent successfully, ID: ${emailData?.id}`);
      
      return new Response(JSON.stringify({
        success: true,
        message: pdfAttachment ? 'Email sent successfully with invoice attached' : 'Email sent successfully',
        order: {
          id: orderData.id,
          order_ref: orderData.order_ref,
          customer_email: orderData.customer_email,
          sent_to: testEmail || orderData.customer_email
        },
        email: {
          id: emailData?.id,
          included_attachment: !!pdfAttachment
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
      
    } catch (emailSendError) {
      console.error(`Exception sending email: ${emailSendError}`);
      return new Response(JSON.stringify({
        error: 'Email sending exception',
        details: emailSendError instanceof Error ? emailSendError.message : String(emailSendError),
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
  } catch (error) {
    console.error(`Global error: ${error}`);
    return new Response(JSON.stringify({
      success: false,
      error: 'Server error',
      details: error instanceof Error ? error.message : String(error),
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
