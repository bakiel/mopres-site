import React from 'react';
import Link from 'next/link';

export default function ContentPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
        </div>
      </header>
      
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Banners */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Banners
                  </h3>
                  <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                </div>
              </div>
              <div className="px-5 py-3 bg-gray-50">
                <p className="text-sm text-gray-500">
                  Manage promotional banners and site announcements
                </p>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm text-gray-700 mb-4">
                  Create and manage banners that display across your site for promotions, announcements, and seasonal campaigns.
                </p>
                <Link 
                  href="/admin/content/banners" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white shadow-sm" 
                  style={{ backgroundColor: '#AF8F53' }}
                >
                  Manage Banners
                </Link>
              </div>
            </div>

            {/* Pages */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Pages
                  </h3>
                  <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
              </div>
              <div className="px-5 py-3 bg-gray-50">
                <p className="text-sm text-gray-500">
                  Edit static content pages
                </p>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm text-gray-700 mb-4">
                  Create and edit static content pages for your website such as About, FAQ, Privacy Policy, and Terms of Service.
                </p>
                <Link 
                  href="/admin/content/pages" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white shadow-sm" 
                  style={{ backgroundColor: '#AF8F53' }}
                >
                  Manage Pages
                </Link>
              </div>
            </div>

            {/* Size Guides */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Size Guides
                  </h3>
                  <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="px-5 py-3 bg-gray-50">
                <p className="text-sm text-gray-500">
                  Manage product sizing information
                </p>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm text-gray-700 mb-4">
                  Create and manage size guides for your products to help customers find the perfect fit for your footwear.
                </p>
                <Link 
                  href="/admin/content/size-guides" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white shadow-sm" 
                  style={{ backgroundColor: '#AF8F53' }}
                >
                  Manage Size Guides
                </Link>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    SEO Settings
                  </h3>
                  <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="px-5 py-3 bg-gray-50">
                <p className="text-sm text-gray-500">
                  Configure search engine optimization
                </p>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm text-gray-700 mb-4">
                  Manage SEO settings for your website including meta titles, descriptions, and structured data for better search engine rankings.
                </p>
                <Link 
                  href="/admin/content/seo" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white shadow-sm" 
                  style={{ backgroundColor: '#AF8F53' }}
                >
                  Manage SEO
                </Link>
              </div>
            </div>

            {/* Navigation */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Navigation
                  </h3>
                  <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </div>
              </div>
              <div className="px-5 py-3 bg-gray-50">
                <p className="text-sm text-gray-500">
                  Manage site navigation menus
                </p>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm text-gray-700 mb-4">
                  Configure the navigation menus for your website, including the main navbar, footer links, and mobile navigation.
                </p>
                <Link 
                  href="/admin/content/navigation" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white shadow-sm" 
                  style={{ backgroundColor: '#AF8F53' }}
                >
                  Manage Navigation
                </Link>
              </div>
            </div>

            {/* Email Templates */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Email Templates
                  </h3>
                  <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="px-5 py-3 bg-gray-50">
                <p className="text-sm text-gray-500">
                  Customize transactional emails
                </p>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm text-gray-700 mb-4">
                  Customize the email templates sent to customers for order confirmations, shipping updates, account notifications, and more.
                </p>
                <Link 
                  href="/admin/content/email-templates" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white shadow-sm" 
                  style={{ backgroundColor: '#AF8F53' }}
                >
                  Manage Email Templates
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
