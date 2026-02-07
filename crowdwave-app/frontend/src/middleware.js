import { NextResponse } from 'next/server';

// Team password - change this to something secure
const TEAM_PASSWORD = 'crowdwave';

export function middleware(request) {
  // Check for auth cookie
  const authCookie = request.cookies.get('crowdwave_auth');
  
  // Allow access to auth page and API routes
  if (request.nextUrl.pathname === '/auth' || request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  
  // Check if authenticated
  if (authCookie?.value === TEAM_PASSWORD) {
    return NextResponse.next();
  }
  
  // Redirect to auth page
  return NextResponse.redirect(new URL('/auth', request.url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
