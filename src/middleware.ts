import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_ROLE } from '@/lib/constants';

export async function middleware(request: NextRequest) {
  // Enhanced logging for all paths
  console.log(`⚪ [${new Date().toISOString()}] Middleware executing for path:`, request.nextUrl.pathname);
  
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase URL or Anon Key is missing in middleware.');
    return response;
  }

  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
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

  // Check if the request is for the client portal
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
    // Skip auth check for admin login page
    if (request.nextUrl.pathname === '/admin/login') {
      return response;
    }
    
    // For all other admin routes, verify the user is authenticated and has admin role
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // If no session, redirect to admin login
      if (!session) {
        console.log('🔒 [Admin] No session found, redirecting to admin login');
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
      
      // Check user's admin status - assuming there's a user_metadata.role field or similar
      const { data: userData } = await supabase.auth.getUser();
      const userRole = userData?.user?.user_metadata?.role;
      
      if (userRole !== ADMIN_ROLE) {
        console.log(`⛔ [Admin] User does not have admin role (${userRole}), redirecting to login`);
        // Sign the user out and redirect to login
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
      
      console.log(`✅ [Admin] Verified admin access: ${userData?.user?.email}`);
    } catch (error) {
      console.error('❌ [Admin] Error checking session:', error);
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
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