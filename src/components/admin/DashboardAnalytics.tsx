'use client';

import React from 'react';
import Link from 'next/link';
import { BRAND } from '@/utils/brand';

// Sample data for the dashboard analytics
const analyticsData = {
  currentPeriod: {
    revenue: 84350,
    orders: 27,
    aov: 3124
  },
  percentChange: {
    revenue: 7.9,
    orders: 8.0,
    aov: -0.1
  },
  topProducts: [
    { id: 'prod_1', name: 'Elegance Stiletto Heels', sales: 12, revenue: 37800 },
    { id: 'prod_2', name: 'Classic Leather Loafers', sales: 8, revenue: 22800 },
    { id: 'prod_3', name: 'Suede Chelsea Boots', sales: 5, revenue: 21250 },
  ]
};

export default function DashboardAnalytics() {
  return (
    <div className={`${BRAND.card.primary} p-6`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Performance Overview</h2>
        <Link href="/admin/analytics" className={`${BRAND.text.primary} font-medium hover:text-amber-900 text-sm`}>
          View Full Analytics →
        </Link>
      </div>
      
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Revenue Card */}
        <div className={`${BRAND.gradient.light} p-4 rounded-lg border ${BRAND.border.accent}`}>
          <div className="text-sm text-gray-700 font-medium mb-1">Total Revenue (30d)</div>
          <div className="flex items-end">
            <div className="text-2xl font-bold text-gray-900">R{analyticsData.currentPeriod.revenue.toLocaleString()}</div>
            <div className={`text-sm ml-2 mb-1 ${analyticsData.percentChange.revenue >= 0 ? 'text-green-700' : 'text-red-700'} font-medium`}>
              {analyticsData.percentChange.revenue >= 0 ? '↑' : '↓'} {Math.abs(analyticsData.percentChange.revenue)}%
            </div>
          </div>
          <div className="mt-2 relative w-full h-2 bg-amber-200 rounded-full overflow-hidden">
            <div 
              className={`absolute inset-y-0 left-0 ${BRAND.bg.primary} rounded-full`}
              style={{ width: `${Math.min(analyticsData.percentChange.revenue * 5, 100)}%` }}
            ></div>
          </div>
        </div>
        
        {/* Orders Card */}
        <div className={`${BRAND.gradient.light} p-4 rounded-lg border ${BRAND.border.accent}`}>
          <div className="text-sm text-gray-700 font-medium mb-1">Total Orders (30d)</div>
          <div className="flex items-end">
            <div className="text-2xl font-bold text-gray-900">{analyticsData.currentPeriod.orders}</div>
            <div className={`text-sm ml-2 mb-1 ${analyticsData.percentChange.orders >= 0 ? 'text-green-700' : 'text-red-700'} font-medium`}>
              {analyticsData.percentChange.orders >= 0 ? '↑' : '↓'} {Math.abs(analyticsData.percentChange.orders)}%
            </div>
          </div>
          <div className="mt-2 relative w-full h-2 bg-amber-200 rounded-full overflow-hidden">
            <div 
              className={`absolute inset-y-0 left-0 ${BRAND.bg.primary} rounded-full`}
              style={{ width: `${Math.min(analyticsData.percentChange.orders * 5, 100)}%` }}
            ></div>
          </div>
        </div>
        
        {/* Average Order Value Card */}
        <div className={`${BRAND.gradient.light} p-4 rounded-lg border ${BRAND.border.accent}`}>
          <div className="text-sm text-gray-700 font-medium mb-1">Avg. Order Value (30d)</div>
          <div className="flex items-end">
            <div className="text-2xl font-bold text-gray-900">R{analyticsData.currentPeriod.aov.toLocaleString()}</div>
            <div className={`text-sm ml-2 mb-1 ${analyticsData.percentChange.aov >= 0 ? 'text-green-700' : 'text-red-700'} font-medium`}>
              {analyticsData.percentChange.aov >= 0 ? '↑' : '↓'} {Math.abs(analyticsData.percentChange.aov)}%
            </div>
          </div>
          <div className="mt-2 relative w-full h-2 bg-amber-200 rounded-full overflow-hidden">
            <div 
              className={`absolute inset-y-0 left-0 ${BRAND.bg.primary} rounded-full`}
              style={{ width: `${Math.min((analyticsData.percentChange.aov + 5) * 10, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Top Products */}
      <div>
        <h3 className="text-md font-semibold text-gray-700 mb-3">Top Selling Products</h3>
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={BRAND.tableHeader}>
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Units Sold
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData.topProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <Link href={`/admin/products/${product.id}`} className={`hover:${BRAND.text.primary}`}>
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {product.sales}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    R{product.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Analytics Quick Links */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Link 
          href="/admin/analytics/sales" 
          className={`inline-flex items-center px-3 py-1.5 border ${BRAND.border.accent} rounded-full text-xs ${BRAND.text.primary} ${BRAND.bg.light} hover:bg-amber-100`}
        >
          <svg className="w-3.5 h-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
          Sales Reports
        </Link>
        <Link 
          href="/admin/analytics/customers" 
          className={`inline-flex items-center px-3 py-1.5 border ${BRAND.border.accent} rounded-full text-xs ${BRAND.text.primary} ${BRAND.bg.light} hover:bg-amber-100`}
        >
          <svg className="w-3.5 h-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
          Customer Analytics
        </Link>
        <Link 
          href="/admin/analytics/inventory" 
          className={`inline-flex items-center px-3 py-1.5 border ${BRAND.border.accent} rounded-full text-xs ${BRAND.text.primary} ${BRAND.bg.light} hover:bg-amber-100`}
        >
          <svg className="w-3.5 h-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
          </svg>
          Inventory Analysis
        </Link>
        <Link 
          href="/admin/analytics" 
          className={`inline-flex items-center px-3 py-1.5 border ${BRAND.border.accent} rounded-full text-xs ${BRAND.text.primary} ${BRAND.bg.light} hover:bg-amber-100`}
        >
          <svg className="w-3.5 h-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Analytics Dashboard
        </Link>
      </div>
    </div>
  );
}
