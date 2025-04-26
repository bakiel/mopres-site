'use client'; // Needs client-side access to localStorage

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Correct import for jspdf-autotable
import Button from '@/components/Button';
import SectionTitle from '@/components/SectionTitle';
import { CartItem, getCartTotal } from '@/lib/cartUtils';

// Re-use ShippingAddress type
type ShippingAddress = {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  phone: string;
};

// Type for the stored order details
type LastOrder = {
    id: string;
    total: number;
    items: CartItem[];
    address: ShippingAddress;
}

export default function ConfirmationPage() {
  const [lastOrder, setLastOrder] = useState<LastOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedOrder = localStorage.getItem('lastOrder');
      if (storedOrder) {
        setLastOrder(JSON.parse(storedOrder));
        // Optional: Clear the stored order after displaying it once?
        // localStorage.removeItem('lastOrder');
      } else {
        // If no order details found, maybe redirect to home or account
        console.warn("No last order details found in localStorage.");
        // router.push('/'); // Or '/account/orders' if user is logged in
      }
      setLoading(false);
    }
  }, [router]);

  // --- PDF Generation Logic ---

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
  }

  /**
   * Adds banking details to the invoice PDF
   * @param {jsPDF} doc - The jsPDF document instance
   * @param {number} yPosition - The current Y position in the document
   * @param {LastOrder} order - The order details
   * @returns {number} - The new Y position after adding banking details
   */
  function addBankingDetails(doc: jsPDF, yPosition: number, order: LastOrder): number {
    const startY = yPosition + 10; // Add a small gap

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT DETAILS (EFT)', 15, startY);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Please use the exact reference below when making your payment:', 15, startY + 7);

    const bankData = [
      ['Account Holder:', 'KEONKOSI ENGINEERS'], // Replace with actual if different
      ['Bank:', 'First National Bank (FNB)'],
      ['Account Type:', 'GOLD BUSINESS ACCOUNT'],
      ['Account Number:', '62792142095'],
      ['Branch Code:', '210648'],
      // ['Branch Name:', 'JUBILEE MALL'], // Optional
      // ['Swift Code:', 'FIRNZAJJ'], // Optional for international
      ['Reference:', `Order #${order.id} ${order.address.fullName.split(' ').pop()}`] // Use Order ID and Last Name
    ];

    autoTable(doc, {
      startY: startY + 12,
      head: [],
      body: bankData,
      theme: 'plain',
      styles: {
        cellPadding: 1,
        fontSize: 9,
        lineWidth: 0,
        halign: 'left'
      },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold' },
        1: { cellWidth: 'auto' }
      },
      margin: { left: 15 }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 5; // Get Y pos after table

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Important: Your order will be processed once payment reflects in our account.', 15, finalY + 5);

    return finalY + 15; // Return the new Y position
  }


  const generateInvoice = async () => {
    if (!lastOrder) {
      alert("Order details not found.");
      return;
    }

    const doc = new jsPDF();
    let yPos = 15; // Initial Y position

    // --- Header ---
    // Add Logo (Requires handling image loading/embedding - simplified for now)
    // try {
    //   // You might need to fetch the image or have it locally/base64 encoded
    //   // const logoUrl = 'https://i.ibb.co/99JhZpV1/Mopres-Gold-luxury-lifestyle-logo.png';
    //   // const imgData = await fetch(logoUrl).then(res => res.blob()); // Needs CORS handling or proxy
    //   // doc.addImage(imgData, 'PNG', 15, yPos, 40, 15); // Adjust coords/size
    //   // yPos += 20;
    //   doc.setFontSize(10);
    //   doc.text('MoPres Logo Placeholder', 15, yPos); // Placeholder
    //   yPos += 5;
    // } catch (e) {
    //   console.error("Error adding logo:", e);
    //   doc.setFontSize(10);
    //   doc.text('MoPres Logo Placeholder', 15, yPos); // Placeholder
    //   yPos += 5;
    // }

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('TAX INVOICE', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
    yPos += 10;

    // --- Company & Order Details ---
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const companyX = 15;
    const orderX = doc.internal.pageSize.getWidth() - 15; // Right align

    doc.text('MoPres Luxury', companyX, yPos);
    doc.text(`Order #: ${lastOrder.id}`, orderX, yPos, { align: 'right' });
    yPos += 5;
    doc.text('6680 Witrigwend Street, Unit 378', companyX, yPos);
    doc.text(`Date: ${new Date().toLocaleDateString('en-ZA')}`, orderX, yPos, { align: 'right' });
    yPos += 5;
    doc.text('Herendaig Estate, Centurion 0157', companyX, yPos);
    yPos += 5;
    doc.text('info@mopres.co.za | +27 83 500 5311', companyX, yPos);
    yPos += 10;

    // --- Billing/Shipping Address ---
    doc.setFont('helvetica', 'bold');
    doc.text('Ship To:', companyX, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(lastOrder.address.fullName, companyX, yPos);
    yPos += 5;
    doc.text(lastOrder.address.addressLine1, companyX, yPos);
    yPos += 5;
    if (lastOrder.address.addressLine2) {
        doc.text(lastOrder.address.addressLine2, companyX, yPos);
        yPos += 5;
    }
    doc.text(`${lastOrder.address.city}, ${lastOrder.address.province}, ${lastOrder.address.postalCode}`, companyX, yPos);
    yPos += 5;
    doc.text(lastOrder.address.country || 'South Africa', companyX, yPos);
    yPos += 5;
    doc.text(`Phone: ${lastOrder.address.phone}`, companyX, yPos);
    yPos += 15; // Space before table

    // --- Order Items Table ---
    const tableColumn = ["Item", "SKU", "Size", "Qty", "Unit Price", "Total"];
    const tableRows = lastOrder.items.map(item => [
      item.name,
      item.sku || 'N/A', // Assuming sku is available on CartItem
      item.size || 'N/A',
      item.quantity,
      formatCurrency(item.price),
      formatCurrency(item.price * item.quantity)
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [26, 26, 26] }, // Dark header
      margin: { left: 15, right: 15 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10; // Get Y pos after table

    // --- Totals ---
    const totalsX = doc.internal.pageSize.getWidth() - 65; // Position for totals labels
    const valuesX = doc.internal.pageSize.getWidth() - 15; // Position for totals values
    const subtotal = lastOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = lastOrder.total - subtotal; // Calculate shipping

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', totalsX, yPos);
    doc.text(formatCurrency(subtotal), valuesX, yPos, { align: 'right' });
    yPos += 7;
    doc.text('Shipping:', totalsX, yPos);
    doc.text(shipping > 0 ? formatCurrency(shipping) : 'Free', valuesX, yPos, { align: 'right' });
    yPos += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Total Due (EFT):', totalsX, yPos);
    doc.text(formatCurrency(lastOrder.total), valuesX, yPos, { align: 'right' });
    yPos += 10;

    // --- Banking Details ---
    yPos = addBankingDetails(doc, yPos, lastOrder);

    // --- Footer ---
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for your business!', doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

    // --- Save PDF ---
    doc.save(`MoPres_Invoice_${lastOrder.id}.pdf`);
  };


  const handleDownloadInvoice = () => {
    generateInvoice().catch(error => {
        console.error("Failed to generate invoice:", error);
        alert("Sorry, there was an error generating the invoice PDF.");
    });
  };

  // Removed duplicate formatCurrency function here

  if (loading) {
      return (
          <div className="bg-background-body py-12 lg:py-20">
              <div className="w-full max-w-screen-xl mx-auto px-4 text-center">
                  <p className="text-text-light">Loading confirmation...</p>
              </div>
          </div>
      );
  }

  if (!lastOrder) {
       return (
          <div className="bg-background-body py-12 lg:py-20">
              <div className="w-full max-w-screen-md mx-auto px-4 text-center">
                 <SectionTitle centered>Order Not Found</SectionTitle>
                 <p className="text-text-light mt-4 mb-6">We couldn't find details for your last order.</p>
                 <Link href="/shop">
                    <Button variant="primary">Continue Shopping</Button>
                 </Link>
              </div>
          </div>
      );
  }

  // Recalculate subtotal for display consistency
  const displaySubtotal = lastOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const displayShipping = lastOrder.total - displaySubtotal;

  return (
    <div className="bg-background-body py-12 lg:py-20">
      <div className="w-full max-w-screen-md mx-auto px-4"> {/* Centered, narrower container */}
        <SectionTitle centered>Thank You For Your Order!</SectionTitle>

        <div className="bg-white p-6 md:p-8 border border-border-light rounded shadow-sm mt-8 text-center font-poppins"> {/* Added font-poppins */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">Your Order is Confirmed</h2>
            <p className="text-text-light mb-4">
                Your Order Number is: <strong className="text-text-dark font-mono">{lastOrder.id}</strong>
            </p>
            <p className="text-text-light mb-6">
                Please use this number as the reference when making your EFT payment. You will receive an email confirmation shortly (if applicable).
            </p>

            {/* Order Details Summary */}
            <div className="text-left border-t border-b border-border-light py-6 my-6 space-y-3 text-sm">
                 <h4 className="font-semibold text-base mb-3">Order Summary:</h4>
                 {lastOrder.items.map(item => (
                     <div key={`${item.productId}-${item.size || 'no-size'}`} className="flex justify-between items-center">
                         <span>{item.name} {item.size ? `(${item.size})` : ''} x {item.quantity}</span>
                         <span>{formatCurrency(item.price * item.quantity)}</span>
                     </div>
                 ))}
                 <div className="flex justify-between pt-2 border-t">
                     <span>Subtotal</span>
                     <span>{formatCurrency(displaySubtotal)}</span>
                 </div>
                  <div className="flex justify-between">
                     <span>Shipping</span>
                     <span>{displayShipping === 0 ? 'Free' : formatCurrency(displayShipping)}</span>
                 </div>
                 <div className="flex justify-between font-bold text-base pt-2 border-t">
                     <span>Total Due (via EFT)</span>
                     <span>{formatCurrency(lastOrder.total)}</span>
                 </div>
            </div>

             {/* Shipping Address Summary */}
             <div className="text-left text-sm mb-6">
                 <h4 className="font-semibold text-base mb-2">Shipping To:</h4>
                 <p>{lastOrder.address.fullName}</p>
                 <p>{lastOrder.address.addressLine1}</p>
                 {lastOrder.address.addressLine2 && <p>{lastOrder.address.addressLine2}</p>}
                 <p>{lastOrder.address.city}, {lastOrder.address.province}, {lastOrder.address.postalCode}</p>
                 <p>{lastOrder.address.country}</p>
                 <p>Phone: {lastOrder.address.phone}</p>
             </div>

            <Button
                onClick={handleDownloadInvoice}
                variant="secondary"
                className="mr-4"
            >
                Download Invoice (PDF)
            </Button>
            <Link href="/shop">
                <Button variant="primary">Continue Shopping</Button>
            </Link>
        </div>
      </div>
    </div>
  );
}
