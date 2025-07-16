'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import SendEmailsCard from '@/components/admin/SendEmailsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gfbedvoexpulmmfitxje.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function EmailFunctionalityPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshFlag, setRefreshFlag] = useState(0);

  // Function to refresh the order list
  const refreshOrders = () => {
    setRefreshFlag(prev => prev + 1);
  };

  // Fetch recent orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('id, order_ref, customer_email, status, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          throw error;
        }

        setOrders(data || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load recent orders');
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [refreshFlag]);

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-semibold mb-8 text-gray-800 font-poppins">
        Email Functionality Demo
      </h1>

      <div className="mb-8">
        <Button onClick={refreshOrders} variant="outline">
          Refresh Orders
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-600">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700 font-poppins">
              Recent Orders
            </h2>
            
            <div className="space-y-4">
              {orders.map(order => (
                <Card key={order.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">Order #{order.order_ref}</CardTitle>
                    <CardDescription>
                      Created: {new Date(order.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2">
                      <p><strong>Status:</strong> {order.status.replace('_', ' ')}</p>
                      <p><strong>Customer Email:</strong> {order.customer_email || 'Not available'}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {orders.length === 0 && (
                <div className="bg-gray-50 p-6 rounded-md text-center text-gray-500">
                  No orders found
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700 font-poppins">
              Send Order Emails
            </h2>
            
            {orders.length > 0 && (
              <SendEmailsCard 
                order={orders[0]} 
                onSuccess={() => {
                  toast.success('Email operation completed successfully');
                  refreshOrders();
                }}
              />
            )}
            
            <div className="mt-8 bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium text-blue-800 mb-2">About This Demo</h3>
              <p className="text-sm text-blue-700">
                This page demonstrates the email functionality for MoPres e-commerce platform.
                It allows sending order confirmation and invoice emails to customers.
                The SendEmailsCard component can be integrated into the admin dashboard
                for order management.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}