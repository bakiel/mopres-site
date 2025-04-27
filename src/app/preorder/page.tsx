'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Define interfaces for size data for better type safety
interface SizeEntry {
  eu: number | string;
  uk: number | string;
  us: number | string;
  cm: number | string;
}

interface SizeCategory {
  title: string;
  sizes: SizeEntry[];
}

const womenSizes: SizeEntry[] = [
  { eu: 35, uk: 2.5, us: 5, cm: 22.4 },
  { eu: 36, uk: 3.5, us: 6, cm: 23.0 },
  { eu: 37, uk: 4, us: 6.5, cm: 23.7 },
  { eu: 38, uk: 5, us: 7.5, cm: 24.4 },
  { eu: 39, uk: 6, us: 8.5, cm: 25.1 },
  { eu: 40, uk: 6.5, us: 9, cm: 25.7 },
  { eu: 41, uk: 7.5, us: 10, cm: 26.4 },
  { eu: 42, uk: 8, us: 10.5, cm: 27.0 },
];

const menSizes: SizeEntry[] = [
  { eu: 40, uk: 6.5, us: 7.5, cm: 25.7 },
  { eu: 41, uk: 7.5, us: 8.5, cm: 26.4 },
  { eu: 42, uk: 8, us: 9, cm: 27.0 },
  { eu: 43, uk: 9, us: 10, cm: 27.7 },
  { eu: 44, uk: 9.5, us: 10.5, cm: 28.3 },
  { eu: 45, uk: 10.5, us: 11.5, cm: 29.0 },
  { eu: 46, uk: 11.5, us: 12.5, cm: 29.7 },
  { eu: 47, uk: 12, us: 13, cm: 30.3 },
];

const childrenSizes: number[] = [28, 29, 30, 31, 32, 33, 34];

const sizeGuideData: SizeCategory[] = [
  { title: "Women's Sizes", sizes: womenSizes },
  { title: "Men's Sizes", sizes: menSizes },
];

function PreorderFormContent() {
  const searchParams = useSearchParams();
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [productName, setProductName] = useState('');
  const [productSKU, setProductSKU] = useState('');

  useEffect(() => {
    const productNameParam = searchParams.get('product');
    const productSKUParam = searchParams.get('sku');

    if (productNameParam) {
      setProductName(decodeURIComponent(productNameParam));
    }
    if (productSKUParam) {
      setProductSKU(decodeURIComponent(productSKUParam));
    }
  }, [searchParams]);

  const toggleSizeGuide = () => {
    setShowSizeGuide(!showSizeGuide);
  };

  return (
    // Use background-light for the page background, text-dark for default text
    <div className="bg-background-light min-h-screen py-10 font-poppins text-text-dark">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header uses brand-black background and brand-white text */}
        <div className="text-center py-5 mb-8 bg-brand-black text-brand-white rounded-md shadow-md">
          <h1 className="text-2xl sm:text-3xl font-semibold m-0">MoPres Out-of-Stock Shoe Order Form</h1>
          <p className="mt-2.5 text-sm sm:text-base">Request notification when your favorite footwear is back in stock</p>
        </div>

        {/* Form container uses brand-white background */}
        <div className="bg-brand-white p-6 sm:p-8 rounded-md shadow-lg">
          {/* Formspree endpoint - verified */}
          <form action="https://formspree.io/f/xnndqwjp" method="POST">
            {/* Honeypot field for spam protection */}
            <input type="text" name="_gotcha" className="absolute left-[-5000px]" aria-hidden="true" tabIndex={-1} autoComplete="off" />

            <div className="mb-5">
              <label htmlFor="fullName" className="block mb-2 font-semibold text-sm sm:text-base text-text-dark">Full Name *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                required
                // Use border-light, focus ring brand-gold
                className="w-full p-2.5 border border-border-light rounded text-base font-inherit focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              />
            </div>

            <div className="mb-5">
              <label htmlFor="email" className="block mb-2 font-semibold text-sm sm:text-base text-text-dark">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full p-2.5 border border-border-light rounded text-base font-inherit focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              />
            </div>

            <div className="mb-5">
              <label htmlFor="phone" className="block mb-2 font-semibold text-sm sm:text-base text-text-dark">Phone Number (for WhatsApp/SMS)</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="e.g. 082 123 4567"
                className="w-full p-2.5 border border-border-light rounded text-base font-inherit focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              />
            </div>

            <div className="mb-5">
              <label htmlFor="productName" className="block mb-2 font-semibold text-sm sm:text-base text-text-dark">Product Name *</label>
              <input
                type="text"
                id="productName"
                name="productName"
                required
                defaultValue={productName} // Use defaultValue for pre-filling uncontrolled component
                className="w-full p-2.5 border border-border-light rounded text-base font-inherit focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              />
            </div>

            <div className="mb-5">
              <label htmlFor="productSKU" className="block mb-2 font-semibold text-sm sm:text-base text-text-dark">Product SKU (if known)</label>
              <input
                type="text"
                id="productSKU"
                name="productSKU"
                defaultValue={productSKU} // Use defaultValue for pre-filling uncontrolled component
                className="w-full p-2.5 border border-border-light rounded text-base font-inherit focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              />
            </div>

            {/* Shoe Size Section */}
            <div className="mb-5">
              <label className="block mb-1 font-semibold text-sm sm:text-base text-text-dark">Shoe Size (EU) *</label>
              {/* Use text-light for note */}
              <span className="text-xs text-text-light mt-1 mb-2.5 italic block">South Africa primarily uses European (EU) sizing</span>

              <button
                type="button" // Prevent form submission
                onClick={toggleSizeGuide}
                 // Use brand-gold for link color
                className="inline-block mb-4 text-brand-gold text-sm underline cursor-pointer hover:text-brand-gold/80"
              >
                {showSizeGuide ? 'Hide' : 'View'} Size Conversion Chart
              </button>

              {showSizeGuide && (
                 // Use border-light for border, background-light for bg
                (<div className="border border-border-light p-4 mb-5 rounded bg-background-light overflow-x-auto">
                  {/* Use brand-gold for header */}
                  <h4 className="text-base font-semibold mb-3 text-brand-gold">Shoe Size Conversion Chart</h4>
                  <table className="w-full border-collapse text-xs sm:text-sm min-w-[450px]">
                    <thead>
                      <tr>
                         {/* Use border-light for table header bg and borders */}
                        <th className="p-1.5 border border-border-light text-center bg-border-light">EU Size</th>
                        <th className="p-1.5 border border-border-light text-center bg-border-light">UK Size</th>
                        <th className="p-1.5 border border-border-light text-center bg-border-light">US Size</th>
                        <th className="p-1.5 border border-border-light text-center bg-border-light">Foot Length (cm)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sizeGuideData.map((category) => (
                        <React.Fragment key={category.title}>
                          <tr>
                            <td colSpan={4} className="p-1.5 border border-gray-300 text-center font-semibold bg-gray-100">{category.title}</td>
                          </tr>
                          {category.sizes.map((size) => (
                            <tr key={`${category.title}-${size.eu}`}>
                              <td className="p-1.5 border border-gray-300 text-center">{size.eu}</td>
                              <td className="p-1.5 border border-gray-300 text-center">{size.uk}</td>
                              <td className="p-1.5 border border-gray-300 text-center">{size.us}</td>
                              <td className="p-1.5 border border-gray-300 text-center">{size.cm}</td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                  {/* Use text-light for note */}
                  <p className="text-xs text-text-light mt-3 italic">Based on South African shoe sizing standards (SANS 606:2012)</p>
                </div>)
              )}

              {/* Women's Sizes */}
              <div className="mb-4">
                 {/* Use brand-gold for header */}
                <h3 className="mb-2.5 text-base text-brand-gold font-semibold">Women's Sizes</h3>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2.5">
                  {womenSizes.map((size) => (
                    <div key={`women-${size.eu}`} className="flex items-center">
                       {/* Use accent-brand-gold for radio */}
                      <input type="radio" id={`size${size.eu}`} name="size" value={`EU ${size.eu}`} className="w-auto mr-1.5 accent-brand-gold" />
                      <label htmlFor={`size${size.eu}`} className="text-sm font-normal">EU {size.eu}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Men's Sizes */}
              <div className="mb-4">
                 {/* Use brand-gold for header */}
                <h3 className="mb-2.5 text-base text-brand-gold font-semibold">Men's Sizes</h3>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2.5">
                  {menSizes.map((size) => (
                    <div key={`men-${size.eu}`} className="flex items-center">
                       {/* Use accent-brand-gold for radio */}
                      <input type="radio" id={`size${size.eu}m`} name="size" value={`EU ${size.eu} (Men)`} className="w-auto mr-1.5 accent-brand-gold" />
                      <label htmlFor={`size${size.eu}m`} className="text-sm font-normal">EU {size.eu}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Children's Sizes */}
              <div className="mb-4">
                 {/* Use brand-gold for header */}
                <h3 className="mb-2.5 text-base text-brand-gold font-semibold">Children's Sizes</h3>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2.5">
                  {childrenSizes.map((size) => (
                    <div key={`child-${size}`} className="flex items-center">
                       {/* Use accent-brand-gold for radio */}
                      <input type="radio" id={`size${size}`} name="size" value={`EU ${size}`} className="w-auto mr-1.5 accent-brand-gold" />
                      <label htmlFor={`size${size}`} className="text-sm font-normal">EU {size}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* ZA Standard Sizes */}
              <div className="mb-4">
                 <h3 className="mb-2.5 text-base text-brand-gold font-semibold">ZA Standard Sizes</h3>
                 <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2.5">
                   {[...Array(12)].map((_, i) => {
                     const size = i + 1;
                     return (
                       <div key={`za-${size}`} className="flex items-center">
                         <input type="radio" id={`sizeZA${size}`} name="size" value={`ZA ${size}`} className="w-auto mr-1.5 accent-brand-gold" />
                         <label htmlFor={`sizeZA${size}`} className="text-sm font-normal">ZA {size}</label>
                       </div>
                     );
                   })}
                 </div>
              </div>

              {/* Other Size Options */}
              <div className="mb-4">
                  {/* Use brand-gold for header */}
                 <h3 className="mb-2.5 text-base text-brand-gold font-semibold">Other Sizing</h3>
                 <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5">
                    <div className="flex items-center">
                       {/* Use accent-brand-gold for radio */}
                      <input type="radio" id="sizeUK" name="size" value="UK Size" className="w-auto mr-1.5 accent-brand-gold" />
                      <label htmlFor="sizeUK" className="text-sm font-normal">UK Size (specify in notes)</label>
                    </div>
                    <div className="flex items-center">
                       {/* Use accent-brand-gold for radio */}
                      <input type="radio" id="sizeUS" name="size" value="US Size" className="w-auto mr-1.5 accent-brand-gold" />
                      <label htmlFor="sizeUS" className="text-sm font-normal">US Size (specify in notes)</label>
                    </div>
                    <div className="flex items-center">
                       {/* Use accent-brand-gold for radio */}
                      <input type="radio" id="sizeOther" name="size" value="Other" className="w-auto mr-1.5 accent-brand-gold" />
                      <label htmlFor="sizeOther" className="text-sm font-normal">Other (specify in notes)</label>
                    </div>
                 </div>
              </div>
            </div>

            <div className="mb-5">
              <label htmlFor="quantity" className="block mb-2 font-semibold text-sm sm:text-base text-text-dark">Quantity Desired *</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min="1"
                defaultValue="1"
                required
                 // Use border-light, focus ring brand-gold
                className="w-full p-2.5 border border-border-light rounded text-base font-inherit focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              />
            </div>

            <div className="mb-5">
              <label htmlFor="additionalInfo" className="block mb-2 font-semibold text-sm sm:text-base text-text-dark">Additional Information</label>
              <textarea
                id="additionalInfo"
                name="additionalInfo"
                rows={4}
                placeholder="Specify any other size requirements, UK/US sizes, or special requests here"
                 // Use border-light, focus ring brand-gold
                className="w-full p-2.5 border border-border-light rounded text-base font-inherit focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              ></textarea>
            </div>

            <div className="mb-5">
              <label htmlFor="notificationPreference" className="block mb-2 font-semibold text-sm sm:text-base text-text-dark">Notification Preference</label>
              <select
                id="notificationPreference"
                name="notificationPreference"
                 // Use border-light, focus ring brand-gold
                className="w-full p-2.5 border border-border-light rounded text-base font-inherit focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent bg-white"
              >
                <option value="Email">Email</option>
                <option value="SMS">SMS</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Both">Email & WhatsApp/SMS</option>
              </select>
            </div>

            <button
              type="submit"
               // Use brand-gold for button bg, brand-black text, hover effect
              className="bg-brand-gold text-brand-black border-none py-3 px-5 text-base font-semibold rounded cursor-pointer transition-colors duration-300 w-full hover:bg-brand-gold/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold"
            >
              Submit Request
            </button>

             {/* Use text-light for note */}
            <p className="text-xs sm:text-sm text-text-light mt-5">* Required fields. By submitting this form, you'll be notified when this item becomes available again. No payment is required at this time.</p>
          </form>
        </div>
      </div>
    </div>
  );
}

// Wrap the component using Suspense for useSearchParams compatibility
export default function PreorderPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PreorderFormContent />
    </Suspense>
  );
}
