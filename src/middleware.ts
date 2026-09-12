
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
  const CONSOLE_NESTED_PATHS = ['/subscribe', '/setting', '/transactions', '/services'];
  
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

    // PROTEKSI API SUBDOMAIN: Jangan alihkan ke console
    if (sub === 'api') {
      if (!pathname.startsWith('/api/')) {
        url.pathname = `/api${pathname}`;
        return NextResponse.rewrite(url);
      }
      return NextResponse.next();
    }

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

    // CROSS-SUBDOMAIN REDIRECTS: Jika path milik subdomain lain diakses di subdomain ini (misal /checkout di console.stspoint.id)
    for (const key in mappings) {
      const targetConfig = mappings[key];
      if (targetConfig.subdomain !== sub) {
        if (pathname === targetConfig.internal || pathname.startsWith(`${targetConfig.internal}/`)) {
          const cleanPath = pathname.replace(targetConfig.internal, '') || '/';
          return NextResponse.redirect(new URL(`https://${targetConfig.subdomain}.${rootDomain}${cleanPath}${search}`, request.url));
        }
      }
    }

    if (isPublicPath || isApiRoute) {
      return NextResponse.next();
    }

    // LOGIKA KHUSUS SUBDOMAIN CONSOLE (Merchant Suite)
    if (sub === 'console') {
      // Jika ini adalah layanan top-level (src/app/xxx), biarkan saja
      const isTopLevelService = TOP_LEVEL_SERVICES.some(p => pathname === p || pathname.startsWith(`${p}/`));
      if (isTopLevelService) {
        return NextResponse.next(); 
      }

      // Bersihkan rute /console eksplisit
      if (pathname.startsWith('/console')) {
        const cleanPath = pathname.replace('/console', '') || '/';
        return NextResponse.redirect(new URL(`https://${host}${cleanPath}${search}`, request.url));
      }

      // Rewrite rute console nested (subscribe, setting, dll)
      url.pathname = `/console${pathname}`;
      return NextResponse.rewrite(url);
    }

    // Rewrite rute untuk subdomain lain (partner, docs, dev)
    if (pathname.startsWith(config.internal)) {
      const cleanPath = pathname.replace(config.internal, '') || '/';
      return NextResponse.redirect(new URL(`https://${host}${cleanPath}${search}`, request.url));
    }

    url.pathname = `${config.internal}${pathname}`;
    return NextResponse.rewrite(url);
  }

  // 5. Redirect dari Domain Utama ke Subdomain yang sesuai
  if (host === rootDomain || host === wwwDomain) {
    if (pathname === '/signin' || pathname === '/signup') {
      return NextResponse.redirect(new URL(`https://console.${rootDomain}${pathname}`, request.url));
    }

    if (isPublicPath) return NextResponse.next();

    // Redirect merchant paths ke console
    for (const p of ALL_MERCHANT_PATHS) {
      if (pathname === p || pathname.startsWith(`${p}/`)) {
        return NextResponse.redirect(new URL(`https://console.${rootDomain}${pathname}${search}`, request.url));
      }
    }

    // Mapping rute internal eksplisit di root
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
