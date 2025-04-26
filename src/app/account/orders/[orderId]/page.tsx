import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SectionTitle from '@/components/SectionTitle';
import Button from '@/components/Button';
// Remove direct import of supabase from lib/supabaseClient
import { createSupabaseServerClient, getProductImageUrl } from '@/lib/supabaseClient'; // Import server client factory and helper
import { cookies } from 'next/headers'; // Import cookies for server-side auth check
// Remove auth-helpers import: import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

// Type for Shipping Address (assuming JSONB structure)
type ShippingAddress = {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  phone: string;
};

// Type for the fetched order details (matching Supabase structure)
type FetchedOrder = {
    id: string;
    created_at: string;
    total_amount: number;
    shipping_fee: number;
    status: string; // Assuming status is a string or enum text
    payment_status: string;
    payment_method: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: ShippingAddress;
    order_items: {
        id: string;
        product_id: string;
        quantity: number;
        size?: string;
        price: number;
        sku?: string;
        products: { // Joined product data
            name: string;
            slug: string;
            images: string[];
        }[] | null;
    }[];
};

interface OrderDetailsPageProps {
  params: {
    orderId: string;
  };
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
}

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const { orderId } = params;
  // Initialize Supabase client INSIDE the component function scope using the ssr factory
  const cookieStore = cookies();
  const supabaseServer = createSupabaseServerClient(cookieStore); // Use the ssr client factory

  let order: FetchedOrder | null = null;
  let fetchError: string | null = null;

  // Check user authentication server-side
  const { data: { user } } = await supabaseServer.auth.getUser();

  if (!user) {
    // Redirect or show message if user is not logged in
    // For server components, redirecting is typically handled in middleware or by returning null/specific component
    // For simplicity here, we'll show an error message, but a redirect is better UX.
     return (
        <div className="bg-background-body py-12 lg:py-20">
            <div className="w-full max-w-screen-md mx-auto px-4 text-center">
                <p className="text-red-600">Please log in to view your orders.</p>
                <Link href="/account/login" className="mt-4 inline-block">
                    <Button variant="primary">Login</Button>
                </Link>
            </div>
        </div>
     );
  }

  try {
    const { data, error: fetchErrorData } = await supabaseServer
      .from('orders')
      .select(`
        id,
        created_at,
        total_amount,
        shipping_fee,
        status,
        payment_status,
        payment_method,
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        order_items (
          id,
          product_id,
          quantity,
          size,
          price,
          sku,
          products (
            name,
            slug,
            images
          )
        )
      `)
      .eq('id', orderId)
      .eq('user_id', user.id) // Ensure the order belongs to the logged-in user
      .single();

    if (fetchErrorData || !data) {
      console.error("Error fetching order details:", fetchErrorData);
      if (fetchErrorData?.code === 'PGRST116') { // Not found or not authorized
          notFound();
      }
      throw new Error("Could not load order details or order not found.");
    }
    order = data as FetchedOrder;

  } catch (err: any) {
    console.error("Error in OrderDetailsPage:", err);
    fetchError = err.message || "An unexpected error occurred while loading the order.";
    // If notFound was triggered, this might not be reached, but handle other errors
  }

  if (fetchError) {
    return (
      <div className="bg-background-body py-12 lg:py-20">
        <div className="w-full max-w-screen-md mx-auto px-4 text-center">
          <p className="text-red-600">{fetchError}</p>
          <Link href="/account/orders" className="mt-4 inline-block">
            <Button variant="secondary">Back to Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    // Should have been caught by notFound() or fetchError, but defensive check
    notFound();
  }

  const displaySubtotal = order.order_items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="bg-background-body py-12 lg:py-20">
      <div className="w-full max-w-screen-lg mx-auto px-4">
        <SectionTitle centered>Order Details</SectionTitle>
        <p className="text-center text-text-light mb-8 font-poppins">Order #{order.id}</p>

        <div className="bg-white p-6 md:p-8 border border-border-light rounded shadow-sm font-poppins">
          {/* Order Status & Date */}
          <div className="flex flex-wrap justify-between items-center mb-6 pb-4 border-b border-border-light">
            <div>
              <p className="text-sm text-text-light">Order Placed:</p>
              <p className="font-medium">{formatDate(order.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-text-light">Order Status:</p>
              <p className="font-medium capitalize">{order.status?.replace('_', ' ') || 'N/A'}</p>
            </div>
             <div>
              <p className="text-sm text-text-light">Payment Status:</p>
              <p className="font-medium capitalize">{order.payment_status?.replace('_', ' ') || 'N/A'}</p>
            </div>
          </div>

          {/* Items Ordered */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Items Ordered</h3>
            <div className="space-y-4">
              {order.order_items.map(item => (
                <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-border-light pb-4 last:border-b-0">
                  <Link href={`/shop/products/${item.products?.[0]?.slug || '#'}`} className="flex-shrink-0 w-20 h-20 block overflow-hidden rounded border border-border-light relative">
                     {/* Basic img tag for simplicity in server component, or use next/image if needed */}
                     <img
                        src={getProductImageUrl(item.products?.[0]?.images?.[0])} // Safely access nested properties
                        alt={item.products?.[0]?.name || 'Product Image'}
                        className="w-full h-full object-cover"
                     />
                  </Link>
                  <div className="flex-grow">
                    <Link href={`/shop/products/${item.products?.[0]?.slug || '#'}`}>
                      <p className="font-medium hover:text-brand-gold">{item.products?.[0]?.name || 'Unknown Product'}</p>
                    </Link>
                    <p className="text-sm text-text-light">SKU: {item.sku || 'N/A'}</p>
                    {item.size && <p className="text-sm text-text-light">Size: {item.size}</p>}
                    <p className="text-sm text-text-light">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right sm:ml-auto flex-shrink-0">
                    <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                    <p className="text-xs text-text-light">({formatCurrency(item.price)} each)</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals & Shipping */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-border-light">
            {/* Shipping Address */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Shipping Address</h3>
              <div className="text-sm text-text-dark space-y-1">
                <p>{order.shipping_address.fullName}</p>
                <p>{order.shipping_address.addressLine1}</p>
                {order.shipping_address.addressLine2 && <p>{order.shipping_address.addressLine2}</p>}
                <p>{order.shipping_address.city}, {order.shipping_address.province}, {order.shipping_address.postalCode}</p>
                <p>{order.shipping_address.country}</p>
                <p>Phone: {order.shipping_address.phone}</p>
              </div>
            </div>
            {/* Order Totals */}
            <div className="text-right">
              <h3 className="text-lg font-semibold mb-3">Order Totals</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-light">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(displaySubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-light">Shipping:</span>
                  <span className="font-medium">{order.shipping_fee === 0 ? 'Free' : formatCurrency(order.shipping_fee)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t mt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
                 <div className="flex justify-between text-xs mt-1">
                  <span className="text-text-light">Payment Method:</span>
                  <span className="font-medium">{order.payment_method}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center mt-10">
            <Link href="/account/orders">
              <Button variant="secondary">&larr; Back to My Orders</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
