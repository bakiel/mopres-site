'use client'; // Add client directive for potential future interactivity like toggle

import React, { useState } from 'react';
import SectionTitle from '@/components/SectionTitle';
import Link from 'next/link';

export default function SizingGuidePage() {
  // Data extracted from the provided size-guide.html content
  const womensSizes = [
    { za_uk: 3, eu: 36, us: 5, cm: 22.8 }, // Adjusted EU/US based on common charts, original HTML had inconsistencies
    { za_uk: 4, eu: 37, us: 6, cm: 23.5 },
    { za_uk: 5, eu: 38, us: 7, cm: 24.1 },
    { za_uk: 6, eu: 39, us: 8, cm: 24.8 },
    { za_uk: 7, eu: 40, us: 9, cm: 25.4 },
    { za_uk: 8, eu: 41, us: 10, cm: 26.0 },
    { za_uk: 9, eu: 42, us: 11, cm: 26.7 },
    { za_uk: 10, eu: 43, us: 12, cm: 27.3 },
  ];

  const mensSizes = [
    { za_uk: 6, eu: 40, us: 7, cm: 25.4 },
    { za_uk: 7, eu: 41, us: 8, cm: 26.0 },
    { za_uk: 8, eu: 42, us: 9, cm: 26.7 },
    { za_uk: 9, eu: 43, us: 10, cm: 27.3 },
    { za_uk: 10, eu: 44, us: 11, cm: 27.9 },
    { za_uk: 11, eu: 45, us: 12, cm: 28.6 },
    { za_uk: 12, eu: 46, us: 13, cm: 29.2 },
  ];

  // Note: Children's sizes might not be relevant for MoPres, but included from HTML
  const childrensSizes = [
    { za_uk: 7, eu: 24, cm: 15.6 },
    { za_uk: 8, eu: 25, cm: 16.2 },
    { za_uk: 9, eu: 27, cm: 16.8 },
    { za_uk: 10, eu: 28, cm: 17.5 },
    { za_uk: 11, eu: 29, cm: 18.1 },
    { za_uk: 12, eu: 30, cm: 18.7 },
    { za_uk: 13, eu: 31, cm: 19.4 },
    { za_uk: 1, eu: 32, cm: 20.0 }, // Size restarts
    { za_uk: 2, eu: 34, cm: 21.0 },
  ];

  return (
    <div className="bg-background-body py-12 lg:py-20">
      <div className="w-full max-w-screen-lg mx-auto px-4">
        <SectionTitle centered>Sizing Guide</SectionTitle>

        {/* Using prose for basic text styling, customize further if needed */}
        <div className="prose prose-lg max-w-4xl mx-auto text-text-light mt-8 font-poppins"> {/* Added font-poppins */}
          <p className="lead">
            Finding the perfect fit is essential for enjoying your MoPres luxury footwear. In South Africa, most shoe sizes follow the UK sizing system, though European (EU) sizes are also commonly used. This guide will help you find your perfect fit.
          </p>

          <h2 className="font-semibold text-text-dark !mt-10 !mb-4">Size Conversion Charts</h2>
          <p>
            Use these charts to convert between South African (UK), European (EU), US sizing systems, and foot length measurements.
          </p>

          {/* Charts container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-8">
            {/* Women's Chart */}
            <div>
              <h3 className="font-medium text-brand-gold !text-lg !mb-3">Women's Shoe Sizes</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">ZA/UK</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">EU</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">US</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-600">Foot (cm)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {womensSizes.map((size) => (
                      <tr key={`w-${size.eu}`}>
                        <td className="px-4 py-2 whitespace-nowrap">{size.za_uk}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{size.eu}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{size.us}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{size.cm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
               <p className="text-xs italic mt-2">Most MoPres women's styles are available in sizes 3-10 (ZA/UK).</p>
            </div>

            {/* Men's Chart (Include if MoPres offers men's shoes) */}
            {/* Uncomment if needed
            <div>
              <h3 className="font-medium text-brand-gold !text-lg !mb-3">Men's Shoe Sizes</h3>
              <div className="overflow-x-auto">
                 <table className="min-w-full text-sm">
                   <thead className="bg-gray-100">
                     <tr>
                       <th className="px-4 py-2 text-left font-medium text-gray-600">ZA/UK</th>
                       <th className="px-4 py-2 text-left font-medium text-gray-600">EU</th>
                       <th className="px-4 py-2 text-left font-medium text-gray-600">US</th>
                       <th className="px-4 py-2 text-left font-medium text-gray-600">Foot (cm)</th>
                     </tr>
                   </thead>
                   <tbody className="bg-white divide-y divide-gray-200">
                     {mensSizes.map((size) => (
                       <tr key={`m-${size.eu}`}>
                         <td className="px-4 py-2 whitespace-nowrap">{size.za_uk}</td>
                         <td className="px-4 py-2 whitespace-nowrap">{size.eu}</td>
                         <td className="px-4 py-2 whitespace-nowrap">{size.cm}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
              </div>
               <p className="text-xs italic mt-2">Most MoPres men's styles are available in sizes 6-12 (ZA/UK).</p>
            </div>
            */}
          </div>

           <div className="bg-yellow-50 border-l-4 border-brand-gold p-4 my-6" role="alert">
                <p className="font-bold text-brand-gold">Sizing Tip</p>
                <p className="text-sm">South African shoe sizes traditionally follow the UK system. If you're used to European sizes, remember that EU sizes are typically 33 numbers higher than the corresponding UK size for adults (e.g., UK 5 = EU 38).</p>
            </div>


          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 my-8">
            <h2 className="font-semibold text-text-dark !mt-0 !mb-4">How to Measure Your Feet</h2>
            <p>For the most accurate size, measure your feet at home following these steps:</p>
            <ol className="list-decimal list-inside space-y-2 mb-4">
              <li>Place a piece of paper on a hard floor against a wall.</li>
              <li>Stand on the paper with your heel firmly against the wall.</li>
              <li>Mark the furthest point of your longest toe on the paper.</li>
              <li>Measure the distance from the wall edge of the paper to the mark in centimetres (cm).</li>
              <li>Use the charts above to find your corresponding size based on the foot length.</li>
            </ol>
             <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4" role="alert">
                <p className="font-bold text-blue-700">Important Notes</p>
                <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                  <li>Measure both feet, as they may be different sizes. Use the larger measurement.</li>
                  <li>Measure your feet in the evening when they are typically at their largest.</li>
                  <li>If you are between sizes, we generally recommend choosing the larger size, especially for closed-toe styles.</li>
                  <li>Consider the style of shoe - pointed toes may fit more snugly than open sandals.</li>
                   <li>This guide provides general recommendations. Fit can vary based on foot width and personal preference.</li>
                </ul>
              </div>
          </div>

          <h2 className="font-semibold text-text-dark !mt-10 !mb-4">Still Unsure?</h2>
          <p>
            If you're still uncertain about your size or have questions about a specific style, please don't hesitate to <Link href="/contact" className="text-brand-gold hover:underline">contact our customer service team</Link> for personalised sizing advice.
          </p>
        </div>
      </div>
    </div>
  );
}
