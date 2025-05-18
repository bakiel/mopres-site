// File: src/components/admin/AdminLayout.tsx
// Purpose: Shared layout component for all admin pages

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ShoppingBagIcon,
  TagIcon,
  UsersIcon,
  PhotoIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase-client';

// Admin navigation items
const navItems = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Products', href: '/admin/products', icon: TagIcon },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBagIcon },
  { name: 'Collections', href: '/admin/collections', icon: PhotoIcon },
  { name: 'Customers', href: '/admin/customers', icon: UsersIcon },
  { name: 'Content', href: '/admin/content', icon: DocumentTextIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Set sidebar to closed by default on mobile, open on desktop
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };
    
    // Initial check
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/account/login';
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 lg:hidden">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-gold"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <Link href="/admin" className="flex items-center">
            <img src="/Mopres_Gold_luxury_lifestyle_logo.png" alt="MoPres Admin" className="h-8" />
          </Link>
          <div className="w-6"></div> {/* Spacer for visual balance */}
        </div>
      </div>
      
      <div className="flex h-screen overflow-hidden pt-0 lg:pt-0">
        {/* Sidebar */}
        <aside 
          className={`
            bg-gray-800 text-white w-full max-w-[250px] fixed h-full overflow-y-auto z-40
            transition-transform duration-300 ease-in-out lg:translate-x-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          {/* Logo area with close button for mobile */}
          <div className="p-4 flex items-center justify-between border-b border-gray-700">
            <Link href="/admin" className="flex items-center">
              <img src="/Mopres_Gold_luxury_lifestyle_logo.png" alt="MoPres Admin" className="h-8" />
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-white focus:outline-none"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="mt-4">
            <ul>
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center px-6 py-3 text-sm ${
                        isActive 
                          ? 'bg-brand-gold text-white' 
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                      onClick={() => {
                        if (window.innerWidth < 1024) {
                          setSidebarOpen(false);
                        }
                      }}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          
          <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
            <button
              onClick={handleSignOut}
              className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white w-full hover:bg-gray-700 rounded"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
              Sign Out
            </button>
          </div>
        </aside>
        
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Main content */}
        <main 
          className={`
            flex-1 overflow-x-hidden overflow-y-auto bg-gray-50
            transition-all duration-300 ease-in-out
            w-full
            ${sidebarOpen ? 'lg:ml-[250px]' : 'ml-0'}
          `}
        >
          <div className="container mx-auto px-4 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
