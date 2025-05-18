import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';
import { invokeEdgeFunction } from './edgeFunctionHelper';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Send an order confirmation email with optional invoice
 * This uses the new standalone implementation to avoid Promise-related issues
 */
export async function sendOrderEmail(options) {
  const {
    orderRef, 
    includeInvoice = true, 
    testEmail = null,
    onStart = () => {},
    onSuccess = () => {},
    onError = () => {}
  } = options;
  
  if (!orderRef) {
    const error = new Error('Order reference is required');
    onError(error);
    return { success: false, error };
  }
  
  try {
    onStart();
    
    // Log the action
    console.log(`📧 Sending order email for: ${orderRef}`);
    console.log(`   Include invoice: ${includeInvoice}`);
    console.log(`   Test email: ${testEmail || 'Using customer email'}`);
    
    // Call the standalone edge function
    const { data, error } = await invokeEdgeFunction(supabase, {
      functionName: 'send-invoice-email-standalone',
      body: {
        orderRef,
        includeInvoice,
        testEmail: testEmail || undefined, // Only include if provided
      },
      retries: 1, // Retry once on network errors
      onError: (err) => {
        console.warn('Error while sending email (will retry):', err);
      }
    });
    
    if (error) {
      console.error('Failed to send order email:', error);
      onError(error);
      return { success: false, error };
    }
    
    console.log('Order email sent successfully:', data);
    onSuccess(data);
    
    return { success: true, data };
  } catch (error) {
    console.error('Exception sending order email:', error);
    onError(error);
    return { success: false, error };
  }
}

/**
 * Component-ready function to send order email with toast notifications
 */
export async function sendOrderEmailWithToasts(orderRef, includeInvoice = true, testEmail = null) {
  const toastId = toast.loading('Sending order email...');
  
  try {
    const { success, data, error } = await sendOrderEmail({
      orderRef,
      includeInvoice,
      testEmail,
    });
    
    if (success) {
      toast.success('Order email sent successfully!', { id: toastId });
      return { success: true, data };
    } else {
      toast.error(`Failed to send email: ${error.message || 'Unknown error'}`, { id: toastId });
      return { success: false, error };
    }
  } catch (error) {
    toast.error(`Error: ${error.message || 'Unknown error'}`, { id: toastId });
    return { success: false, error };
  }
}

export default {
  sendOrderEmail,
  sendOrderEmailWithToasts
};
