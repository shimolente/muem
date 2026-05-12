/**
 * Auth gate for /admin/*.
 * Unauthenticated → /admin/login.
 * Authenticated visiting /admin/login → /admin/dashboard.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAdminRoute = pathname.startsWith('/admin');
  const isLogin      = pathname === '/admin/login';

  if (isAdminRoute && !isLogin && !req.auth) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  if (isLogin && req.auth) {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*'],
};
