 import React from 'react';
 import Link from 'next/link';
 import Image from 'next/image'; // Import next/image
 import { cookies } from 'next/headers';
 import { createSupabaseServerClient, getProductImageUrl } from '@/lib/supabaseClient';
 import SectionTitle from '@/components/SectionTitle';
 // Removed unused Button import
 import { notFound, redirect } from 'next/navigation';
 // Removed unused InvoiceTemplate import

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

 // Helper function to format date
 const formatDate = (dateString: string) => {
   return new Date(dateString).toLocaleDateString('en-ZA', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
};

// Helper function to get status badge color (copied from orders list page)
const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
        case 'pending_payment': return 'bg-yellow-100 text-yellow-800';
        case 'processing': return 'bg-blue-100 text-blue-800';
        case 'shipped': return 'bg-green-100 text-green-800';
        case 'delivered': return 'bg-green-200 text-green-900';
        case 'cancelled': return 'bg-red-100 text-red-800';
        case 'refunded': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

// Function to generate tracking URL (basic example, needs refinement per carrier)
const getTrackingUrl = (carrier?: string | null, trackingNumber?: string | null): string | null => {
    if (!carrier || !trackingNumber) return null;
    const carrierLower = carrier.toLowerCase();
    // Add more carriers as needed
    if (carrierLower.includes('aramex')) {
        return `https://www.aramex.com/track/results?track_id=${trackingNumber}`;
    } else if (carrierLower.includes('dhl')) {
         return `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`;
    } else if (carrierLower.includes('fastway')) {
         return `https://www.fastway.co.za/our-services/track-your-parcel?l=${trackingNumber}`;
    }
     // Add more specific carrier links here...
    // Fallback generic search (less ideal)
    // return `https://www.google.com/search?q=${encodeURIComponent(carrier + ' tracking ' + trackingNumber)}`;
    return null; // Return null if no specific link is known
}

// Align with standard Next.js PageProps structure
interface OrderDetailsPageProps {
    params: { orderId: string }; // Keep specific param name
    searchParams: { [key: string]: string | string[] | undefined }; // Include searchParams even if unused
}

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const orderId = params.orderId;

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

  const subtotal = order.total_amount - order.shipping_cost;
  const trackingUrl = getTrackingUrl(order.shipping_carrier, order.tracking_number);

  return (
      <div className="bg-background-body py-12 lg:py-20">
          <div className="w-full max-w-screen-lg mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
                <SectionTitle>Order Details</SectionTitle>
                 <Link href="/account/orders" className="text-brand-gold hover:underline font-poppins text-sm">
                    &larr; Back to Orders
                </Link>
            </div>


            <div className="bg-white p-6 md:p-8 border border-border-light rounded shadow-sm mb-8">
                {/* Corrected Grid Structure */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-border-light text-sm">
                    <div>
                        <span className="block text-xs text-text-light mb-1">Order #</span>
                        <span className="font-medium text-text-dark">{order.order_ref}</span>
                    </div>
                     <div>
                        <span className="block text-xs text-text-light mb-1">Date Placed</span>
                        <span className="font-medium text-text-dark">{formatDate(order.created_at)}</span>
                    </div>
                     <div>
                        <span className="block text-xs text-text-light mb-1">Total Amount</span>
                        <span className="font-medium text-text-dark">{formatCurrency(order.total_amount)}</span>
                    </div>
                     <div>
                        <span className="block text-xs text-text-light mb-1">Status</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </span>
                    </div>
                </div> {/* Correctly closed grid div */}

                {/* Tracking Information */}
                {order.status === 'shipped' && (order.tracking_number || order.shipping_carrier) && (
                     <div className="mb-6 pb-6 border-b border-border-light">
                        <h3 className="text-base font-semibold font-montserrat mb-3">Tracking Information</h3>
                        <p className="text-sm text-text-light">
                            Carrier: <span className="text-text-dark font-medium">{order.shipping_carrier || 'N/A'}</span>
                        </p>
                         <p className="text-sm text-text-light">
                            Tracking #: <span className="text-text-dark font-medium">{order.tracking_number || 'N/A'}</span>
                            {trackingUrl && (
                                <a href={trackingUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-brand-gold hover:underline text-xs">(Track Package)</a>
                            )}
                        </p>
                     </div>
                )}


                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Shipping Address */}
                    <div>
                        <h3 className="text-base font-semibold font-montserrat mb-3">Shipping Address</h3>
                        {order.shipping_address ? (
                            <div className="text-sm text-text-light space-y-1 font-poppins">
                                <p>{order.shipping_address.firstName} {order.shipping_address.lastName}</p>
                                <p>{order.shipping_address.addressLine1}</p>
                                {order.shipping_address.addressLine2 && <p>{order.shipping_address.addressLine2}</p>}
                                <p>{order.shipping_address.city}, {order.shipping_address.province}, {order.shipping_address.postalCode}</p>
                                <p>{order.shipping_address.country}</p>
                                {order.shipping_address.phone && <p>Phone: {order.shipping_address.phone}</p>}
                            </div>
                        ) : (
                            <p className="text-sm text-text-light font-poppins">Address details not available.</p>
                        )}
                    </div>
                     {/* Payment Method */}
                     <div>
                        <h3 className="text-base font-semibold font-montserrat mb-3">Payment Method</h3>
                         <p className="text-sm text-text-light font-poppins">
                            {order.payment_method === 'eft' ? 'EFT / Bank Deposit' : order.payment_method || 'N/A'}
                        </p>
                        {/* Add more payment details if needed */}
                     </div>
                </div>
            </div>

            {/* Order Items */}
            <h3 className="text-lg font-semibold font-montserrat mb-4">Items Ordered</h3>
            <div className="space-y-4 font-poppins">
                {order.order_items.map((item: OrderItem) => ( // Added type for item
                 (// Check if product data exists
                 (item.products && (<div key={item.id} className="bg-white p-4 border border-border-light rounded shadow-sm flex items-center gap-4">
                     <Link
                         href={`/shop/products/${item.products.slug}`}
                         className="flex-shrink-0 w-16 h-16 block relative overflow-hidden rounded"> {/* Added relative and overflow */}
                         <Image
                           src={getProductImageUrl(supabase, item.products.images?.[0])} // Pass supabase instance
                             alt={item.products.name}
                             fill // Use fill layout
                             style={{ objectFit: 'cover' }} // Ensure image covers the area
                             sizes="64px" // Provide size hint
                             className="rounded"
                         />
                     </Link>
                     <div className="flex-grow text-sm">
                         <Link
                             href={`/shop/products/${item.products.slug}`}
                             className="font-medium text-text-dark hover:text-brand-gold">{item.products.name}</Link>
                         {item.size && <p className="text-xs text-text-light">Size: {item.size}</p>}
                         <p className="text-xs text-text-light">Qty: {item.quantity}</p>
                     </div>
                     <div className="text-sm font-medium text-text-dark">
                         {formatCurrency(item.price * item.quantity)}
                          {item.quantity > 1 && <span className="block text-xs text-text-light text-right">({formatCurrency(item.price)} each)</span>}
                     </div>
                 </div>)))
               ))}
            </div>

             {/* Order Totals */}
             <div className="mt-6 pt-6 border-t border-border-light flex justify-end">
                <div className="w-full max-w-xs space-y-2 text-sm">
                     <div className="flex justify-between">
                        <span className="text-text-light">Subtotal:</span>
                        <span className="font-medium">{formatCurrency(subtotal)}</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-text-light">Shipping:</span>
                        <span className="font-medium">{order.shipping_cost === 0 ? 'FREE' : formatCurrency(order.shipping_cost)}</span>
                     </div>
                     <div className="flex justify-between font-semibold text-base border-t pt-2 mt-2">
                        <span>Total:</span>
                        <span>{formatCurrency(order.total_amount)}</span>
                     </div>
                </div>
             </div>

             {/* TODO: Add button to download invoice using InvoiceTemplate and jsPDF/html2canvas */}
             {/* <div className="mt-8 text-center">
                 <Button variant="secondary">Download Invoice (PDF)</Button>
             </div> */}

          </div>
          {/* Removed commented-out InvoiceTemplate block to fix syntax errors */}
      </div>
  );
}
