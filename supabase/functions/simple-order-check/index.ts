/// <reference types="https://esm.sh/v135/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Simple CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    
    // Try to fetch the order - simple test
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, created_at, order_ref, total_amount, customer_email')
      .eq('order_ref', orderRef)
      .single();
    
    if (error) {
      return new Response(JSON.stringify({ 
        error: 'Database error', 
        details: error.message,
        code: error.code
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (!order) {
      return new Response(JSON.stringify({ 
        error: 'Order not found',
        orderRef: orderRef 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Success - return order details
    return new Response(JSON.stringify({
      success: true,
      message: 'Order found successfully',
      order: order,
      email: {
        from: emailFrom,
        to: order.customer_email,
        resendApiKeyLength: resendApiKey.length
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
