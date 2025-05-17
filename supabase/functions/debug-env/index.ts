/// <reference types="https://esm.sh/v135/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    // Get all environment variables
    const envVars = {};
    for (const key of Object.keys(Deno.env.toObject())) {
      // Mask sensitive keys
      envVars[key] = key.includes('KEY') || key.includes('SECRET') 
        ? `[REDACTED - Length: ${Deno.env.get(key)?.length || 0}]` 
        : Deno.env.get(key);
    }
    
    // Parse request body if it's a POST
    let requestBody = {};
    if (req.method === 'POST') {
      try {
        requestBody = await req.json();
      } catch (e) {
        requestBody = { error: 'Failed to parse JSON body' };
      }
    }
    
    // Return environment info and request details
    return new Response(JSON.stringify({
      success: true,
      message: 'Debug function successful',
      environment: {
        deno_version: Deno.version,
        env_vars: envVars,
        specific_vars: {
          SB_URL: Deno.env.has('SB_URL') ? 'Set' : 'Missing',
          SB_SERVICE_ROLE_KEY: Deno.env.has('SB_SERVICE_ROLE_KEY') ? 'Set' : 'Missing',
          RESEND_API_KEY: Deno.env.has('RESEND_API_KEY') ? 'Set' : 'Missing',
          EMAIL_FROM: Deno.env.has('EMAIL_FROM') ? 'Set' : 'Missing'
        }
      },
      request: {
        method: req.method,
        url: req.url,
        headers: Object.fromEntries(req.headers.entries()),
        body: requestBody
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
