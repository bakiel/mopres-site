import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { Buffer } from 'buffer';

// Environment configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'info@mopres.co.za';

// Initialize clients
const resend = new Resend(RESEND_API_KEY);
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Type definitions for order data
 */
export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  size: string | null;
  products: {
    name: string;
    sku: string;
  } | null;
}

export interface OrderData {
  id: string;
  created_at: string;
  order_ref: string;
  total_amount: number;
  shipping_fee: number;
  status: string;
  customer_email: string;
  customer_name: string;
  shipping_address: string;
  order_items: OrderItem[];
}

/**
 * Generates a static HTML invoice template
 */
function generateInvoiceHtml(order: OrderData): string {
  // Format the order date
  const orderDate = new Date(order.created_at).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Calculate payment due date (7 days after order)
  const paymentDueDate = new Date(order.created_at);
  paymentDueDate.setDate(paymentDueDate.getDate() + 7);
  const formattedDueDate = paymentDueDate.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Format items
  const itemsHtml = order.order_items.map(item => {
    const productName = item.products?.name || 'Unknown Product';
    const sku = item.products?.sku || 'N/A';
    const size = item.size ? `Size: ${item.size}` : '';
    const unitPrice = item.price / item.quantity;
    const totalPrice = item.price;
    
    return `
      <tr>
        <td style="padding: 12px 15px; border-bottom: 1px solid #e8e8e8;">${productName} ${size ? `<br><span style="color: #777; font-size: 12px;">${size}</span>` : ''}</td>
        <td style="padding: 12px 15px; border-bottom: 1px solid #e8e8e8;">${sku}</td>
        <td style="padding: 12px 15px; border-bottom: 1px solid #e8e8e8; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px 15px; border-bottom: 1px solid #e8e8e8; text-align: right;">R ${unitPrice.toFixed(2)}</td>
        <td style="padding: 12px 15px; border-bottom: 1px solid #e8e8e8; text-align: right;">R ${totalPrice.toFixed(2)}</td>
      </tr>
    `;
  }).join('');
  
  // Calculate order totals
  const subtotal = order.total_amount - order.shipping_fee;
  
  // Return the complete HTML template
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MoPres Invoice #${order.order_ref}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #fff;
    }
    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      border-bottom: 2px solid #AF8F53;
      padding-bottom: 20px;
    }
    .logo img {
      max-width: 180px;
      height: auto;
    }
    .invoice-title {
      text-align: right;
    }
    .invoice-title h1 {
      color: #AF8F53;
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .invoice-title .ref {
      font-size: 16px;
      color: #666;
    }
    .invoice-details {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .invoice-details-box {
      width: 48%;
    }
    .invoice-details-box h3 {
      color: #AF8F53;
      border-bottom: 1px solid #eee;
      padding-bottom: 8px;
      margin-top: 0;
      margin-bottom: 15px;
    }
    .invoice-details-group {
      margin-bottom: 15px;
    }
    .invoice-details-group span {
      display: block;
    }
    .label {
      color: #666;
      font-size: 14px;
      margin-bottom: 4px;
    }
    .value {
      font-weight: 500;
    }
    .invoice-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    .invoice-table th {
      background-color: #AF8F53;
      color: white;
      text-align: left;
      padding: 12px 15px;
    }
    .invoice-table th:nth-child(3),
    .invoice-table th:nth-child(4),
    .invoice-table th:nth-child(5) {
      text-align: right;
    }
    .invoice-table th:nth-child(3) {
      text-align: center;
    }
    .invoice-summary {
      width: 350px;
      margin-left: auto;
      margin-bottom: 40px;
    }
    .invoice-summary-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    .invoice-summary-row.total {
      border-bottom: 2px solid #AF8F53;
      font-weight: bold;
      font-size: 18px;
      color: #AF8F53;
      padding: 12px 0;
    }
    .payment-info {
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 30px;
    }
    .payment-info h3 {
      color: #AF8F53;
      margin-top: 0;
      margin-bottom: 15px;
    }
    .payment-details {
      display: flex;
      flex-wrap: wrap;
    }
    .payment-detail {
      width: 50%;
      margin-bottom: 10px;
    }
    .payment-detail .payment-label {
      color: #666;
      font-size: 14px;
      margin-bottom: 4px;
      display: block;
    }
    .payment-detail .payment-value {
      font-weight: 500;
    }
    .highlight {
      color: #AF8F53;
      font-weight: bold;
    }
    .invoice-footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      color: #666;
      font-size: 14px;
    }
    .invoice-footer p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Invoice Header -->
    <div class="invoice-header">
      <div class="logo">
        <img src="https://gfbedvoexpulmmfitxje.supabase.co/storage/v1/object/public/images/Mopres_Gold_luxury_lifestyle_logo.png" alt="MoPres Fashion">
      </div>
      <div class="invoice-title">
        <h1>INVOICE</h1>
        <div class="ref">#${order.order_ref}</div>
      </div>
    </div>

    <!-- Invoice Details -->
    <div class="invoice-details">
      <div class="invoice-details-box">
        <h3>Bill To</h3>
        <div class="invoice-details-group">
          <span class="value">${order.customer_name}</span>
          <span class="value">${order.shipping_address}</span>
          <span class="value">${order.customer_email}</span>
        </div>
      </div>
      <div class="invoice-details-box">
        <h3>Invoice Information</h3>
        <div class="invoice-details-group">
          <span class="label">Invoice Date:</span>
          <span class="value">${orderDate}</span>
        </div>
        <div class="invoice-details-group">
          <span class="label">Payment Due:</span>
          <span class="value">${formattedDueDate}</span>
        </div>
        <div class="invoice-details-group">
          <span class="label">Status:</span>
          <span class="value">${order.status}</span>
        </div>
      </div>
    </div>

    <!-- Invoice Table -->
    <table class="invoice-table">
      <thead>
        <tr>
          <th>Item</th>
          <th>SKU</th>
          <th style="text-align: center;">Quantity</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <!-- Invoice Summary -->
    <div class="invoice-summary">
      <div class="invoice-summary-row">
        <div>Subtotal</div>
        <div>R ${subtotal.toFixed(2)}</div>
      </div>
      <div class="invoice-summary-row">
        <div>Shipping</div>
        <div>R ${order.shipping_fee.toFixed(2)}</div>
      </div>
      <div class="invoice-summary-row total">
        <div>Total Amount</div>
        <div>R ${order.total_amount.toFixed(2)}</div>
      </div>
    </div>

    <!-- Payment Information -->
    <div class="payment-info">
      <h3>Payment Information</h3>
      <div class="payment-details">
        <div class="payment-detail">
          <span class="payment-label">Bank</span>
          <span class="payment-value">First National Bank (FNB)</span>
        </div>
        <div class="payment-detail">
          <span class="payment-label">Account Name</span>
          <span class="payment-value">MoPres Fashion</span>
        </div>
        <div class="payment-detail">
          <span class="payment-label">Account Type</span>
          <span class="payment-value">GOLD BUSINESS ACCOUNT</span>
        </div>
        <div class="payment-detail">
          <span class="payment-label">Account Number</span>
          <span class="payment-value">62792142095</span>
        </div>
        <div class="payment-detail">
          <span class="payment-label">Branch Code</span>
          <span class="payment-value">210648</span>
        </div>
        <div class="payment-detail">
          <span class="payment-label">Branch</span>
          <span class="payment-value">JUBILEE MALL</span>
        </div>
        <div class="payment-detail">
          <span class="payment-label">Reference</span>
          <span class="payment-value highlight">${order.order_ref}</span>
        </div>
      </div>
    </div>

    <p>Thank you for your business. Please make payment within 7 days of the invoice date. For any inquiries, please contact us at <a href="mailto:info@mopres.co.za" style="color: #AF8F53;">info@mopres.co.za</a> or call us at +27 83 500 5311.</p>

    <!-- Invoice Footer -->
    <div class="invoice-footer">
      <p><strong>MoPres Fashion</strong> • Reg: K2018607632 • VAT: 4350288769</p>
      <p>6680 Witrugeend Street, 578 Heuwelsig Estates, Cetisdal, Centurion, South Africa</p>
      <p><a href="https://www.mopres.co.za" style="color: #AF8F53;">www.mopres.co.za</a> • <a href="mailto:info@mopres.co.za" style="color: #AF8F53;">info@mopres.co.za</a> • +27 83 500 5311</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generates a static HTML email template
 */
function generateOrderConfirmationEmailHtml(order: OrderData, includeInvoiceText: boolean = false): string {
  // Format the order date
  const orderDate = new Date(order.created_at).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Format the order items
  const formattedItems = order.order_items.map(item => {
    const productName = item.products?.name || 'Unknown Product';
    const size = item.size ? ` (Size: ${item.size})` : '';
    return `${productName}${size} x ${item.quantity} - R ${item.price.toFixed(2)}`;
  }).join('<br>');
  
  // Return the complete HTML template
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MoPres Order Confirmation - ${order.order_ref}</title>
  </head>
  <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
    <div style="background-color: #000000; padding: 20px; text-align: center;">
      <img src="https://gfbedvoexpulmmfitxje.supabase.co/storage/v1/object/public/images/Mopres_Gold_luxury_lifestyle_logo.png" alt="MoPres Logo" style="max-width: 180px; height: auto;">
    </div>
    
    <div style="padding: 20px;">
      <h1 style="color: #AF8F53; margin-bottom: 20px;">Your Order Confirmation</h1>
      
      <p>Dear ${order.customer_name || 'Valued Customer'},</p>
      
      <p>Thank you for your order with MoPres Fashion. We're excited to confirm that your order has been received and is being processed.</p>
      
      <div style="background-color: #f9f9f9; border-left: 4px solid #AF8F53; padding: 15px; margin: 20px 0;">
        <p style="margin: 0 0 5px 0;"><strong>Order Reference:</strong> ${order.order_ref}</p>
        <p style="margin: 0 0 5px 0;"><strong>Date:</strong> ${orderDate}</p>
        <p style="margin: 0 0 5px 0;"><strong>Total Amount:</strong> R ${order.total_amount.toFixed(2)}</p>
        <p style="margin: 0;"><strong>Status:</strong> ${order.status}</p>
      </div>
      
      <h3 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Details</h3>
      <p>${formattedItems}</p>
      
      <h3 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">Payment Instructions</h3>
      <p>To complete your order, please make payment via EFT to our account:</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; margin: 15px 0; font-family: monospace;">
        <p style="margin: 0 0 5px 0;"><strong>Bank:</strong> First National Bank (FNB)</p>
        <p style="margin: 0 0 5px 0;"><strong>Account Name:</strong> MoPres Fashion</p>
        <p style="margin: 0 0 5px 0;"><strong>Account Number:</strong> 62792142095</p>
        <p style="margin: 0 0 5px 0;"><strong>Account Type:</strong> GOLD BUSINESS ACCOUNT</p>
        <p style="margin: 0 0 5px 0;"><strong>Branch Code:</strong> 210648</p>
        <p style="margin: 0 0 5px 0;"><strong>Branch:</strong> JUBILEE MALL</p>
        <p style="margin: 0 0 5px 0;"><strong>Reference:</strong> ${order.order_ref}</p>
      </div>
      
      <p>Once payment is received, your order will be processed and shipped to you.</p>
      
      ${includeInvoiceText ? '<p><strong>Note:</strong> Your invoice is attached to this email for your records.</p>' : ''}
      
      <p>If you have any questions or need assistance, please don't hesitate to contact us at <a href="mailto:info@mopres.co.za" style="color: #AF8F53;">info@mopres.co.za</a> or by phone at +27 83 500 5311.</p>
      
      <p>Thank you for choosing MoPres Fashion!</p>
      
      <p>Kind regards,<br>MoPres Team</p>
    </div>
    
    <div style="background-color: #f7f7f7; padding: 20px; text-align: center; font-size: 12px; color: #777;">
      <p>&copy; 2025 MoPres Fashion • Reg: K2018607632 • VAT: 4350288769</p>
      <p>6680 Witrugeend Street, 578 Heuwelsig Estates, Cetisdal, Centurion, South Africa</p>
      <p><a href="https://www.mopres.co.za" style="color: #AF8F53;">www.mopres.co.za</a> • <a href="mailto:info@mopres.co.za" style="color: #AF8F53;">info@mopres.co.za</a> • +27 83 500 5311</p>
    </div>
  </body>
</html>`;
}

/**
 * Generates a PDF for an invoice using the invoice HTML template
 * This is a placeholder - you'll need to implement PDF generation
 * using a library like Puppeteer or jsPDF in a way that works in your environment
 */
export async function generatePdfFromHtml(order: OrderData): Promise<Buffer> {
  // This is where you would generate the PDF from HTML
  // For now, this is just a placeholder
  throw new Error('PDF generation not implemented - use a PDF generation library like Puppeteer');
}

/**
 * Fetches an order from the database
 */
export async function fetchOrder(orderRef: string): Promise<OrderData | null> {
  try {
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
        shipping_address,
        order_items (
          id,
          quantity,
          price,
          size,
          products (
            name, 
            sku
          )
        )
      `)
      .eq('order_ref', orderRef)
      .single();
      
    if (error) {
      console.error('Error fetching order:', error);
      return null;
    }
    
    return data as OrderData;
  } catch (error) {
    console.error('Error in fetchOrder:', error);
    return null;
  }
}

/**
 * Sends an order confirmation email with optional PDF attachment
 */
export async function sendOrderConfirmationEmail(
  orderRef: string, 
  includeInvoice: boolean = false,
  testEmail?: string
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    // Validate inputs
    if (!RESEND_API_KEY) {
      return {
        success: false,
        message: 'Missing RESEND_API_KEY environment variable'
      };
    }
    
    // Fetch the order data
    const order = await fetchOrder(orderRef);
    if (!order) {
      return {
        success: false,
        message: `Order not found with reference: ${orderRef}`
      };
    }
    
    // Prepare email options
    const emailOptions: any = {
      from: `MoPres Fashion <${EMAIL_FROM}>`,
      to: testEmail || order.customer_email,
      subject: `Your MoPres Order Confirmation - ${order.order_ref}`,
      html: generateOrderConfirmationEmailHtml(order, includeInvoice),
      reply_to: EMAIL_FROM,
    };
    
    // Add invoice attachment if required
    if (includeInvoice) {
      let pdfAttachment = null;
      
      // First check if we have a saved PDF in storage
      try {
        const { data: fileData, error: fileError } = await supabase.storage
          .from('invoices')
          .download(`invoices/invoice_${orderRef}.pdf`);
          
        if (fileData && !fileError) {
          // Convert the blob to base64
          const buffer = Buffer.from(await fileData.arrayBuffer());
          const base64 = buffer.toString('base64');
          
          pdfAttachment = {
            filename: `MoPres_Invoice_${orderRef}.pdf`,
            content: base64
          };
          
          console.log(`Found existing invoice PDF in storage for ${orderRef}`);
        }
      } catch (error) {
        console.warn(`No existing PDF found in storage for ${orderRef}:`, error);
      }
      
      // If no PDF found in storage, generate one and save it
      if (!pdfAttachment) {
        // Generate invoice HTML
        const invoiceHtml = generateInvoiceHtml(order);
        
        // Save the HTML to storage (for debugging purposes)
        try {
          const htmlFilePath = `invoices/invoice_${orderRef}.html`;
          const { error: htmlUploadError } = await supabase.storage
            .from('invoices')
            .upload(htmlFilePath, Buffer.from(invoiceHtml), {
              contentType: 'text/html',
              upsert: true
            });
            
          if (htmlUploadError) {
            console.warn(`Failed to save invoice HTML to storage: ${htmlUploadError.message}`);
          } else {
            console.log(`Saved invoice HTML to storage at ${htmlFilePath}`);
          }
        } catch (htmlUploadError) {
          console.warn(`Error saving invoice HTML: ${htmlUploadError}`);
        }
        
        // Here you would generate PDF from HTML using a library like Puppeteer
        // For this example, we'll use a direct HTML approach instead
        // Instead of a PDF attachment, we'll add a link to view the invoice online
        
        // This customizes the email to indicate that the invoice is available online
        emailOptions.html = generateOrderConfirmationEmailHtml(order, false);
        emailOptions.html = emailOptions.html.replace(
          '</p>\n      \n      <p>Once payment is received',
          `</p>\n      \n      <p><strong>Note:</strong> You can view your invoice online <a href="https://gfbedvoexpulmmfitxje.supabase.co/storage/v1/object/public/invoices/invoice_${orderRef}.html" style="color: #AF8F53;">by clicking here</a>.</p>\n      \n      <p>Once payment is received`
        );
      } else {
        // Add the PDF attachment to the email
        emailOptions.attachments = [pdfAttachment];
      }
    }
    
    // Send the email
    const { data: emailData, error: emailError } = await resend.emails.send(emailOptions);
    
    if (emailError) {
      console.error('Error sending email:', emailError);
      return {
        success: false,
        message: `Failed to send email: ${emailError.message}`,
        data: {
          error: emailError
        }
      };
    }
    
    return {
      success: true,
      message: includeInvoice ? 'Order confirmation email sent with invoice' : 'Order confirmation email sent',
      data: {
        emailId: emailData?.id,
        sentTo: testEmail || order.customer_email,
        order: {
          id: order.id,
          orderRef: order.order_ref
        }
      }
    };
  } catch (error) {
    console.error('Error in sendOrderConfirmationEmail:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Creates a basic script-friendly API for the email service
 */
export const emailService = {
  sendOrderConfirmationEmail,
  fetchOrder,
  generateInvoiceHtml,
  generateOrderConfirmationEmailHtml
};

export default emailService;
