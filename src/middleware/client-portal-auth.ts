import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function clientPortalMiddleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // For now, we'll allow access without authentication
  // In production, you would check for proper authentication here
  // if (!session) {
  //   return NextResponse.redirect(new URL('/login', req.url));
  // }

  return res;
}