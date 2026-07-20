
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * STSPoint Unified Subdomain Middleware
 * Menangani pembersihan URL agar folder internal tidak muncul di subdomain.
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';
  const { pathname } = url;

  // 1. Lewati logika jika di localhost atau workspace agar tidak merusak pengembangan
  const isDev = host.includes('localhost') || host.includes('9002') || host.includes('firebaseapp.com');
  if (isDev) return NextResponse.next();

  const rootDomain = 'stspoint.id';

  // 2. Definisi Mapping Subdomain
  const mappings: Record<string, { internal: string; subdomain: string }> = {
    'console': { internal: '/console', subdomain: 'console' },
    'partner': { internal: '/client', subdomain: 'partner' },
    'dev': { internal: '/dev', subdomain: 'dev' },
    'checkout': { internal: '/checkout', subdomain: 'checkout' },
  };

  // 3. Cek apakah host saat ini adalah salah satu subdomain yang terdaftar
  const sub = Object.keys(mappings).find(key => host.startsWith(`${mappings[key].subdomain}.`));

  if (sub) {
    const config = mappings[sub];

    // JIKA PATH DIAWALI DENGAN FOLDER INTERNAL (Misal: console.stspoint.id/console)
    // REDIRECT UNTUK MENGHAPUS PREFIX TERSEBUT DARI URL BROWSER
    if (pathname.startsWith(config.internal)) {
      const cleanPath = pathname.replace(config.internal, '') || '/';
      return NextResponse.redirect(new URL(`https://${host}${cleanPath}`, request.url));
    }

    // REWRITE SECARA TRANSPARAN (User tetap melihat console.stspoint.id/ tapi sistem baca /console)
    url.pathname = `${config.internal}${pathname}`;
    return NextResponse.rewrite(url);
  }

  // 4. Redirect jika user mencoba akses path internal dari domain utama stspoint.id
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
