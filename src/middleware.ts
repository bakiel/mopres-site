import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
// No need for 'next/headers' cookies here

export async function middleware(request: NextRequest) {
  // Initialize response object - This is crucial for setting cookies
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase client using the request/response pattern for middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Set cookie on the response object
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          // Set cookie on the response object to remove it
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Get session (refresh is handled implicitly by getSession with ssr client)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // Define protected routes
  const protectedRoutes = ['/account', '/checkout/delivery', '/checkout/payment']; // Add '/account/orders', '/account/wishlist' etc. if needed directly
  const accountSubRoutes = /^\/account\/.+/; // Matches /account/orders, /account/wishlist etc. but not /account/login or /account/register

  const isProtectedRoute =
       protectedRoutes.includes(pathname) ||
       (pathname.startsWith('/account') &&
        !pathname.startsWith('/account/login') &&
        !pathname.startsWith('/account/register') &&
        !pathname.startsWith('/account/forgot-password') && // Exclude forgot password
        !pathname.startsWith('/account/reset-password')); // Exclude reset password


  // If trying to access a protected route without a session, redirect to login
  if (isProtectedRoute && !session) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/account/login';
    // Optional: Add a 'redirectedFrom' query param
    // redirectUrl.searchParams.set('redirectedFrom', pathname);
    console.log(`Redirecting unauthenticated user from ${pathname} to /account/login`);
     return NextResponse.redirect(redirectUrl);
   }

   // If user is logged in and tries to access login/register, redirect to account dashboard
   // Restore this block
   if (session && (pathname === '/account/login' || pathname === '/account/register')) {
       const redirectUrl = request.nextUrl.clone();
       redirectUrl.pathname = '/account';
       console.log(`Redirecting authenticated user from ${pathname} to /account`);
       return NextResponse.redirect(redirectUrl);
   }

   // Refresh session if expired - handled by supabase client library with ssr package

  // Return the potentially modified response object
  return response;
}

// Configure middleware matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (assuming your public images folder) - Adjust if needed
     * - *.png, *.jpg, *.jpeg, *.gif, *.svg etc (image extensions)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.(?:png|jpg|jpeg|gif|svg)$).*)',
    // Explicitly include paths to protect if needed, but the above should cover most app routes
     '/account/:path*',
     '/checkout/delivery',
     '/checkout/payment',
  ],
};
