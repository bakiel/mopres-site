'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import AdminNavigation from '@/components/admin/navigation/AdminNavigation';
import DashboardAnalytics from '@/components/admin/DashboardAnalytics';
import { BRAND } from '@/utils/brand';

// Dynamically import client-side components
const AdminLogsViewer = dynamic(
  () => import('@/components/admin/AdminLogsViewer'),
  { ssr: false }
);

const AdminSessionKeeper = dynamic(
  () => import('@/components/admin/AdminSessionKeeper'),
  { ssr: false }
);

export default function SimpleAdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSessionKeeper />
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">MoPres Admin Dashboard</h1>
          <div className="flex space-x-4">
            <Link href="/admin/analytics" className={`px-4 py-2 text-sm font-medium ${BRAND.button.primary} rounded-md shadow-sm flex items-center`}>
              <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              Analytics
            </Link>
            <Link href="/" className={`px-4 py-2 text-sm font-medium ${BRAND.button.secondary} rounded-md shadow-sm`}>
              Back to Website
            </Link>
          </div>
        </div>
      </header>
      
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Add Admin Navigation */}
          <AdminNavigation />
          
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-full bg-white p-8">
            <h2 className="text-xl font-semibold mb-6">Quick Links</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Analytics - Prominently featured first */}
              <div className={`${BRAND.bg.light} p-6 rounded-lg shadow-md md:col-span-3 border-l-4 ${BRAND.border.primary} border border-amber-300`}>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics Dashboard</h3>
                    <p className="text-sm text-gray-700 mb-4">
                      View detailed sales, customer, and inventory analytics with interactive charts and reports.
                    </p>
                  </div>
                  <Link href="/admin/analytics" className={`px-4 py-2 ${BRAND.button.primary} rounded-md shadow-sm font-medium`}>
                    Open Analytics
                  </Link>
                </div>
                
                {/* Mini Analytics Summary */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${BRAND.bg.accent} mr-3`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${BRAND.text.primary}`} viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Sales (30d)</div>
                        <div className="text-lg font-semibold text-gray-800">R84,350</div>
                        <div className="text-xs text-green-600">↑ 7.9%</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${BRAND.bg.accent} mr-3`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${BRAND.text.primary}`} viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Orders (30d)</div>
                        <div className="text-lg font-semibold text-gray-800">27</div>
                        <div className="text-xs text-green-600">↑ 8.0%</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${BRAND.bg.accent} mr-3`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${BRAND.text.primary}`} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Top Product</div>
                        <div className="text-md font-semibold text-gray-800">Elegance Heels</div>
                        <div className="text-xs text-gray-600">R37,800 (12 units)</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Analytics Quick Links */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href="/admin/analytics/sales" className="px-3 py-1 bg-white text-amber-800 text-sm font-medium rounded-full border border-amber-300 hover:bg-amber-50">
                    Sales Analytics
                  </Link>
                  <Link href="/admin/analytics/customers" className="px-3 py-1 bg-white text-amber-800 text-sm font-medium rounded-full border border-amber-300 hover:bg-amber-50">
                    Customer Insights
                  </Link>
                  <Link href="/admin/analytics/inventory" className="px-3 py-1 bg-white text-amber-800 text-sm font-medium rounded-full border border-amber-300 hover:bg-amber-50">
                    Inventory Reports
                  </Link>
                  <Link href="/admin/analytics" className="px-3 py-1 bg-white text-amber-800 text-sm font-medium rounded-full border border-amber-300 hover:bg-amber-50">
                    All Reports
                  </Link>
                </div>
              </div>
              
              {/* Products */}
              <div className={`${BRAND.bg.light} p-6 rounded-lg shadow-md border border-amber-300`}>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Products</h3>
                <p className="text-sm text-gray-700 mb-4">Manage your product catalog, inventory, and pricing.</p>
                <div className="mt-4 space-y-2">
                  <Link href="/admin/products" className="block text-sm text-amber-800 font-medium hover:underline">
                    View All Products
                  </Link>
                  <Link href="/admin/products/new" className="block text-sm text-amber-800 font-medium hover:underline">
                    Add New Product
                  </Link>
                </div>
              </div>
              
              {/* Orders */}
              <div className={`${BRAND.bg.light} p-6 rounded-lg shadow-md border border-amber-300`}>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Orders</h3>
                <p className="text-sm text-gray-700 mb-4">View and manage customer orders and fulfillment.</p>
                <div className="mt-4 space-y-2">
                  <Link href="/admin/orders" className="block text-sm text-amber-800 font-medium hover:underline">
                    View All Orders
                  </Link>
                  <Link href="/admin/orders/new" className="block text-sm text-amber-800 font-medium hover:underline">
                    Create New Order
                  </Link>
                </div>
              </div>
              
              {/* Collections */}
              <div className={`${BRAND.bg.light} p-6 rounded-lg shadow-md border border-amber-300`}>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Collections</h3>
                <p className="text-sm text-gray-700 mb-4">Organize products into categories and collections.</p>
                <div className="mt-4 space-y-2">
                  <Link href="/admin/collections" className="block text-sm text-amber-800 font-medium hover:underline">
                    View All Collections
                  </Link>
                  <Link href="/admin/collections/new" className="block text-sm text-amber-800 font-medium hover:underline">
                    Create New Collection
                  </Link>
                </div>
              </div>
              
              {/* Customers */}
              <div className={`${BRAND.bg.light} p-6 rounded-lg shadow-md border border-amber-300`}>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Customers</h3>
                <p className="text-sm text-gray-700 mb-4">View and manage customer accounts and data.</p>
                <div className="mt-4 space-y-2">
                  <Link href="/admin/customers" className="block text-sm text-amber-800 font-medium hover:underline">
                    View All Customers
                  </Link>
                  <Link href="/admin/customers/export" className="block text-sm text-amber-800 font-medium hover:underline">
                    Export Customer Data
                  </Link>
                </div>
              </div>
              
              {/* Content */}
              <div className={`${BRAND.bg.light} p-6 rounded-lg shadow-md border border-amber-300`}>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Content</h3>
                <p className="text-sm text-gray-700 mb-4">Manage banners, pages, and other site content.</p>
                <div className="mt-4 space-y-2">
                  <Link href="/admin/content/banners" className="block text-sm text-amber-800 font-medium hover:underline">
                    Manage Banners
                  </Link>
                  <Link href="/admin/content/pages" className="block text-sm text-amber-800 font-medium hover:underline">
                    Manage Pages
                  </Link>
                </div>
              </div>
              
              {/* Settings */}
              <div className={`${BRAND.bg.light} p-6 rounded-lg shadow-md border border-amber-300`}>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Settings</h3>
                <p className="text-sm text-gray-700 mb-4">Configure store settings and preferences.</p>
                <div className="mt-4 space-y-2">
                  <Link href="/admin/settings/store" className="block text-sm text-amber-800 font-medium hover:underline">
                    Store Settings
                  </Link>
                  <Link href="/admin/settings/users" className="block text-sm text-amber-800 font-medium hover:underline">
                    User Management
                  </Link>
                </div>
              </div>
              
              {/* Logs */}
              <div className={`${BRAND.bg.light} p-6 rounded-lg shadow-md border border-amber-300`}>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Admin Logs</h3>
                <p className="text-sm text-gray-700 mb-4">View detailed activity logs and audit trail.</p>
                <div className="mt-4 space-y-2">
                  <Link href="/admin/logs" className="block text-sm text-amber-800 font-medium hover:underline">
                    View Admin Logs
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="mt-10 p-6 bg-amber-50 rounded-lg border border-amber-300 shadow-md">
              <h2 className="text-xl font-medium text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-amber-100 rounded-full p-2 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-800" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New order received</p>
                    <p className="text-xs text-gray-600">Order #12345 for R3,250.00</p>
                    <p className="text-xs text-gray-500">10 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-amber-100 rounded-full p-2 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-800" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New customer registered</p>
                    <p className="text-xs text-gray-600">Thabo Molefe (thabo@example.com)</p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-amber-100 rounded-full p-2 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-800" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Low stock alert</p>
                    <p className="text-xs text-gray-600">Classic Leather Loafers (2 units remaining)</p>
                    <p className="text-xs text-gray-500">3 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-10">
              <h2 className="text-xl font-medium text-gray-900 mb-4">Analytics Overview</h2>
              <DashboardAnalytics />
            </div>
            
            {/* Admin Logs Section */}
            <div className="mt-10">
              <h2 className="text-xl font-medium text-gray-900 mb-4">Admin Activity Logs</h2>
              <AdminLogsViewer maxLogs={100} autoRefresh={true} refreshInterval={5000} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
