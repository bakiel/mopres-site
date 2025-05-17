// Add Deno types reference
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// import { corsHeaders } from '../_shared/cors.ts'; // Temporarily remove import

// Define CORS headers directly for testing
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};


console.log("[get-invoice-upload-url] Function handler loading.");

serve(async (req: Request) => {
  console.log(`[get-invoice-upload-url] Received request: ${req.method} ${req.url}`);
  // Log headers for debugging CORS or other issues
  console.log('[get-invoice-upload-url] Request Headers:', Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    console.log('[get-invoice-upload-url] Responding to OPTIONS preflight request.');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Ensure environment variables are set
    const supabaseUrl = Deno.env.get('SB_URL');
    const serviceRoleKey = Deno.env.get('SB_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[get-invoice-upload-url] Missing SB_URL or SB_SERVICE_ROLE_KEY.');
      throw new Error('Missing SB_URL or SB_SERVICE_ROLE_KEY environment variables.');
    }

    // Initialize Supabase client with service_role key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Parse request body to get orderRef
    console.log('[get-invoice-upload-url] Attempting to parse JSON body...');
    const { orderRef } = await req.json();
    console.log(`[get-invoice-upload-url] Parsed orderRef: ${orderRef}`);

    if (!orderRef || typeof orderRef !== 'string') {
        console.error('[get-invoice-upload-url] Missing or invalid orderRef in request body.');
      return new Response(JSON.stringify({ error: 'Missing or invalid orderRef in request body' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Define file path
    const filePath = `invoices/invoice_${orderRef}.pdf`;
    const bucketName = 'invoices';

    console.log(`[get-invoice-upload-url] Generating signed upload URL for path: ${filePath}`);

    // Generate signed upload URL (expires in 60 seconds)
    // Requires storage.objects.add permission for the service_role key
    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .createSignedUploadUrl(filePath, 60); // 60 seconds validity

    if (error) {
      console.error(`[get-invoice-upload-url] Error generating signed URL for ${filePath}:`, error);
      throw error; // Let the outer catch handle it
    }

    if (!data?.signedUrl) {
        console.error(`[get-invoice-upload-url] Signed URL data received, but signedUrl property is missing for ${filePath}.`);
        throw new Error('Failed to retrieve signed URL component.');
    }

    console.log(`[get-invoice-upload-url] Successfully generated signed URL for ${filePath}.`);

    // Return the signed URL and the path
    return new Response(JSON.stringify({ signedUrl: data.signedUrl, path: data.path }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (e) {
    // Safely handle unknown error type
    const error = e instanceof Error ? e : new Error(String(e));
    console.error('[get-invoice-upload-url] General error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

console.log("[get-invoice-upload-url] Function handler registered.");