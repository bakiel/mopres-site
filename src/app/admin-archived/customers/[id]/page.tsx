'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-singleton';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import Button from '@/components/Button';
import { formatCurrency, formatDate } from '@/utils/formatters';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  PencilSquareIcon,
  TrashIcon,
  ShoppingBagIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

// Types
interface CustomerAddress {
  id: string;
  customer_id: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

interface Order {
  id: string;
  order_ref: string;
  created_at: string;
  status: string;
  payment_status: string;
  total_amount: number;
}

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  created_at: string;
  status: string;
  notes: string | null;
  tags: string[] | null;
}

interface CustomerNote {
  id: string;
  customer_id: string;
  note: string;
  created_at: string;
  created_by: string;
}

interface CustomerDetailPageProps {
  params: {
    id: string;
  };
}

export default function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notes, setNotes] = useState<CustomerNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [customerStatus, setCustomerStatus] = useState('');
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  // Fetch customer data
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        
        // Get user email for notes
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email);
        }
        
        // Fetch customer
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', params.id)
          .single();
        
        if (customerError) throw customerError;
        
        setCustomer(customerData);
        setCustomerStatus(customerData.status);
        
        // Fetch addresses
        const { data: addressesData, error: addressesError } = await supabase
          .from('customer_addresses')
          .select('*')
          .eq('customer_id', params.id);
        
        if (addressesError) throw addressesError;
        
        setAddresses(addressesData || []);
        
        // Fetch orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('id, order_ref, created_at, status, payment_status, total_amount')
          .eq('customer_id', params.id)
          .order('created_at', { ascending: false });
        
        if (ordersError) throw ordersError;
        
        setOrders(ordersData || []);
        
        // Fetch notes
        const { data: notesData, error: notesError } = await supabase
          .from('customer_notes')
          .select('*')
          .eq('customer_id', params.id)
          .order('created_at', { ascending: false });
        
        if (notesError) throw notesError;
        
        setNotes(notesData || []);
        
      } catch (error) {
        console.error('Error loading customer data:', error);
        toast.error('Failed to load customer details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomerData();
  }, [supabase, params.id]);
  
  // Update customer status
  const updateCustomerStatus = async () => {
    if (!customer) return;
    
    try {
      setUpdating(true);
      
      const { error } = await supabase
        .from('customers')
        .update({
          status: customerStatus
        })
        .eq('id', customer.id);
      
      if (error) throw error;
      
      // Update local state
      setCustomer({
        ...customer,
        status: customerStatus
      });
      
      toast.success('Customer status updated successfully');
    } catch (error) {
      console.error('Error updating customer status:', error);
      toast.error('Failed to update customer status');
    } finally {
      setUpdating(false);
    }
  };
  
  // Add customer note
  const addCustomerNote = async () => {
    if (!customer || !newNote.trim() || !userEmail) return;
    
    try {
      setAddingNote(true);
      
      const { data, error } = await supabase
        .from('customer_notes')
        .insert({
          customer_id: customer.id,
          note: newNote.trim(),
          created_by: userEmail
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      setNotes([data, ...notes]);
      setNewNote('');
      
      toast.success('Note added successfully');
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };
  
  // Delete customer (archive)
  const deleteCustomer = async () => {
    if (!customer) return;
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete the customer ${customer.first_name} ${customer.last_name}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setUpdating(true);
      
      // In a real app, we'd probably archive instead of delete
      // but for this example, we'll do a soft delete by setting status to 'deleted'
      const { error } = await supabase
        .from('customers')
        .update({
          status: 'deleted'
        })
        .eq('id', customer.id);
      
      if (error) throw error;
      
      toast.success('Customer deleted successfully');
      router.push('/admin/customers');
      
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
    } finally {
      setUpdating(false);
    }
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
  
  if (!customer) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">Customer not found</span>
        </div>
      </AdminLayout>
    );
  }
  
  // Get totals
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.total_amount, 0);
  
  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Customer Profile: {customer.first_name} {customer.last_name}
          </h1>
          <p className="text-gray-600">
            Customer since {formatDate(customer.created_at)}
          </p>
        </div>
        
        <div className="flex space-x-4">
          <Button 
            variant="outline-light" 
            onClick={deleteCustomer}
            disabled={updating}
          >
            <TrashIcon className="h-5 w-5 mr-2 text-red-500" />
            Delete Customer
          </Button>
          
          <Link href="/admin/customers">
            <Button variant="outline-light">
              Back to Customers
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Customer Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Status Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Customer Status</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="customerStatus" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="customerStatus"
                value={customerStatus}
                onChange={(e) => setCustomerStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <Button
              variant="primary"
              onClick={updateCustomerStatus}
              className="w-full"
              disabled={updating || customerStatus === customer.status}
            >
              {updating ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
          
          <div className="mt-6 space-y-4">
            <h3 className="font-medium text-gray-700">Tags</h3>
            
            <div className="flex flex-wrap gap-2">
              {customer.tags && customer.tags.length > 0 ? (
                customer.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500">No tags added</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Contact Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Contact Information</h2>
          
          <div className="space-y-3">
            <div className="flex items-start">
              <UserIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="font-medium">{customer.first_name} {customer.last_name}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
              <div>
                <p className="text-sm">{customer.email}</p>
              </div>
            </div>
            
            {customer.phone && (
              <div className="flex items-start">
                <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm">{customer.phone}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6">
            <h3 className="font-medium text-gray-700 mb-3">Shipping Addresses</h3>
            
            {addresses.length === 0 ? (
              <p className="text-sm text-gray-500">No addresses added</p>
            ) : (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div 
                    key={address.id} 
                    className="border rounded p-3 text-sm relative"
                  >
                    {address.is_default && (
                      <span className="absolute top-2 right-2 bg-brand-primary text-white text-xs px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                    <div className="flex items-start">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                      <div>
                        <p>{address.address_line1}</p>
                        {address.address_line2 && <p>{address.address_line2}</p>}
                        <p>{address.city}, {address.province} {address.postal_code}</p>
                        <p>{address.country}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Order Summary</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Orders:</span>
              <span className="font-medium">{totalOrders}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Total Spent:</span>
              <span className="font-medium">{formatCurrency(totalSpent)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Average Order Value:</span>
              <span className="font-medium">
                {totalOrders > 0 
                  ? formatCurrency(totalSpent / totalOrders) 
                  : formatCurrency(0)}
              </span>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-medium text-gray-700 mb-3">Most Recent Order</h3>
            
            {orders.length === 0 ? (
              <p className="text-sm text-gray-500">No orders yet</p>
            ) : (
              <div className="border rounded p-3 text-sm">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Order #{orders[0].order_ref}</span>
                  <span>{formatDate(orders[0].created_at)}</span>
                </div>
                
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Status:</span>
                  <span className={`${
                    orders[0].status === 'delivered' ? 'text-green-600' :
                    orders[0].status === 'cancelled' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {orders[0].status.charAt(0).toUpperCase() + orders[0].status.slice(1)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span>{formatCurrency(orders[0].total_amount)}</span>
                </div>
                
                <div className="mt-3">
                  <Link 
                    href={`/admin/orders/${orders[0].id}`}
                    className="text-brand-primary hover:text-brand-primary-dark text-sm font-medium"
                  >
                    View Order Details
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Order History */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium flex items-center">
            <ShoppingBagIcon className="h-5 w-5 mr-2 text-gray-500" />
            Order History
          </h2>
          
          {orders.length > 0 && (
            <Link href={`/admin/customers/${customer.id}/orders`} className="text-sm text-brand-primary">
              View All Orders
            </Link>
          )}
        </div>
        
        {orders.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No orders found for this customer.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Ref
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Show the 5 most recent orders */}
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.order_ref}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                        order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        href={`/admin/orders/${order.id}`}
                        className="text-brand-primary hover:text-brand-primary-dark"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Customer Notes */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium flex items-center">
            <PencilSquareIcon className="h-5 w-5 mr-2 text-gray-500" />
            Customer Notes
          </h2>
        </div>
        
        <div className="p-6">
          {/* Add Note Form */}
          <div className="mb-6">
            <label htmlFor="newNote" className="block text-sm font-medium text-gray-700 mb-1">
              Add Note
            </label>
            <div className="flex">
              <textarea
                id="newNote"
                rows={3}
                className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary"
                placeholder="Add a note about this customer..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                disabled={addingNote}
              ></textarea>
            </div>
            <div className="mt-2 flex justify-end">
              <Button
                variant="primary"
                onClick={addCustomerNote}
                disabled={!newNote.trim() || addingNote}
              >
                {addingNote ? 'Adding...' : 'Add Note'}
              </Button>
            </div>
          </div>
          
          {/* Notes List */}
          <div className="space-y-4">
            {notes.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No notes added yet.</p>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium">{note.created_by}</span>
                    <span className="text-xs text-gray-500">{formatDate(note.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-700">{note.note}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
