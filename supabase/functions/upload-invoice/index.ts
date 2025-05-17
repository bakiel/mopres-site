// Add Deno types reference
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Helper function to convert base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  console.log('[base64ToArrayBuffer] Attempting to decode base64 string...');
  try {
    const binaryString = atob(base64); // Decode base64
    console.log(`[base64ToArrayBuffer] Successfully decoded base64. Binary string length: ${binaryString.length}`);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    console.log('[base64ToArrayBuffer] Successfully created Uint8Array.');
    return bytes.buffer;
  } catch (decodeError) {
    console.error('[base64ToArrayBuffer] Error during base64 decoding (atob):', decodeError);
    // Re-throw a more specific error to be caught by the main handler
    throw new Error(`Failed to decode base64 string: ${decodeError instanceof Error ? decodeError.message : String(decodeError)}`);
  }
}

serve(async (req: Request) => {
  console.log(`[upload-invoice] Received request: ${req.method} ${req.url}`);
  // Log headers for debugging CORS or other issues
  console.log('[upload-invoice] Request Headers:', Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    console.log('[upload-invoice] Responding to OPTIONS preflight request.');
    return new Response('ok', { headers: corsHeaders });
  }

  // Log content length if available (helps diagnose payload size issues)
  const contentLength = req.headers.get('content-length');
  console.log(`[upload-invoice] Content-Length: ${contentLength || 'Not provided'}`);


  try {
    // Ensure environment variables are set
    const supabaseUrl = Deno.env.get('SB_URL');
    const serviceRoleKey = Deno.env.get('SB_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing SB_URL or SB_SERVICE_ROLE_KEY environment variables.');
    }

    // Initialize Supabase client with service_role key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Parse request body
    console.log('[upload-invoice] Attempting to parse JSON body...');
    // Read body as text first to log size before potential parsing error
    const bodyText = await req.text();
    console.log(`[upload-invoice] Received body size: ${bodyText.length} characters`);

    const { orderRef, pdfBase64 } = JSON.parse(bodyText); // Parse the text
    console.log(`[upload-invoice] Parsed orderRef: ${orderRef}, pdfBase64 length: ${pdfBase64?.length ?? 'undefined'}`);


    if (!orderRef || !pdfBase64) {
      console.error('[upload-invoice] Missing orderRef or pdfBase64 in parsed body.');
      return new Response(JSON.stringify({ error: 'Missing orderRef or pdfBase64 in request body' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Convert base64 PDF data to ArrayBuffer, then Blob
    const pdfArrayBuffer = base64ToArrayBuffer(pdfBase64);
    const pdfBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });

    // Define file path
    const filePath = `invoices/invoice_${orderRef}.pdf`;

    console.log(`[upload-invoice] Attempting to upload to: ${filePath}`);

    // Upload using the admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin.storage
      .from('invoices')
      .upload(filePath, pdfBlob, {
        cacheControl: '3600',
        upsert: true, // Overwrite if exists
        contentType: 'application/pdf', // Explicitly set content type
      });

    if (error) {
      console.error(`[upload-invoice] Supabase storage upload error for ${filePath}:`, error);
      throw error; // Let the outer catch handle it
    }

    console.log(`[upload-invoice] Successfully uploaded ${filePath}:`, data);

    // Return success response
    return new Response(JSON.stringify({ success: true, path: data?.path }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (e) {
    // Safely handle unknown error type
    const error = e instanceof Error ? e : new Error(String(e));
    console.error('[upload-invoice] General error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});