'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase-singleton';
import { useRouter } from 'next/navigation';
import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import BankQRCode from './BankQRCode';

interface PaymentSettingsProps {
  paymentData?: {
    id?: string;
    method: string;
    configuration: Record<string, any>;
    is_active: boolean;
  };
}

// Define payment method options
const PAYMENT_METHODS = [
  { 
    id: 'bank_transfer', 
    name: 'Bank Transfer', 
    description: 'Customers pay via direct bank transfer',
    fields: [
      { name: 'bank_name', label: 'Bank Name', type: 'text', required: true },
      { name: 'account_number', label: 'Account Number', type: 'text', required: true },
      { name: 'account_name', label: 'Account Name', type: 'text', required: true },
      { name: 'branch_code', label: 'Branch Code', type: 'text', required: true },
      { name: 'reference_prefix', label: 'Reference Prefix', type: 'text', required: false },
      { name: 'payment_instructions', label: 'Payment Instructions', type: 'textarea', required: true },
      { name: 'enable_qr_code', label: 'Enable Scan-to-Pay QR Code', type: 'checkbox', required: false },
    ] 
  },
  { 
    id: 'cash_on_delivery', 
    name: 'Cash on Delivery', 
    description: 'Customers pay when the order is delivered',
    fields: [
      { name: 'cash_handling_fee', label: 'Cash Handling Fee (R)', type: 'number', required: false },
      { name: 'delivery_instructions', label: 'Delivery Instructions', type: 'textarea', required: true },
    ] 
  },
  { 
    id: 'invoice_payment', 
    name: 'PDF Invoice Payment', 
    description: 'Generate PDF invoices for customers to pay',
    fields: [
      { name: 'invoice_due_days', label: 'Invoice Due Days', type: 'number', required: true },
      { name: 'invoice_note', label: 'Invoice Footer Note', type: 'textarea', required: false },
      { name: 'invoice_terms', label: 'Invoice Terms & Conditions', type: 'textarea', required: true },
      { name: 'enable_qr_code', label: 'Enable Scan-to-Pay QR Code', type: 'checkbox', required: false },
    ] 
  },
];

export default function PaymentSettings({ paymentData }: PaymentSettingsProps) {
  const [selectedMethod, setSelectedMethod] = useState(paymentData?.method || 'invoice_payment');
  const [configuration, setConfiguration] = useState<Record<string, any>>(paymentData?.configuration || {});
  const [isActive, setIsActive] = useState(paymentData?.is_active || true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  
  const handleChange = (name: string, value: any) => {
    // Special handling for checkboxes
    if (name === 'enable_qr_code') {
      setConfiguration(prev => ({
        ...prev,
        [name]: Boolean(value)
      }));
    } else {
      setConfiguration(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const method = PAYMENT_METHODS.find(m => m.id === selectedMethod);
    
    if (method) {
      method.fields.forEach(field => {
        if (field.required && !configuration[field.name]) {
          newErrors[field.name] = `${field.label} is required`;
        }
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Get background color class based on payment method
  const getMethodBgClass = (methodId: string): string => {
    switch (methodId) {
      case 'bank_transfer':
        return 'bg-blue-50';
      case 'cash_on_delivery':
        return 'bg-amber-50';
      case 'invoice_payment':
        return 'bg-green-50';
      default:
        return 'bg-gray-50';
    }
  };

  const generatePdfPreview = async () => {
    // This would generate a preview of the invoice PDF
    // In a real implementation, this would call an API endpoint
    alert('PDF Preview would be generated here');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (paymentData?.id) {
        // Update existing payment setting
        const { error } = await supabase
          .from('payment_settings')
          .update({
            method: selectedMethod,
            configuration,
            is_active: isActive,
            updated_at: new Date().toISOString(),
          })
          .eq('id', paymentData.id);
          
        if (error) throw error;
      } else {
        // Insert new payment setting
        const { error } = await supabase
          .from('payment_settings')
          .insert({
            method: selectedMethod,
            configuration,
            is_active: isActive,
          });
          
        if (error) throw error;
      }
      
      // Show success message
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/settings/payment');
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error('Error saving payment settings:', error);
      setErrors({ form: 'An error occurred while saving the payment settings. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      {errors.form && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded flex items-start">
          <ExclamationCircleIcon className="h-5 w-5 mr-2 mt-0.5" />
          <span>{errors.form}</span>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded flex items-start">
          <CheckCircleIcon className="h-5 w-5 mr-2 mt-0.5" />
          <span>Payment settings saved successfully!</span>
        </div>
      )}
      
      <div className="mb-6">
        <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-1">
          Payment Method
        </label>
        <select
          id="method"
          value={selectedMethod}
          onChange={(e) => setSelectedMethod(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        >
          {PAYMENT_METHODS.map(method => (
            <option key={method.id} value={method.id}>
              {method.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-sm text-gray-500">
          {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.description}
        </p>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Method Configuration</h3>
        
        <div className="space-y-4">
          {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.fields.map(field => (
            <div key={field.name}>
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  value={configuration[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  rows={4}
                  className={`w-full p-2 border rounded ${
                    errors[field.name] ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              ) : (
                <input
                  type={field.type}
                  id={field.name}
                  value={configuration[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className={`w-full p-2 border rounded ${
                    errors[field.name] ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              )}
              
              {errors[field.name] && (
                <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Bank Details Section - Pre-filled from business settings */}
      {selectedMethod === 'bank_transfer' && (
        <div className="mb-6 p-4 bg-blue-50 rounded">
          <h4 className="text-sm font-medium text-blue-700 mb-2">Default Bank Details</h4>
          <p className="text-sm text-blue-600">
            The following bank details have been pre-filled from your business information:
          </p>
          <ul className="mt-2 text-sm text-blue-600">
            <li>Bank: First National Bank (FNB)</li>
            <li>Account Number: 62792142095</li>
            <li>Account Name: MoPres Fashion</li>
            <li>Branch Code: 210648</li>
          </ul>
          <p className="mt-2 text-sm text-blue-600">
            You can override these in the configuration above if needed.
          </p>
        </div>
      )}
      
      {/* Invoice settings */}
      {selectedMethod === 'invoice_payment' && (
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-700">Invoice Settings</h3>
            <button
              type="button"
              onClick={generatePdfPreview}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Preview Invoice
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Configure how your PDF invoices will look and function.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Logo
              </label>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 flex items-center justify-center rounded mr-3">
                  <span className="text-xs text-gray-500">Logo</span>
                </div>
                <button
                  type="button"
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  Change Logo
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Color
              </label>
              <input
                type="color"
                value={configuration.invoice_color || '#3B82F6'}
                onChange={(e) => handleChange('invoice_color', e.target.value)}
                className="p-1 border border-gray-300 rounded h-8 w-16"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* QR Code Preview section */}
      {(selectedMethod === 'bank_transfer' || selectedMethod === 'invoice_payment') && 
       configuration.enable_qr_code && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Scan-to-Pay QR Code Preview</h3>
          <div className="bg-gray-50 p-4 rounded flex flex-col items-center">
            <p className="text-sm text-gray-600 mb-4">
              This QR code will be included on invoices for easy mobile payments. 
              Customers can scan this with their banking app to automatically fill in payment details.
            </p>
            <BankQRCode
              bankName={configuration.bank_name || 'First National Bank (FNB)'}
              accountNumber={configuration.account_number || '62792142095'}
              accountName={configuration.account_name || 'MoPres Fashion'}
              branchCode={configuration.branch_code || '210648'}
              reference="INV-12345"
            />
            <p className="text-xs text-gray-500 mt-4">
              The actual QR code on invoices will include the specific invoice number as payment reference.
            </p>
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 text-brand-primary border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
            Active
            <span className="text-xs text-gray-500 block">
              Enable this payment method on your store
            </span>
          </label>
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.push('/admin/settings/payment')}
          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-brand-primary text-white rounded hover:bg-brand-primary-dark transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : (paymentData ? 'Update Settings' : 'Save Settings')}
        </button>
      </div>
    </form>
  );
}
