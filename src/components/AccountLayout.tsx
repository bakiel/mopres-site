'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import AuthStatus from '@/components/AuthStatus';

interface AccountLayoutProps {
  children: React.ReactNode;
}

const AccountLayout: React.FC<AccountLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  
  // List of routes that don't require a navigation sidebar
  const publicRoutes = [
    '/account/login',
    '/account/register',
    '/account/forgot-password',
    '/account/reset-password',
  ];
  
  // Check if current path is a public route
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // Only show auth status on non-public routes (profile pages)
  const showAuthStatus = !isPublicRoute;
  
  // Only require auth on non-public routes
  const requireAuth = !isPublicRoute;
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Authentication Status Display */}
      {showAuthStatus && (
        <AuthStatus
          showProfile={true}
          requireAuth={requireAuth}
          redirectTo={pathname}
        />
      )}
      
      {/* Navigation Sidebar for authenticated account pages */}
      {!isPublicRoute && (
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-brand-gold px-4 py-3">
                <h2 className="text-white font-medium">My Account</h2>
              </div>
              
              <nav className="p-2">
                <ul className="space-y-1">
                  <li>
                    <Link 
                      href="/account" 
                      className={`block px-4 py-2 rounded-md text-sm ${pathname === '/account' ? 'bg-brand-gold-light text-brand-gold font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      Account Overview
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/account/orders" 
                      className={`block px-4 py-2 rounded-md text-sm ${pathname.startsWith('/account/orders') ? 'bg-brand-gold-light text-brand-gold font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      My Orders
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/account/addresses" 
                      className={`block px-4 py-2 rounded-md text-sm ${pathname.startsWith('/account/addresses') ? 'bg-brand-gold-light text-brand-gold font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      Addresses
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/account/wishlist" 
                      className={`block px-4 py-2 rounded-md text-sm ${pathname.startsWith('/account/wishlist') ? 'bg-brand-gold-light text-brand-gold font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      Wishlist
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="flex-grow">
            {children}
          </div>
        </div>
      )}
      
      {/* For public routes, display the children directly */}
      {isPublicRoute && children}
    </div>
  );
};

export default AccountLayout;