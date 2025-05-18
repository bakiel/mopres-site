'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/Button'; 
import SectionTitle from '@/components/SectionTitle';
import InvoiceTemplateOptimized from '@/components/InvoiceTemplateOptimized';
import { createSupabaseBrowserClient, getProductImageUrl } from '@/lib/supabaseClient';
// Import the pure JS utility directly - we'll use the new one we created
// Using enhanced PDF generator with robust error handling and fallback options
import { 
  createPdfWithRetry, 
  blobToBase64, 
  downloadPdf, 
  downloadHtml 
} from '@/utils/pdfGeneratorEnhanced';
import { sendOrderEmailWithToasts } from '@/lib/email/fixed-email-service';
import toast from 'react-hot-toast';

// Type definitions (combined/adjusted from both files)
interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  size?: string | null; // Keep null possibility as per original page.tsx
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
  shipping_fee: number; // Align with InvoiceTemplate
  status: string;
  customer_email?: string; // Make optional if not always needed/present
  shipping_address: {
    firstName?: string; // Make optional if not always present
    lastName?: string; // Make optional if not always present
    addressLine1?: string;
    addressLine2?: string | null; // Allow null
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
    phone?: string | null; // Allow null
  } | null; // Allow address to be null
  order_items: OrderItem[];
  payment_method?: string | null; // Add from page.tsx usage
  shipping_carrier?: string | null; // Add from page.tsx usage
  tracking_number?: string | null; // Add from page.tsx usage
}


interface OrderDetailsClientProps {
  order: Order;
}

// Helper functions (copied from [orderId]/page.tsx)
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-ZA', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const formatCurrency = (amount: number | undefined | null) => {
  if (amount === undefined || amount === null) return 'N/A';
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
};

const getStatusColor = (status: string | undefined): string => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status.toLowerCase()) {
        case 'pending_payment': return 'bg-yellow-100 text-yellow-800';
        case 'processing': return 'bg-blue-100 text-blue-800';
        case 'shipped': return 'bg-green-100 text-green-800';
        case 'delivered': return 'bg-green-200 text-green-900';
        case 'cancelled': return 'bg-red-100 text-red-800';
        case 'refunded': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getTrackingUrl = (carrier?: string | null, trackingNumber?: string | null): string | null => {
    if (!carrier || !trackingNumber) return null;
    const carrierLower = carrier.toLowerCase();
    if (carrierLower.includes('aramex')) {
        return `https://www.aramex.com/track/results?track_id=${trackingNumber}`;
    } else if (carrierLower.includes('dhl')) {
         return `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`;
    } else if (carrierLower.includes('fastway')) {
         return `https://www.fastway.co.za/our-services/track-your-parcel?l=${trackingNumber}`;
    }
    return null;
};


const OrderDetailsClient: React.FC<OrderDetailsClientProps> = ({ order }) => {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [pdfFailed, setPdfFailed] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const supabase = createSupabaseBrowserClient(); // Create browser client instance

  // Calculate subtotal and tracking URL based on the passed order prop
  // Add checks for undefined/null before calculation
  const subtotal = (order.total_amount ?? 0) - (order.shipping_fee ?? 0); // Use shipping_fee
  const trackingUrl = getTrackingUrl(order.shipping_carrier, order.tracking_number);

  const handleDownloadInvoice = async () => {
    if (!invoiceRef.current || !order) {
      console.error("Invoice template ref or order details not available.");
      toast.error("Could not generate invoice at this time. Required details are missing.");
      return;
    }
    setPdfLoading(true);
    setPdfFailed(false); // Reset failure state
    try {
      // Add a small delay to ensure rendering
      await new Promise(resolve => setTimeout(resolve, 500));

      // Use our enhanced PDF generator with retry mechanism
      const pdfBlob = await createPdfWithRetry(invoiceRef.current, 3);
      
      // Trigger download
      const pdfURL = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = pdfURL;
      link.download = `MoPres_Invoice_${order.order_ref}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(pdfURL);
      
      toast.success("Invoice downloaded successfully");
    } catch (error) {
      console.error("Error during invoice generation:", error);
      setPdfFailed(true); // Set failure state to show HTML fallback button
      toast.error("PDF generation failed. Try the HTML option instead.");
    } finally {
      setPdfLoading(false);
    }
  };
  
  const handleDownloadHtml = async () => {
    if (!invoiceRef.current || !order) {
      toast.error("Could not generate invoice HTML. Missing details.");
      return;
    }
    
    try {
      const success = await downloadHtml(invoiceRef.current, `MoPres_Invoice_${order.order_ref}.html`);
      if (success) {
        toast.success("Invoice downloaded as HTML successfully");
      } else {
        toast.error("Failed to download invoice as HTML");
      }
    } catch (error) {
      console.error("Error downloading HTML invoice:", error);
      toast.error("Failed to generate invoice in HTML format");
    }
  };

  const handleSendInvoiceEmail = async () => {
    if (!order?.order_ref || !order?.customer_email) {
      toast.error("Missing order details or customer email");
      return;
    }
    
    setEmailLoading(true);
    try {
      // Use our new standalone email service
      const { success, error } = await sendOrderEmailWithToasts(
        order.order_ref,  // Use order_ref instead of id
        true,  // Include invoice
        null   // Use customer's email
      );
      
      if (!success) {
        throw new Error(error.message || 'Failed to send invoice email');
      }
      
      // Toast notification is handled by the service itself
    } catch (error) {
      console.error("Error sending invoice email:", error);
      // Toast notification is already handled by the service
    } finally {
      setEmailLoading(false);
    }
  };

  // The JSX copied from [orderId]/page.tsx, adapted for client component props
  return (
      <div className="bg-background-body py-12 lg:py-20 relative"> {/* Added relative for positioning InvoiceTemplate */}
          {/* Hidden Invoice Template for PDF Generation */}
          {/* Position it off-screen or make it visually hidden but available for html2canvas */}
          <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', zIndex: -1, width: '210mm', height: '297mm' }}> {/* A4 size might help layout */}
             {/* Ensure InvoiceTemplate receives a valid order object */}
             {order && <InvoiceTemplateOptimized order={order} invoiceRef={invoiceRef} />}
          </div>

          <div className="w-full max-w-screen-lg mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
                <SectionTitle>Order Details</SectionTitle>
                 <Link href="/account/orders" className="text-brand-gold hover:underline font-poppins text-sm">
                    &larr; Back to Orders
                </Link>
            </div>


            <div className="bg-white p-6 md:p-8 border border-border-light rounded shadow-sm mb-8">
                {/* Grid Structure */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-border-light text-sm">
                    <div>
                        <span className="block text-xs text-text-light mb-1">Order #</span>
                        <span className="font-medium text-text-dark">{order.order_ref || 'N/A'}</span>
                    </div>
                     <div>
                        <span className="block text-xs text-text-light mb-1">Date Placed</span>
                        <span className="font-medium text-text-dark">{formatDate(order.created_at)}</span>
                    </div>
                     <div>
                        <span className="block text-xs text-text-light mb-1">Total Amount</span>
                        <span className="font-medium text-text-dark">{formatCurrency(order.total_amount)}</span>
                    </div>
                     <div>
                        <span className="block text-xs text-text-light mb-1">Status</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status ? order.status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'N/A'}
                        </span>
                    </div>
                </div>

                {/* Tracking Information */}
                {order.status === 'shipped' && (order.tracking_number || order.shipping_carrier) && (
                     <div className="mb-6 pb-6 border-b border-border-light">
                        <h3 className="text-base font-semibold font-montserrat mb-3">Tracking Information</h3>
                        <p className="text-sm text-text-light">
                            Carrier: <span className="text-text-dark font-medium">{order.shipping_carrier || 'N/A'}</span>
                        </p>
                         <p className="text-sm text-text-light">
                            Tracking #: <span className="text-text-dark font-medium">{order.tracking_number || 'N/A'}</span>
                            {trackingUrl && (
                                <a href={trackingUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-brand-gold hover:underline text-xs">(Track Package)</a>
                            )}
                        </p>
                     </div>
                )}


                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Shipping Address */}
                    <div>
                        <h3 className="text-base font-semibold font-montserrat mb-3">Shipping Address</h3>
                        {order.shipping_address ? (
                            <div className="text-sm text-text-light space-y-1 font-poppins">
                                <p>{order.shipping_address.firstName || ''} {order.shipping_address.lastName || ''}</p>
                                <p>{order.shipping_address.addressLine1 || ''}</p>
                                {order.shipping_address.addressLine2 && <p>{order.shipping_address.addressLine2}</p>}
                                <p>{order.shipping_address.city || ''}, {order.shipping_address.province || ''}, {order.shipping_address.postalCode || ''}</p>
                                <p>{order.shipping_address.country || ''}</p>
                                {order.shipping_address.phone && <p>Phone: {order.shipping_address.phone}</p>}
                            </div>
                        ) : (
                            <p className="text-sm text-text-light font-poppins">Address details not available.</p>
                        )}
                    </div>
                     {/* Payment Method */}
                     <div>
                        <h3 className="text-base font-semibold font-montserrat mb-3">Payment Method</h3>
                         <p className="text-sm text-text-light font-poppins">
                            {order.payment_method === 'eft' ? 'EFT / Bank Deposit' : order.payment_method || 'N/A'}
                        </p>
                     </div>
                </div>
            </div>

            {/* Order Items */}
            <h3 className="text-lg font-semibold font-montserrat mb-4">Items Ordered</h3>
            <div className="space-y-4 font-poppins">
                {order.order_items?.map((item: OrderItem) => (
                 // Check if product data exists before rendering the item div
                 (item.products && (
                 <div key={item.id} className="bg-white p-4 border border-border-light rounded shadow-sm flex items-center gap-4">
                     <Link
                         href={`/shop/products/${item.products.slug}`}
                          className="flex-shrink-0 w-16 h-16 block relative overflow-hidden rounded">
                          <Image
                            // Use the browser client instance for getProductImageUrl
                            src={getProductImageUrl(supabase, item.products.images?.[0])}
                              alt={item.products.name || 'Product Image'}
                              fill
                              style={{ objectFit: 'cover' }}
                             sizes="64px"
                             className="rounded"
                             // Add basic error handling for images
                             onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                const target = e.target as HTMLImageElement;
                                console.error(`Error loading image: ${target.src}`);
                                target.src = '/placeholder.svg'; // Fallback image
                             }}
                         />
                     </Link>
                     <div className="flex-grow text-sm">
                          <Link
                              href={`/shop/products/${item.products.slug}`}
                              className="font-medium text-text-dark hover:text-brand-gold">{item.products.name || 'N/A'}</Link>
                          {item.size && <p className="text-xs text-text-light">Size: {item.size}</p>}
                          <p className="text-xs text-text-light">Qty: {item.quantity || 0}</p>
                     </div>
                     <div className="text-sm font-medium text-text-dark">
                         {formatCurrency((item.price || 0) * (item.quantity || 0))}
                          {(item.quantity || 0) > 1 && <span className="block text-xs text-text-light text-right">({formatCurrency(item.price)} each)</span>}
                     </div>
                 </div>))
               ))}
            </div>

             {/* Order Totals */}
             <div className="mt-6 pt-6 border-t border-border-light flex justify-end">
                <div className="w-full max-w-xs space-y-2 text-sm">
                     <div className="flex justify-between">
                        <span className="text-text-light">Subtotal:</span>
                        <span className="font-medium">{formatCurrency(subtotal)}</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-text-light">Shipping:</span>
                        <span className="font-medium">{order.shipping_fee === 0 ? 'FREE' : formatCurrency(order.shipping_fee)}</span> {/* Use shipping_fee */}
                     </div>
                     <div className="flex justify-between font-semibold text-base border-t pt-2 mt-2">
                        <span>Total:</span>
                        <span>{formatCurrency(order.total_amount)}</span>
                     </div>
                </div>
             </div>

             {/* Download Invoice and Send Email Buttons */}
             <div className="mt-8 flex justify-center space-x-4">
                 <Button
                    variant="secondary" // Use secondary variant as requested
                    onClick={handleDownloadInvoice}
                    disabled={pdfLoading || !order} // Disable if loading or no order data
                 >
                    {pdfLoading ? (
                        <>
                            {/* Simple loading text or use a spinner */}
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating PDF...
                        </>
                    ) : (
                        'Download Invoice (PDF)'
                    )}
                 </Button>
                 
                 {/* Show HTML fallback option if PDF generation failed */}
                 {pdfFailed && (
                   <Button
                     variant="outline"
                     onClick={handleDownloadHtml}
                     disabled={!order}
                   >
                     Download Invoice (HTML)
                   </Button>
                 )}
                 
                 <Button
                    variant="primary"
                    onClick={handleSendInvoiceEmail}
                    disabled={emailLoading || !order || !order.customer_email}
                 >
                    {emailLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending Email...
                        </>
                    ) : (
                        'Send Invoice Email'
                    )}
                 </Button>
             </div>

          </div>
      </div>
  );
};

export default OrderDetailsClient;