
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * STSPoint API Routing Middleware
 * Handles clean URL rewrites (removing /api prefix requirement for clients)
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // List of paths that should be internally mapped to the /api directory
  // We include specific gopay and orkut paths to avoid conflicting with their UI routes
  const apiRewrites = [
    '/payments',
    '/ppob',
    '/webhooks',
    '/gopay/create',
    '/gopay/status',
    '/orkut/create',
    '/orkut/status'
  ];

  const shouldRewrite = apiRewrites.some(path => pathname.startsWith(prefix(path)));

  if (shouldRewrite && !pathname.startsWith('/api')) {
    const url = request.nextUrl.clone();
    url.pathname = `/api${pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

/**
 * Helper to ensure exact or nested path matches
 */
function prefix(path: string) {
  return path.endsWith('/') ? path : `${path}`;
}

export const config = {
  matcher: [
    '/payments/:path*',
    '/ppob/:path*',
    '/webhooks/:path*',
    '/gopay/create',
    '/gopay/status',
    '/orkut/create',
    '/orkut/status',
  ],
};
