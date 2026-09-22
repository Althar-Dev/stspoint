import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { DevToolsGuard } from '@/components/devtools-guard';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  applicationName: 'STSPoint',
  title: {
    default: 'STSPoint',
    template: '%s | STSPoint'
  },
  description: 'The ultimate digital gateway platform by StarVale Technology Solution. Providing enterprise-grade API solutions for PPOB, OTP, and STSPay payment bridges with 99.9% uptime. Developed and engineered by Alhadi Adriano (AltharDev) for high-scale business automation.',
  keywords: [
    'digital infrastructure',
    'payment gateway indonesia',
    'api bridge',
    'ppob api',
    'otp center',
    'stspay',
    'stspoint',
    'payment orchestration',
    'h2h ppob',
    'StarVale Technology Solution',
    'Alhadi Adriano',
    'AltharDev',
    'AltharDev Infrastructure',
    'StarVale ID',
    'Indonesian API Provider',
    'StarVale StarPoint'
  ],
  authors: [
    { name: 'Alhadi Adriano (AltharDev)', url: 'https://github.com/althardev' },
    { name: 'StarVale Technology Solution', url: 'https://stspoint.id/about' }
  ],
  creator: 'Alhadi Adriano (AltharDev)',
  publisher: 'StarVale Technology Solution',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://stspoint.id'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'STSPoint | Digital Infrastructure',
    description: 'Scale your business with robust payment and product distribution infrastructure by StarVale Technology Solution.',
    url: 'https://stspoint.id',
    siteName: 'STSPoint',
    images: [
      {
        url: '/assets/img/logo.png',
        width: 512,
        height: 512,
        alt: 'STSPoint Infrastructure Logo',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'STSPoint | Digital Infrastructure',
    description: 'High-speed APIs for payments and digital goods by StarVale Technology Solution.',
    creator: '@StarValeID',
    images: ['/assets/img/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/assets/img/logo.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '512x512',
        url: '/assets/img/logo.png',
      },
    ],
  },
  manifest: '/manifest.json',
  verification: {
    google: 'google-site-verification=L0Y-wjQWEqVL9gxAw-Z9o3NOzeD_6hSDA7WQ4O6pMWo',
  },
  other: {
    'geo.region': 'ID-JK',
    'geo.placename': 'Jakarta',
    'geo.position': '-6.2088;106.8456',
    'ICBM': '-6.2088, 106.8456',
    'DC.title': 'STSPoint | Digital Infrastructure & Payment Bridge',
    'DC.creator': 'Alhadi Adriano (AltharDev)',
    'DC.publisher': 'StarVale Technology Solution',
    'apple-mobile-web-app-title': 'STSPoint',
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#222222',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'STSPoint',
    alternateName: ['STS Point', 'STSPoint Platform', 'StarVale STSPoint'],
    url: 'https://stspoint.id',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://stspoint.id/docs?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'STSPoint',
    legalName: 'StarVale Technology Solution',
    url: 'https://stspoint.id',
    logo: 'https://stspoint.id/assets/img/logo.png',
    sameAs: [
      'https://github.com/althardev',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: 'https://stspoint.id/support',
    },
  };

  const siteNavigationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: [
      {
        '@type': 'SiteNavigationElement',
        position: 1,
        name: 'Sign In / Login',
        description: 'Masuk ke platform dashboard STSPoint.',
        url: 'https://stspoint.id/signin',
      },
      {
        '@type': 'SiteNavigationElement',
        position: 2,
        name: 'Documentation',
        description: 'Dokumentasi API lengkap untuk STSPay, PPOB, GoMerchant, dan Webhook.',
        url: 'https://stspoint.id/docs',
      },
      {
        '@type': 'SiteNavigationElement',
        position: 3,
        name: 'About',
        description: 'Tentang platform dan infrastruktur digital StarVale Technology Solution.',
        url: 'https://stspoint.id/about',
      },
      {
        '@type': 'SiteNavigationElement',
        position: 4,
        name: 'Support',
        description: 'Bantuan teknis dan layanan customer service 24/7.',
        url: 'https://stspoint.id/support',
      },
    ],
  };

  return (
    <html lang="id-ID" className={`${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteNavigationJsonLd) }}
        />
      </head>
      <body className="font-body antialiased selection:bg-primary/10 selection:text-primary min-h-screen">
        <FirebaseClientProvider>
          <DevToolsGuard />
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
