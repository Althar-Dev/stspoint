import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * STSPoint Unified Subdomain Middleware
 * Menangani pembersihan URL, proteksi rute autentikasi, dan pemetaan subdomain.
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';
  const { pathname, search } = url;

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

  // MERCHANT CLUSTER: Rute yang merupakan saudara kandung /console tapi harus diakses di subdomain console.
  const MERCHANT_SERVICE_PATHS = ['/orkut', '/gopay', '/pay', '/ai'];

  // 3. Rute Publik & File Sistem Global
  const PUBLIC_PATHS = [
    '/signin',
    '/signup',
    '/about',
    '/support',
    '/status',
    '/access',
    '/qris-string',
    '/terms-of-service',
    '/privacy-policy',
    '/manifest.json',
    '/robots.txt',
    '/sitemap.xml',
    '/favicon.ico',
    '/assets/'
  ];

  const isPublicPath = PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`));
  const isApiRoute = pathname.startsWith('/api/');

  // 4. Logika Jika Request Datang ke Subdomain
  const currentSubKey = Object.keys(mappings).find(key => host.startsWith(`${mappings[key].subdomain}.`));

  if (currentSubKey) {
    const config = mappings[currentSubKey];
    const sub = config.subdomain;

    // PROTEKSI AUTENTIKASI: /signin & /signup HANYA untuk console dan partner
    if (pathname === '/signin' || pathname === '/signup') {
      if (sub !== 'console' && sub !== 'partner') {
        return NextResponse.redirect(new URL(`https://console.${rootDomain}${pathname}`, request.url));
      }
      return NextResponse.next();
    }

    if (isPublicPath || isApiRoute) {
      return NextResponse.next();
    }

    // LOGIKA KHUSUS SUBDOMAIN CONSOLE (Merchant Suite)
    if (sub === 'console') {
      const isServicePath = MERCHANT_SERVICE_PATHS.some(p => pathname === p || pathname.startsWith(`${p}/`));
      if (isServicePath) {
        return NextResponse.next(); 
      }

      if (pathname.startsWith('/console')) {
        const cleanPath = pathname.replace('/console', '') || '/';
        return NextResponse.redirect(new URL(`https://${host}${cleanPath}${search}`, request.url));
      }

      url.pathname = `/console${pathname}`;
      return NextResponse.rewrite(url);
    }

    // LOGIKA UNTUK SUBDOMAIN LAIN (partner, docs, dev, api, etc)
    if (pathname.startsWith(config.internal)) {
      const cleanPath = pathname.replace(config.internal, '') || '/';
      return NextResponse.redirect(new URL(`https://${host}${cleanPath}${search}`, request.url));
    }

    url.pathname = `${config.internal}${pathname}`;
    return NextResponse.rewrite(url);
  }

  // 5. Redirect dari Domain Utama (stspoint.id atau www.stspoint.id) ke Subdomain
  if (host === rootDomain || host === wwwDomain) {
    if (pathname === '/signin' || pathname === '/signup') {
      return NextResponse.redirect(new URL(`https://console.${rootDomain}${pathname}`, request.url));
    }

    if (isPublicPath) return NextResponse.next();

    // Mapping redirect otomatis jika user mengetik path internal di domain root
    for (const key in mappings) {
      const config = mappings[key];
      if (pathname === config.internal || pathname.startsWith(`${config.internal}/`)) {
        const cleanPath = pathname.replace(config.internal, '') || '/';
        return NextResponse.redirect(new URL(`https://${config.subdomain}.${rootDomain}${cleanPath}${search}`, request.url));
      }
    }
    
    // Cek juga untuk merchant services di domain root
    for (const p of MERCHANT_SERVICE_PATHS) {
      if (pathname === p || pathname.startsWith(`${p}/`)) {
        return NextResponse.redirect(new URL(`https://console.${rootDomain}${pathname}`, request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|assets|favicon.ico).*)',
  ],
};