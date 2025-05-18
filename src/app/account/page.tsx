'use client';

import React, { useEffect, useState } from 'react';
import SectionTitle from '@/components/SectionTitle';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowserClient';
import AccountLayout from '@/components/AccountLayout';
import Link from 'next/link';

export default function AccountPage() {
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get the current user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error fetching user:', userError);
          return;
        }
        
        if (userData.user) {
          setUser(userData.user);
          
          // Fetch recent orders for this user
          const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .select('id, order_ref, created_at, total_amount, status')
            .eq('customer_email', userData.user.email)
            .order('created_at', { ascending: false })
            .limit(5);
          
          if (orderError) {
            console.error('Error fetching orders:', orderError);
          } else {
            setOrders(orderData || []);
          }
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [supabase]);

  if (loading) {
    return (
      <AccountLayout>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-brand-gold px-6 py-4">
          <h1 className="text-white text-xl font-medium">Account Overview</h1>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Information Section */}
            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-4">Account Information</h2>
              
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-gray-700">
                  <span className="font-medium">Email:</span> {user?.email}
                </p>
                
                <p className="text-gray-700 mt-1">
                  <span className="font-medium">Member Since:</span>{' '}
                  {user?.created_at 
                    ? new Date(user.created_at).toLocaleDateString('en-ZA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'N/A'}
                </p>
                
                <p className="text-gray-700 mt-1">
                  <span className="font-medium">Email Verified:</span>{' '}
                  {user?.email_confirmed_at ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
            
            {/* Recent Orders Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-800">Recent Orders</h2>
                <Link 
                  href="/account/orders" 
                  className="text-sm text-brand-gold hover:underline"
                >
                  View All Orders
                </Link>
              </div>
              
              {orders.length === 0 ? (
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-center">
                  <p className="text-gray-500">You haven't placed any orders yet.</p>
                  <Link 
                    href="/shop" 
                    className="mt-2 inline-block text-brand-gold hover:underline"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="overflow-hidden border border-gray-200 rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Link 
                              href={`/account/orders/${order.order_ref}`}
                              className="text-brand-gold hover:underline"
                            >
                              #{order.order_ref}
                            </Link>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {new Date(order.created_at).toLocaleDateString('en-ZA')}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status.replace(/_/g, ' ').charAt(0).toUpperCase() + order.status.replace(/_/g, ' ').slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {new Intl.NumberFormat('en-ZA', {
                              style: 'currency',
                              currency: 'ZAR'
                            }).format(order.total_amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          
          {/* Account Management Section */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Account Management</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-md hover:border-brand-gold transition-colors">
                <h3 className="font-medium text-gray-800 mb-2">Update Password</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Change your account password for security.
                </p>
                <Link 
                  href="/account/forgot-password" 
                  className="text-sm text-brand-gold hover:underline"
                >
                  Change Password
                </Link>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-md hover:border-brand-gold transition-colors">
                <h3 className="font-medium text-gray-800 mb-2">Manage Addresses</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Add or update your shipping addresses.
                </p>
                <Link 
                  href="/account/addresses" 
                  className="text-sm text-brand-gold hover:underline"
                >
                  Manage Addresses
                </Link>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-md hover:border-brand-gold transition-colors">
                <h3 className="font-medium text-gray-800 mb-2">Wishlist</h3>
                <p className="text-sm text-gray-600 mb-3">
                  View and manage your saved items.
                </p>
                <Link 
                  href="/account/wishlist" 
                  className="text-sm text-brand-gold hover:underline"
                >
                  View Wishlist
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}