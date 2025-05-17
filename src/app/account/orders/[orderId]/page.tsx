 import React from 'react';
 import { cookies } from 'next/headers';
 import { createSupabaseServerClient } from '@/lib/supabaseClient'; // Removed getProductImageUrl
 // Removed unused Button import
 import { notFound, redirect } from 'next/navigation';
 // Removed unused InvoiceTemplate import
import OrderDetailsClient from '@/components/OrderDetailsClient'; // Added import

 // Define types for Order and OrderItem (consider centralizing these)
interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  size?: string | null;
  products: { // Joined product data
    id: string;
    name: string;
    slug: string;
    images: string[];
   } | null;
 }

 // Removed unused Order interface definition

 export default async function OrderDetailsPage({ params: paramsPromise }: { params: Promise<{ orderId: string }> }) {
   const cookieStore = await cookies(); // Await cookies() here
   const supabase = createSupabaseServerClient(cookieStore);
   // Await the params promise
   const { orderId } = await paramsPromise;

   // Check user session
   const { data: { session } } = await supabase.auth.getSession();
   if (!session?.user) {
     redirect(`/account/login?redirect=/account/orders/${orderId}`);
   }

   // Fetch the specific order with items and product details
   const { data: order, error } = await supabase
     .from('orders')
     .select(`
       *,
       order_items (
         *,
         products (id, name, slug, images)
       )
     `)
     .eq('id', orderId)
     .eq('user_id', session.user.id) // Ensure user owns the order
     .single(); // Expect only one result

   if (error || !order) {
     console.error("Error fetching order details:", error);
     notFound(); // Show 404 if order not found or doesn't belong to user
   }

   // Removed subtotal and trackingUrl calculations

   // Render the client component, passing the fetched order data
   return <OrderDetailsClient order={order} />;
 }
