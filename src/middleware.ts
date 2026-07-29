
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

  // MERCHANT TOP-LEVEL SERVICES: Rute yang berada di folder root src/app/
  const TOP_LEVEL_SERVICES = ['/orkut', '/gopay', '/pay', '/ai', '/shopeepay', '/ovo'];
  
  // CONSOLE NESTED PATHS: Rute yang berada di dalam folder src/app/console/
  const CONSOLE_NESTED_PATHS = ['/subscribe', '/setting', '/transactions'];
  
  // ALL MERCHANT CONTEXT PATHS: Untuk keperluan redirect dari root domain
  const ALL_MERCHANT_PATHS = [...TOP_LEVEL_SERVICES, ...CONSOLE_NESTED_PATHS];

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

    // CROSS-SUBDOMAIN REDIRECTS: Jika path milik layanan merchant diakses di subdomain non-console
    const isMerchantPath = ALL_MERCHANT_PATHS.some(p => pathname === p || pathname.startsWith(`${p}/`));
    if (isMerchantPath && sub !== 'console') {
      return NextResponse.redirect(new URL(`https://console.${rootDomain}${pathname}${search}`, request.url));
    }

    if (isPublicPath || isApiRoute) {
      return NextResponse.next();
    }

    // REDIRECT CROSS-SUBDOMAIN: Jika path internal subdomain lain diakses secara eksplisit
    for (const key in mappings) {
      const otherConf = mappings[key];
      if (otherConf.subdomain !== sub && (pathname === otherConf.internal || pathname.startsWith(`${otherConf.internal}/`))) {
        const cleanPath = pathname.replace(otherConf.internal, '') || '/';
        return NextResponse.redirect(new URL(`https://${otherConf.subdomain}.${rootDomain}${cleanPath}${search}`, request.url));
      }
    }

    // LOGIKA KHUSUS SUBDOMAIN CONSOLE (Merchant Suite)
    if (sub === 'console') {
      // Jika ini adalah layanan top-level (bukan di dalam folder console), biarkan saja (direct hit ke src/app/service)
      const isTopLevelService = TOP_LEVEL_SERVICES.some(p => pathname === p || pathname.startsWith(`${p}/`));
      if (isTopLevelService) {
        return NextResponse.next(); 
      }

      // Jika user mengetik /console di subdomain console, bersihkan rutenya
      if (pathname.startsWith('/console')) {
        const cleanPath = pathname.replace('/console', '') || '/';
        return NextResponse.redirect(new URL(`https://${host}${cleanPath}${search}`, request.url));
      }

      // Rewrite rute lain (termasuk /subscribe, /setting) ke dalam folder /console
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

    // Redirect merchant paths ke console subdomain
    for (const p of ALL_MERCHANT_PATHS) {
      if (pathname === p || pathname.startsWith(`${p}/`)) {
        return NextResponse.redirect(new URL(`https://console.${rootDomain}${pathname}${search}`, request.url));
      }
    }

    // Mapping redirect otomatis jika user mengetik path internal di domain root (e.g. /console, /client)
    for (const key in mappings) {
      const config = mappings[key];
      if (pathname === config.internal || pathname.startsWith(`${config.internal}/`)) {
        const cleanPath = pathname.replace(config.internal, '') || '/';
        return NextResponse.redirect(new URL(`https://${config.subdomain}.${rootDomain}${cleanPath}${search}`, request.url));
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
