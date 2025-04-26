'use client'; // Needs client-side access to cart/address info

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import SectionTitle from '@/components/SectionTitle';
import { getCart, getCartTotal, clearCart, CartItem } from '@/lib/cartUtils'; // Import cart utilities
import { createSupabaseBrowserClient } from '@/lib/supabaseClient'; // Import the factory function
import type { User } from '@supabase/supabase-js';

// Re-use ShippingAddress type if needed, or define locally
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

export default function PaymentPage() {
  // Create the client instance inside the component
  const supabase = createSupabaseBrowserClient();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false); // For placing order
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Load cart and address info on mount
  useEffect(() => {
    setCartItems(getCart());
    if (typeof window !== 'undefined') {
      const storedAddress = localStorage.getItem('shippingAddress');
      if (storedAddress) {
        setShippingAddress(JSON.parse(storedAddress));
      } else {
        // If no address found, redirect back to delivery step
        console.warn("No shipping address found, redirecting to delivery.");
        router.push('/checkout/delivery');
      }
      // Check user session for order creation
      supabase.auth.getSession().then(({ data: { session } }) => {
          setUser(session?.user ?? null);
      });
    }
  }, [router]);

  const cartTotal = getCartTotal();
  const shippingCost = cartTotal >= 2000 ? 0 : 150;
  const orderTotal = cartTotal + shippingCost;

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError(null);

    if (!shippingAddress || cartItems.length === 0) {
        setError("Missing order details. Please go back to cart or delivery.");
        setLoading(false);
        return;
    }

    // Prepare order data for insertion
    const orderData = {
        user_id: user?.id || null, // Link to user if logged in
        customer_name: shippingAddress.fullName,
        customer_email: user?.email || 'guest@example.com', // Use user email or prompt if guest?
        customer_phone: shippingAddress.phone,
        shipping_address: shippingAddress, // Store as JSONB
        total_amount: orderTotal,
        shipping_fee: shippingCost,
        payment_method: 'EFT',
        status: 'pending_payment', // Initial status
        payment_status: 'pending',
        // invoice_number: Generate later or use order ID? Let's use order ID for now.
    };

    // Prepare order items data for the RPC call
    const orderItemsData = cartItems.map(item => ({
        product_id: item.productId, // Assuming productId is the UUID from products table
        quantity: item.quantity,
        size: item.size,
        price: item.price, // Price at time of order
        sku: item.sku || 'N/A', // Include SKU
    }));

    try {
        // Call the Supabase RPC function to create the order and order items transactionally
        const { data: newOrderId, error: rpcError } = await supabase.rpc('create_order_with_items', {
            order_data: orderData,
            order_items_data: orderItemsData
        });

        if (rpcError || !newOrderId) {
            console.error("Error calling create_order_with_items RPC:", rpcError);
            throw new Error("Failed to create order.");
        }

        const orderId = newOrderId; // The RPC function returns the new order ID

        // Order placed successfully
        console.log("Order placed successfully via RPC:", orderId);

        // Store details for confirmation page
         if (typeof window !== 'undefined') {
            localStorage.setItem('lastOrder', JSON.stringify({
                id: orderId, // Use actual order ID returned by RPC
                total: orderTotal,
                items: cartItems, // Store items for display/invoice
                address: shippingAddress, // Store address for display
            }));
         }

        // Clear the cart after successful order
        clearCart();

        // Redirect to confirmation page with order ID
        router.push('/checkout/confirmation/' + orderId);

    } catch (orderError: any) {
        console.error("Error placing order (placeholder):", orderError);
        setError("Failed to place order. Please try again.");
        setLoading(false);
    }

    // setLoading(false); // Loading stops on redirect or error
  };

  const formatCurrency = (amount: number) => {
     return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
  }

  return (
    <div className="bg-background-body py-12 lg:py-20">
      <div className="w-full max-w-screen-lg mx-auto px-4">
        <SectionTitle centered>Payment & Order Review</SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mt-8 font-poppins"> {/* Added font-poppins */}
          {/* Payment Instructions & Details */}
          <div className="md:col-span-2 bg-white p-6 md:p-8 border border-border-light rounded shadow-sm">
            <h3 className="text-xl font-semibold mb-6">Payment Method: EFT</h3>
            <p className="text-text-light mb-4">
              Please use the banking details below to make an Electronic Funds Transfer (EFT) for your order total.
              Use your generated Order Number (which will be shown on the confirmation page) as the payment reference.
            </p>
            <div className="bg-background-light p-4 rounded border border-border-light space-y-2 text-sm mb-6">
              <p><strong>Bank:</strong> First National Bank (FNB)</p>
              <p><strong>Account Name:</strong> MoPres (PTY) LTD</p> {/* Assuming based on registration */}
              <p><strong>Account Number:</strong> 62792142095</p>
              <p><strong>Account Type:</strong> GOLD BUSINESS ACCOUNT</p>
              <p><strong>Branch Code:</strong> 210648</p>
              <p><strong>Reference:</strong> Your Order Number (from confirmation page)</p>
            </div>
            <p className="text-text-light mb-6">
              Your order will be processed and shipped once payment confirmation is received. This may take 1-2 business days.
              Please send proof of payment to <a href="mailto:info@mopres.co.za" className="text-brand-gold hover:underline">info@mopres.co.za</a> to expedite processing.
            </p>

             {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <Button
              onClick={handlePlaceOrder}
              variant="primary"
              className="w-full md:w-auto"
              disabled={loading || cartItems.length === 0 || !shippingAddress}
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </Button>
             <p className="text-xs text-text-light mt-4">By placing your order, you agree to our Terms of Service and Policies.</p>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1 bg-white p-6 border border-border-light rounded shadow-sm h-fit sticky top-24 font-poppins"> {/* Added font-poppins */}
             <h3 className="text-xl font-semibold mb-4 border-b pb-3">Order Summary</h3>
             {/* Cart Items Mini-List */}
             <div className="space-y-3 max-h-60 overflow-y-auto mb-4 pr-2">
                 {cartItems.map(item => (
                     <div key={`${item.productId}-${item.size || 'no-size'}`} className="flex items-center gap-3 text-sm border-b border-border-light pb-2 last:border-b-0">
                         <img src={item.image || '/Mopres_Gold_luxury_lifestyle_logo.png'} alt={item.name} className="w-10 h-10 object-cover rounded flex-shrink-0"/>
                         <div className="flex-grow">
                             <p className="font-medium truncate">{item.name} {item.size ? `(${item.size})` : ''}</p>
                             <p className="text-xs text-text-light">Qty: {item.quantity}</p>
                         </div>
                         <span className="font-medium flex-shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                     </div>
                 ))}
             </div>
             {/* Totals */}
             <div className="space-y-3 text-sm pt-3 border-t">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(cartTotal)}</span>
                </div>
                 <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? 'Free' : formatCurrency(shippingCost)}</span>
                </div>
                 <div className="flex justify-between font-semibold text-base pt-3 border-t mt-3">
                    <span>Total</span>
                    <span>{formatCurrency(orderTotal)}</span>
                </div>
             </div>
             <Link href="/checkout/delivery" className="text-sm text-brand-gold hover:underline mt-6 inline-block">
                &larr; Back to Delivery
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
