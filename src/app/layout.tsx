import type {Metadata, Viewport} from 'next';
import './globals.css';
import {Toaster} from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: {
    default: 'STSPoint | StarVale Digital Infrastructure & Payment Bridge',
    template: '%s | STSPoint by StarVale'
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
    languages: {
      'id-ID': '/id',
      'en-US': '/en',
    },
  },
  openGraph: {
    title: 'STSPoint | Digital Infrastructure by AltharDev',
    description: 'Scale your business with robust payment and product distribution infrastructure by StarVale Technology Solution.',
    url: 'https://stspoint.id',
    siteName: 'STSPoint Infrastructure',
    images: [
      {
        url: '/assets/img/og-image.png',
        width: 1200,
        height: 630,
        alt: 'STSPoint Infrastructure by StarVale Technology Solution',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'STSPoint | Digital Infrastructure by AltharDev',
    description: 'High-speed APIs for payments and digital goods by StarVale Technology Solution.',
    creator: '@StarValeID',
    images: ['/assets/img/twitter-image.png'],
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
    icon: '/assets/img/icon.png',
    shortcut: '/assets/img/icon.png',
    apple: '/assets/img/icon.png',
  },
  manifest: '/manifest.json',
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
  return (
    <html lang="id-ID" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-primary/10 selection:text-primary min-h-screen">
        <FirebaseClientProvider>
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
