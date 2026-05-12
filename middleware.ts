/**
 * Auth gate for /admin/*.
 * Lightweight cookie-presence check for Edge runtime (stays under 1 MB).
 * Full JWT verification happens in each server action / RSC via auth().
 *
 * Auth.js v5 stores the session in:
 *   - Development: "authjs.session-token"
 *   - Production:  "__Secure-authjs.session-token"
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === '/admin/login';

  const sessionToken =
    request.cookies.get('authjs.session-token')?.value ||
    request.cookies.get('__Secure-authjs.session-token')?.value;

  // Unauthenticated → redirect to login
  if (!isLogin && !sessionToken) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already logged in visiting login page → dashboard
  if (isLogin && sessionToken) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
