'use client';

import { useEffect } from 'react';
import { logger } from '@/utils/logger';
import { createAdminSession, validateAdminSession } from '@/utils/admin-auth';

export default function AdminSessionInjector() {
  useEffect(() => {
    const injectAdminSession = () => {
      try {
        // First try to read existing session and check if it's valid
        const isValid = validateAdminSession();
        
        // If session is valid, nothing to do
        if (isValid) {
          logger.debug('Existing admin session is valid, no need to inject');
          return;
        }
        
        // Create new admin session
        createAdminSession('admin@mopres.co.za', '73f8df24-fc99-41b2-9f5c-1a5c74c4564e');
        logger.admin('New admin session injected', { 
          path: typeof window !== 'undefined' ? window.location.pathname : 'unknown'
        });
      } catch (error) {
        logger.error('Error injecting admin session', error);
      }
    };
    
    // Run immediately
    injectAdminSession();
    
    // Log access to admin area
    logger.admin('Admin area accessed', { 
      path: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      timestamp: new Date().toISOString()
    });
  }, []);
  
  // This component doesn't render anything visible
  return null;
}
