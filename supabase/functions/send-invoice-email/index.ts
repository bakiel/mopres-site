/// <reference types="https://esm.sh/v135/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend";
import { createClient, SupabaseClient, PostgrestError } from "https://esm.sh/@supabase/supabase-js@2"; // Import PostgrestError
import { Buffer } from "node:buffer"; // Use Node buffer for Resend compatibility
import { delay } from "https://deno.land/std@0.168.0/async/delay.ts"; // Import delay

// --- Environment Variable Setup & Validation ---
console.log("Attempting to load environment variables...");
const supabaseUrl = Deno.env.get("SB_URL");
const serviceRoleKey = Deno.env.get("SB_SERVICE_ROLE_KEY"); // Use Service Role Key for admin-level access
const resendApiKey = Deno.env.get("RESEND_API_KEY");
const emailFrom = Deno.env.get("EMAIL_FROM") || "noreply@mopres.shoes"; // Default sender

console.log(`SB_URL: ${supabaseUrl ? 'Loaded' : 'MISSING!'}`);
console.log(`SB_SERVICE_ROLE_KEY: ${serviceRoleKey ? 'Loaded (length: ' + (serviceRoleKey ? serviceRoleKey.length : 'N/A') + ')' : 'MISSING!'}`);
console.log(`RESEND_API_KEY: ${resendApiKey ? 'Loaded (length: ' + (resendApiKey ? resendApiKey.length : 'N/A') + ')' : 'MISSING!'}`);
console.log(`EMAIL_FROM: ${emailFrom}`);

if (!supabaseUrl || !serviceRoleKey || !resendApiKey) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push('SB_URL');
  if (!serviceRoleKey) missingVars.push('SB_SERVICE_ROLE_KEY');
  if (!resendApiKey) missingVars.push('RESEND_API_KEY');
  
  const errorMessage = `Critical environment variables missing: ${missingVars.join(', ')}`;
  console.error(errorMessage);
  
  // Instead of throwing, which causes a generic 500 error, return a detailed response
  return new Response(JSON.stringify({ 
    error: "Configuration Error", 
    message: errorMessage,
    orderRef: orderRef || null
  }), {
    status: 500,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// --- Initialize Clients ---
// These lines will only be reached if the above check passes.
console.log("Initializing Supabase and Resend clients...");
// Initialize Supabase client with the Service Role Key
const supabase: SupabaseClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    // Prevent client from trying to use a JWT or persisting session for service role
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});
const resend = new Resend(resendApiKey);
console.log("Supabase and Resend clients initialized (Supabase with Service Role).");

// --- Helper: Read Email Template ---
async function getEmailTemplate(): Promise<string> {
  try {
    const templatePath = new URL("./email-template.html", import.meta.url).pathname;
    console.log("Reading email template from:", templatePath);
    return await Deno.readTextFile(templatePath);
  } catch (error) {
    console.error("Error reading email template:", error);
    // Provide a very basic fallback template
    return "<p>Thank you for your order. Your invoice details should be included below.</p><p>Order Reference: {{ORDER_REF}}</p><p>Total Amount: {{TOTAL_AMOUNT}}</p>";
  }
}

// --- Helper: Format Currency ---
function formatCurrency(amount: number, currency = "ZAR", locale = "en-ZA"): string {
    try {
        return new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(amount);
    } catch (e) {
        console.warn("Currency formatting failed, returning raw amount:", e);
        return `${currency} ${amount.toFixed(2)}`; // Basic fallback
    }
}

// --- Main Function Logic ---
serve(async (req: Request) => {
  console.log(`Received request: ${req.method} ${req.url}`);

  // --- CORS Headers ---
  // Reference: https://supabase.com/docs/guides/functions/cors
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // Allow requests from any origin (adjust for production)
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', // Headers allowed by Supabase
    'Access-Control-Allow-Methods': 'POST, OPTIONS', // Allow POST and OPTIONS
  };

  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS preflight request");
    return new Response('ok', { headers: corsHeaders });
  }

  // 1. Validate Request Method (Now only check if not POST after handling OPTIONS)
  if (req.method !== "POST") {
    console.warn(`Invalid method: ${req.method}`);
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json", "Allow": "POST" }, // Include CORS headers in error response
    });
  }

  let orderRef: string | null = null;
  try {
    // Dump all environment variables for debugging
    console.log("All environment variables:");
    for (const key of Object.keys(Deno.env.toObject())) {
      console.log(`${key}: ${key.includes('KEY') ? '[REDACTED]' : Deno.env.get(key)}`);
    }
    
    // Debug our specific variables
    console.log("SB_URL:", Deno.env.get("SB_URL"));
    console.log("SB_SERVICE_ROLE_KEY exists:", !!Deno.env.get("SB_SERVICE_ROLE_KEY"));
    console.log("RESEND_API_KEY exists:", !!Deno.env.get("RESEND_API_KEY"));
    console.log("EMAIL_FROM:", Deno.env.get("EMAIL_FROM"));

    const body = await req.json();
    orderRef = body.orderRef;

    if (!orderRef || typeof orderRef !== 'string') {
      console.error("Missing or invalid 'orderRef' in request body:", body);
      return new Response(JSON.stringify({ error: "Missing or invalid 'orderRef'" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }, // Include CORS headers
      });
    }
    console.log(`Processing request for orderRef: ${orderRef}`);

    // 2. Fetch Order Details from Supabase with Retry Logic
    let orderData: any = null; // Use 'any' for simplicity or define a proper type
    let orderError: PostgrestError | null = null;
    const maxRetries = 5; // Increased from 3
    const retryDelayMs = 2000; // Increased from 1000ms (1 second) to 2000ms (2 seconds)

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`Attempt ${attempt}/${maxRetries}: Fetching order details for orderRef: ${orderRef}`);
        const { data: currentData, error: currentError } = await supabase
            .from("orders")
            .select("order_ref, customer_email, total_amount, customer_name") // Add other fields as needed
            .eq("order_ref", orderRef)
            .maybeSingle(); // Use maybeSingle() to handle 0 rows gracefully without error

        orderData = currentData;
        orderError = currentError; // Capture any actual DB errors

        if (orderError) {
            // If there's a real DB error (not just 'not found'), log it and break
            console.error(`Database error fetching order ${orderRef} on attempt ${attempt}:`, orderError);
            break; // Exit loop on actual errors
        }

        if (orderData) {
            // If data is found, success!
            console.log(`Order ${orderRef} found successfully on attempt ${attempt}.`);
            break; // Exit loop on success
        }

        // If no data and no error, it means 0 rows were returned by maybeSingle()
        console.warn(`Order ${orderRef} not found on attempt ${attempt}. Retrying in ${retryDelayMs}ms...`);
        if (attempt < maxRetries) {
            await delay(retryDelayMs); // Wait before retrying
        } else {
            console.error(`Order ${orderRef} not found after ${maxRetries} attempts.`);
            // Set a specific 'not found' error to be handled below
            orderError = { code: 'CUSTOM_NOT_FOUND', message: 'Order not found after retries', details: '', hint: '' };
        }
    }

    // Handle final outcome after retries
    if (orderError) {
        console.error(`Final error state after retries for order ${orderRef}:`, orderError);
        // Use the custom code or default to 500
        const status = orderError.code === 'CUSTOM_NOT_FOUND' ? 404 : 500;
        const message = status === 404 ? "Order not found after retries" : "Database error fetching order";
        return new Response(JSON.stringify({ error: message, details: orderError.message }), {
            status: status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    // If loop finished without error, but data is still null (should be caught by CUSTOM_NOT_FOUND)
    if (!orderData) {
        console.error(`Order not found for orderRef: ${orderRef} (data was null after retries - unexpected state)`);
        return new Response(JSON.stringify({ error: "Order not found (post-retry check)" }), {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    // --- Proceed with orderData if found ---
    console.log(`Order details confirmed for ${orderRef}. Email: ${orderData.customer_email}`);
    const { customer_email, total_amount, customer_name } = orderData;

    if (!customer_email) {
        console.error(`Missing customer_email for orderRef: ${orderRef}`);
        // Decide how to handle this - maybe skip email? For now, return error.
        return new Response(JSON.stringify({ error: "Customer email missing for this order" }), {
            status: 500, // Internal data issue
            headers: { ...corsHeaders, "Content-Type": "application/json" }, // Include CORS headers
        });
    }


    // 3. Construct PDF Path and Attempt Download
    const pdfPath = `invoice_${orderRef}.pdf`;
    const bucketName = "invoices"; // Assuming 'invoices' bucket
    let pdfContent: ArrayBuffer | null = null;
    let pdfAttachment = null;

    console.log(`Attempting to download PDF from bucket '${bucketName}', path: '${pdfPath}'`);
    const { data: blobData, error: downloadError } = await supabase.storage
      .from(bucketName)
      .download(pdfPath);

    if (downloadError) {
      console.warn(`Warning: Failed to download PDF invoice '${pdfPath}' for order ${orderRef}. Proceeding without attachment. Error:`, downloadError.message);
      // Log warning but continue processing the email without the attachment
    } else if (blobData) {
      console.log(`PDF invoice '${pdfPath}' downloaded successfully for order ${orderRef}. Size: ${blobData.size} bytes.`);
      try {
        pdfContent = await blobData.arrayBuffer();
        if (pdfContent) {
            pdfAttachment = {
              filename: pdfPath, // Use the constructed path as filename
              content: Buffer.from(pdfContent), // Convert ArrayBuffer to Node Buffer for Resend
              contentType: "application/pdf",
            };
            console.log(`Successfully converted PDF blob to ArrayBuffer and created attachment for ${pdfPath}.`);
        } else {
            console.warn(`Warning: PDF blobData.arrayBuffer() returned null/empty for ${pdfPath}. Proceeding without attachment.`);
        }
      } catch (e) {
        console.error(`Error converting PDF blob to ArrayBuffer for ${pdfPath}:`, e);
        // pdfContent remains null, proceed without attachment
      }
    } else {
         console.warn(`Warning: PDF invoice '${pdfPath}' for order ${orderRef} not found or empty, but no download error reported. Proceeding without attachment.`);
    }

    // 4. Read and Populate Email Template
    console.log("Reading email template...");
    let emailHtmlContent = await getEmailTemplate();

    console.log("Populating email template...");
    // Replace placeholders (case-insensitive replaceAll)
    const formattedTotal = formatCurrency(total_amount || 0); // Handle potential null total_amount
    emailHtmlContent = emailHtmlContent.replace(/{{ORDER_REF}}/gi, orderRef || 'N/A');
    emailHtmlContent = emailHtmlContent.replace(/{{TOTAL_AMOUNT}}/gi, formattedTotal);
    emailHtmlContent = emailHtmlContent.replace(/{{CUSTOMER_NAME}}/gi, customer_name || 'Valued Customer');
    // Add more replacements as needed based on the actual template

    // 5. Send Email via Resend
    const attachments = pdfAttachment ? [pdfAttachment] : [];
    console.log(`Sending invoice email to: ${customer_email} for order ${orderRef}. Attachment included: ${!!pdfAttachment}`);

    const { data: emailSentData, error: emailError } = await resend.emails.send({
      from: emailFrom,
      to: customer_email, // Use email fetched from the order
      subject: `Your Mopres Order Invoice (${orderRef})`,
      html: emailHtmlContent, // Use populated HTML
      attachments: attachments, // Attach PDF if available
    });

    if (emailError) {
      console.error(`Error sending email via Resend for order ${orderRef}:`, emailError);
      return new Response(JSON.stringify({ error: "Failed to send invoice email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }, // Include CORS headers
      });
    }

    console.log(`Email for order ${orderRef} sent successfully:`, emailSentData?.id);
    return new Response(JSON.stringify({ success: true, message: "Invoice email sent.", emailId: emailSentData?.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }, // Include CORS headers
    });

  } catch (error) {
    // Catch unexpected errors (e.g., JSON parsing issues, unhandled exceptions)
    console.error(`Unhandled error processing request (OrderRef: ${orderRef || 'N/A'}):`, error);
    
    // Attempt to provide more context for debugging
    let errorDetails = "Unknown error type";
    if (error instanceof Error) {
      errorDetails = `${error.name}: ${error.message}\nStack: ${error.stack || 'No stack trace'}`;
    } else {
      try {
        errorDetails = JSON.stringify(error);
      } catch (e) {
        errorDetails = String(error);
      }
    }
    
    return new Response(JSON.stringify({ 
      error: "Internal Server Error", 
      details: errorDetails,
      debugInfo: "Check function logs for more details" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

console.log("Send Invoice Email function handler registered.");