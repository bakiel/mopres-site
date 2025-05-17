'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Button from '@/components/Button';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient'; // Import Supabase client
// Import specific error types for better function error handling
import { FunctionsHttpError, FunctionsRelayError, FunctionsFetchError } from '@supabase/supabase-js';
import SectionTitle from '@/components/SectionTitle';
import { useCartStore } from '@/store/cartStore'; // Import cart store hook
import InvoiceTemplate from '@/components/InvoiceTemplate'; // Import the template
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
// Import the edge function helper
import { invokeEdgeFunction } from '@/lib/edgeFunctionHelper';

// Define Order type matching InvoiceTemplate and mock data
interface Order {
    id: string;
    created_at: string;
    order_ref: string;
    total_amount: number;
    shipping_fee: number;
    status: string;
    customer_email: string;
    shipping_address: {
        firstName: string;
        lastName: string;
        addressLine1: string;
        city: string;
        province: string;
        postalCode: string;
        country: string;
    };
    order_items: {
        id: string;
        quantity: number;
        price: number;
        products: {
            name: string;
            sku?: string;
        } | null; // Allow product to be null if relation fails
        size?: string | undefined; // Align with InvoiceTemplate: remove | null
    }[];
}

// Define a loading component for Suspense
const ConfirmationLoading = () => (
    <div className="bg-background-body py-12 lg:py-20">
        <div className="w-full max-w-screen-md mx-auto px-4 text-center">
            <p className="text-text-light">Loading confirmation...</p>
        </div>
    </div>
);

// Helper function to convert Blob to Base64
const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            } else {
                reject(new Error("Failed to read blob as base64 string."));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};


// Main component content
const ConfirmationContent = () => {
    console.log('Confirmation page rendering...'); // Added log
    const searchParams = useSearchParams();
    const orderRef = searchParams.get('orderRef');
    const [orderDetails, setOrderDetails] = useState<Order | null>(null); // State for fetched order
    const [emailStatus, setEmailStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
    const [isFetchingOrder, setIsFetchingOrder] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const invoiceRef = useRef<HTMLDivElement>(null); // Ref for the template component
    const { clearCart } = useCartStore(); // Get clearCart function from store

    const supabase = createSupabaseBrowserClient(); // Create client instance

    useEffect(() => {
        console.log('Confirmation page useEffect running...'); // Added log
        const fetchOrder = async () => {
            if (!orderRef) {
                console.log("No orderRef found in URL.");
                setOrderDetails(null); // Clear any previous details
                return;
            }

            setIsFetchingOrder(true);
            setOrderDetails(null); // Clear previous details while fetching

            try {
                console.log(`Fetching order details for orderRef: ${orderRef}`);
                const { data: orderData, error } = await supabase
                    .from('orders')
                    .select(`
                        id,
                        created_at,
                        order_ref,
                        total_amount,
                        shipping_fee,
                        status,
                        customer_email,
                        shipping_address,
                        order_items (
                            id,
                            quantity,
                            price,
                            size,
                            products (
                                name,
                                sku
                            )
                        )
                    `)
                    .eq('order_ref', orderRef)
                    .single(); // Expecting only one order

                if (error) {
                    throw error;
                }

                if (orderData) {
                    console.log("Raw order data fetched:", orderData);

                    // Transform the data to match the Order type
                    const transformedOrder: Order = {
                        ...orderData,
                        shipping_address: orderData.shipping_address || {}, // Ensure shipping_address is an object
                        order_items: orderData.order_items.map((item: any) => ({
                            ...item,
                            // Extract the single product object from the array returned by Supabase
                            // or set to null if products array is empty or not an array
                            products: Array.isArray(item.products) && item.products.length > 0
                                ? { name: item.products[0]?.name, sku: item.products[0]?.sku }
                                : null,
                            size: item.size || undefined, // Ensure size is string or undefined
                        })),
                    };

                    console.log("Transformed order data:", transformedOrder);
                    setOrderDetails(transformedOrder);

                    // --- BEGIN: Invoke Edge Function on Load ---
                    if (transformedOrder.order_ref) {
                        console.log(`Attempting to trigger email confirmation for orderRef: ${transformedOrder.order_ref}`);
                        
                        // Set initial status to pending
                        setEmailStatus('pending');
                        
                        // Simple approach without the helper
                        supabase.functions.invoke('send-invoice-email-new', {
                            body: { orderRef: transformedOrder.order_ref }
                        }).then(({ data, error }) => {
                            if (error) {
                                console.error('Email function error:', error);
                                setEmailStatus('error');
                            } else {
                                console.log('Email function success:', data);
                                setEmailStatus('success');
                            }
                        });
                    } else {
                         console.warn('Order reference not found in fetched order data, cannot trigger email function.');
                    }
                    // --- END: Invoke Edge Function on Load ---

                    // Clear the cart after successful order fetch and email trigger
                    console.log("Clearing cart on confirmation page...");
                    clearCart();

                } else {
                    console.warn(`No order found for orderRef: ${orderRef}`);
                    setOrderDetails(null); // Set to null if not found
                }

            } catch (error: any) {
                console.error("Error fetching order details:", error);
                setOrderDetails(null); // Clear details on error
                // Optionally show a user-facing error message
                alert(`Failed to fetch order details: ${error.message}`);
            } finally {
                setIsFetchingOrder(false);
            }
        };

        fetchOrder();
    }, [orderRef, supabase]); // Add supabase to dependency array

    const handleDownloadInvoice = async () => {
        if (!invoiceRef.current || !orderDetails) {
            console.error("Invoice template ref or order details not available.");
            alert("Could not generate invoice at this time.");
            return;
        }
        setPdfLoading(true);
        try {
            // 1. Generate PDF Canvas/Blob
            const canvas = await html2canvas(invoiceRef.current, {
                scale: 2, // Increase scale for better resolution
                useCORS: true, // If using external images
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 0; // Start image at the top

            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            const pdfBlob = pdf.output('blob');

            // 2. Convert Blob to Base64
            console.log("[Client] Converting PDF blob to Base64...");
            const pdfBase64 = await blobToBase64(pdfBlob);
            console.log(`[Client] PDF Base64 generated (length: ${pdfBase64.length})`);


            // 3. Invoke 'upload-invoice' Edge Function
            console.log(`[Client] Invoking 'upload-invoice' function for orderRef: ${orderDetails.order_ref}`);
            // Use specific error types from @supabase/supabase-js
            // import { FunctionsHttpError, FunctionsRelayError, FunctionsFetchError } from '@supabase/supabase-js'; // Already imported above

            // Pass the body as an object directly, supabase-js v2 handles stringification
            console.log(`[Client] Preparing to invoke 'upload-invoice'. Order Ref: ${orderDetails.order_ref}, Base64 Length: ${pdfBase64.length}`); // Added log

            const { data: uploadFnData, error: uploadFnError } = await supabase.functions.invoke('upload-invoice', {
                body: { // Pass object directly
                    orderRef: orderDetails.order_ref,
                    pdfBase64: pdfBase64 // Send the actual base64 data
                    // pdfBase64: "dummy" // Removed dummy data
                }
            });

            if (uploadFnError) {
                 if (uploadFnError instanceof FunctionsHttpError) {
                    const errorMessage = await uploadFnError.context.json();
                    console.error('Upload-invoice Function HTTP Error:', errorMessage);
                    alert(`Failed to upload invoice: Server returned error - ${errorMessage?.error || uploadFnError.message}`);
                    throw new Error(`Upload function HTTP error: ${errorMessage?.error || uploadFnError.message}`);
                 } else if (uploadFnError instanceof FunctionsRelayError) {
                    console.error('Upload-invoice Function Relay Error:', uploadFnError.message);
                    alert(`Failed to upload invoice: Network relay issue - ${uploadFnError.message}`);
                    throw new Error(`Upload function relay error: ${uploadFnError.message}`);
                 } else if (uploadFnError instanceof FunctionsFetchError) {
                    console.error('Upload-invoice Function Fetch Error:', uploadFnError.message);
                    // This is the most likely error type based on previous logs
                    alert(`Failed to upload invoice: Network fetch issue - ${uploadFnError.message}. Check connection or CORS.`);
                    throw new Error(`Upload function fetch error: ${uploadFnError.message}`);
                 } else {
                    console.error("Error invoking 'upload-invoice' function:", uploadFnError);
                    alert(`Failed to upload invoice via function: ${uploadFnError.message}. Please try again.`);
                    throw new Error(`Upload function invocation failed: ${uploadFnError.message}`);
                 }
            }

            // Check for success flag from the function itself AFTER checking invocation errors
            if (!uploadFnData?.success) {
                 console.error("Upload function reported failure:", uploadFnData);
                 alert(`Failed to upload invoice: ${uploadFnData?.error || 'Unknown function error'}. Please try again.`);
                 throw new Error(`Upload function failed: ${uploadFnData?.error || 'Unknown function error'}`);
            }

            console.log("[Client] Invoice uploaded successfully via Edge Function:", uploadFnData);

            // 4. Only trigger download after successful upload via function
            pdf.save(`MoPres_Invoice_${orderDetails.order_ref}.pdf`);

        } catch (error) {
            // Catch errors from PDF generation, base64 conversion, or function invocation/upload
            // The specific error logging/alerting is now handled within the 'if (uploadFnError)' block
            // We still log the general error here for visibility
            console.error("Error during invoice generation or upload process:", error);
            // Avoid redundant alerts if already shown by the specific error handlers
            // Ensure error is an instance of Error before accessing message property
            const isHandledError = error instanceof FunctionsHttpError || error instanceof FunctionsRelayError || error instanceof FunctionsFetchError || (error instanceof Error && (error.message.startsWith('Upload function invocation failed') || error.message.startsWith('Upload function failed') || error.message.startsWith('Upload function HTTP error') || error.message.startsWith('Upload function relay error') || error.message.startsWith('Upload function fetch error')));
            if (!isHandledError) {
                 alert("An unexpected error occurred while processing the invoice. Please try again.");
            }
        } finally {
            setPdfLoading(false); // Ensure loading state is reset regardless of success or failure
        }
    };

    return (
        <div className="bg-background-body py-12 lg:py-20">
            <div className="w-full max-w-screen-md mx-auto px-4 text-center">
                <SectionTitle centered>Order Confirmed!</SectionTitle>

                <div className="mt-8 bg-white p-8 border border-green-200 rounded shadow-sm font-poppins relative"> {/* Added relative positioning */}
                    {/* Loading Spinner Overlay */}
                    {pdfLoading && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded">
                            <svg className="animate-spin h-10 w-10 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="ml-3 text-text-light">Generating & Uploading Invoice...</p> {/* Updated text */}
                        </div>
                    )}

                    <div className="text-green-600 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <h2 className="text-xl font-semibold mb-3 text-text-dark">Thank you for your order!</h2>
                    {isFetchingOrder && <p className="text-text-light mb-2">Loading order details...</p>}
                    {!isFetchingOrder && orderDetails ? (
                        <p className="text-text-light mb-2">
                            Your order reference is: <strong className="text-brand-gold">{orderDetails.order_ref}</strong>
                        </p>
                    ) : !isFetchingOrder && !orderDetails ? (
                         <p className="text-red-600 mb-2">Could not load order details.</p>
                    ) : null}
                    <p className="text-sm text-text-light mb-6">
                        {emailStatus === 'success' ? (
                            "You will receive an email confirmation shortly with your order details."
                        ) : emailStatus === 'error' ? (
                            "Your order was successful! Due to high demand, the confirmation email might be delayed. Please check your account for order details."
                        ) : (
                            "You will receive an email confirmation shortly with your order details."
                        )}
                    </p>

                    {/* Buttons Section */}
                    <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                         <Button
                            variant="primary"
                            onClick={handleDownloadInvoice}
                            disabled={pdfLoading || !orderDetails || isFetchingOrder}
                         >
                           {/* Keep spinner inside button for visual feedback on click */}
                           {pdfLoading ? (
                             <>
                               <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                               </svg>
                               Generating...
                             </>
                           ) : (
                             'Download Invoice (PDF)'
                           )}
                         </Button>
                        <Link href="/shop">
                            <Button variant="secondary">Continue Shopping</Button>
                        </Link>
                        {/* Link to specific order if details available */}
                        {orderDetails ? (
                            <Link href={`/account/orders/${orderDetails.id}`}>
                                <Button variant="outline-light">View This Order</Button>
                            </Link>
                        ) : (
                            <Link href="/account/orders">
                                <Button variant="outline-light">View My Orders</Button>
                            </Link>
                        )}
                    </div>
                    
                    {/* Show email status if there was an error */}
                    {emailStatus === 'error' && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-left">
                            <p className="text-amber-800 text-sm">
                                <strong>Note:</strong> Your order has been confirmed, but there was an issue sending the confirmation email. 
                                You can view all order details in your account dashboard.
                            </p>
                        </div>
                    )}

                    {/* Call to Action: EFT Payment */}
                    {!isFetchingOrder && orderDetails && (
                        <div className="mt-10 pt-6 border-t border-gray-200 text-left">
                            <h3 className="text-lg font-semibold text-brand-primary mb-4">Action Required: Complete Your Payment</h3>
                            <p className="text-text-light mb-4">
                                Thank you for placing your order! To complete the process, please make a manual Electronic Funds Transfer (EFT) using the details below.
                            </p>
                            <div className="bg-gray-50 p-4 rounded border border-gray-100 mb-4">
                                <p className="mb-2"><strong>Total Amount Due:</strong> R {orderDetails.total_amount.toFixed(2)}</p>
                                <p className="mb-2"><strong>Bank Details:</strong> [Placeholder: Bank Name, Account Number, Branch Code]</p> {/* Placeholder */}
                                <p><strong>Reference:</strong> {orderDetails.order_ref} (Your Order Reference)</p>
                            </div>
                            <p className="text-sm text-text-light mb-6">
                                Please make your EFT payment using the details above and your Order Reference to ensure timely processing of your order.
                            </p>
                            <Link href={`/account/orders/${orderDetails.id}`}>
                                <Button variant="primary">View Order Details</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            {/* Render InvoiceTemplate off-screen for capturing */}
            {/* Ensure InvoiceTemplate only renders when orderDetails is available */}
            {orderDetails && <InvoiceTemplate order={orderDetails} invoiceRef={invoiceRef} />}
        </div>
    );
}

// Export component wrapped in Suspense
export default function ConfirmationPage() {
    return (
        <Suspense fallback={<ConfirmationLoading />}>
            <ConfirmationContent />
        </Suspense>
    );
}
