'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BRAND } from '@/utils/brand';
import LogoutButton from '@/components/admin/LogoutButton';

export default function AdminNavigation() {
  const pathname = usePathname();
  const [analyticsExpanded, setAnalyticsExpanded] = useState(pathname?.startsWith('/admin/analytics'));
  
  // Check if current path matches the given path
  const isActivePath = (path: string) => {
    if (!pathname) return false;
    return pathname === path || pathname.startsWith(`${path}/`);
  };
  
  return (
    <nav className="bg-white shadow mb-6 rounded-lg">
      <div className="mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex justify-between h-14">
          <div className="flex">
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              <Link 
                href="/admin" 
                className={`${isActivePath('/admin') && !isActivePath('/admin/analytics') && !isActivePath('/admin/products') && !pathname?.includes('/admin/') ? 
                  BRAND.navItem.active : 
                  BRAND.navItem.inactive} 
                  inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium`}
              >
                Dashboard
              </Link>
              
              {/* Analytics Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setAnalyticsExpanded(!analyticsExpanded)}
                  className={`${isActivePath('/admin/analytics') || isActivePath('/admin/analytics-hub') ? 
                    BRAND.navItem.active : 
                    BRAND.navItem.inactive} 
                    inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium focus:outline-none`}
                >
                  Analytics
                  <svg 
                    className={`ml-1 h-4 w-4 transition-transform duration-200 ${analyticsExpanded ? 'rotate-180' : ''}`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {analyticsExpanded && (
                  <div className="absolute z-10 left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <Link 
                        href="/admin/analytics" 
                        className={`${isActivePath('/admin/analytics') && pathname === '/admin/analytics' ? 
                          'bg-amber-50 text-amber-800' : 'text-gray-700'} 
                          block px-4 py-2 text-sm hover:bg-amber-50`}
                        role="menuitem"
                      >
                        Overview
                      </Link>
                      <Link 
                        href="/admin/analytics-hub" 
                        className={`${isActivePath('/admin/analytics-hub') ? 
                          'bg-amber-50 text-amber-800' : 'text-gray-700'} 
                          block px-4 py-2 text-sm hover:bg-amber-50`}
                        role="menuitem"
                      >
                        Analytics Hub
                      </Link>
                      <Link 
                        href="/admin/analytics/sales" 
                        className={`${isActivePath('/admin/analytics/sales') ? 
                          'bg-amber-50 text-amber-800' : 'text-gray-700'} 
                          block px-4 py-2 text-sm hover:bg-amber-50`}
                        role="menuitem"
                      >
                        Sales Reports
                      </Link>
                      <Link 
                        href="/admin/analytics/customers" 
                        className={`${isActivePath('/admin/analytics/customers') ? 
                          'bg-amber-50 text-amber-800' : 'text-gray-700'} 
                          block px-4 py-2 text-sm hover:bg-amber-50`}
                        role="menuitem"
                      >
                        Customer Insights
                      </Link>
                      <Link 
                        href="/admin/analytics/inventory" 
                        className={`${isActivePath('/admin/analytics/inventory') ? 
                          'bg-amber-50 text-amber-800' : 'text-gray-700'} 
                          block px-4 py-2 text-sm hover:bg-amber-50`}
                        role="menuitem"
                      >
                        Inventory Analytics
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              
              <Link 
                href="/admin/products" 
                className={`${isActivePath('/admin/products') ? 
                  BRAND.navItem.active : 
                  BRAND.navItem.inactive} 
                  inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium`}
              >
                Products
              </Link>
              
              <Link 
                href="/admin/orders" 
                className={`${isActivePath('/admin/orders') ? 
                  BRAND.navItem.active : 
                  BRAND.navItem.inactive} 
                  inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium`}
              >
                Orders
              </Link>
              
              <Link 
                href="/admin/customers" 
                className={`${isActivePath('/admin/customers') ? 
                  BRAND.navItem.active : 
                  BRAND.navItem.inactive} 
                  inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium`}
              >
                Customers
              </Link>
              
              <Link 
                href="/admin/settings" 
                className={`${isActivePath('/admin/settings') ? 
                  BRAND.navItem.active : 
                  BRAND.navItem.inactive} 
                  inline-flex items-center px-3 pt-1 border-b-2 text-sm font-medium`}
              >
                Settings
              </Link>
            </div>
          </div>
          
          <div className="-mr-2 flex items-center space-x-4">
            {/* Admin Profile & Logout Section */}
            <div className="flex items-center">
              <div className="hidden md:flex md:items-center md:ml-6">
                <div className="ml-3 relative flex items-center space-x-4">
                  <span className="text-amber-800 text-sm">
                    Admin
                  </span>
                  <LogoutButton 
                    variant="secondary"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                className={`inline-flex items-center justify-center p-2 rounded-md text-amber-800 hover:text-amber-900 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-700`}
              >
                <span className="sr-only">Open main menu</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
