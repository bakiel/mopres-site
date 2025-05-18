import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    
    // Simple API key validation
    const apiKey = authHeader.split(' ')[1];
    if (apiKey !== 'invoice-mopres-api-key-2025') {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const { orderId, pdfBase64 } = body;
    
    if (!orderId || !pdfBase64) {
      return NextResponse.json(
        { error: 'Missing required parameters: orderId and pdfBase64' },
        { status: 400 }
      );
    }
    
    // Fetch order details from Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('order_ref')
      .eq('id', orderId)
      .single();
    
    if (orderError || !order) {
      console.error('Error fetching order:', orderError);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Process the base64 PDF
    const base64Data = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
    
    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Upload to Supabase storage
    const filename = `invoice_${order.order_ref}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('invoices')
      .upload(filename, buffer, {
        contentType: 'application/pdf',
        upsert: true
      });
    
    if (uploadError) {
      console.error('Error uploading PDF:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload PDF' },
        { status: 500 }
      );
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase
      .storage
      .from('invoices')
      .getPublicUrl(filename);
    
    return NextResponse.json({
      success: true,
      filename,
      publicUrl: publicUrlData.publicUrl
    });
    
  } catch (error) {
    console.error('Error in upload PDF API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
