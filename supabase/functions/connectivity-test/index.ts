/// <reference types="https://esm.sh/v135/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Enhanced CORS headers for better browser compatibility
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, origin, accept, cache-control',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400' // 24 hours - reduce preflight requests
};

// This simple function just returns success for testing CORS and connectivity
serve(async (req: Request) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Extract data from request
    let orderRef: string | null = null;
    try {
      const body = await req.json();
      orderRef = body.orderRef;
    } catch (e) {
      // Handle parsing error
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to parse request body',
        details: e instanceof Error ? e.message : String(e)
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Just return success - simplified testing function
    return new Response(JSON.stringify({
      success: true,
      message: "Function test successful",
      data: {
        orderRef: orderRef,
        timestamp: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    // Enhanced error handling
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
