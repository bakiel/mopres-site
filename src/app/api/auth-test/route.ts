import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_ROLE } from '@/lib/constants';

export async function GET(request: Request) {
  try {
    // Create a Supabase client
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Check session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      return NextResponse.json({
        status: 'error',
        message: 'Error getting session',
        error: sessionError.message,
      }, { status: 500 });
    }
    
    if (!session) {
      return NextResponse.json({
        status: 'unauthenticated',
        message: 'No active session found',
      }, { status: 401 });
    }
    
    // Get user details
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      return NextResponse.json({
        status: 'error',
        message: 'Error getting user',
        error: userError.message,
      }, { status: 500 });
    }
    
    // Check if user is admin
    const userRole = user?.app_metadata?.role;
    const isAdmin = userRole === ADMIN_ROLE;
    
    return NextResponse.json({
      status: 'success',
      authenticated: true,
      isAdmin,
      userRole,
      user: {
        id: user.id,
        email: user.email,
        app_metadata: user.app_metadata,
        user_metadata: user.user_metadata,
      },
      session: {
        expires_at: session.expires_at,
      },
    });
    
  } catch (error: any) {
    console.error('Auth test error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Unexpected error occurred',
      error: error.message,
    }, { status: 500 });
  }
}
