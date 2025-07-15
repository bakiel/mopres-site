'use client';

import React from 'react';
import Link from 'next/link';
import { BRAND } from '@/utils/brand';

export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">MoPres Client Portal</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Link 
                href="/client-portal" 
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link 
                href="/client-portal/products" 
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Products
              </Link>
              <Link 
                href="/client-portal/orders" 
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Orders
              </Link>
              <Link 
                href="/client-portal/messages" 
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Messages
              </Link>
              <Link 
                href="/" 
                className={`px-4 py-2 text-sm font-medium ${BRAND.button.secondary} rounded-md`}
              >
                View Store
              </Link>
              <button
                onClick={() => {
                  document.cookie = 'clientPortalAuth=; path=/; max-age=0';
                  window.location.href = '/client-portal/login';
                }}
                className="ml-4 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}