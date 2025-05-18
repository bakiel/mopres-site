'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react'; // Added Suspense
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowserClient';
import InvoiceTemplateOptimized from '@/components/InvoiceTemplateOptimized';
import { createPdfWithRetry, downloadHtml } from '@/utils/pdfGeneratorEnhanced';
import { sendOrderEmails } from '@/lib/client/fixed-email-service';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/cartStore';

interface OrderItemProduct { // More specific type for the nested product
  id: string;
  name: string;
  slug: string;
  images: string[];
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  size?: string | null;
  products: OrderItemProduct | null; // Use the specific type
}

interface ShippingAddress { // Define ShippingAddress separately for clarity
  firstName?: string;
  lastName?: string;
  addressLine1?: string;
  addressLine2?: string; 
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  phone?: string | null; // Keep null here for data fetching
}

interface Order {
  id: string;
  created_at: string;
  order_ref: string;
  total_amount: number;
  shipping_fee: number;
  status: string;
  customer_email?: string;
  shipping_address: ShippingAddress | null; 
  order_items: OrderItem[];
  payment_method?: string | null;
}

// Add window type declaration to make TypeScript happy
declare global {
  interface Window {
    generatedPdfBlob?: Blob;
  }
}

interface ConfirmationPageContentProps {
  orderRef: string | null;
}

function ConfirmationPageContent({ orderRef }: ConfirmationPageContentProps) {
  const router = useRouter();
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
        const { data, error: fetchError } = await supabase // Renamed error to fetchError
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
        
        if (fetchError) {
          throw fetchError;
        }
        
        if (!data) {
          throw new Error('Order not found');
        }
        
        const typedData = data as any as Order;
        
        // Ensure shipping_address fields are undefined if null for InvoiceTemplateOptimized compatibility
        if (typedData.shipping_address) {
          if (typedData.shipping_address.addressLine2 === null) {
            typedData.shipping_address.addressLine2 = undefined;
          }
          if (typedData.shipping_address.phone === null) { // Convert null phone to undefined
            typedData.shipping_address.phone = undefined;
          }
        }

        setOrderDetails(typedData);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    }
    
    fetchOrderDetails();
  }, [orderRef, supabase]);
  
  useEffect(() => {
    let clearCartTimer: NodeJS.Timeout;
    
    if (orderDetails && !cartCleared) {
      clearCartTimer = setTimeout(() => {
        try {
          clearCart();
          setCartCleared(true);
          console.log('Cart cleared after successful order (with delay)');
        } catch (cartError) { // Renamed error to cartError
          console.error('Error clearing cart:', cartError);
        }
      }, 3000);
    }
    
    return () => {
      if (clearCartTimer) {
        clearTimeout(clearCartTimer);
      }
    };
  }, [orderDetails, clearCart, cartCleared]);
  
  const handleDownloadInvoice = async () => {
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
      } catch (blobError) { // Renamed error
        console.error("Error using cached PDF blob:", blobError);
      }
    } else if (invoiceDownloadUrl) {
      try {
        window.open(invoiceDownloadUrl, '_blank');
        return;
      } catch (urlError) { // Renamed error
        console.error("Error opening invoice URL:", urlError);
      }
    }
    
    if (!orderDetails) {
      console.error("Order details not available.");
      toast.error("Could not generate invoice at this time. Order details are missing.");
      return;
    }
    
    setPdfLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let templateAccessible = false;
      let waitTime = 800; 
      let maxWaitTime = 10000; 
      let totalWaitTime = 0;
      
      while (!templateAccessible && totalWaitTime < maxWaitTime) {
        if (invoiceRef.current && document.body.contains(invoiceRef.current)) {
          templateAccessible = true;
          console.log(`Template became accessible after waiting ${totalWaitTime}ms`);
        } else {
          console.log(`Template not accessible, waiting ${waitTime}ms (total wait so far: ${totalWaitTime}ms)...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          totalWaitTime += waitTime;
          waitTime = Math.min(waitTime * 1.5, 2000); 
        }
      }
      
      if (!templateAccessible) {
        throw new Error("Invoice template remained inaccessible after maximum wait time. Please refresh and try again.");
      }
      
      if (invoiceRef.current) {
        const _ = invoiceRef.current.offsetHeight;
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
          const pdfBlob = await createPdfWithRetry(invoiceRef.current, 5);
          console.log(`PDF generated with size: ${Math.round(pdfBlob.size/1024)} KB`);
          window.generatedPdfBlob = pdfBlob;
          const pdfURL = URL.createObjectURL(pdfBlob);
          setInvoiceDownloadUrl(pdfURL);
          
          const link = document.createElement('a');
          link.href = pdfURL;
          link.download = `MoPres_Invoice_${orderDetails.order_ref}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          toast.success("Invoice downloaded successfully");
        } catch (pdfError) {
          console.error("PDF generation failed, falling back to HTML:", pdfError);
          handleDownloadInvoiceHTML();
        }
      } else {
        throw new Error("Invoice template element is not available");
      }
      
    } catch (genError) { // Renamed error
      console.error("Error generating invoice:", genError);
      toast.error("PDF generation failed. Attempting HTML fallback...");
      handleDownloadInvoiceHTML();
    } finally {
      setPdfLoading(false);
    }
  };
  
  const handleDownloadInvoiceHTML = async () => {
    if (!orderDetails || !invoiceRef.current) {
      toast.error("Could not generate invoice HTML");
      return;
    }
    
    try {
      await downloadHtml(invoiceRef.current, `MoPres_Invoice_${orderDetails.order_ref}.html`);
      toast.success("Invoice downloaded as HTML");
    } catch (htmlError) { // Renamed error
      console.error("Error downloading HTML invoice:", htmlError);
      toast.error("Failed to generate invoice in any format");
    }
  };
  
  const handleSendConfirmationEmail = async () => {
    if (!orderDetails?.id || !orderDetails?.customer_email) {
      toast.error("Cannot send email: Missing order details or customer email");
      return;
    }
    
    setEmailLoading(true);
    toast.loading("Sending order emails...", { id: "send-email-toast" });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); 
      
      const response = await fetch('/api/orders/send-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer mopres-order-emails-api-key-2025`
        },
        body: JSON.stringify({
          orderId: orderDetails.id,
          generateNewInvoice: false
        }),
        signal: controller.signal
      }).finally(() => {
        clearTimeout(timeoutId);
      });
      
      if (!response.ok) {
        const textResponse = await response.text();
        console.error("Error response from email API:", textResponse);
        throw new Error(`Server error (${response.status}): ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to send order emails');
      }
      
      toast.dismiss("send-email-toast");
      toast.success(`Emails sent to ${orderDetails.customer_email}`, {
        duration: 5000,
        icon: '📧'
      });
    } catch (emailError) { // Renamed error
      console.error("Error sending order emails:", emailError);
      toast.dismiss("send-email-toast");
      
      if (emailError instanceof Error) {
        if (emailError.message.includes('timed out') || emailError.name === 'AbortError') {
          toast.error("Email server request timed out. Please try again later.");
        } else if (emailError.message.includes('NetworkError') || emailError.message.includes('network')) {
          toast.error("Network error. Please check your internet connection and try again.");
        } else if (emailError.message.includes('Non-JSON') || emailError.message.includes('parse')) {
          toast.error("Unable to communicate with email server. Please try again later.");
        } else {
          toast.error(emailError.message || "Failed to send order emails. Please try again.");
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
  
  if (error || !orderDetails) { // error is the state variable
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
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        {orderDetails && <InvoiceTemplateOptimized order={orderDetails as any} invoiceRef={invoiceRef as React.RefObject<HTMLDivElement>} />}
      </div>
      
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-border-light">
          <div className="text-center mb-8">
            <div className="inline-block bg-green-100 p-3 rounded-full mb-4">
              <svg className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-semibold mb-2 font-poppins">Order Confirmed!</h1>
            <p className="text-text-light">Thank you for your purchase</p>
          </div>
          
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
              
              <p className="mt-6 text-xs text-text-light">
                Your order will be processed once payment is confirmed. This may take 1-2 business days.
              </p>
            </div>
          )}
          
          <div className="border-t border-border-light pt-8">
            <h2 className="text-xl font-semibold mb-4 font-poppins">Order Summary</h2>
            {orderDetails.order_items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-4 border-b border-border-light-alt last:border-b-0">
                <div className="flex items-center">
                  {item.products?.images?.[0] && (
                    <img 
                      src={item.products.images[0]} 
                      alt={item.products.name} 
                      className="w-16 h-16 object-cover rounded-md mr-4"
                    />
                  )}
                  <div>
                    <p className="font-medium">{item.products?.name || 'Product Name Unavailable'}</p>
                    {item.size && <p className="text-sm text-text-light">Size: {item.size}</p>}
                    <p className="text-sm text-text-light">
                      {item.quantity} x {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(item.price)}
                    </p>
                  </div>
                </div>
                <p className="font-medium">
                  {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(item.quantity * item.price)}
                </p>
              </div>
            ))}
            
            <div className="mt-6 text-right">
              <div className="flex justify-between mb-2">
                <span className="text-text-light">Subtotal</span>
                <span>
                  {new Intl.NumberFormat('en-ZA', { 
                    style: 'currency', 
                    currency: 'ZAR' 
                  }).format(orderDetails.total_amount - orderDetails.shipping_fee)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-text-light">Shipping</span>
                <span>
                  {new Intl.NumberFormat('en-ZA', { 
                    style: 'currency', 
                    currency: 'ZAR' 
                  }).format(orderDetails.shipping_fee)}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-brand-gold">
                  {new Intl.NumberFormat('en-ZA', { 
                    style: 'currency', 
                    currency: 'ZAR' 
                  }).format(orderDetails.total_amount)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-text-light mb-2">
              An email confirmation with your order details and invoice has been sent to <span className="font-medium">{orderDetails.customer_email}</span>.
            </p>
            <p className="text-text-light mb-6">
              If you have any questions, please contact our support team.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={handleDownloadInvoice}
                disabled={pdfLoading}
                className="px-6 py-3 bg-brand-gold text-white rounded-md font-medium hover:bg-brand-gold-dark transition-colors flex items-center justify-center disabled:opacity-70"
              >
                {pdfLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating PDF...
                  </>
                ) : (
                  'Download Invoice (PDF)'
                )}
              </button>
              <button
                onClick={handleSendConfirmationEmail}
                disabled={emailLoading}
                className="px-6 py-3 bg-gray-700 text-white rounded-md font-medium hover:bg-gray-800 transition-colors flex items-center justify-center disabled:opacity-70"
              >
                {emailLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Email...
                  </>
                ) : (
                  'Resend Confirmation Email'
                )}
              </button>
            </div>
            
            <Link 
              href="/shop"
              className="inline-block px-8 py-3 border border-brand-gold text-brand-gold rounded-md font-medium hover:bg-brand-gold hover:text-white transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-12">
        <p className="text-sm text-text-light">
          Need help? <Link href="/contact" className="text-brand-gold hover:underline">Contact Support</Link>
        </p>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderRef = searchParams ? searchParams.get('orderRef') : null;

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background-body">
        <div className="text-center p-4">
          <div className="animate-spin h-12 w-12 border-4 border-brand-gold border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-text-light">Loading confirmation details...</p>
        </div>
      </div>
    }>
      <ConfirmationPageContent orderRef={orderRef} />
    </Suspense>
  );
}