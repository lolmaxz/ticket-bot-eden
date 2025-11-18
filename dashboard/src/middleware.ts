import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Development flag to bypass authentication
const SKIP_AUTH = process.env.SKIP_AUTH === 'true';

// If auth is disabled, create a simple middleware that allows all requests
const middleware = SKIP_AUTH
  ? function middleware() {
      return NextResponse.next();
    }
  : withAuth({
      callbacks: {
        authorized: ({ token, req }) => {
          // Protect all routes except auth pages and public assets
          const { pathname } = req.nextUrl;

          // Allow login pages and root redirect
          if (pathname.startsWith('/login') || pathname === '/') {
            return true;
          }

          // Allow dashboard pages (they're protected by layout)
          if (pathname.startsWith('/dashboard')) {
            return !!token;
          }

          // Allow API routes (they handle their own auth)
          if (pathname.startsWith('/api')) {
            return true;
          }

          // Allow public assets
          if (
            pathname.startsWith('/_next') ||
            pathname.startsWith('/static') ||
            pathname.includes('.')
          ) {
            return true;
          }

          // Require authentication for all other routes
          return !!token;
        },
      },
      pages: {
        signIn: '/login',
        error: '/login/error',
      },
    });

export default middleware;

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};

