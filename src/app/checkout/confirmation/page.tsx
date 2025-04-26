'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react'; // Added useState, useEffect, useRef
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Button from '@/components/Button';
import SectionTitle from '@/components/SectionTitle';
import InvoiceTemplate from '@/components/InvoiceTemplate'; // Import the template
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Define Order type matching InvoiceTemplate and mock data
interface Order {
    id: string;
    created_at: string;
    order_ref: string;
    total_amount: number;
    shipping_cost: number;
    status: string;
    user_email: string;
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

// Main component content
const ConfirmationContent = () => {
    const searchParams = useSearchParams();
    const orderRef = searchParams.get('orderRef');
    const [orderDetails, setOrderDetails] = useState<Order | null>(null); // State for fetched order
    const [isFetchingOrder, setIsFetchingOrder] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const invoiceRef = useRef<HTMLDivElement>(null); // Ref for the template component

    // TODO: Fetch actual order details using orderRef
    useEffect(() => {
        if (orderRef) {
            setIsFetchingOrder(true);
            // Simulate fetch
            console.log(`Simulating fetch for orderRef: ${orderRef}`);
            setTimeout(() => {
                 // Replace with actual fetch logic from Supabase based on orderRef
                const mockOrderData: Order = {
                    id: 'mock-id-' + orderRef,
                    created_at: new Date().toISOString(),
                    order_ref: orderRef,
                    total_amount: 2150.00, // Example data
                    shipping_cost: 0, // Example data
                    status: 'pending_payment',
                    user_email: 'customer@example.com',
                    shipping_address: {
                        firstName: 'Test', lastName: 'User', addressLine1: '123 Mock St', city: 'Pretoria', province: 'Gauteng', postalCode: '0001', country: 'South Africa'
                    },
                    order_items: [
                        { id: 'item1', quantity: 1, price: 2150.00, products: { name: 'Example Heel', sku: 'SKU123' }, size: '6' }
                    ]
                };
                setOrderDetails(mockOrderData);
                setIsFetchingOrder(false);
            }, 1000);
        }
    }, [orderRef]);

    const handleDownloadInvoice = async () => {
        if (!invoiceRef.current || !orderDetails) {
            console.error("Invoice template ref or order details not available.");
            alert("Could not generate invoice at this time.");
            return;
        }
        setPdfLoading(true);
        try {
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
            pdf.save(`MoPres_Invoice_${orderDetails.order_ref}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF invoice.");
        } finally {
            setPdfLoading(false);
        }
    };

    return (
        <div className="bg-background-body py-12 lg:py-20">
            <div className="w-full max-w-screen-md mx-auto px-4 text-center">
                <SectionTitle centered>Order Confirmed!</SectionTitle>

                <div className="mt-8 bg-white p-8 border border-green-200 rounded shadow-sm font-poppins">
                    <div className="text-green-600 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <h2 className="text-xl font-semibold mb-3 text-text-dark">Thank you for your order!</h2>
                    {orderRef ? (
                        <p className="text-text-light mb-2">
                            Your order reference is: <strong className="text-brand-gold">{orderRef}</strong>
                        </p>
                    ) : (
                         <p className="text-text-light mb-2">Loading order details...</p>
                    )}
                    <p className="text-sm text-text-light mb-6">
                        You will receive an email confirmation shortly with your order details and EFT payment instructions. Please use the reference number above when making payment.
                    </p>

                    {/* TODO: Display Order Summary here by fetching order details */}
                    {/* <div className="order-summary-placeholder my-6 border-t border-b py-4">
                        <p className="text-text-light text-sm">[Order Summary Placeholder]</p>
                    </div> */}

                    <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                         <Button
                            variant="primary"
                            onClick={handleDownloadInvoice}
                            disabled={pdfLoading || !orderDetails || isFetchingOrder}
                         >
                            {pdfLoading ? 'Generating...' : 'Download Invoice (PDF)'}
                         </Button>
                        <Link href="/shop">
                            <Button variant="secondary">Continue Shopping</Button>
                        </Link>
                         {/* TODO: Link to account orders page if user is logged in */}
                        <Link href="/account/orders">
                            <Button variant="outline-light">View My Orders</Button>
                        </Link>
                    </div>
                </div>
            </div>
             {/* Render InvoiceTemplate off-screen for capturing */}
             <InvoiceTemplate order={orderDetails} invoiceRef={invoiceRef} />
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
