/**
 * Enhanced admin authentication utilities with disabled auto-login by default
 */

import { logger } from '@/utils/logger';
import { ADMIN_ROLE } from '@/lib/constants';
import { supabase } from '@/lib/supabase-client';

// Check if window is defined (client-side) or not (server-side)
const isClient = typeof window !== 'undefined';

// Interface for admin session data
interface AdminSession {
  isAdmin: boolean;
  userId: string;
  email: string;
  timestamp: number;
}

/**
 * Create admin session in localStorage with logging
 */
export const createAdminSession = (email: string = 'admin@mopres.co.za', userId: string = '73f8df24-fc99-41b2-9f5c-1a5c74c4564e'): void => {
  if (!isClient) {
    logger.debug('Attempted to create admin session on server side - skipping');
    return;
  }
  
  try {
    const adminSession: AdminSession = {
      isAdmin: true,
      userId,
      email,
      timestamp: Date.now()
    };
    
    localStorage.setItem('mopres_admin_session', JSON.stringify(adminSession));
    
    // Always set auto-login disabled by default - this is the key change
    localStorage.setItem('mopres_disable_auto_login', 'true');
    
    logger.admin('Admin session created with auto-login disabled', { email, userId });
  } catch (error) {
    logger.error('Failed to create admin session', error);
    throw error;
  }
};

/**
 * Check if admin session exists and is valid
 * Also enforces auto-login disabled by default
 */
export const validateAdminSession = (): boolean => {
  if (!isClient) {
    logger.debug('Attempted to validate admin session on server side - skipping');
    return false;
  }
  
  try {
    // First check if auto-login is disabled
    const isAutoLoginDisabled = localStorage.getItem('mopres_disable_auto_login') === 'true';
    
    // If auto-login is disabled and we're in the login page validation, return false
    if (isAutoLoginDisabled && window.location.pathname.includes('/admin/login')) {
      logger.debug('Auto-login disabled, manual login required');
      return false;
    }
    
    const sessionData = localStorage.getItem('mopres_admin_session');
    if (!sessionData) {
      logger.debug('No admin session found');
      return false;
    }
    
    const session = JSON.parse(sessionData) as AdminSession;
    const sessionAge = Date.now() - (session.timestamp || 0);
    
    // Sessions expire after 24 hours
    const isValid = session.isAdmin && sessionAge < 24 * 60 * 60 * 1000;
    
    if (isValid) {
      logger.debug('Valid admin session found', { email: session.email });
    } else {
      logger.warn('Invalid or expired admin session', { 
        sessionAge: Math.floor(sessionAge / (60 * 1000)) + ' minutes', 
        isAdmin: session.isAdmin 
      });
    }
    
    return isValid;
  } catch (error) {
    logger.error('Error validating admin session', error);
    return false;
  }
};

/**
 * Clear admin session
 */
export const clearAdminSession = (): void => {
  if (!isClient) {
    logger.debug('Attempted to clear admin session on server side - skipping');
    return;
  }
  
  try {
    localStorage.removeItem('mopres_admin_session');
    // Always set the disable auto-login flag when clearing session
    localStorage.setItem('mopres_disable_auto_login', 'true');
    logger.admin('Admin session cleared with auto-login disabled');
  } catch (error) {
    logger.error('Failed to clear admin session', error);
  }
};

/**
 * Logout admin user
 * Clears all authentication data including Supabase session and localStorage
 */
export const logoutAdmin = async (): Promise<boolean> => {
  if (!isClient) {
    logger.debug('Attempted to logout admin on server side - skipping');
    return false;
  }
  
  try {
    logger.admin('Admin logout initiated');
    
    // First clear the admin session from localStorage
    clearAdminSession();
    
    // Clear any supabase.auth.token in localStorage as backup
    try {
      localStorage.removeItem('supabase.auth.token');
      logger.debug('Removed supabase.auth.token from localStorage');
    } catch (tokenError) {
      logger.error('Token removal failed', tokenError);
    }
    
    // Set a flag to disable auto-login
    try {
      localStorage.setItem('mopres_disable_auto_login', 'true');
      logger.debug('Set auto-login disable flag');
    } catch (flagError) {
      logger.error('Setting auto-login flag failed', flagError);
    }
    
    // Sign out from Supabase
    const supabaseClient = supabase();
    await supabaseClient.auth.signOut();
    
    logger.admin('Admin logout completed successfully');
    return true;
  } catch (error) {
    logger.error('Admin logout failed', error);
    return false;
  }
};

/**
 * Check if auto-login is enabled/disabled and
 * allow explicit enabling/disabling
 */
export const checkAutoLoginStatus = (): boolean => {
  if (!isClient) return false;
  
  try {
    return localStorage.getItem('mopres_disable_auto_login') !== 'true';
  } catch (error) {
    logger.error('Error checking auto-login status', error);
    return false;
  }
};

export const enableAutoLogin = (): void => {
  if (!isClient) return;
  
  try {
    localStorage.removeItem('mopres_disable_auto_login');
    logger.admin('Auto-login enabled');
  } catch (error) {
    logger.error('Error enabling auto-login', error);
  }
};

export const disableAutoLogin = (): void => {
  if (!isClient) return;
  
  try {
    localStorage.setItem('mopres_disable_auto_login', 'true');
    logger.admin('Auto-login disabled');
  } catch (error) {
    logger.error('Error disabling auto-login', error);
  }
};

/**
 * Authenticate admin with Supabase
 */
export const authenticateAdmin = async (email: string, password: string): Promise<boolean> => {
  if (!isClient) {
    logger.debug('Attempted to authenticate admin on server side - skipping');
    return false;
  }
  
  try {
    logger.admin('Attempting admin authentication', { email });
    
    // Get Supabase client
    const supabaseClient = supabase();
    
    // Sign out first to clear any existing session
    await supabaseClient.auth.signOut();
    logger.debug('Signed out existing user');
    
    // Attempt to sign in
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      logger.error('Admin authentication failed', { error: error.message });
      return false;
    }
    
    // Check if user has admin role - check both app_metadata and user_metadata
    const userRole = data.user?.app_metadata?.role || data.user?.user_metadata?.role;
    logger.debug('User role from authentication', { 
      app_role: data.user?.app_metadata?.role,
      user_role: data.user?.user_metadata?.role,
      final_role: userRole 
    });
    
    if (userRole === ADMIN_ROLE) {
      logger.admin('Admin authentication successful', { userId: data.user.id, email: data.user.email });
      
      // Clear the auto-login disable flag to allow this session
      localStorage.removeItem('mopres_disable_auto_login');
      
      // Create admin session
      createAdminSession(data.user.email, data.user.id);
      
      return true;
    } else {
      logger.warn('User does not have admin role', { role: userRole, userId: data.user?.id });
      return false;
    }
  } catch (error) {
    logger.error('Unexpected error during admin authentication', error);
    return false;
  }
};

/**
 * Update user with admin role
 */
export const assignAdminRole = async (): Promise<boolean> => {
  if (!isClient) {
    logger.debug('Attempted to assign admin role on server side - skipping');
    return false;
  }
  
  try {
    logger.admin('Attempting to assign admin role to current user');
    
    const supabaseClient = supabase();
    
    // Update user with admin role
    const { data, error } = await supabaseClient.auth.updateUser({
      data: { role: ADMIN_ROLE }
    });
    
    if (error) {
      logger.error('Failed to assign admin role', { error: error.message });
      return false;
    }
    
    logger.admin('Admin role assigned successfully', { userId: data.user.id });
    return true;
  } catch (error) {
    logger.error('Unexpected error assigning admin role', error);
    return false;
  }
};

/**
 * Log admin access (for middleware and other access points)
 */
export const logAdminAccess = (path: string, method: string = 'GET'): void => {
  logger.admin('Admin area accessed', { path, method, timestamp: new Date().toISOString() });
};
