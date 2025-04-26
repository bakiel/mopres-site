'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import next/image
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import SectionTitle from '@/components/SectionTitle';
import { useCartStore } from '@/store/cartStore';
import { getProductImageUrl } from '@/lib/supabaseClient';

// TODO: Define type for delivery info passed from previous step
interface DeliveryInfo {
    email: string;
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    phone?: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const { items: cartItems, getTotalPrice, clearCart } = useCartStore();
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null); // State to hold delivery info
  const [isLoading, setIsLoading] = useState(false);
  const [orderRef, setOrderRef] = useState(''); // State for generated order reference

  // TODO: Retrieve delivery info (e.g., from localStorage or state)
  // For now, using placeholder effect
  useEffect(() => {
    // Simulate fetching/retrieving delivery info
    const storedInfo = localStorage.getItem('deliveryInfo'); // Example: using localStorage
    if (storedInfo) {
        setDeliveryInfo(JSON.parse(storedInfo));
    } else {
        // If no delivery info, redirect back? Or handle error
        console.warn("Delivery info not found, redirecting back.");
        // router.replace('/checkout/delivery');
    }

    // Generate a unique order reference (simple example)
    const generateOrderRef = () => `MP-${Date.now().toString().slice(-6)}`;
    setOrderRef(generateOrderRef());

     // Redirect if cart is empty (check again on this page)
     if (cartItems.length === 0) {
        router.replace('/checkout/cart');
     }

  }, [cartItems, router]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
  };

  const subtotal = getTotalPrice();
  // TODO: Calculate final shipping based on actual address/method if needed
  const shippingCost = subtotal >= 2000 ? 0 : 150; // Use same logic as sidebar for now
  const totalAmount = subtotal + shippingCost;

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    // TODO:
    // 1. Create order in Supabase 'orders' table (include items, deliveryInfo, total, status='pending_payment', orderRef)
    // 2. Create corresponding 'order_items' in Supabase
    // 3. Handle potential errors during order creation
    // 4. Clear the cart (useCartStore clearCart action)
    // 5. Redirect to confirmation page, passing order details/ID

    console.log('Placing order with ref:', orderRef, 'Data:', { deliveryInfo, cartItems, totalAmount });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // On successful order creation:
    // clearCart(); // Clear the cart
    // router.push(`/checkout/confirmation?orderRef=${orderRef}`); // Redirect to confirmation

    // Simulate success for now
    setIsLoading(false);
    // For testing, manually clear cart and redirect
     clearCart();
     router.push(`/checkout/confirmation?orderRef=${orderRef}`);

  };

  return (
    <div className="bg-background-body py-12 lg:py-20">
      <div className="w-full max-w-screen-md mx-auto px-4">
        <SectionTitle centered>Checkout - Payment</SectionTitle>

        {/* Checkout Steps Indicator */}
         <div className="flex justify-center space-x-2 my-8 text-sm font-poppins items-center">
            <Link href="/checkout/cart" className="text-text-light hover:text-brand-gold">Cart</Link>
            <span className="text-gray-400">/</span>
            <Link href="/checkout/delivery" className="text-text-light hover:text-brand-gold">Delivery</Link>
            <span className="text-gray-400">/</span>
            <span className="font-semibold text-text-dark">Payment</span>
            <span className="text-gray-400">/</span>
            <span className="text-text-light">Confirmation</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Payment Instructions & Details */}
          <div className="space-y-6 font-poppins">
            {/* Delivery Info Summary */}
            {deliveryInfo && (
                <div className="border border-border-light rounded p-4 bg-white shadow-sm">
                    <h3 className="text-lg font-semibold mb-3 font-montserrat">Delivery Details</h3>
                    <div className="text-sm space-y-1 text-text-light">
                        <p><span className="font-medium text-text-dark">Contact:</span> {deliveryInfo.email}</p>
                        <p><span className="font-medium text-text-dark">Ship to:</span> {deliveryInfo.addressLine1}, {deliveryInfo.addressLine2 && `${deliveryInfo.addressLine2}, `}{deliveryInfo.city}, {deliveryInfo.province}, {deliveryInfo.postalCode}, {deliveryInfo.country}</p>
                    </div>
                    <Link href="/checkout/delivery" className="text-xs text-brand-gold hover:underline mt-2 inline-block">Change</Link>
                </div>
            )}

            {/* Payment Method - EFT Only */}
            <div>
              <h3 className="text-lg font-semibold mb-3 font-montserrat">Payment Method</h3>
              <div className="border border-border-light rounded p-4 bg-white shadow-sm">
                <p className="font-medium text-text-dark mb-2">EFT / Bank Deposit</p>
                <p className="text-sm text-text-light mb-4">
                  Please use the generated reference number when making your payment. Your order will be processed once payment is confirmed.
                </p>
                <div className="bg-gray-50 p-3 rounded border border-dashed border-gray-300 space-y-1 text-sm">
                   <p><span className="font-medium">Bank:</span> FNB</p>
                   <p><span className="font-medium">Account Name:</span> MoPres (Pty) Ltd</p>
                   <p><span className="font-medium">Account Number:</span> 628XXXXXXXX</p> {/* Replace X with actual */}
                   <p><span className="font-medium">Branch Code:</span> 250655</p>
                   <p><span className="font-medium">Reference:</span> <strong className="text-brand-gold">{orderRef || 'Generating...'}</strong></p>
                </div>
                 <p className="text-xs text-text-light mt-3">
                    Send proof of payment to <a href="mailto:payments@mopres.co.za" className="text-blue-600 hover:underline">payments@mopres.co.za</a> to speed up processing.
                 </p>
              </div>
            </div>

             <div className="flex justify-between items-center mt-8">
                 <Link href="/checkout/delivery" className="text-sm text-brand-gold hover:underline">
                    &larr; Return to Delivery
                 </Link>
                <Button onClick={handlePlaceOrder} variant="primary" disabled={isLoading || !deliveryInfo || !orderRef}>
                    {isLoading ? 'Placing Order...' : `Place Order (${formatCurrency(totalAmount)})`}
                </Button>
            </div>

          </div>

          {/* Order Summary */}
           <div className="bg-white p-6 border border-border-light rounded shadow-sm h-fit sticky top-[130px]">
                 <h3 className="text-lg font-semibold mb-4 font-montserrat border-b pb-3">Order Summary</h3>
                 <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
                     {cartItems.map(item => (
                         <div key={`${item.productId}-${item.size}`} className="flex justify-between items-center text-sm">
                             <div className="flex items-center gap-3">
                                 <div className="relative w-10 h-10 flex-shrink-0"> {/* Added relative container */}
                                     <Image
                                         src={getProductImageUrl(item.image)}
                                         alt={item.name}
                                         fill // Use fill layout
                                         style={{ objectFit: 'cover' }} // Ensure image covers the area
                                         sizes="40px" // Provide size hint
                                         className="rounded"
                                     />
                                 </div>
                                 <div>
                                     <p className="text-text-dark font-medium line-clamp-1">{item.name}</p>
                                     {item.size && <p className="text-xs text-text-light">Size: {item.size}</p>}
                                 </div>
                                 <p className="text-text-light">x{item.quantity}</p>
                             </div>
                             <p className="text-text-dark font-medium">{formatCurrency(item.price * item.quantity)}</p>
                         </div>
                     ))}
                 </div>
                 <div className="border-t pt-4 space-y-2">
                     <div className="flex justify-between text-sm">
                         <span className="text-text-light">Subtotal</span>
                         <span className="font-medium">{formatCurrency(subtotal)}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                         <span className="text-text-light">Shipping</span>
                         <span className="font-medium">
                            {shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)}
                         </span>
                     </div>
                     <div className="flex justify-between font-semibold text-base border-t pt-2 mt-2">
                         <span>Total</span>
                         <span>{formatCurrency(totalAmount)}</span>
                     </div>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
}
