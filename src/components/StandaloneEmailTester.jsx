import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function StandaloneEmailTester() {
  const [orderRef, setOrderRef] = useState('');
  const [includeInvoice, setIncludeInvoice] = useState(true);
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Function to test the email service
  const sendTestEmail = async () => {
    if (!orderRef) {
      toast.error('Please enter an order reference');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const toastId = toast.loading('Sending email...');
      
      // Call the standalone edge function
      const { data, error } = await supabase.functions.invoke('send-invoice-email-standalone', {
        body: {
          orderRef,
          includeInvoice,
          testEmail: testEmail || undefined,
        },
      });
      
      if (error) {
        console.error('Error invoking edge function:', error);
        toast.error('Failed to send email: ' + error.message, { id: toastId });
        setError(error);
      } else {
        console.log('Email service response:', data);
        toast.success(data.success ? 'Email sent successfully!' : 'Email failed to send', { id: toastId });
        setResult(data);
      }
    } catch (err) {
      console.error('Exception sending email:', err);
      toast.error('Error: ' + (err.message || 'Unknown error'));
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl m-4 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Standalone Email Tester</h1>
      <p className="text-gray-600 mb-6">
        Test the new standalone email system that bypasses React Email templates
        and Promise-related issues.
      </p>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="orderRef" className="block text-sm font-medium text-gray-700 mb-1">
            Order Reference Number *
          </label>
          <input
            type="text"
            id="orderRef"
            value={orderRef}
            onChange={(e) => setOrderRef(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g. ORDER12345"
            required
          />
        </div>
        
        <div>
          <label htmlFor="testEmail" className="block text-sm font-medium text-gray-700 mb-1">
            Test Email (Optional)
          </label>
          <input
            type="email"
            id="testEmail"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Leave empty to use customer email"
          />
          <p className="mt-1 text-xs text-gray-500">
            If provided, the email will be sent to this address instead of the customer's email
          </p>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="includeInvoice"
            checked={includeInvoice}
            onChange={(e) => setIncludeInvoice(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="includeInvoice" className="ml-2 block text-sm text-gray-700">
            Include invoice attachment
          </label>
        </div>
        
        <button
          onClick={sendTestEmail}
          disabled={loading || !orderRef}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            loading || !orderRef
              ? 'bg-indigo-300 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
        >
          {loading ? 'Sending...' : 'Send Test Email'}
        </button>
      </div>
      
      {result && (
        <div className="mt-6 p-4 border border-green-200 bg-green-50 rounded-md">
          <h3 className="text-lg font-medium text-green-800">Success</h3>
          <p className="text-green-700 mt-1">{result.message}</p>
          <div className="mt-3 text-sm text-green-700">
            <p><strong>Sent to:</strong> {result.order?.sent_to || result.order?.customer_email}</p>
            <p><strong>Email ID:</strong> {result.email?.id || 'Not available'}</p>
            <p><strong>Attachment:</strong> {result.email?.included_attachment ? 'Yes' : 'No'}</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-6 p-4 border border-red-200 bg-red-50 rounded-md">
          <h3 className="text-lg font-medium text-red-800">Error</h3>
          <p className="text-red-700 mt-1">{error.message || JSON.stringify(error)}</p>
        </div>
      )}
    </div>
  );
}
