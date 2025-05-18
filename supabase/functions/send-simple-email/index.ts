/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, origin, accept',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req: Request) => {
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Get environment variables
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const emailFrom = Deno.env.get("EMAIL_FROM") || "info@mopres.co.za";
    
    if (!resendApiKey) {
      return new Response(JSON.stringify({
        error: 'Missing RESEND_API_KEY environment variable'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Parse request
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ 
        error: 'Failed to parse JSON body',
        details: e instanceof Error ? e.message : String(e)
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const { 
      to, 
      subject, 
      html, 
      attachmentName,
      attachmentBase64
    } = body;
    
    // Validate required fields
    if (!to || !subject || !html) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: to, subject, and html are required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`Sending email to ${to} with subject: ${subject}`);
    if (attachmentBase64) {
      console.log(`Email includes attachment: ${attachmentName || 'unnamed file'} (${attachmentBase64.length} bytes)`);
    }
    
    // Initialize Resend
    const resend = new Resend(resendApiKey);
    
    // Prepare email options
    const emailOptions = {
      from: `MoPres Fashion <${emailFrom}>`,
      to: to,
      subject: subject,
      html: html,
      reply_to: emailFrom,
    };
    
    // Add attachment if provided
    if (attachmentBase64 && attachmentName) {
      emailOptions.attachments = [{
        filename: attachmentName,
        content: attachmentBase64
      }];
    }
    
    // Send email
    const { data, error } = await resend.emails.send(emailOptions);
    
    if (error) {
      console.error(`Error sending email: ${error.message || JSON.stringify(error)}`);
      return new Response(JSON.stringify({ 
        error: 'Failed to send email',
        details: error.message || JSON.stringify(error)
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Success response
    return new Response(JSON.stringify({
      success: true,
      message: attachmentBase64 
        ? 'Email sent successfully with attachment' 
        : 'Email sent successfully',
      emailId: data?.id
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
