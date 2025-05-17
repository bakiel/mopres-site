import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are defined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
}
if (!supabaseServiceRoleKey) {
  console.error("CRITICAL: Missing environment variable: SUPABASE_SERVICE_ROLE_KEY");
}

// Create a Supabase client configured to use the Service Role Key
const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceRoleKey || '');

// Type definitions match Next.js 15 API route pattern
export async function GET(
  request: NextRequest,
  { params }: { params: { orderRef: string } }
) {
  const orderRef = params.orderRef;

  if (!supabaseServiceRoleKey) {
    return NextResponse.json(
      { error: 'Server configuration error: Service role key missing.' },
      { status: 500 }
    );
  }

  if (!orderRef) {
    return NextResponse.json(
      { error: 'Order reference is required' },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id, created_at, order_ref, total_amount, shipping_fee, status, user_email, shipping_address,
        order_items (
          id, quantity, price, size,
          products (name, sku)
        )
      `)
      .eq('order_ref', orderRef)
      .single();

    if (error) {
      const status = error.code === 'PGRST116' ? 404 : 500;
      const message = status === 404 ? "Order not found" : "Database error";
      return NextResponse.json(
        { error: message, details: error.message },
        { status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
