import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Protected routes that require authentication
  const protectedRoutes = ['/admin', '/history', '/myprofile', '/TopUp'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Auth routes
  const authRoutes = ['/auth/login', '/auth/register'];
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // If not logged in and trying to access protected route, redirect to login
  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // If logged in and trying to access auth routes, redirect to home
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};