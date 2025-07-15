'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowserClient';
import { User } from '@supabase/supabase-js';

export default function UserDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchUserData();
  }, []);

  const checkAuth = async () => {
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/account/login');
      return;
    }
    
    setUser(user);
  };

  const fetchUserData = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      
      // Fetch user orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (ordersData) {
        setOrders(ordersData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/">
                <Image 
                  src="/logo.png" 
                  alt="MoPres Fashion"
                  width={120}
                  height={48}
                  className="h-8 w-auto"
                />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.email}</span>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">My Account</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
            <nav className="space-y-2">
              <Link href="/account/orders" className="block px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-700 rounded">
                My Orders
              </Link>
              <Link href="/account/profile" className="block px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-700 rounded">
                Profile Settings
              </Link>
              <Link href="/account/addresses" className="block px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-700 rounded">
                Addresses
              </Link>
              <Link href="/account/wishlist" className="block px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-700 rounded">
                Wishlist
              </Link>
            </nav>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <Link href="/account/orders" className="text-amber-600 hover:text-amber-700 text-sm">
                View all →
              </Link>
            </div>
            
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">R {order.total_amount}</p>
                        <p className="text-sm text-gray-500 capitalize">{order.status}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No orders yet</p>
            )}
          </div>
        </div>

        {/* Account Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500">Email</dt>
                <dd className="text-gray-900">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Member Since</dt>
                <dd className="text-gray-900">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h2>
            <p className="text-gray-600 mb-4">
              Our customer service team is here to assist you with any questions or concerns.
            </p>
            <div className="space-y-2">
              <a href="mailto:support@mopres.co.za" className="flex items-center text-amber-600 hover:text-amber-700">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                support@mopres.co.za
              </a>
              <Link href="/contact" className="flex items-center text-amber-600 hover:text-amber-700">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}