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

  // Unauthenticated → redirect to login.
  // Presence-only check (Edge-safe). The validated check happens in the
  // (shell) layout via auth(). The reverse redirect (login → dashboard for
  // logged-in users) lives in app/(admin)/admin/login/page.tsx where it can
  // validate the JWT — doing it here on cookie presence alone causes an
  // infinite loop when the cookie is stale (layout bounces to login, this
  // bounces back). Do not reintroduce it.
  if (!isLogin && !sessionToken) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
