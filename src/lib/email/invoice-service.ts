import { OrderConfirmationData } from './order-service';
import { sendEmailSafely } from './safe-email-sender';

/**
 * Interface for basic invoice order data
 */
interface InvoiceOrder {
  id: string;
  order_ref: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  created_at: string;
  status: string;
}

/**
 * Send an invoice email with the attached PDF
 */
export async function sendInvoiceEmail(
  order: InvoiceOrder,
  invoicePdfBase64: string | Promise<string>
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`Sending invoice email for order ${order.order_ref}`);
    
    // Ensure PDF is resolved if it's a Promise
    let resolvedPdfBase64 = invoicePdfBase64;
    if (resolvedPdfBase64 instanceof Promise) {
      try {
        resolvedPdfBase64 = await resolvedPdfBase64;
      } catch (pdfError) {
        console.error('Error resolving PDF Promise:', pdfError);
        return {
          success: false,
          error: 'Failed to generate invoice PDF'
        };
      }
    }
    
    // Prepare the attachments
    const attachments = [{
      filename: `MoPres_Invoice_${order.order_ref}.pdf`,
      content: resolvedPdfBase64 // Now guaranteed to be a string, not a Promise
    }];
    
    // Generate a simple HTML email body for the invoice
    const invoiceEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Your MoPres Invoice</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; color: #333;">
          <div style="text-align: center; padding: 20px 0;">
            <img src="https://gfbedvoexpulmmfitxje.supabase.co/storage/v1/object/public/images/Mopres_Gold_luxury_lifestyle_logo.png" alt="MoPres Logo" style="max-width: 180px;">
          </div>
          
          <div style="padding: 20px;">
            <h1 style="color: #AF8F53; margin-bottom: 20px;">Invoice for Order #${order.order_ref}</h1>
            
            <p>Dear ${order.customer_name},</p>
            
            <p>Thank you for your order with MoPres Fashion. Please find your invoice attached to this email.</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #AF8F53; margin: 20px 0;">
              <p style="margin: 0;"><strong>Order Reference:</strong> ${order.order_ref}</p>
              <p style="margin: 10px 0 0;"><strong>Total Amount:</strong> R ${order.total_amount.toFixed(2)}</p>
            </div>
            
            <p>If you have any questions regarding your order or invoice, please don't hesitate to contact our customer service team at <a href="mailto:info@mopres.co.za" style="color: #AF8F53;">info@mopres.co.za</a> or call us at +27 83 500 5311.</p>
            
            <p>Thank you for choosing MoPres Fashion!</p>
            
            <p style="margin-top: 30px;">Kind regards,<br>The MoPres Fashion Team</p>
          </div>
          
          <div style="background-color: #f7f7f7; padding: 20px; text-align: center; font-size: 12px; color: #777;">
            <p>&copy; 2025 MoPres Fashion • Reg: K2018607632 • VAT: 4350288769</p>
            <p>6680 Witrugeend Street, 578 Heuwelsig Estates, Cetisdal, Centurion, South Africa</p>
            <p><a href="https://www.mopres.co.za" style="color: #AF8F53;">www.mopres.co.za</a> • <a href="mailto:info@mopres.co.za" style="color: #AF8F53;">info@mopres.co.za</a> • +27 83 500 5311</p>
          </div>
        </body>
      </html>
    `;
    
    // Use the safe email sending function to avoid [object Promise] issues
    const { success, error } = await sendEmailSafely({
      to: [order.customer_email],
      subject: `Your MoPres Invoice #${order.order_ref}`,
      html: invoiceEmailHtml, // Static HTML string, not a Promise
      attachments,
      replyTo: 'info@mopres.co.za',
    });
    
    if (!success) {
      console.error('Failed to send invoice email:', error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in sendInvoiceEmail:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}