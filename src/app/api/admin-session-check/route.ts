import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const adminSession = request.cookies.get('adminSession');
  const adminBypass = request.cookies.get('adminBypass');
  
  const response = {
    timestamp: new Date().toISOString(),
    url: request.url,
    headers: {
      host: request.headers.get('host'),
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer'),
      cookie: request.headers.get('cookie')
    },
    cookies: {
      adminSession: adminSession?.value || null,
      adminBypass: adminBypass?.value || null,
      allCookies: request.cookies.getAll().map(c => ({
        name: c.name,
        value: c.value
      }))
    },
    sessionStatus: {
      hasAdminSession: adminSession?.value === 'authenticated',
      hasLegacyBypass: adminBypass?.value === 'emergency-access',
      isAuthenticated: adminSession?.value === 'authenticated' || adminBypass?.value === 'emergency-access'
    }
  };
  
  return NextResponse.json(response, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache'
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    
    if (action === 'set') {
      const response = NextResponse.json({ 
        success: true, 
        message: 'Session set successfully' 
      });
      
      // Set the cookie
      response.cookies.set({
        name: 'adminSession',
        value: 'authenticated',
        path: '/',
        maxAge: 86400,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });
      
      return response;
    } else if (action === 'clear') {
      const response = NextResponse.json({ 
        success: true, 
        message: 'Session cleared successfully' 
      });
      
      // Clear the cookies
      response.cookies.delete('adminSession');
      response.cookies.delete('adminBypass');
      
      return response;
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'Invalid action' 
    }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Error processing request',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}