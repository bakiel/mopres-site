'use client';

import React from 'react';
import Link from 'next/link';

export default function SimpleAdmin() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">MoPres Admin</h1>
            <Link href="/admin/logout" className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
              Logout
            </Link>
          </div>
        </div>
      </header>
      
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Products Box */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Products</h2>
              <div className="space-y-3">
                <Link href="/admin/products" className="block bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 text-center">
                  View All Products
                </Link>
                <Link href="/admin/products/new" className="block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-center">
                  Add New Product
                </Link>
              </div>
            </div>
            
            {/* Orders Box */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Orders</h2>
              <div className="space-y-3">
                <Link href="/admin/orders" className="block bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 text-center">
                  View All Orders
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}