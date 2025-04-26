'use client'; // Needs client-side checks for auth and data fetching

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SectionTitle from '@/components/SectionTitle';
import Button from '@/components/Button'; // Import Button component
import { createSupabaseBrowserClient } from '@/lib/supabaseClient'; // Import the factory function
import type { User } from '@supabase/supabase-js';

// Define a type for the order data (adjust based on actual schema)
// TODO: Refine this type, potentially fetch order items as well
type Order = {
  id: string;
  created_at: string; // Assuming timestamp string
  status: string;
  total_amount: number;
  invoice_number?: string; // Optional invoice number
  // Add other fields as needed, e.g., order_items array if fetched together
};

export default function OrderHistoryPage() {
  // Create the client instance inside the component
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndOrders = async () => {
      setLoading(true);
      setError(null);

      // 1. Check user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        console.error("Error getting session or no user:", sessionError);
        router.push('/account/login'); // Redirect if not logged in
        return;
      }
      setUser(session.user);

      // 2. Fetch orders for the logged-in user
      try {
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('id, created_at, status, total_amount, invoice_number') // Select desired fields
          .eq('user_id', session.user.id) // Filter by user ID
          .order('created_at', { ascending: false }); // Show most recent first

        if (ordersError) {
          console.error("Error fetching orders:", ordersError);
          throw new Error("Could not load your order history.");
        }
        setOrders(ordersData || []);
      } catch (fetchError: any) {
        setError(fetchError.message || "An error occurred while fetching orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndOrders();

     // Listen for auth changes (e.g., logout)
     const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (event === 'SIGNED_OUT') {
            setUser(null);
            setOrders([]); // Clear orders on logout
            router.push('/account/login');
          } else {
             // Update user state if session changes while on page (less likely here)
             setUser(session?.user ?? null);
          }
        }
      );

      // Cleanup listener
      return () => {
        authListener?.subscription.unsubscribe();
      };

  }, [router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
     return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
  }

  if (loading) {
    return (
      <div className="bg-background-body py-12 lg:py-20">
        <div className="w-full max-w-screen-xl mx-auto px-4 text-center">
          <p className="text-text-light">Loading your order history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-body py-12 lg:py-20">
      <div className="w-full max-w-screen-lg mx-auto px-4">
        <SectionTitle centered>Order History</SectionTitle>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 font-poppins" role="alert"> {/* Added font-poppins */}
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {orders.length > 0 ? (
          <div className="overflow-x-auto bg-white p-6 border border-border-light rounded shadow-sm mt-8 font-poppins"> {/* Added font-poppins */}
            <table className="min-w-full divide-y divide-border-light">
              <thead className="bg-background-light">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Order Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Order #</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Total</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border-light">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-dark">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-dark font-mono">{order.invoice_number || order.id.substring(0, 8)}</td> {/* Show invoice # or partial ID */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-dark">{formatCurrency(order.total_amount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-dark capitalize">{order.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/account/orders/${order.id}`} className="text-brand-gold hover:underline">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center mt-8 bg-white p-8 border border-border-light rounded shadow-sm font-poppins"> {/* Added font-poppins */}
            <p className="text-text-light">You haven't placed any orders yet.</p>
            <Link href="/shop" className="mt-4 inline-block">
                <Button variant="primary">Start Shopping</Button>
            </Link>
          </div>
        )}

         <div className="mt-8 text-center">
            <Link href="/account" className="text-brand-gold hover:underline font-poppins"> {/* Added font-poppins */}
                &larr; Back to My Account
            </Link>
        </div>
      </div>
    </div>
  );
}
