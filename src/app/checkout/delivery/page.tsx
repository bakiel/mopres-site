'use client';

import React, { useState, useEffect } from 'react'; // Import useEffect
import Link from 'next/link';
import Image from 'next/image'; // Import next/image
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient, getProductImageUrl } from '@/lib/supabaseClient'; // Import image helper and client creator
import Button from '@/components/Button';
import SectionTitle from '@/components/SectionTitle';
import { useCartStore } from '@/store/cartStore'; // Import cart store if needed for summary

// Define types for form data
interface DeliveryFormData {
  email: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string; // Default or select
  phone?: string;
}

export default function DeliveryPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient(); // Create client instance
  const { items: cartItems, getTotalPrice } = useCartStore(); // Get cart items for summary/guard
  const [formData, setFormData] = useState<DeliveryFormData>({
    email: '',
    firstName: '',
    lastName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'South Africa', // Default
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      router.replace('/checkout/cart'); // Redirect to cart if empty
    }
  }, [cartItems, router]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Validate form data
    // TODO: Save delivery info (e.g., in localStorage, state management, or backend if creating order draft)
    console.log('Delivery Info:', formData);
    // Simulate saving delay
    setTimeout(() => {
      setIsLoading(false);
      router.push('/checkout/payment'); // Navigate to the next step
    }, 1000);
  };

   const formatCurrency = (amount: number) => {
     return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
   }

  // Basic form structure - styling and layout can be improved
  return (
    <div className="bg-background-body py-12 lg:py-20">
      <div className="w-full max-w-screen-md mx-auto px-4"> {/* Centered container */}
        <SectionTitle centered>Checkout - Delivery</SectionTitle>

        {/* Checkout Steps Indicator (Optional) */}
        <div className="flex justify-center space-x-2 my-8 text-sm font-poppins items-center"> {/* Reduced space, added items-center */}
            <Link href="/checkout/cart" className="text-text-light hover:text-brand-gold">Cart</Link>
            <span className="text-gray-400">/</span> {/* Use slash as separator */}
            <span className="font-semibold text-text-dark">Delivery</span>
            <span className="text-gray-400">/</span>
            <span className="text-text-light">Payment</span>
            <span className="text-gray-400">/</span>
            <span className="text-text-light">Confirmation</span>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Delivery Form */}
            <form onSubmit={handleSubmit} className="space-y-6 font-poppins">
                {/* Contact Info */}
                <div>
                    <h3 className="text-lg font-semibold mb-3 font-montserrat">Contact Information</h3>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="you@example.com"
                        className="w-full p-2 border border-border-light rounded focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold"
                    />
                </div>

                 {/* Shipping Address */}
                 <div>
                    <h3 className="text-lg font-semibold mb-3 font-montserrat">Shipping Address</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required className="w-full p-2 border border-border-light rounded focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold" />
                        </div>
                         <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required className="w-full p-2 border border-border-light rounded focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold" />
                        </div>
                    </div>
                     <div className="mt-4">
                        <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input type="text" id="addressLine1" name="addressLine1" placeholder="Street address" value={formData.addressLine1} onChange={handleInputChange} required className="w-full p-2 border border-border-light rounded focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold" />
                    </div>
                     <div className="mt-4">
                        <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">Apartment, suite, etc. (Optional)</label>
                        <input type="text" id="addressLine2" name="addressLine2" value={formData.addressLine2 || ''} onChange={handleInputChange} className="w-full p-2 border border-border-light rounded focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold" />
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                         <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <input type="text" id="city" name="city" value={formData.city} onChange={handleInputChange} required className="w-full p-2 border border-border-light rounded focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold" />
                        </div>
                         <div>
                            <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                            {/* Consider making this a dropdown */}
                            <input type="text" id="province" name="province" value={formData.province} onChange={handleInputChange} required className="w-full p-2 border border-border-light rounded focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold" />
                        </div>
                         <div>
                            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                            <input type="text" id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleInputChange} required className="w-full p-2 border border-border-light rounded focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold" />
                        </div>
                    </div>
                     <div className="mt-4">
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country/Region</label>
                        <select id="country" name="country" value={formData.country} onChange={handleInputChange} required className="w-full p-2 border border-border-light rounded bg-white focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold">
                            <option>South Africa</option>
                            {/* Add other countries if needed */}
                        </select>
                    </div>
                     <div className="mt-4">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                        <input type="tel" id="phone" name="phone" value={formData.phone || ''} onChange={handleInputChange} placeholder="For delivery updates" className="w-full p-2 border border-border-light rounded focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold" />
                    </div>
                 </div>

                <div className="flex justify-between items-center mt-8">
                     <Link href="/checkout/cart" className="text-sm text-brand-gold hover:underline">
                        &larr; Return to Cart
                     </Link>
                    <Button type="submit" variant="primary" disabled={isLoading}>
                        {isLoading ? 'Processing...' : 'Continue to Payment'}
                    </Button>
                </div>
            </form>

            {/* Order Summary (Optional - can be a separate component) */}
            <div className="bg-white p-6 border border-border-light rounded shadow-sm h-fit sticky top-[130px]"> {/* Sticky summary */}
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
                         <span className="font-medium">{formatCurrency(getTotalPrice())}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                         <span className="text-text-light">Shipping</span>
                         <span className="text-xs text-text-light">Calculated at next step</span>
                     </div>
                     {/* <div className="flex justify-between font-semibold text-base border-t pt-2 mt-2">
                         <span>Total</span>
                         <span>{formatCurrency(getTotalPrice())}</span>
                     </div> */}
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
}
