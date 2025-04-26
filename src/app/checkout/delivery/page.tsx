'use client'; // Needs client-side state for form inputs

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import SectionTitle from '@/components/SectionTitle';
import { getCartTotal } from '@/lib/cartUtils'; // Import cart total for shipping calculation

// Define type for address (can be expanded)
type ShippingAddress = {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string; // Default to South Africa?
  phone: string;
};

export default function DeliveryPage() {
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: '',
    addressLine1: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'South Africa', // Default
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Calculate shipping cost based on cart total
  const cartTotal = getCartTotal(); // Fetch cart total
  const shippingCost = cartTotal >= 2000 ? 0 : 150; // R150 standard, free over R2000
  const orderTotal = cartTotal + shippingCost;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    console.log("Shipping Address Submitted:", address);

    // TODO: Validate address fields
    // TODO: Store address info (e.g., in localStorage or context) for next step
    // For now, just simulate success and navigate to payment
    setTimeout(() => {
        // Store address in localStorage temporarily (refine later)
        if (typeof window !== 'undefined') {
            localStorage.setItem('shippingAddress', JSON.stringify(address));
        }
        router.push('/checkout/payment');
        setLoading(false);
    }, 1000);
  };

   const formatCurrency = (amount: number) => {
     return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
   }

  return (
    <div className="bg-background-body py-12 lg:py-20">
      <div className="w-full max-w-screen-lg mx-auto px-4">
        <SectionTitle centered>Delivery Information</SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mt-8 font-poppins"> {/* Added font-poppins */}
          {/* Shipping Form */}
          <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6 bg-white p-6 md:p-8 border border-border-light rounded shadow-sm">
            <h3 className="text-xl font-semibold mb-6">Shipping Address</h3>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            {/* Form Fields */}
            <div>
              <label htmlFor="fullName" className="block mb-2 font-medium text-sm text-text-dark">Full Name</label>
              <input type="text" id="fullName" name="fullName" required value={address.fullName} onChange={handleInputChange} className="w-full py-3 px-4 border border-border-light bg-white text-base rounded-sm transition-colors duration-300 ease-in-out focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 placeholder:text-gray-400 placeholder:font-light" placeholder="John Doe" /> {/* Applied input styles directly */}
            </div>
            <div>
              <label htmlFor="addressLine1" className="block mb-2 font-medium text-sm text-text-dark">Address Line 1</label>
              <input type="text" id="addressLine1" name="addressLine1" required value={address.addressLine1} onChange={handleInputChange} className="w-full py-3 px-4 border border-border-light bg-white text-base rounded-sm transition-colors duration-300 ease-in-out focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 placeholder:text-gray-400 placeholder:font-light" placeholder="Street address, P.O. box, company name, c/o" /> {/* Applied input styles directly */}
            </div>
             <div>
              <label htmlFor="addressLine2" className="block mb-2 font-medium text-sm text-text-dark">Address Line 2 (Optional)</label>
              <input type="text" id="addressLine2" name="addressLine2" value={address.addressLine2 || ''} onChange={handleInputChange} className="w-full py-3 px-4 border border-border-light bg-white text-base rounded-sm transition-colors duration-300 ease-in-out focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 placeholder:text-gray-400 placeholder:font-light" placeholder="Apartment, suite, unit, building, floor, etc." /> {/* Applied input styles directly */}
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="city" className="block mb-2 font-medium text-sm text-text-dark">City</label>
                    <input type="text" id="city" name="city" required value={address.city} onChange={handleInputChange} className="w-full py-3 px-4 border border-border-light bg-white text-base rounded-sm transition-colors duration-300 ease-in-out focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 placeholder:text-gray-400 placeholder:font-light" placeholder="e.g. Centurion" /> {/* Applied input styles directly */}
                 </div>
                 <div>
                    <label htmlFor="province" className="block mb-2 font-medium text-sm text-text-dark">Province</label>
                    {/* Consider using a select dropdown for provinces */}
                    <input type="text" id="province" name="province" required value={address.province} onChange={handleInputChange} className="w-full py-3 px-4 border border-border-light bg-white text-base rounded-sm transition-colors duration-300 ease-in-out focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 placeholder:text-gray-400 placeholder:font-light" placeholder="e.g. Gauteng" /> {/* Applied input styles directly */}
                 </div>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="postalCode" className="block mb-2 font-medium text-sm text-text-dark">Postal Code</label>
                    <input type="text" id="postalCode" name="postalCode" required value={address.postalCode} onChange={handleInputChange} className="w-full py-3 px-4 border border-border-light bg-white text-base rounded-sm transition-colors duration-300 ease-in-out focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 placeholder:text-gray-400 placeholder:font-light" placeholder="e.g. 0157" /> {/* Applied input styles directly */}
                 </div>
                 <div>
                    <label htmlFor="country" className="block mb-2 font-medium text-sm text-text-dark">Country</label>
                    <input type="text" id="country" name="country" required value={address.country} onChange={handleInputChange} className="w-full py-3 px-4 border border-border-light bg-white text-base rounded-sm transition-colors duration-300 ease-in-out focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 placeholder:text-gray-400 placeholder:font-light bg-gray-100" readOnly /> {/* Applied input styles directly */} {/* Readonly for now */}
                 </div>
             </div>
             <div>
                <label htmlFor="phone" className="block mb-2 font-medium text-sm text-text-dark">Phone Number</label>
                <input type="tel" id="phone" name="phone" required value={address.phone} onChange={handleInputChange} className="w-full py-3 px-4 border border-border-light bg-white text-base rounded-sm transition-colors duration-300 ease-in-out focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 placeholder:text-gray-400 placeholder:font-light" placeholder="For delivery updates" /> {/* Applied input styles directly */}
             </div>

            <div className="pt-4">
              <Button type="submit" variant="primary" className="w-full md:w-auto" disabled={loading}>
                {loading ? 'Saving...' : 'Continue to Payment'}
              </Button>
            </div>
          </form>

          {/* Order Summary */}
          <div className="md:col-span-1 bg-white p-6 border border-border-light rounded shadow-sm h-fit sticky top-24 font-poppins"> {/* Added font-poppins */}
             <h3 className="text-xl font-semibold mb-4 border-b pb-3">Order Summary</h3>
             <div className="space-y-3 text-sm">
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
             <p className="text-xs text-text-light mt-4">Shipping costs calculated at checkout.</p>
             <Link href="/checkout/cart" className="text-sm text-brand-gold hover:underline mt-6 inline-block">
                &larr; Back to Cart
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper style for input fields (can be moved to globals.css)
// Add this to your globals.css or use Tailwind @apply if preferred:
/*
.input-field {
  @apply py-3 px-4 border border-border-light bg-white font-poppins text-base rounded-sm transition-colors duration-300 ease-in-out focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/15 placeholder:text-gray-400 placeholder:font-light;
}
*/
