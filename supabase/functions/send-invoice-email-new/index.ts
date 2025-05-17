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
    
    // Get orderRef from request
    let orderRef = null;
    try {
      const body = await req.json();
      orderRef = body.orderRef;
      if (!orderRef) {
        return new Response(JSON.stringify({ error: 'Missing orderRef in request body' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Failed to parse JSON body' }), {
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
          shipping_address
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
    
    // Initialize Resend
    const resend = new Resend(resendApiKey);
    
    // Create a simple email template
    const emailHtml = `
      <html>
        <body>
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Your Order Confirmation</h1>
            <p>Dear ${orderData.customer_name || 'Valued Customer'},</p>
            <p>Thank you for your order with MoPres. Your order reference is: <strong>${orderData.order_ref}</strong></p>
            <p>Total amount: R ${orderData.total_amount.toFixed(2)}</p>
            <p>Please keep this email for your records.</p>
            <p>Regards,<br>MoPres Team</p>
          </div>
        </body>
      </html>
    `;
    
    // Attempt to send email - using a verified Resend domain (resend.dev)
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "onboarding@resend.dev", // Using Resend's verified domain as fallback
      to: orderData.customer_email,
      subject: `Your MoPres Order Invoice (${orderData.order_ref})`,
      html: emailHtml,
      reply_to: emailFrom // Use the original email as reply-to address
    });
    
    if (emailError) {
      return new Response(JSON.stringify({ 
        error: 'Failed to send email',
        details: emailError.message,
        order: {
          id: orderData.id,
          order_ref: orderData.order_ref,
          customer_email: orderData.customer_email
        }
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Success - return order details
    return new Response(JSON.stringify({
      success: true,
      message: 'Email sent successfully',
      order: {
        id: orderData.id,
        order_ref: orderData.order_ref,
        customer_email: orderData.customer_email
      },
      email: {
        id: emailData?.id
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
