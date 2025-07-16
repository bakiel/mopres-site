'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-singleton';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import Button from '@/components/Button';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { use } from 'react';

// Types
interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  size?: string;
  products: {
    name: string;
    sku: string;
  } | null;
}

interface Order {
  id: string;
  order_ref: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  created_at: string;
  status: string;
  payment_status: string;
  payment_method: string;
  total_amount: number;
  shipping_fee: number;
  shipping_address: {
    firstName?: string;
    lastName?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
  };
  notes?: string;
  order_items: OrderItem[];
}

// Status options for orders
const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed'];

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  
  // Unwrap params Promise using React.use
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id, order_ref, customer_name, customer_email, customer_phone,
            created_at, status, payment_status, payment_method,
            total_amount, shipping_fee, shipping_address, notes,
            order_items (
              id, quantity, price, size,
              products (name, sku)
            )
          `)
          .eq('id', orderId)
          .single();
        
        if (error) throw error;
        
        setOrder(data);
        setOrderStatus(data.status);
        setPaymentStatus(data.payment_status);
      } catch (error) {
        console.error('Error loading order:', error);
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [supabase, orderId]);
  
  const updateOrderStatus = async () => {
    if (!order) return;
    
    try {
      setUpdating(true);
      
      const { error } = await supabase
        .from('orders')
        .update({
          status: orderStatus,
          payment_status: paymentStatus
        })
        .eq('id', order.id);
      
      if (error) throw error;
      
      // Log status change to admin logs
      await supabase
        .from('admin_logs')
        .insert({
          action: 'UPDATE_STATUS',
          entity_type: 'orders',
          entity_id: order.id,
          details: {
            old_status: order.status,
            new_status: orderStatus,
            old_payment_status: order.payment_status,
            new_payment_status: paymentStatus
          }
        });
      
      // Update local state
      setOrder({
        ...order,
        status: orderStatus,
        payment_status: paymentStatus
      });
      
      toast.success('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };
  
  const generateInvoice = () => {
    // This would typically open the invoice in a new tab or download it
    if (!order) return;
    window.open(`/checkout/invoice/${order.order_ref}`, '_blank');
  };
  
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
        </div>
      </AdminLayout>
    );
  }
  
  if (!order) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">Order not found</span>
        </div>
      </AdminLayout>
    );
  }
  
  // Calculate subtotal
  const subtotal = order.total_amount - order.shipping_fee;
  
  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Order #{order.order_ref}
          </h1>
          <p className="text-gray-600">
            {formatDate(order.created_at)}
          </p>
        </div>
        
        <div className="flex space-x-4">
          <Button 
            variant="secondary"
            onClick={generateInvoice}
          >
            Download Invoice
          </Button>
          
          <Link href="/admin/orders">
            <Button variant="outline-light">
              Back to Orders
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Order Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Status Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Order Status</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="orderStatus" className="block text-sm font-medium text-gray-700 mb-1">
                Order Status
              </label>
              <select
                id="orderStatus"
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
              >
                {ORDER_STATUSES.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Status
              </label>
              <select
                id="paymentStatus"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
              >
                {PAYMENT_STATUSES.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <Button
              variant="primary"
              onClick={updateOrderStatus}
              className="w-full"
              disabled={updating || (orderStatus === order.status && paymentStatus === order.payment_status)}
            >
              {updating ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </div>
        
        {/* Customer Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Customer Information</h2>
          
          <div className="space-y-2">
            <p className="font-medium">{order.customer_name}</p>
            <p className="text-sm text-gray-600">{order.customer_email}</p>
            {order.customer_phone && (
              <p className="text-sm text-gray-600">{order.customer_phone}</p>
            )}
          </div>
          
          <h3 className="font-medium mt-4 mb-2">Shipping Address</h3>
          <div className="text-sm text-gray-600">
            <p>{order.shipping_address.firstName} {order.shipping_address.lastName}</p>
            <p>{order.shipping_address.addressLine1}</p>
            {order.shipping_address.addressLine2 && (
              <p>{order.shipping_address.addressLine2}</p>
            )}
            <p>
              {order.shipping_address.city}, {order.shipping_address.province} {order.shipping_address.postalCode}
            </p>
            <p>{order.shipping_address.country}</p>
            {order.shipping_address.phone && (
              <p className="mt-1">Phone: {order.shipping_address.phone}</p>
            )}
          </div>
        </div>
        
        {/* Payment Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Payment Information</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium">{order.payment_method}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping:</span>
              <span>{formatCurrency(order.shipping_fee)}</span>
            </div>
            
            <div className="flex justify-between font-medium">
              <span>Total:</span>
              <span className="text-lg">{formatCurrency(order.total_amount)}</span>
            </div>
            
            <div className="pt-3 mt-3 border-t border-gray-200">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Order Items */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Order Items</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.order_items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No items in this order
                  </td>
                </tr>
              ) : (
                order.order_items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-md object-cover"
                            src={`/product-images/${item.products?.sku || 'placeholder'}.jpg`}
                            alt={item.products?.name || 'Product'}
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.products?.name || 'Unknown Product'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.products?.sku || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.size || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(item.price * item.quantity)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Order Notes */}
      {order.notes && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-2">Order Notes</h2>
          <p className="text-gray-600">{order.notes}</p>
        </div>
      )}
    </AdminLayout>
  );
}
