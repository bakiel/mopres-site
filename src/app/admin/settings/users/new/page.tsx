'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import UserForm from '@/components/admin/UserForm';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NewUserPage() {
  return (
    <AdminLayout>
      <div className="mb-6">
        <Link 
          href="/admin/settings/users" 
          className="inline-flex items-center text-sm text-brand-primary hover:text-brand-primary-dark mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Users
        </Link>
        
        <h1 className="text-2xl font-semibold text-gray-800">Create New User</h1>
        <p className="text-gray-600">Add a new admin user to the system</p>
      </div>
      
      <UserForm isNew={true} />
    </AdminLayout>
  );
}
