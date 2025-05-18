// src/app/admin/layout.tsx
'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { logger } from '@/utils/logger';
import { createAdminSession } from '@/utils/admin-auth';

// Dynamically import the admin session injector to ensure it runs client-side
const AdminSessionInjector = dynamic(
  () => import('@/components/admin/AdminSessionInjector'),
  { ssr: false }
);

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Set up admin session directly in layout
    try {
      // Force set admin session on every admin page load
      createAdminSession('admin@mopres.co.za', '73f8df24-fc99-41b2-9f5c-1a5c74c4564e');
      
      // Log admin layout access
      logger.admin('Admin layout rendered', { 
        path: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown'
      });
    } catch (error) {
      logger.error('Error setting up admin session in layout', error);
    }
  }, []);

  return (
    <div>
      <AdminSessionInjector />
      {children}
    </div>
  );
}