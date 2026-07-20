
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * STSPoint Unified Subdomain Middleware
 * Handles: checkout, dev, console, and partner (mapped from /client)
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';
  const { pathname } = url;

  // 1. Skip logic for local development or workspace
  const isDev = host.includes('localhost') || host.includes('9002') || host.includes('firebaseapp.com');
  if (isDev) return NextResponse.next();

  const rootDomain = 'stspoint.id';

  // 2. Map Subdomains to Internal Paths
  // partner.stspoint.id -> /client
  if (host.startsWith('partner.')) {
    url.pathname = `/client${pathname}`;
    return NextResponse.rewrite(url);
  }

  // console.stspoint.id -> /console
  if (host.startsWith('console.')) {
    url.pathname = `/console${pathname}`;
    return NextResponse.rewrite(url);
  }

  // dev.stspoint.id -> /dev
  if (host.startsWith('dev.')) {
    url.pathname = `/dev${pathname}`;
    return NextResponse.rewrite(url);
  }

  // checkout.stspoint.id -> /checkout
  if (host.startsWith('checkout.')) {
    url.pathname = `/checkout${pathname}`;
    return NextResponse.rewrite(url);
  }

  // 3. Handle Redirects from Main Domain to Subdomains
  if (host === rootDomain) {
    if (pathname.startsWith('/console')) {
      return NextResponse.redirect(new URL(`https://console.${rootDomain}${pathname.replace('/console', '')}`, request.url));
    }
    if (pathname.startsWith('/client')) {
      return NextResponse.redirect(new URL(`https://partner.${rootDomain}${pathname.replace('/client', '')}`, request.url));
    }
    if (pathname.startsWith('/dev')) {
      return NextResponse.redirect(new URL(`https://dev.${rootDomain}${pathname.replace('/dev', '')}`, request.url));
    }
    if (pathname.startsWith('/checkout')) {
      return NextResponse.redirect(new URL(`https://checkout.${rootDomain}${pathname.replace('/checkout', '')}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - assets (public assets)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|assets|favicon.ico).*)',
  ],
};
