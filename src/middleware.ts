import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_ROLE } from '@/lib/constants';

export async function middleware(request: NextRequest) {
  // Enhanced logging for all paths
  console.log(`⚪ [${new Date().toISOString()}] Middleware executing for path:`, request.nextUrl.pathname);
  
  // CRITICAL: Log raw cookie header to debug
  console.log('🍪 [Middleware] Raw Cookie Header:', request.headers.get('cookie'));
  console.log('🍪 [Middleware] Parsed Cookies:', request.cookies.getAll());
  
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Check for admin session BEFORE creating Supabase client to prevent conflicts
  const adminSession = request.cookies.get('adminSession');
  const legacyBypass = request.cookies.get('adminBypass');
  const hasAdminSession = adminSession?.value === 'authenticated' || legacyBypass?.value === 'emergency-access';
  
  console.log('🔐 [Middleware] Session Status:', {
    adminSessionValue: adminSession?.value,
    legacyBypassValue: legacyBypass?.value,
    hasAdminSession,
    path: request.nextUrl.pathname
  });

  let supabase: any = null;

  // Only create Supabase client if no admin session exists
  if (!hasAdminSession) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Supabase URL or Anon Key is missing in middleware.');
      return response;
    }

    // Create a Supabase client configured to use cookies
    supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value,
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );
  } else {
    console.log('🛡️ [Middleware] Admin session detected - skipping Supabase client creation');
  }

  // Check if the request is for the user account area
  if (request.nextUrl.pathname.startsWith('/account')) {
    // Skip auth check for public account pages
    const publicPaths = ['/account/login', '/account/register', '/account/forgot-password', '/account/reset-password'];
    if (publicPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
      return response;
    }
    
    // If admin session exists, redirect to admin area
    if (hasAdminSession) {
      console.log('🛡️ [User Account] Admin session detected, redirecting to admin area');
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    
    // For all other account routes, check user authentication
    if (!supabase) {
      console.log('❌ [User Account] No Supabase client available, redirecting to login');
      return NextResponse.redirect(new URL('/account/login', request.url));
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('🔒 [User Account] No session found, redirecting to login');
        return NextResponse.redirect(new URL('/account/login', request.url));
      }
      
      // Check if user has admin role - admins should use admin area
      const { data: userData } = await supabase.auth.getUser();
      const userRole = userData?.user?.user_metadata?.role;
      
      if (userRole === ADMIN_ROLE) {
        console.log('⚠️ [User Account] Admin user detected, redirecting to admin area');
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      
      console.log(`✅ [User Account] Access granted: ${userData?.user?.email}`);
    } catch (error) {
      console.error('❌ [User Account] Error checking session:', error);
      return NextResponse.redirect(new URL('/account/login', request.url));
    }
  }

  // Check if the request is for the client portal (temporary admin access)
  if (request.nextUrl.pathname.startsWith('/client-portal')) {
    // Skip auth check for client portal login page
    if (request.nextUrl.pathname === '/client-portal/login') {
      return response;
    }
    
    // For all other client portal routes, check simple auth
    const clientAuth = request.cookies.get('clientPortalAuth');
    if (!clientAuth) {
      console.log('🔒 [Client Portal] No auth found, redirecting to login');
      return NextResponse.redirect(new URL('/client-portal/login', request.url));
    }
    
    console.log('✅ [Client Portal] Access granted');
    return response;
  }

  // Check if the request is for an admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Skip auth check for admin login page and debug pages
    if (request.nextUrl.pathname === '/admin/login' || 
        request.nextUrl.pathname === '/admin/check' ||
        request.nextUrl.pathname === '/admin/session-test') {
      return response;
    }
    
    console.log('🔍 [Admin Middleware] Session check:', {
      timestamp: new Date().toISOString(),
      hasAdminSession,
      adminSession: adminSession?.value,
      legacyBypass: legacyBypass?.value,
      path: request.nextUrl.pathname,
      cookieHeader: request.headers.get('cookie'),
      allCookies: request.cookies.getAll().map(c => `${c.name}=${c.value}`)
    });
    
    if (hasAdminSession) {
      console.log('✅ [Admin] Admin session active - COMPLETE SUPABASE BYPASS');
      // Set headers to prevent any Supabase interference
      response.headers.set('X-Admin-Session', 'active');
      response.headers.set('X-Skip-Supabase', 'true');
      // IMMEDIATELY RETURN - NO SUPABASE OPERATIONS AT ALL
      return response;
    }
    
    console.log('❌ [Admin] No valid admin session found - redirecting to login');
    // If no admin session, redirect immediately to login - don't check Supabase
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Add CORS headers
  const origin = request.headers.get('origin') || '*';
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Client-Info, apikey, Range');
  response.headers.set('Access-Control-Max-Age', '86400');

  return response;
}

// Apply middleware to all routes except static files
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};