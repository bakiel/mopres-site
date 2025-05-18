'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logoutAdmin } from '@/utils/admin-auth';
import { logger } from '@/utils/logger';

interface LogoutButtonProps {
  variant?: 'primary' | 'secondary' | 'text';
  className?: string;
  children?: React.ReactNode;
}

export default function LogoutButton({ 
  variant = 'text', 
  className = '', 
  children 
}: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  
  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    try {
      setIsLoggingOut(true);
      logger.admin('Admin logout button clicked');
      
      // Add confirmation if needed
      // if (!confirm('Are you sure you want to log out?')) {
      //   setIsLoggingOut(false);
      //   return;
      // }
      
      // Ensure the auto-login disable flag is set
      try {
        localStorage.setItem('mopres_disable_auto_login', 'true');
        logger.debug('Set auto-login disable flag from logout button');
      } catch (flagError) {
        logger.error('Setting auto-login flag failed from logout button', flagError);
      }
      
      const success = await logoutAdmin();
      
      if (success) {
        // Show a brief alert to confirm logout
        if (typeof window !== 'undefined') {
          alert('You have been successfully logged out. Redirecting to login page...');
        }
        
        // Use window.location for a full page reload and redirect to login page
        window.location.href = '/admin/login';
      } else {
        // If the logout fails, show an alert
        alert('Logout failed. Please try again.');
        setIsLoggingOut(false);
      }
    } catch (error) {
      logger.error('Error during logout', error);
      alert('An error occurred during logout. Please try again.');
      setIsLoggingOut(false);
    }
  };
  
  // Define button styles based on variant
  let buttonStyle = '';
  
  switch (variant) {
    case 'primary':
      buttonStyle = 'bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded shadow';
      break;
    case 'secondary':
      buttonStyle = 'bg-white hover:bg-amber-50 text-amber-700 font-medium py-2 px-4 rounded border border-amber-300 shadow-sm';
      break;
    case 'text':
    default:
      buttonStyle = 'text-amber-700 hover:text-amber-900 hover:underline font-medium';
      break;
  }
  
  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`${buttonStyle} ${className} flex items-center transition-colors duration-150 ease-in-out`}
      aria-label="Logout"
    >
      {isLoggingOut ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Logging out...
        </span>
      ) : children || (
        <span className="flex items-center">
          <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Logout
        </span>
      )}
    </button>
  );
}
