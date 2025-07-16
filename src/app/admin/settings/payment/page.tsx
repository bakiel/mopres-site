'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-singleton';
import AdminLayout from '@/components/admin/AdminLayout';
import PaymentSettings from '@/components/admin/PaymentSettings';
import BankQRCode from '@/components/admin/BankQRCode';
import { PlusIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface PaymentMethod {
  id: string;
  method: string;
  configuration: Record<string, any>;
  is_active: boolean;
  updated_at: string;
}

export default function PaymentSettingsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<string | null>(null);
  
  
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const { data, error } = await supabase
          .from('payment_settings')
          .select('*')
          .order('updated_at', { ascending: false });
        
        if (error) throw error;
        
        setPaymentMethods(data || []);
        
        if (data && data.length > 0) {
          setSelectedMethod(data.find(method => method.is_active) || data[0]);
        }
      } catch (error) {
        console.error('Error fetching payment methods:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPaymentMethods();
  }, [supabase]);
  
  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setIsCreating(false);
  };
  
  const handleCreateNew = () => {
    setSelectedMethod(null);
    setIsCreating(true);
  };
  
  const confirmDelete = (methodId: string) => {
    setMethodToDelete(methodId);
    setIsDeleteModalOpen(true);
  };
  
  const handleDelete = async () => {
    if (!methodToDelete) return;
    
    try {
      const { error } = await supabase
        .from('payment_settings')
        .delete()
        .eq('id', methodToDelete);
      
      if (error) throw error;
      
      // Update UI
      const updatedMethods = paymentMethods.filter(method => method.id !== methodToDelete);
      setPaymentMethods(updatedMethods);
      
      if (selectedMethod?.id === methodToDelete) {
        setSelectedMethod(updatedMethods.length > 0 ? updatedMethods[0] : null);
      }
      
      setIsDeleteModalOpen(false);
      setMethodToDelete(null);
    } catch (error) {
      console.error('Error deleting payment method:', error);
    }
  };
  
  const handlePaymentMethodUpdate = async (updatedMethod: PaymentMethod) => {
    try {
      if (updatedMethod.id) {
        // Update existing payment method
        const { error } = await supabase
          .from('payment_settings')
          .update({
            method: updatedMethod.method,
            configuration: updatedMethod.configuration,
            is_active: updatedMethod.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', updatedMethod.id);
        
        if (error) throw error;
        
        // If this method was activated, deactivate others
        if (updatedMethod.is_active) {
          const { error: deactivateError } = await supabase
            .from('payment_settings')
            .update({ is_active: false })
            .neq('id', updatedMethod.id);
          
          if (deactivateError) throw deactivateError;
        }
        
        // Update UI
        setPaymentMethods(paymentMethods.map(method => 
          method.id === updatedMethod.id ? updatedMethod : 
          (updatedMethod.is_active ? { ...method, is_active: false } : method)
        ));
        
        setSelectedMethod(updatedMethod);
      } else {
        // Create new payment method
        const { data, error } = await supabase
          .from('payment_settings')
          .insert({
            method: updatedMethod.method,
            configuration: updatedMethod.configuration,
            is_active: updatedMethod.is_active,
          })
          .select()
          .single();
        
        if (error) throw error;
        
        // If this method was activated, deactivate others
        if (updatedMethod.is_active) {
          const { error: deactivateError } = await supabase
            .from('payment_settings')
            .update({ is_active: false })
            .neq('id', data.id);
          
          if (deactivateError) throw deactivateError;
        }
        
        // Update UI
        const newMethod = data as PaymentMethod;
        setPaymentMethods(prev => 
          updatedMethod.is_active 
            ? [newMethod, ...prev.map(m => ({ ...m, is_active: false }))]
            : [newMethod, ...prev]
        );
        
        setSelectedMethod(newMethod);
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Error saving payment method:', error);
      throw error;
    }
  };
  
  const getMethodTypeLabel = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'cash_on_delivery':
        return 'Cash on Delivery';
      case 'invoice_payment':
        return 'PDF Invoice Payment';
      default:
        return method.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  };
  
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-primary"></div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Payment Settings</h1>
        <p className="text-gray-600">Configure payment methods and options</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800">Payment Methods</h2>
            </div>
            
            <div className="p-2">
              <button
                onClick={handleCreateNew}
                className="w-full flex items-center justify-center p-2 text-sm text-brand-primary hover:bg-gray-50 rounded"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add New Method
              </button>
            </div>
            
            <ul className="divide-y divide-gray-200">
              {paymentMethods.length === 0 && !isCreating ? (
                <li className="p-4 text-sm text-gray-500 text-center">
                  No payment methods configured
                </li>
              ) : (
                paymentMethods.map(method => (
                  <li 
                    key={method.id}
                    className={`flex justify-between items-center p-3 text-sm cursor-pointer hover:bg-gray-50 ${
                      selectedMethod?.id === method.id && !isCreating ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleMethodSelect(method)}
                  >
                    <div className="flex items-center">
                      <div className={`h-2 w-2 rounded-full mr-2 ${method.is_active ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span>{getMethodTypeLabel(method.method)}</span>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDelete(method.id);
                      }}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
          
          {/* QR Code Preview */}
          {selectedMethod && selectedMethod.method === 'bank_transfer' && 
           selectedMethod.configuration.enable_qr_code && (
            <div className="mt-6 bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">QR Code Preview</h3>
              <div className="flex justify-center">
                <BankQRCode
                  bankName={selectedMethod.configuration.bank_name || 'First National Bank (FNB)'}
                  accountNumber={selectedMethod.configuration.account_number || '62792142095'}
                  accountName={selectedMethod.configuration.account_name || 'MoPres Fashion'}
                  branchCode={selectedMethod.configuration.branch_code || '210648'}
                  reference="INV-12345"
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Main content */}
        <div className="lg:col-span-3">
          {isCreating ? (
            <PaymentSettings onSave={handlePaymentMethodUpdate} />
          ) : selectedMethod ? (
            <PaymentSettings paymentData={selectedMethod} onSave={handlePaymentMethodUpdate} />
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-500">
                Select a payment method from the sidebar or add a new one
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete this payment method? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setMethodToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
