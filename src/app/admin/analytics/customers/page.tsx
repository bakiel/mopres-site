'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';

export default function CustomerAnalyticsRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to main analytics page
    router.push('/admin/analytics');
  }, [router]);
  
  return (
    <AdminLayout>
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
        <p className="ml-4">Redirecting to analytics dashboard...</p>
      </div>
    </AdminLayout>
  );
}
