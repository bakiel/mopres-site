'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import next/image
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import SectionTitle from '@/components/SectionTitle';
import { useCartStore } from '@/store/cartStore';
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowserClient'; // Import client creator
import { getProductImageUrl } from '@/lib/supabaseClient';

// Simple Loading Overlay Component
const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
    {/* Simple CSS Spinner */}
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mb-4"></div>
    <p className="text-white text-lg font-semibold font-poppins">Processing your order, please wait...</p>
  </div>
);

// Error Dialog Component
const ErrorDialog = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <h3 className="text-lg font-semibold text-red-600 mb-3 font-montserrat">Checkout Error</h3>
      <p className="text-text-dark mb-4">{message}</p>
      <div className="flex justify-between">
        <Link href="/account/register" className="px-4 py-2 bg-brand-gold text-white rounded hover:bg-brand-gold-dark">
          Register
        </Link>
        <Link href="/account/login" className="px-4 py-2 bg-brand-gold text-white rounded hover:bg-brand-gold-dark">
          Login
        </Link>
        <button 
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

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
  const supabase = createSupabaseBrowserClient(); // Create client instance
  const { items: cartItems, getTotalPrice, clearCart } = useCartStore();
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null); // State to hold delivery info
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // State to track client-side mount
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // New state for error message

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

     // Redirect if cart is empty (check again on this page)
     if (cartItems.length === 0) {
        router.replace('/checkout/cart');
     }

  }, [cartItems, router]);

  // Effect to set isMounted to true after component mounts on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
  };

  const subtotal = getTotalPrice();
  // TODO: Calculate final shipping based on actual address/method if needed
  const shippingCost = subtotal >= 2000 ? 0 : 150; // Use same logic as sidebar for now
  const totalAmount = subtotal + shippingCost;

  const handlePlaceOrder = async () => {
    // Validation check
    if (!deliveryInfo || cartItems.length === 0) {
        alert('Missing required information to place the order.');
        // Don't set isLoading true if validation fails before starting
        return;
    }

    setIsLoading(true); // Set loading state *before* starting async operations
    console.log("handlePlaceOrder: Loading state set to true."); // Added log

    try {
        // 1. Get current user
        console.log("handlePlaceOrder: Attempting to get current session...");
        const sessionResponse = await supabase.auth.getSession();
        console.log("handlePlaceOrder: supabase.auth.getSession() response:", JSON.stringify(sessionResponse, null, 2));

        if (sessionResponse.error) {
          console.error("handlePlaceOrder: Error getting session:", sessionResponse.error);
        }
        if (!sessionResponse.data.session) {
          console.warn("handlePlaceOrder: No active session found by getSession().");
        } else {
          console.log("handlePlaceOrder: Active session found by getSession(). User ID:", sessionResponse.data.session.user.id);
        }

        console.log("handlePlaceOrder: Attempting supabase.auth.getUser()...");
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        console.log("handlePlaceOrder: supabase.auth.getUser() result - user:", JSON.stringify(user, null, 2));
        console.log("handlePlaceOrder: supabase.auth.getUser() result - userError:", JSON.stringify(userError, null, 2));

        if (userError || !user) {
          console.error("handlePlaceOrder: Critical - getUser() failed or returned no user.", { userError, user });
          throw new Error(userError?.message || 'Please register or log in before checkout. You need to create an account to complete your purchase.');
        }

        // Generate a new order reference *before* creating the order data
        const newOrderRef = `MP-${Date.now().toString().slice(-6)}`;
        console.log(`Generated Order Reference for insert: ${newOrderRef}`);

        // 2. Create order in Supabase 'orders' table
        const orderData = {
            user_id: user.id,
            order_ref: newOrderRef, // Use the newly generated ref here
            total_amount: totalAmount,
            shipping_fee: shippingCost,
            status: 'pending_payment', // Initial status
            shipping_address: deliveryInfo, // Store the whole object as JSONB
            customer_email: deliveryInfo.email,
            customer_name: `${deliveryInfo.firstName} ${deliveryInfo.lastName}`,
            // Add other relevant fields if needed, e.g., payment_method: 'EFT'
        };

        console.log("handlePlaceOrder: Attempting to insert into 'orders' table:", orderData); // Added log
        // 2. Create order in Supabase 'orders' table (removed logs)
        const { data: newOrder, error: orderError } = await supabase
            .from('orders')
            .insert(orderData)
            .select()
            .single(); // Use single() if you expect one row back

        // DEBUG LOG: Show raw result of orders insert
        console.log("DEBUG: Raw orders insert result - newOrder object:", newOrder, "orderError object:", orderError);

        if (orderError || !newOrder) {
            // Log the detailed error before throwing
            console.error('Supabase order insert error (raw object):', orderError); // This is the critical log
            // Attempt to stringify the error for more details, handling cases where it might be null
            if (orderError) {
                try {
                    console.error('Supabase order insert error DETAILS (stringified):', JSON.stringify(orderError, Object.getOwnPropertyNames(orderError), 2));
                } catch (e) {
                    console.error('Supabase order insert error DETAILS (stringification failed):', orderError);
                }
            } else if (!newOrder) {
                console.error('Supabase order insert issue: newOrder is null/undefined, but no explicit orderError received.');
            }
            throw new Error(orderError?.message || 'Failed to create order record. Check browser console for "Supabase order insert error" details.');
        }
 
        console.log("handlePlaceOrder: Successfully inserted into 'orders' table (newOrder object):", newOrder); // Clarified log

        // 3. Create corresponding 'order_items' in Supabase (removed logs)
        const orderItemsData = cartItems.map(item => ({
            order_id: newOrder.id, // Link to the created order
            product_id: item.productId,
            quantity: item.quantity,
            price: item.price, // Price at the time of order
            size: item.size,
            // Add product_name, image_url if needed for easier display later
            name: item.name, // Added for DB constraint
            product_name: item.name,
            sku: item.sku,
            product_sku: item.sku, // Added for DB constraint
        }));

        console.log("handlePlaceOrder: Attempting to insert into 'order_items' table:", orderItemsData); // Added log
        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItemsData);

        if (itemsError) {
             // Log the detailed error before throwing
            console.error('Supabase order items insert error:', itemsError);
            // Attempt to delete the created order if items fail
            // Consider more robust error handling/rollback logic here
            try {
                await supabase.from('orders').delete().match({ id: newOrder.id });
            } catch (cleanupError) {
                console.error('Failed to cleanup order after items insert failed:', cleanupError);
            }
            throw new Error(itemsError.message || 'Failed to save order items.');
        }

        console.log("handlePlaceOrder: Successfully inserted into 'order_items' table."); // Added log

        // If we reach here, both inserts were successful

        // 4. Clear the cart
        console.log("handlePlaceOrder: Attempting to clear cart."); // Added log
        // clearCart(); // Removed as per user feedback - cart should be cleared on confirmation page

        // 5. Redirect to confirmation page
        console.log(`handlePlaceOrder: Attempting to navigate to confirmation page with orderRef: ${newOrderRef}`); // Use newOrderRef
        router.push(`/checkout/confirmation?orderRef=${newOrderRef}`); // Use newOrderRef

        // Note: setIsLoading(false) is handled in the finally block

    } catch (error) {
        console.error("Order placement error:", error); // Log the full error object
        
        // Check if the error is related to authentication
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        
        if (errorMessage.includes('register') || errorMessage.includes('log in') || errorMessage.includes('Auth session')) {
            // Set error message for auth errors
            setErrorMessage('You need to be logged in to complete checkout. Please register or log in to continue with your purchase.');
        } else {
            // For other errors
            setErrorMessage(`Error placing order: ${errorMessage}`);
        }
        
        // isLoading state is handled in finally block
    } finally {
        // This block executes regardless of success or failure in try/catch
        console.log("handlePlaceOrder: Reached finally block."); // Added log
        setIsLoading(false);
    }
  };

  return (
    <div className="bg-background-body py-12 lg:py-20 relative"> {/* Added relative for potential absolute children if needed, though overlay is fixed */}
      {/* Conditionally render the loading overlay */}
      {isLoading && <LoadingOverlay />}
      
      {/* Conditionally render the error dialog */}
      {errorMessage && <ErrorDialog message={errorMessage} onClose={() => setErrorMessage(null)} />}

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
              
              {/* Account Required Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-sm text-blue-800">
                <p className="font-medium">Account Required</p>
                <p>You must be logged in to complete your purchase. If you don't have an account yet, you'll be prompted to register when placing your order.</p>
              </div>
              
              <div className="border border-border-light rounded p-4 bg-white shadow-sm">
                <p className="font-medium text-text-dark mb-2">EFT / Bank Deposit</p>
                <p className="text-sm text-text-light mb-4">
                  Please use the generated reference number when making your payment. Your order will be processed once payment is confirmed.
                </p>
                <div className="bg-gray-50 p-3 rounded border border-dashed border-gray-300 space-y-1 text-sm">
                   <p><span className="font-medium">Bank:</span> FNB</p>
                   <p><span className="font-medium">Account Name:</span> MoPres (Pty) Ltd</p>
                   <p><span className="font-medium">Account Number:</span> 62876543210</p>
                   <p><span className="font-medium">Branch Code:</span> 250655</p>
                   <p><span className="font-medium">Reference:</span> <strong className="text-brand-gold">Provided after order placement</strong></p>
                </div>
                 <p className="text-xs text-text-light mt-3">
                    Send proof of payment to <a href="mailto:info@mopres.co.za" className="text-blue-600 hover:underline">info@mopres.co.za</a> to speed up processing.
                 </p>
              </div>
            </div>

             <div className="flex justify-between items-center mt-8">
                 <Link href="/checkout/delivery" className="text-sm text-brand-gold hover:underline">
                    &larr; Return to Delivery
                 </Link>
                <Button onClick={handlePlaceOrder} variant="primary" disabled={isLoading || !deliveryInfo}>
                    {isLoading
                        ? 'Placing Order...'
                        : isMounted // Only show price after client mount
                        ? `Place Order (${formatCurrency(totalAmount)})`
                        : 'Place Order' // Placeholder during SSR/initial render
                    }
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
                                         src={getProductImageUrl(supabase, item.image)} // Pass supabase instance
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
                         <span className="font-medium">{isMounted ? formatCurrency(subtotal) : 'R 0.00'}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                         <span className="text-text-light">Shipping</span>
                         <span className="font-medium">
                            {isMounted ? (shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)) : 'Calculating...'}
                         </span>
                     </div>
                     <div className="flex justify-between font-semibold text-base border-t pt-2 mt-2">
                         <span>Total</span>
                         <span>{isMounted ? formatCurrency(totalAmount) : 'R 0.00'}</span>
                     </div>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
}
