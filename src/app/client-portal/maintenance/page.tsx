'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ClientPortalMaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image 
              src="/logo.png" 
              alt="MoPres Fashion"
              width={220}
              height={88}
              className="mx-auto"
              priority
            />
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Decorative header */}
          <div className="h-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600"></div>
          
          <div className="p-12 text-center">
            {/* Icon */}
            <div className="mb-8 relative">
              <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>

            {/* Message */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              System Update in Progress
            </h1>
            
            <div className="max-w-2xl mx-auto space-y-6 text-gray-600">
              <p className="text-lg">
                Dear Valued MoPres Partner,
              </p>
              
              <p className="leading-relaxed">
                We're currently enhancing your admin portal with new features and improvements 
                to provide you with an even better experience. Our team is working around the 
                clock to ensure everything is perfect for you.
              </p>

              {/* Status Box */}
              <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-300 rounded-2xl p-8 my-8">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="text-xl font-semibold text-amber-900">Update Status</h2>
                </div>
                <p className="text-amber-800 font-medium text-lg">
                  Expected Completion: Tomorrow Morning
                </p>
                <p className="text-amber-700 mt-2">
                  Your online store remains fully operational
                </p>
              </div>

              <p className="text-gray-600">
                We apologize for any inconvenience this may cause. Your patience and 
                understanding during this brief maintenance period is greatly appreciated.
              </p>

              {/* Contact Section */}
              <div className="border-t border-gray-200 pt-8 mt-8">
                <p className="font-medium text-gray-700 mb-3">
                  Need immediate assistance?
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a 
                    href="mailto:support@mopres.co.za" 
                    className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email Support
                  </a>
                  <Link 
                    href="/" 
                    className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Visit Store
                  </Link>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 text-sm text-gray-500">
              <p>Thank you for choosing MoPres Fashion</p>
              <p className="mt-1">Excellence in every step</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}