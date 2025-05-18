import { renderEmailTemplate } from './render-template';
import { OrderConfirmationEmail } from './templates/OrderConfirmationEmail';
import { sendEmail } from './resend';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for getting product images
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gfbedvoexpulmmfitxje.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  products: {
    id: string;
    name: string;
    sku?: string;
    images?: string[];
  } | null;
  size?: string;
}

export interface ShippingAddress {
  firstName?: string;
  lastName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
}

export interface OrderConfirmationData {
  id: string;
  order_ref: string;
  customer_email: string;
  total_amount: number;
  shipping_fee: number;
  created_at: string;
  status: string;
  shipping_address: ShippingAddress;
  order_items: OrderItem[];
  payment_method?: string | null;
}

/**
 * Calculate estimated delivery date based on the order date
 * 3-5 business days from order date for standard shipping
 */
function calculateEstimatedDelivery(orderDate: string): string {
  const date = new Date(orderDate);
  
  // Add 5 business days (excluding weekends)
  let businessDays = 0;
  let daysToAdd = 0;
  
  while (businessDays < 5) {
    daysToAdd++;
    date.setDate(date.getDate() + 1);
    
    // Skip weekends (0 = Sunday, 6 = Saturday)
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays++;
    }
  }
  
  // Format the date range (3-5 business days)
  const minDate = new Date(new Date(orderDate).getTime());
  let minBusinessDays = 0;
  let minDaysToAdd = 0;
  
  while (minBusinessDays < 3) {
    minDaysToAdd++;
    minDate.setDate(minDate.getDate() + 1);
    
    const dayOfWeek = minDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      minBusinessDays++;
    }
  }
  
  const formatOptions: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  };
  
  return `${minDate.toLocaleDateString('en-ZA', formatOptions)} - ${date.toLocaleDateString('en-ZA', formatOptions)}`;
}

/**
 * Generate a URL to the product image
 */
function getProductImageUrl(imageUrl: string | undefined): string {
  if (!imageUrl) {
    return 'https://gfbedvoexpulmmfitxje.supabase.co/storage/v1/object/public/assets/product-placeholder.png';
  }
  
  // If it's already a full URL, use it directly
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  return `${supabaseUrl}/storage/v1/object/public/products/${imageUrl}`;
}

/**
 * Send an order confirmation email to the customer
 */
export async function sendOrderConfirmationEmail(
  order: OrderConfirmationData
): Promise<{ success: boolean; error?: string }> {
  try {
    // Generate estimated delivery date
    const estimatedDelivery = calculateEstimatedDelivery(order.created_at);
    
    // Generate order details URL
    const orderUrl = `https://www.mopres.co.za/account/orders/${order.id}`;
    
    // Prepare product images
    const productImages: { [productId: string]: string } = {};
    
    // Add product images to the map
    for (const item of order.order_items) {
      if (item.products?.images && item.products.images.length > 0) {
        productImages[item.id] = getProductImageUrl(item.products.images[0]);
      } else {
        productImages[item.id] = 'https://gfbedvoexpulmmfitxje.supabase.co/storage/v1/object/public/assets/product-placeholder.png';
      }
    }
    
    // Render the email HTML from our React template
    const emailHtml = await renderEmailTemplate(OrderConfirmationEmail, {
      order,
      estimatedDelivery,
      orderUrl,
      productImages,
    });
    
    // Send the email
    const { success, error } = await sendEmail({
      to: [order.customer_email],
      subject: `Your MoPres Fashion Order #${order.order_ref} Confirmation`,
      html: emailHtml,
      replyTo: 'info@mopres.co.za',
    });
    
    if (!success) {
      console.error('Failed to send order confirmation email:', error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in sendOrderConfirmationEmail:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Send both order confirmation and invoice emails
 */
export async function sendOrderEmails(
  order: OrderConfirmationData,
  invoicePdfBase64: string
): Promise<{ 
  confirmation: { success: boolean; error?: string };
  invoice: { success: boolean; error?: string };
}> {
  try {
    // Send order confirmation email
    const confirmationResult = await sendOrderConfirmationEmail(order);
    
    // Send invoice email
    const invoiceOrder = {
      id: order.id,
      order_ref: order.order_ref,
      customer_name: `${order.shipping_address.firstName || ''} ${order.shipping_address.lastName || ''}`.trim() || 'Valued Customer',
      customer_email: order.customer_email,
      total_amount: order.total_amount,
      created_at: order.created_at,
      status: order.status
    };
    
    const invoiceUrl = `https://gfbedvoexpulmmfitxje.supabase.co/storage/v1/object/public/invoices/invoice_${order.order_ref}.pdf`;
    
    // Import the invoice email service
    const { sendInvoiceEmail } = await import('./invoice-service');
    
    // Make sure the invoicePdfBase64 is resolved if it's a Promise
    const resolvedPdfBase64 = invoicePdfBase64 instanceof Promise 
      ? await invoicePdfBase64 
      : invoicePdfBase64;
    
    // Send the invoice email with the resolved PDF base64 string
    const invoiceResult = await sendInvoiceEmail(invoiceOrder, resolvedPdfBase64);
    
    return {
      confirmation: confirmationResult,
      invoice: invoiceResult
    };
  } catch (error) {
    console.error('Error in sendOrderEmails:', error);
    return {
      confirmation: { success: false, error: 'Failed to send confirmation email' },
      invoice: { success: false, error: 'Failed to send invoice email' }
    };
  }
}