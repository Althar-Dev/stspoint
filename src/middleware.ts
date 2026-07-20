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
  const wwwDomain = 'www.stspoint.id';

  // 2. Definisi Mapping Subdomain Produksi
  const mappings: Record<string, { internal: string; subdomain: string }> = {
    'console': { internal: '/console', subdomain: 'console' },
    'partner': { internal: '/client', subdomain: 'partner' },
    'dev': { internal: '/dev', subdomain: 'dev' },
    'checkout': { internal: '/checkout', subdomain: 'checkout' },
    'docs': { internal: '/docs', subdomain: 'docs' },
  };

  // 3. Logika Jika Request Datang ke Subdomain (misal: console.stspoint.id)
  const currentSubKey = Object.keys(mappings).find(key => host.startsWith(`${mappings[key].subdomain}.`));

  if (currentSubKey) {
    const config = mappings[currentSubKey];

    // Redirect jika path diawali dengan folder internal MILIK subdomain ini (Pembersihan URL)
    // Contoh: console.stspoint.id/console/dashboard -> console.stspoint.id/dashboard
    if (pathname.startsWith(config.internal)) {
      const cleanPath = pathname.replace(config.internal, '') || '/';
      return NextResponse.redirect(new URL(`https://${host}${cleanPath}`, request.url));
    }

    // CEK CROSS-SUBDOMAIN: Jika user di subdomain A mengakses path milik subdomain B
    // Contoh: partner.stspoint.id/console -> REDIRECT KE console.stspoint.id/
    for (const key in mappings) {
      if (key !== currentSubKey && (pathname === mappings[key].internal || pathname.startsWith(`${mappings[key].internal}/`))) {
        const targetConfig = mappings[key];
        const cleanPath = pathname.replace(targetConfig.internal, '') || '/';
        return NextResponse.redirect(new URL(`https://${targetConfig.subdomain}.${rootDomain}${cleanPath}`, request.url));
      }
    }

    // Rewrite secara transparan untuk folder internal yang tepat
    url.pathname = `${config.internal}${pathname}`;
    return NextResponse.rewrite(url);
  }

  // 4. Redirect dari Domain Utama (stspoint.id atau www.stspoint.id) ke Subdomain
  if (host === rootDomain || host === wwwDomain) {
    for (const key in mappings) {
      const config = mappings[key];
      // Jika path dimulai dengan folder internal, redirect ke subdomain terkait
      if (pathname === config.internal || pathname.startsWith(`${config.internal}/`)) {
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
