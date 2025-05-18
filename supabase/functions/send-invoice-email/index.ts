import { serve } from 'https://deno.land/std@0.170.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'
import { Resend } from 'https://esm.sh/resend@1.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Resend
const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

// Format date to ISO string
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Format currency to ZAR
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(amount);
};

// Create email HTML
const createEmailHtml = (order, customerName, publicUrl) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your MoPres Invoice #${order.order_ref}</title>
  <style>
    body, html {
      font-family: 'Helvetica', Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 5px;
    }
    .header {
      padding: 20px;
      text-align: center;
      border-bottom: 3px solid #AF8F53;
    }
    .content {
      padding: 30px;
    }
    .info-box {
      background-color: #f8f8f8;
      border-left: 4px solid #AF8F53;
      border-radius: 4px;
      padding: 15px;
      margin: 20px 0;
    }
    .info-box p {
      margin: 5px 0;
    }
    .banking-box {
      background-color: #f8f8f8;
      border-radius: 4px;
      padding: 15px;
      margin: 20px 0;
    }
    h1 {
      color: #AF8F53;
      font-size: 24px;
      margin-top: 0;
    }
    .button {
      display: inline-block;
      background-color: #AF8F53;
      color: white;
      text-decoration: none;
      padding: 12px 25px;
      border-radius: 4px;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #8c8c8c;
      border-top: 1px solid #e0e0e0;
    }
    .footer a {
      color: #AF8F53;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://gfbedvoexpulmmfitxje.supabase.co/storage/v1/object/public/assets/Mopres_Gold_luxury_lifestyle_logo.png" alt="MoPres Fashion" width="150">
    </div>
    
    <div class="content">
      <h1>Your Invoice</h1>
      <p>Dear ${customerName},</p>
      <p>Thank you for your recent purchase from MoPres Fashion. Please find your invoice attached to this email for your records.</p>
      
      <div class="info-box">
        <p><strong>Invoice Number:</strong> ${order.order_ref}</p>
        <p><strong>Date:</strong> ${formatDate(order.created_at)}</p>
        <p><strong>Amount Due:</strong> ${formatCurrency(order.total_amount)}</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${publicUrl}" class="button">View Invoice Online</a>
      </div>
      
      <p>To make payment via EFT, please use the following banking details:</p>
      
      <div class="banking-box">
        <p><strong>Bank:</strong> First National Bank (FNB)</p>
        <p><strong>Account Name:</strong> MoPres Fashion</p>
        <p><strong>Account Type:</strong> GOLD BUSINESS ACCOUNT</p>
        <p><strong>Account Number:</strong> 62792142095</p>
        <p><strong>Branch Code:</strong> 210648</p>
        <p><strong>Reference:</strong> ${order.order_ref}</p>
      </div>
      
      <p>If you have any questions or need assistance, please don't hesitate to contact us at <a href="mailto:info@mopres.co.za" style="color: #AF8F53;">info@mopres.co.za</a> or call us at +27 83 500 5311.</p>
      
      <p>Thank you for shopping with MoPres Fashion!</p>
      
      <p>Warm regards,<br>The MoPres Fashion Team</p>
    </div>
    
    <div class="footer">
      <p>MoPres Fashion | 6680 Witrugeend Street, 578 Heuwelsig Estates | Cetisdal, Centurion, South Africa</p>
      <p>© ${new Date().getFullYear()} MoPres Fashion. All rights reserved.</p>
      <p><a href="https://www.mopres.co.za">www.mopres.co.za</a> | <a href="https://www.instagram.com/mopresfashion">Instagram</a> | <a href="https://www.facebook.com/mopresfashion">Facebook</a></p>
    </div>
  </div>
</body>
</html>
  `;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Parse request body
    const { orderId } = await req.json();
    
    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'Missing order ID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Get order details
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select(`
        id,
        order_ref,
        total_amount,
        created_at,
        customer_email,
        shipping_address,
        status
      `)
      .eq('id', orderId)
      .single();
      
    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
    
    if (!order.customer_email) {
      return new Response(
        JSON.stringify({ error: 'Customer email not available' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Get customer name from shipping address
    const shippingAddress = order.shipping_address || {};
    const customerName = (shippingAddress.firstName && shippingAddress.lastName)
      ? `${shippingAddress.firstName} ${shippingAddress.lastName}`
      : 'Valued Customer';
    
    // Check if there's an invoice PDF in Supabase storage
    const invoiceFileName = `invoice_${order.order_ref}.pdf`;
    const { data: existsData } = await supabaseClient
      .storage
      .from('invoices')
      .list('', {
        search: invoiceFileName
      });
    
    const invoiceExists = existsData && existsData.length > 0 && existsData.some(file => file.name === invoiceFileName);
    
    if (!invoiceExists) {
      return new Response(
        JSON.stringify({ error: 'Invoice PDF not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
    
    // Get the PDF file
    const { data: fileData, error: fileError } = await supabaseClient
      .storage
      .from('invoices')
      .download(invoiceFileName);
      
    if (fileError || !fileData) {
      return new Response(
        JSON.stringify({ error: 'Error downloading invoice PDF' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Convert the file to base64
    const buffer = await fileData.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    const base64Invoice = btoa(String.fromCharCode.apply(null, uint8Array));
    
    // Get the public URL
    const { data: publicUrlData } = supabaseClient
      .storage
      .from('invoices')
      .getPublicUrl(invoiceFileName);
    
    // Create email HTML
    const emailHtml = createEmailHtml(order, customerName, publicUrlData.publicUrl);
    
    // Send email with attachment
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'MoPres Fashion <onboarding@resend.dev>',
      to: [order.customer_email],
      subject: `MoPres Fashion - Your Invoice #${order.order_ref}`,
      html: emailHtml,
      attachments: [
        {
          filename: `MoPres_Invoice_${order.order_ref}.pdf`,
          content: base64Invoice,
          encoding: 'base64',
        },
      ],
      reply_to: 'bakielisrael@gmail.com',
    });
    
    if (emailError) {
      console.error('Error sending email:', emailError);
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Invoice email sent to ${order.customer_email}`,
        emailId: emailData?.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})
