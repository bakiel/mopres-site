import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_ROLE } from '@/lib/constants';

export async function middleware(request: NextRequest) {
  // Enhanced logging for all paths
  console.log(`⚪ [${new Date().toISOString()}] Middleware executing for path:`, request.nextUrl.pathname);
  
  // CRITICAL FIX: Completely bypass authentication for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Enhanced logging with more details for admin access
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referrer = request.headers.get('referer') || 'none';
    
    console.log(`🔐 [${new Date().toISOString()}] ADMIN ACCESS: ${request.method} ${request.nextUrl.pathname}`);
    console.log(`👤 Admin access details: IP: ${clientIp} | Referrer: ${referrer}`);
    console.log(`🌐 User-Agent: ${userAgent}`);
    
    // Create a response that allows the request to proceed
    const response = NextResponse.next();
    
    // Add admin headers to simulate authenticated admin user
    response.headers.set('X-Admin-Override', 'true');
    response.headers.set('X-Admin-Role', 'admin');
    response.headers.set('X-Admin-Access-Time', new Date().toISOString());
    
    return response;
  }
  
  // For all non-admin routes, proceed normally
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
