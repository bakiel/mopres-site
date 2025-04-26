import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabaseClient';
import SectionTitle from '@/components/SectionTitle';
import Button from '@/components/Button';
import { redirect } from 'next/navigation';

// Define type for Order Summary
interface OrderSummary {
  id: string;
  created_at: string;
  order_ref: string;
  total_amount: number;
  status: string;
}

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-ZA', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
};

// Helper function to get status badge color
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


export default async function OrdersPage() {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  // Check user session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    // Redirect to login if not authenticated
    redirect('/account/login?redirect=/account/orders');
  }

  // Fetch user's orders
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, created_at, order_ref, total_amount, status')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false }); // Show newest first

  if (error) {
    console.error("Error fetching orders:", JSON.stringify(error, null, 2));
    // Handle error display appropriately
    return (
        <div className="bg-background-body py-12 lg:py-20">
            <div className="w-full max-w-screen-lg mx-auto px-4">
                <SectionTitle centered>My Orders</SectionTitle>
                <p className="text-center text-red-600 mt-6">Could not load your order history. Please try again later.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="bg-background-body py-12 lg:py-20">
      <div className="w-full max-w-screen-lg mx-auto px-4">
        <SectionTitle centered>My Orders</SectionTitle>

        {orders && orders.length > 0 ? (
          <div className="mt-8 space-y-6 font-poppins">
            {orders.map((order: OrderSummary) => (
              <div key={order.id} className="bg-white p-4 md:p-6 border border-border-light rounded shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Order Info */}
                <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                   <div>
                        <span className="block text-xs text-text-light mb-1">Order #</span>
                        <span className="font-medium text-text-dark">{order.order_ref}</span>
                   </div>
                    <div>
                        <span className="block text-xs text-text-light mb-1">Date Placed</span>
                        <span className="font-medium text-text-dark">{formatDate(order.created_at)}</span>
                    </div>
                     <div>
                        <span className="block text-xs text-text-light mb-1">Total</span>
                        <span className="font-medium text-text-dark">{formatCurrency(order.total_amount)}</span>
                    </div>
                     <div>
                        <span className="block text-xs text-text-light mb-1">Status</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} {/* Format status */}
                        </span>
                    </div>
                </div>
                  {/* Action Button */}
                  <div className="flex-shrink-0 mt-4 md:mt-0">
                     <Link href={`/account/orders/${order.id}`}>
                         <Button variant="outline-light">View Details</Button> {/* Removed size="sm" */}
                     </Link>
                  </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center mt-8 bg-white p-12 border border-border-light rounded shadow-sm font-poppins">
            <h2 className="text-xl font-semibold mb-4">No Orders Found</h2>
            <p className="text-text-light mb-6">You haven't placed any orders yet.</p>
            <Link href="/shop">
                <Button variant="primary">Start Shopping</Button>
            </Link>
          </div>
        )}
         <div className="mt-8 text-center">
            <Link href="/account" className="text-brand-gold hover:underline font-poppins text-sm">
                &larr; Back to Account
            </Link>
        </div>
      </div>
    </div>
  );
}
