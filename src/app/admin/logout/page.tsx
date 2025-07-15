'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { logoutAdmin } from '@/utils/admin-auth';
import { logger } from '@/utils/logger';

export default function LogoutPage() {
  const [logoutStatus, setLogoutStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('Logging you out...');
  const router = useRouter();
  
  useEffect(() => {
    const performLogout = async () => {
      try {
        logger.admin('Logout page accessed, performing logout');
        
        // Ensure the auto-login disable flag is set (in addition to the flag set in logoutAdmin)
        try {
          localStorage.setItem('mopres_disable_auto_login', 'true');
          logger.debug('Explicitly set auto-login disable flag in logout page');
        } catch (flagError) {
          logger.error('Setting auto-login flag failed in logout page', flagError);
        }
        
        const success = await logoutAdmin();
        
        if (success) {
          setLogoutStatus('success');
          setMessage('You have been successfully logged out.');
          logger.admin('Logout successful via logout page');
          
          // Redirect to login page after a brief delay
          setTimeout(() => {
            window.location.href = '/admin/login';
          }, 2000);
        } else {
          setLogoutStatus('error');
          setMessage('Logout failed. Please try again or close your browser.');
          logger.error('Logout failed via logout page');
        }
      } catch (error) {
        setLogoutStatus('error');
        setMessage('An error occurred during logout. Please try again or close your browser.');
        logger.error('Error during logout via logout page', error);
      }
    };
    
    performLogout();
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 bg-gradient-to-br from-gray-50 to-gray-200">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border-t-4 border-amber-600">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Admin Logout
        </h1>
        
        <div className={`p-4 rounded mb-6 ${
          logoutStatus === 'pending' ? 'bg-blue-50 text-blue-700' :
          logoutStatus === 'success' ? 'bg-green-50 text-green-700' :
          'bg-red-50 text-red-700'
        }`}>
          <div className="flex items-center justify-center mb-2">
            {logoutStatus === 'pending' ? (
              <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : logoutStatus === 'success' ? (
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span>{message}</span>
          </div>
          
          {logoutStatus === 'success' && (
            <div className="text-sm text-center">
              Redirecting to login page...
            </div>
          )}
        </div>
        
        <div className="flex justify-center">
          <Link 
            href="/admin/login" 
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded shadow-sm transition-colors duration-150 ease-in-out"
          >
            Go to Login Page
          </Link>
        </div>
      </div>
    </div>
  );
}
