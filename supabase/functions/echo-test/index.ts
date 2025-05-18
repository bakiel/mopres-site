// This is a simple testing function to verify connectivity
// It will echo back the parameters you send to it

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the request body
    const body = await req.json()
    
    // Simply echo back the parameters with success status
    return new Response(
      JSON.stringify({
        success: true,
        message: "Echo test successful",
        receivedParams: body,
        timestamp: new Date().toISOString(),
        environmentVariables: {
          hasApiKey: !!Deno.env.get("RESEND_API_KEY"),
          hasEmailFrom: !!Deno.env.get("EMAIL_FROM"),
          supabaseUrl: Deno.env.get("SUPABASE_URL") ? "Configured" : "Missing",
          serviceRoleKey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ? "Configured" : "Missing"
        }
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    )
  } catch (error) {
    // Return any errors
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 400,
      }
    )
  }
})
