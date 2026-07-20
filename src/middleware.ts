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
    'api': { internal: '/api', subdomain: 'api' },
  };

  // 3. Rute Publik & File Sistem Global (Jangan di-rewrite atau di-redirect)
  const PUBLIC_PATHS = [
    '/signin',
    '/signup',
    '/about',
    '/support',
    '/status',
    '/qris-string',
    '/terms-of-service',
    '/privacy-policy',
    '/auth',
    '/manifest.json',
    '/robots.txt',
    '/sitemap.xml',
    '/favicon.ico'
  ];

  const isPublicPath = PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`));
  const isApiRoute = pathname.startsWith('/api/');

  // 4. Logika Jika Request Datang ke Subdomain (misal: console.stspoint.id)
  const currentSubKey = Object.keys(mappings).find(key => host.startsWith(`${mappings[key].subdomain}.`));

  if (currentSubKey) {
    const config = mappings[currentSubKey];

    // Jika ini adalah rute publik global atau file sistem, biarkan apa adanya
    if (isPublicPath) {
      return NextResponse.next();
    }

    // PENTING: Jangan redirect panggilan API antar subdomain untuk menghindari CORS error
    // Biarkan saja dia ter-rewrite ke folder internal API jika memang dia memanggil /api/
    if (isApiRoute) {
      // Jika kita berada di subdomain selain 'api', biarkan dia mengakses /api secara internal
      return NextResponse.next();
    }

    // Redirect jika path diawali dengan folder internal MILIK subdomain ini (Pembersihan URL)
    if (pathname.startsWith(config.internal)) {
      const cleanPath = pathname.replace(config.internal, '') || '/';
      return NextResponse.redirect(new URL(`https://${host}${cleanPath}`, request.url));
    }

    // CEK CROSS-SUBDOMAIN: Jika user di subdomain A mengakses path milik subdomain B (BUKAN API)
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

  // 5. Redirect dari Domain Utama (stspoint.id atau www.stspoint.id) ke Subdomain
  if (host === rootDomain || host === wwwDomain) {
    // Jangan ganggu file sistem di root
    if (isPublicPath) return NextResponse.next();

    for (const key in mappings) {
      const config = mappings[key];
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
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - assets (public assets)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|assets|favicon.ico).*)',
  ],
};
