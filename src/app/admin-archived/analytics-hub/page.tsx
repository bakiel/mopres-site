'use client';

import React from 'react';
import Link from 'next/link';
import AdminNavigation from '@/components/admin/navigation/AdminNavigation';
import { BRAND } from '@/utils/brand';

export default function AnalyticsSubpagesIndex() {
  const analyticsPages = [
    {
      title: 'Sales Analytics',
      description: 'Detailed sales data by product, collection, region, and time period.',
      icon: (
        <svg className={`w-12 h-12 ${BRAND.text.primary}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
      ),
      url: '/admin/analytics/sales',
      color: `${BRAND.bg.light} border-${BRAND.border.accent}`,
      iconColor: `${BRAND.text.primary}`,
      buttonColor: `${BRAND.text.primary} hover:${BRAND.bg.light}`
    },
    {
      title: 'Customer Analytics',
      description: 'Customer acquisition, retention, average value, and demographics.',
      icon: (
        <svg className={`w-12 h-12 ${BRAND.text.primary}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
      ),
      url: '/admin/analytics/customers',
      color: `${BRAND.bg.light} border-${BRAND.border.accent}`,
      iconColor: `${BRAND.text.primary}`,
      buttonColor: `${BRAND.text.primary} hover:${BRAND.bg.light}`
    },
    {
      title: 'Inventory Analytics',
      description: 'Stock levels, turnover rates, bestsellers, and restock predictions.',
      icon: (
        <svg className={`w-12 h-12 ${BRAND.text.primary}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
        </svg>
      ),
      url: '/admin/analytics/inventory',
      color: `${BRAND.bg.light} border-${BRAND.border.accent}`,
      iconColor: `${BRAND.text.primary}`,
      buttonColor: `${BRAND.text.primary} hover:${BRAND.bg.light}`
    },
    {
      title: 'Performance Metrics',
      description: 'Key performance indicators, conversion rates, and business metrics.',
      icon: (
        <svg className={`w-12 h-12 ${BRAND.text.primary}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      url: '/admin/analytics/metrics',
      color: `${BRAND.bg.light} border-${BRAND.border.accent}`,
      iconColor: `${BRAND.text.primary}`,
      buttonColor: `${BRAND.text.primary} hover:${BRAND.bg.light}`
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Hub</h1>
          <div className="flex space-x-4">
            <Link href="/admin" className={`px-4 py-2 text-sm font-medium bg-amber-800 hover:bg-amber-900 text-white border border-amber-900 rounded-md shadow-sm font-semibold`}>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>
      
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Add Admin Navigation */}
          <AdminNavigation />
          
          <div className="bg-white p-8 rounded-lg shadow mt-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Analytics & Reporting</h2>
              <p className="text-gray-600">
                Access detailed insights, reports, and data visualizations to help you make informed business decisions.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analyticsPages.map((page, index) => (
                <div key={index} className={`rounded-lg p-6 border ${page.color} flex`}>
                  <div className={`flex-shrink-0 ${page.iconColor}`}>
                    {page.icon}
                  </div>
                  <div className="ml-6">
                    <h3 className="text-lg font-semibold text-gray-900">{page.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 mb-4">{page.description}</p>
                    <Link href={page.url} className={`inline-flex items-center rounded-md border border-amber-500 px-4 py-2 text-sm font-medium bg-white text-amber-900 hover:bg-amber-50 shadow-sm`}>
                      View Reports
                      <svg className="ml-2 -mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            
            <div className={`mt-8 p-6 ${BRAND.bg.light} rounded-lg border border-amber-300`}>
              <h3 className="text-lg font-semibold text-amber-900 mb-4">Need Custom Reports?</h3>
              <p className="text-gray-700 mb-4">
                Our analytics system allows you to create custom reports for specific business needs. Filter by date, product category, customer segment, and more.
              </p>
              <Link href="/admin/analytics/custom" className={`inline-flex items-center rounded-md bg-amber-800 hover:bg-amber-900 text-white border border-amber-900 px-4 py-2 text-sm font-medium shadow-sm`}>
                Create Custom Report
                <svg className="ml-2 -mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
