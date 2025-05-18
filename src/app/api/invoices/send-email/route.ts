import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendInvoiceEmail } from '@/lib/email/invoice-service';

// Initialize Supabase client
const supabaseUrl = 'https://gfbedvoexpulmmfitxje.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    // Verify request authorization
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Simple API key validation (you should use a more secure method in production)
    const apiKey = authHeader.split(' ')[1];
    if (apiKey !== 'invoice-mopres-api-key-2025') {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const { orderId } = body;
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch order details from Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        order_ref,
        total_amount,
        status,
        created_at,
        customer_email,
        shipping_address
      `)
      .eq('id', orderId)
      .single();
    
    if (orderError || !order) {
      console.error('Error fetching order:', orderError);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Get customer name from shipping address
    const shippingAddress = order.shipping_address as any;
    const customerName = shippingAddress?.firstName && shippingAddress?.lastName
      ? `${shippingAddress.firstName} ${shippingAddress.lastName}`
      : 'Valued Customer';
    
    // Check if there's an invoice PDF in Supabase storage
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from('invoices')
      .download(`invoice_${order.order_ref}.pdf`);
    
    if (fileError || !fileData) {
      return NextResponse.json(
        { error: 'Invoice PDF not found' },
        { status: 404 }
      );
    }
    
    // Convert the PDF blob to base64
    const base64 = await blobToBase64(fileData);
    
    // Format order data for the email service
    const orderData = {
      id: order.id,
      order_ref: order.order_ref,
      customer_email: order.customer_email,
      customer_name: customerName,
      total_amount: order.total_amount,
      created_at: order.created_at,
      status: order.status
    };
    
    // Send the email with the invoice
    const { success, error } = await sendInvoiceEmail(orderData, base64);
    
    if (!success) {
      return NextResponse.json(
        { error: error || 'Failed to send invoice email' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `Invoice email sent to ${order.customer_email}`
    });
  } catch (error) {
    console.error('Error in invoice email API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to convert blob to base64
async function blobToBase64(blob: Blob): Promise<string> {
  // Convert Blob to Buffer in Node.js environment
  const buffer = Buffer.from(await blob.arrayBuffer());
  return buffer.toString('base64');
}
