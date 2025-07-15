'use client';

import React from 'react';
import Image from 'next/image';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header with MoPres branding */}
        <div className="bg-amber-600 p-8 text-center">
          <div className="flex justify-center mb-4">
            <Image 
              src="/logo.png" 
              alt="MoPres Fashion"
              width={200}
              height={80}
              className="brightness-0 invert"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-white">System Maintenance</h1>
        </div>

        {/* Content */}
        <div className="p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              We're Updating Our Systems
            </h2>
            
            <p className="text-gray-600 text-lg leading-relaxed">
              Dear Valued Client,
            </p>
            
            <p className="text-gray-600 leading-relaxed">
              We're currently performing essential updates to enhance your admin portal experience. 
              Our team is working diligently to ensure everything runs smoothly for you.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 my-6">
              <p className="text-amber-800 font-medium">
                Expected completion: Tomorrow morning
              </p>
              <p className="text-amber-700 text-sm mt-2">
                Your store remains fully operational during this time
              </p>
            </div>

            <p className="text-gray-600">
              We sincerely apologize for any inconvenience. If you need immediate assistance, 
              please don't hesitate to contact our support team.
            </p>
          </div>

          {/* Contact Information */}
          <div className="border-t pt-6 mt-8">
            <p className="text-gray-500 text-sm">
              Need help? Contact us at{' '}
              <a href="mailto:support@mopres.co.za" className="text-amber-600 hover:underline">
                support@mopres.co.za
              </a>
            </p>
          </div>

          {/* Progress indicator */}
          <div className="mt-8">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}