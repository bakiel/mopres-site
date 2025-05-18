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

serve(async (req: Request) => {
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Get environment variables with our renamed variables
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
    
    // Get request parameters
    let orderRef = null;
    let includeInvoice = false;
    let forceResend = false;
    let testEmail = null;
    let pdfBase64Direct = null;
    let pdfSize = 0;
    let testMode = false;
    
    try {
      const body = await req.json();
      orderRef = body.orderRef;
      includeInvoice = !!body.includeInvoice; // Convert to boolean
      forceResend = !!body.forceResend; // Convert to boolean
      testEmail = body.testEmail || null; // Optional override for testing
      pdfBase64Direct = body.pdfBase64 || null; // Direct base64 PDF data
      pdfSize = body.pdfSize || 0; // Size of PDF for logging
      testMode = !!body.testMode; // Test mode flag
      
      // Added: Optional custom HTML template parameter
      const useCustomHtml = !!body.useCustomHtml;
      const customHtml = body.customHtml || null;
      
      if (!orderRef) {
        return new Response(JSON.stringify({ error: 'Missing orderRef in request body' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      console.log(`Processing order ${orderRef} with includeInvoice=${includeInvoice}, forceResend=${forceResend}, directPDF=${!!pdfBase64Direct}, pdfSize=${pdfSize}, testMode=${testMode}, useCustomHtml=${useCustomHtml}`);
      
      // Log the body size for debugging
      console.log(`Request body size: ~${JSON.stringify(body).length} characters`);
      
      if (testMode) {
        // In test mode, we don't actually send an email, just log what we would do
        return new Response(JSON.stringify({
          success: true,
          message: 'Test mode: email would be sent with invoice attached',
          pdfDigest: body.pdfBase64Digest || 'No PDF digest provided',
          pdfSize: pdfSize
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
    
    // Try to fetch the order - with retry logic
    let orderData = null;
    let fetchError = null;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
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
      
      if (error) {
        fetchError = error;
        console.error(`Database error fetching order ${orderRef} on attempt ${attempt}:`, error);
        
        if (attempt < maxRetries) {
          await delay(1000); // Wait 1 second before retrying
        }
      } else if (data) {
        orderData = data;
        break; // Exit loop on success
      } else {
        console.warn(`Order ${orderRef} not found on attempt ${attempt}`);
        
        if (attempt < maxRetries) {
          await delay(1000); // Wait 1 second before retrying
        }
      }
    }
    
    if (!orderData) {
      return new Response(JSON.stringify({ 
        error: 'Order not found or database error',
        orderRef: orderRef,
        dbError: fetchError ? fetchError.message : null
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Format the order items for the email
    const formattedItems = orderData.order_items.map((item: any) => {
      const productName = item.products?.name || 'Unknown Product';
      const size = item.size ? ` (Size: ${item.size})` : '';
      return `${productName}${size} x ${item.quantity} - R ${item.price.toFixed(2)}`;
    }).join('<br>');
    
    // Initialize Resend
    const resend = new Resend(resendApiKey);
    
    // Get the PDF invoice if needed
    let pdfAttachment = null;
    if (includeInvoice) {
      // If PDF base64 data was provided directly, use it
      if (pdfBase64Direct) {
        console.log(`Using directly provided PDF data for order ${orderRef}`);
        
        try {
          // Make sure pdfBase64Direct is resolved if it's a promise
          const resolvedPdfBase64 = pdfBase64Direct instanceof Promise 
            ? await pdfBase64Direct 
            : pdfBase64Direct;
          
          pdfAttachment = {
            filename: `MoPres_Invoice_${orderRef}.pdf`,
            content: resolvedPdfBase64
          };
          console.log(`Successfully prepared invoice attachment from direct data for ${orderRef}`);
          
          // Also save it to storage for future use
          try {
            const pdfBlob = Uint8Array.from(atob(resolvedPdfBase64), c => c.charCodeAt(0));
            const filePath = `invoices/invoice_${orderRef}.pdf`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('invoices')
              .upload(filePath, pdfBlob, {
                contentType: 'application/pdf',
                upsert: true
              });
              
            if (uploadError) {
              console.warn(`Storage upload failed but continuing with email: ${uploadError.message}`);
            } else {
              console.log(`Successfully saved PDF to storage at ${filePath}`);
            }
          } catch (uploadError) {
            console.warn(`Failed to save PDF to storage but continuing with email: ${uploadError}`);
          }
        } catch (directPdfError) {
          console.error(`Error processing direct PDF data: ${directPdfError}`);
          // Continue with trying to get from storage as fallback
        }
      }
      
      // If we don't have an attachment yet (direct data wasn't provided or failed), try storage
      if (!pdfAttachment) {
        try {
          console.log(`Attempting to retrieve PDF from storage for order ${orderRef}`);
          // Try to download the invoice from storage
          const invoicePath = `invoices/invoice_${orderRef}.pdf`;
          
          // Retry loop for fetching the PDF in case it was just uploaded
          let fileData = null;
          let fileError = null;
          
          for (let attempt = 1; attempt <= 3; attempt++) {
            console.log(`Attempt ${attempt} to download invoice from storage`);
            
            const result = await supabase.storage
              .from('invoices')
              .download(invoicePath);
            
            fileData = result.data;
            fileError = result.error;
            
            if (fileError) {
              console.error(`Error downloading invoice from storage (attempt ${attempt}): ${fileError.message}`);
              
              if (attempt < 3) {
                console.log(`Waiting before retry ${attempt}...`);
                await delay(1500); // Wait 1.5 seconds before retrying
              }
            } else if (fileData) {
              console.log(`Successfully downloaded invoice for ${orderRef}, size: ${fileData.size / 1024}KB`);
              break; // Exit loop on success
            }
          }
          
          if (fileData) {
            // Convert the blob to base64 for attachment
            const arrayBuffer = await fileData.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString('base64');
            
            pdfAttachment = {
              filename: `MoPres_Invoice_${orderRef}.pdf`,
              content: base64
            };
            
            console.log(`Successfully prepared invoice attachment for ${orderRef}`);
          } else {
            console.error(`Failed to retrieve invoice after 3 attempts`);
          }
        } catch (pdfError) {
          console.error(`Error processing PDF attachment: ${pdfError instanceof Error ? pdfError.message : String(pdfError)}`);
          // Continue without attachment if there's an error
        }
      }
    }
    
    // Create a richer email template
    let emailHtml;
    
    // Check if using custom HTML template (added to fix [object Promise] issue)
    if (useCustomHtml && customHtml) {
      console.log('Using custom HTML template provided in request');
      emailHtml = customHtml;
      
      // For debugging: check if the customHtml is a Promise
      if (customHtml instanceof Promise) {
        console.warn('WARNING: Custom HTML is a Promise. Resolving it before using...');
        emailHtml = await customHtml;
      }
    } else {
      // Use standard template as before
      emailHtml = `
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
    
    // Debug check for Promises
    if (emailHtml instanceof Promise) {
      console.warn('WARNING: emailHtml is a Promise! Resolving it before sending...');
      emailHtml = await emailHtml;
    }
    
    // Prepare the email options with conditional attachment
    const emailOptions = {
      from: `MoPres Fashion <${emailFrom}>`,
      to: testEmail || orderData.customer_email, // Use test email if provided
      subject: `Your MoPres Order Confirmation - ${orderData.order_ref}`,
      html: emailHtml,
      reply_to: emailFrom,
    };
    
    // Add attachment if available
    if (pdfAttachment) {
      console.log(`Adding invoice attachment for ${orderRef} (Size: ${pdfAttachment.content?.length || 0} characters)`);
      emailOptions.attachments = [pdfAttachment];
    } else {
      console.warn(`No PDF attachment available for ${orderRef}`);
    }
    
    // Attempt to send email
    console.log(`Sending email to: ${emailOptions.to} with attachment: ${!!pdfAttachment}`);
    const { data: emailData, error: emailError } = await resend.emails.send(emailOptions);
    
    if (emailError) {
      console.error(`Email sending error: ${emailError.message || JSON.stringify(emailError)}`);
      return new Response(JSON.stringify({ 
        error: 'Failed to send email',
        details: emailError.message,
        order: {
          id: orderData.id,
          order_ref: orderData.order_ref,
          customer_email: orderData.customer_email,
          sent_to: testEmail || orderData.customer_email
        }
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Success - return order details
    return new Response(JSON.stringify({
      success: true,
      message: pdfAttachment ? 'Email sent successfully with invoice attached' : 'Email sent successfully without invoice',
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
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace available'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
