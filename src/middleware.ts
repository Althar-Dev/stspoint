import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * STSPoint Unified Subdomain Middleware
 * Menangani pembersihan URL dan pemetaan folder internal ke subdomain secara transparan.
 * Proteksi: Logika ini dinonaktifkan di lingkungan Localhost dan Workspace.
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';
  const { pathname } = url;

  // 1. CEK LINGKUNGAN PENGEMBANGAN
  const isDev = 
    host.includes('localhost') || 
    host.includes('127.0.0.1') || 
    host.includes('cloudworkstations.dev') || 
    host.includes('firebaseapp.com');

  // JIKA DI DEV, JANGAN LAKUKAN REDIRECT ATAU REWRITE SUBDOMAIN
  if (isDev) return NextResponse.next();

  const rootDomain = 'stspoint.id';

  // 2. Definisi Mapping Subdomain Produksi
  const mappings: Record<string, { internal: string; subdomain: string }> = {
    'console': { internal: '/console', subdomain: 'console' },
    'partner': { internal: '/client', subdomain: 'partner' },
    'dev': { internal: '/dev', subdomain: 'dev' },
    'checkout': { internal: '/checkout', subdomain: 'checkout' },
  };

  // 3. Logika Pembersihan Path Internal di Subdomain
  // Cek apakah host saat ini adalah salah satu subdomain kita
  const subKey = Object.keys(mappings).find(key => host.startsWith(`${mappings[key].subdomain}.`));

  if (subKey) {
    const config = mappings[subKey];

    // Redirect jika path diawali dengan folder internal (membersihkan URL publik)
    // Contoh: console.stspoint.id/console -> console.stspoint.id/
    if (pathname.startsWith(config.internal)) {
      const cleanPath = pathname.replace(config.internal, '') || '/';
      return NextResponse.redirect(new URL(`https://${host}${cleanPath}`, request.url));
    }

    // Rewrite secara transparan
    url.pathname = `${config.internal}${pathname}`;
    return NextResponse.rewrite(url);
  }

  // 4. Redirect dari domain utama ke subdomain jika mengakses path folder internal secara manual
  if (host === rootDomain) {
    for (const key in mappings) {
      const config = mappings[key];
      if (pathname.startsWith(config.internal)) {
        const cleanPath = pathname.replace(config.internal, '') || '/';
        return NextResponse.redirect(new URL(`https://${config.subdomain}.${rootDomain}${cleanPath}`, request.url));
      }
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
