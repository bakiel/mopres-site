"use client";
import React, { FC } from 'react';
import Link from 'next/link';
import Button from './Button'; // Corrected path assuming Button is in the same dir or adjust as needed
import NewsletterSignup from './NewsletterSignup'; // Import the new component


const Footer: FC = () => { // Type Footer as FC
  // Calculate year directly
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-black text-[#a0a0a0] pt-16 lg:pt-24 pb-8 lg:pb-12 text-sm">
      {/* Using a simple container div for now. Replace with Tailwind container class if defined globally */}
      <div className="w-full max-w-screen-xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Footer About */}
          <div className="footer-about text-center sm:text-left">
            <div className="footer-logo mb-5 inline-block sm:block">
              {/* Ensure the image path is correct or use an absolute URL */}
              <img src="/Gold-letter-Mopres-logo-favicon.png" alt="MoPres Logo" className="h-[45px] mx-auto sm:mx-0" />
            </div>
            <p className="text-[#888] leading-relaxed">Contemporary Luxury Lifestyle Footwear. Crafted with passion in South Africa.</p>
          </div>

          {/* Footer Links - Shop */}
          <div className="footer-links text-center sm:text-left">
            <h4 className="text-white font-medium tracking-wide mb-6">Shop</h4>
            <ul className="space-y-3">
              <li><Link href="/shop" className="text-[#a0a0a0] hover:text-white">All Collections</Link></li>
              <li><Link href="/shop/collections/red-showstoppers" className="text-[#a0a0a0] hover:text-white">Red Showstoppers</Link></li>
              <li><Link href="/shop/collections/black-essentials" className="text-[#a0a0a0] hover:text-white">Black Essentials</Link></li>
              <li><Link href="/preorder" className="text-[#a0a0a0] hover:text-white">Preorder</Link></li>
            </ul>
          </div>

          {/* Footer Links - Information */}
          <div className="footer-links text-center sm:text-left">
            <h4 className="text-white font-medium tracking-wide mb-6">Information</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-[#a0a0a0] hover:text-white">About Us</Link></li>
              <li><Link href="/contact" className="text-[#a0a0a0] hover:text-white">Contact Us</Link></li>
              <li><Link href="/account" className="text-[#a0a0a0] hover:text-white">My Account</Link></li>
              <li><Link href="/policies/shipping" className="text-[#a0a0a0] hover:text-white">Shipping & Returns</Link></li>
              <li><Link href="/policies/privacy" className="text-[#a0a0a0] hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/policies/terms" className="text-[#a0a0a0] hover:text-white">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Footer Newsletter */}
          {/* Footer Newsletter - Replace static form with component */}
          <div className="footer-newsletter text-center sm:text-left lg:col-span-1"> {/* Adjusted grid span if needed */}
             {/* The NewsletterSignup component handles its own title and text */}
             <NewsletterSignup />
          </div>
        </div>

        {/* Copyright */}
        <div className="copyright text-[#777] text-xs border-t border-[#333] pt-10 mt-4 text-center">
          {/* Display the calculated year */}
          <p>&copy; {currentYear} MoPres. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
