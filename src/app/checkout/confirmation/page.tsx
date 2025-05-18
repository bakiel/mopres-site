'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import InvoiceTemplateOptimized from '@/components/InvoiceTemplateOptimized';
import { createPdfWithRetry, downloadHtml } from '@/utils/pdfGeneratorEnhanced';
import { sendOrderEmails } from '@/lib/client/fixed-email-service';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/cartStore';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  size?: string | null;
  products: {
    id: string;
    name: string;
    slug: string;
    images: string[];
  } | null;
}

interface Order {
  id: string;
  created_at: string;
  order_ref: string;
  total_amount: number;
  shipping_fee: number;
  status: string;
  customer_email?: string;
  shipping_address: {
    firstName?: string;
    lastName?: string;
    addressLine1?: string;
    addressLine2?: string | null;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
    phone?: string | null;
  } | null;
  order_items: OrderItem[];
  payment_method?: string | null;
}

// Add window type declaration to make TypeScript happy
declare global {
  interface Window {
    generatedPdfBlob?: Blob;
  }
}

export default function OrderConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderRef = searchParams.get('orderRef');
  const { clearCart } = useCartStore();
  
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [invoiceDownloadUrl, setInvoiceDownloadUrl] = useState<string | null>(null);
  const [cartCleared, setCartCleared] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  
  const supabase = createSupabaseBrowserClient();
  
  useEffect(() => {
    if (!orderRef) {
      setError('No order reference provided');
      setLoading(false);
      return;
    }
    
    async function fetchOrderDetails() {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            order_ref,
            total_amount,
            shipping_fee,
            status,
            created_at,
            customer_email,
            shipping_address,
            payment_method,
            order_items (
              id,
              quantity,
              price,
              size,
              products (
                id,
                name,
                slug,
                images
              )
            )
          `)
          .eq('order_ref', orderRef)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (!data) {
          throw new Error('Order not found');
        }
        
        setOrderDetails(data);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    }
    
    fetchOrderDetails();
  }, [orderRef, supabase]);
  
  // Clear cart after order details are successfully loaded, but with a delay
  useEffect(() => {
    let clearCartTimer: NodeJS.Timeout;
    
    // Only clear the cart after a delay to ensure other operations complete first
    if (orderDetails && !cartCleared) {
      // Set a delay of 3 seconds before clearing the cart
      // This ensures PDF generation and email functions can access any needed cart data
      clearCartTimer = setTimeout(() => {
        try {
          clearCart();
          setCartCleared(true);
          console.log('Cart cleared after successful order (with delay)');
        } catch (error) {
          console.error('Error clearing cart:', error);
        }
      }, 3000);
    }
    
    // Cleanup function to clear the timeout if component unmounts
    return () => {
      if (clearCartTimer) {
        clearTimeout(clearCartTimer);
      }
    };
  }, [orderDetails, clearCart, cartCleared]);
  
  // Function to handle download invoice
  const handleDownloadInvoice = async () => {
    // If we already have a download URL or generated PDF, use it directly
    if (window.generatedPdfBlob) {
      try {
        const pdfURL = URL.createObjectURL(window.generatedPdfBlob);
        const link = document.createElement('a');
        link.href = pdfURL;
        link.download = `MoPres_Invoice_${orderDetails?.order_ref || 'invoice'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      } catch (error) {
        console.error("Error using cached PDF blob:", error);
        // Continue to regenerate if there was an error
      }
    } else if (invoiceDownloadUrl) {
      try {
        window.open(invoiceDownloadUrl, '_blank');
        return;
      } catch (error) {
        console.error("Error opening invoice URL:", error);
        // Continue to regenerate if there was an error
      }
    }
    
    if (!orderDetails) {
      console.error("Order details not available.");
      toast.error("Could not generate invoice at this time. Order details are missing.");
      return;
    }
    
    setPdfLoading(true);
    
    try {
      // Force a slight delay to ensure DOM is fully rendered
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Much more robust check for the invoice ref with progressive waits
      let templateAccessible = false;
      let waitTime = 800; // Start with 800ms
      let maxWaitTime = 10000; // Max cumulative waiting time: 10 seconds
      let totalWaitTime = 0;
      
      while (!templateAccessible && totalWaitTime < maxWaitTime) {
        if (invoiceRef.current && document.body.contains(invoiceRef.current)) {
          templateAccessible = true;
          console.log(`Template became accessible after waiting ${totalWaitTime}ms`);
        } else {
          console.log(`Template not accessible, waiting ${waitTime}ms (total wait so far: ${totalWaitTime}ms)...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          totalWaitTime += waitTime;
          // Increase wait time for next iteration (progressive backoff)
          waitTime = Math.min(waitTime * 1.5, 2000); // Cap at 2 seconds per wait
        }
      }
      
      if (!templateAccessible) {
        throw new Error("Invoice template remained inaccessible after maximum wait time. Please refresh and try again.");
      }
      
      // Force a repaint by accessing offsetHeight
      // This is a trick to make sure the browser has fully rendered the element
      if (invoiceRef.current) {
        const _ = invoiceRef.current.offsetHeight;
      
        // Give the browser a moment to finish rendering after force repaint
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
          // Create PDF from the invoice template
          const pdfBlob = await createPdfWithRetry(invoiceRef.current, 5);
          console.log(`PDF generated with size: ${Math.round(pdfBlob.size/1024)} KB`);
          
          // Store for future use
          window.generatedPdfBlob = pdfBlob;
          
          // Create a download link
          const pdfURL = URL.createObjectURL(pdfBlob);
          setInvoiceDownloadUrl(pdfURL); // Set for future use
          
          const link = document.createElement('a');
          link.href = pdfURL;
          link.download = `MoPres_Invoice_${orderDetails.order_ref}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          toast.success("Invoice downloaded successfully");
        } catch (pdfError) {
          console.error("PDF generation failed, falling back to HTML:", pdfError);
          // Fall back to HTML download
          handleDownloadInvoiceHTML();
        }
      } else {
        throw new Error("Invoice template element is not available");
      }
      
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast.error("PDF generation failed. Attempting HTML fallback...");
      // Try HTML fallback as last resort
      handleDownloadInvoiceHTML();
    } finally {
      setPdfLoading(false);
    }
  };
  
  // Function to handle download as HTML (fallback)
  const handleDownloadInvoiceHTML = async () => {
    if (!orderDetails || !invoiceRef.current) {
      toast.error("Could not generate invoice HTML");
      return;
    }
    
    try {
      await downloadHtml(invoiceRef.current, `MoPres_Invoice_${orderDetails.order_ref}.html`);
      toast.success("Invoice downloaded as HTML");
    } catch (error) {
      console.error("Error downloading HTML invoice:", error);
      toast.error("Failed to generate invoice in any format");
    }
  };
  
  // Function to send confirmation email
  const handleSendConfirmationEmail = async () => {
    if (!orderDetails?.id || !orderDetails?.customer_email) {
      toast.error("Cannot send email: Missing order details or customer email");
      return;
    }
    
    setEmailLoading(true);
    
    // Show loading toast that will remain until the request completes
    toast.loading("Sending order emails...", { id: "send-email-toast" });
    
    try {
      // Force a slight delay before sending to ensure any needed operations complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use our client-side service to send the invoice email with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      // Call the email service with custom fetch options
      const response = await fetch('/api/orders/send-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer mopres-order-emails-api-key-2025`
        },
        body: JSON.stringify({
          orderId: orderDetails.id,
          generateNewInvoice: false  // Use existing invoice if available
        }),
        signal: controller.signal
      }).finally(() => {
        clearTimeout(timeoutId);
      });
      
      // Check if response is valid
      if (!response.ok) {
        const textResponse = await response.text();
        console.error("Error response from email API:", textResponse);
        throw new Error(`Server error (${response.status}): ${response.statusText}`);
      }
      
      // Parse the JSON response
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to send order emails');
      }
      
      // Dismiss the loading toast
      toast.dismiss("send-email-toast");
      
      // Show success toast
      toast.success(`Emails sent to ${orderDetails.customer_email}`, {
        duration: 5000,
        icon: '📧'
      });
    } catch (error) {
      console.error("Error sending order emails:", error);
      toast.dismiss("send-email-toast");
      
      // Provide a more helpful error message based on error type
      if (error instanceof Error) {
        if (error.message.includes('timed out') || error.name === 'AbortError') {
          toast.error("Email server request timed out. Please try again later.");
        } else if (error.message.includes('NetworkError') || error.message.includes('network')) {
          toast.error("Network error. Please check your internet connection and try again.");
        } else if (error.message.includes('Non-JSON') || error.message.includes('parse')) {
          toast.error("Unable to communicate with email server. Please try again later.");
        } else {
          toast.error(error.message || "Failed to send order emails. Please try again.");
        }
      } else {
        toast.error("Failed to send order emails. Please try again later.");
      }
    } finally {
      setEmailLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-body">
        <div className="text-center p-4">
          <div className="animate-spin h-12 w-12 border-4 border-brand-gold border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-text-light">Loading order details...</p>
        </div>
      </div>
    );
  }
  
  if (error || !orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-body">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-border-light max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-semibold mb-4 font-poppins">Order Not Found</h1>
          <p className="text-text-light mb-6">{error || "We couldn't find the order you're looking for."}</p>
          <Link
            href="/shop"
            className="inline-block px-6 py-3 bg-brand-gold text-white rounded-md font-medium hover:bg-brand-gold-dark transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background-body py-12">
      {/* Hidden invoice template for PDF generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        {orderDetails && <InvoiceTemplateOptimized order={orderDetails} invoiceRef={invoiceRef} />}
      </div>
      
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-border-light">
          {/* Order confirmation header */}
          <div className="text-center mb-8">
            <div className="inline-block bg-green-100 p-3 rounded-full mb-4">
              <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-semibold mb-2 font-poppins">Order Confirmed!</h1>
            <p className="text-text-light">Thank you for your purchase</p>
          </div>
          
          {/* Order details */}
          <div className="bg-background-light p-6 rounded-md mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-sm text-text-light">Order Reference</span>
                <p className="font-medium text-lg">#{orderDetails.order_ref}</p>
              </div>
              <div className="text-right">
                <span className="text-sm text-text-light">Order Date</span>
                <p className="font-medium">
                  {new Date(orderDetails.created_at).toLocaleDateString('en-ZA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <span className="text-sm text-text-light">Order Status</span>
              <p className="mt-1">
                <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                  orderDetails.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {orderDetails.status.replace(/_/g, ' ').toUpperCase()}
                </span>
              </p>
            </div>
            
            <div className="mt-4">
              <span className="text-sm text-text-light">Total Amount</span>
              <p className="font-semibold text-xl text-brand-gold">
                {new Intl.NumberFormat('en-ZA', { 
                  style: 'currency', 
                  currency: 'ZAR' 
                }).format(orderDetails.total_amount)}
              </p>
            </div>
          </div>
          
          {/* Payment instructions for EFT */}
          {orderDetails.payment_method === 'eft' && (
            <div className="mb-8 p-6 border border-yellow-200 bg-yellow-50 rounded-md">
              <h2 className="text-lg font-semibold mb-3 font-poppins text-brand-gold">Payment Instructions</h2>
              <p className="mb-4 text-text-dark">
                Please complete your payment using the banking details below. Be sure to use your order number as the payment reference.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-text-light mb-1">Bank:</p>
                  <p className="font-medium">First National Bank (FNB)</p>
                </div>
                <div>
                  <p className="text-text-light mb-1">Account Name:</p>
                  <p className="font-medium">MoPres Fashion</p>
                </div>
                <div>
                  <p className="text-text-light mb-1">Account Type:</p>
                  <p className="font-medium">GOLD BUSINESS ACCOUNT</p>
                </div>
                <div>
                  <p className="text-text-light mb-1">Account Number:</p>
                  <p className="font-medium">62792142095</p>
                </div>
                <div>
                  <p className="text-text-light mb-1">Branch Code:</p>
                  <p className="font-medium">210648</p>
                </div>
                <div>
                  <p className="text-text-light mb-1">Reference:</p>
                  <p className="font-semibold text-brand-gold">{orderDetails.order_ref}</p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-white rounded border border-yellow-200">
                <p className="text-sm">
                  <strong>Important:</strong> After making payment, please email your proof of payment to{' '}
                  <a href="mailto:payments@mopres.co.za" className="text-brand-gold hover:underline">
                    payments@mopres.co.za
                  </a>
                  {' '}to help us process your order faster.
                </p>
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={handleDownloadInvoice}
              disabled={pdfLoading}
              className="inline-flex items-center justify-center px-6 py-3 border border-brand-gold text-brand-gold bg-white hover:bg-gray-50 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pdfLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-brand-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating PDF...
                </>
              ) : (
                'Download Invoice'
              )}
            </button>
            
            {orderDetails.customer_email && (
              <button
                onClick={handleSendConfirmationEmail}
                disabled={emailLoading}
                className="inline-flex items-center justify-center px-6 py-3 bg-brand-gold text-white hover:bg-brand-gold-dark rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {emailLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Emails...
                  </>
                ) : (
                  'Send Order Emails'
                )}
              </button>
            )}
            
            <Link 
              href="/account/orders"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md font-medium transition-colors"
            >
              View Order History
            </Link>
          </div>
          
          {/* Next steps */}
          <div className="bg-background-light p-6 rounded-md mb-8">
            <h2 className="text-lg font-semibold mb-4 font-poppins">What's Next?</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-brand-gold text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">1</div>
                <div>
                  <h3 className="font-medium mb-1">Order Processing</h3>
                  <p className="text-sm text-text-light">We're preparing your items for shipment. You'll receive updates via email.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-brand-gold text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">2</div>
                <div>
                  <h3 className="font-medium mb-1">Shipping</h3>
                  <p className="text-sm text-text-light">Once your order ships, we'll send you tracking information so you can follow its journey.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-brand-gold text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">3</div>
                <div>
                  <h3 className="font-medium mb-1">Delivery</h3>
                  <p className="text-sm text-text-light">Your luxury items will be delivered to your specified address within 3-5 business days.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Continue shopping button */}
          <div className="text-center">
            <Link
              href="/shop"
              className="inline-block px-6 py-3 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}