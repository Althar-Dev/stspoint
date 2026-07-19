import type {Metadata, Viewport} from 'next';
import './globals.css';
import {Toaster} from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: {
    default: 'STSPoint | Professional Digital Infrastructure & Payment Bridge',
    template: '%s | STSPoint'
  },
  description: 'Integrated digital gateway platform for modern businesses. Providing high-speed APIs for PPOB, OTP, and STSPay payments with 99.9% uptime and low-latency infrastructure.',
  keywords: ['digital infrastructure', 'payment gateway indonesia', 'api bridge', 'ppob api', 'otp center', 'stspay', 'stspoint', 'payment orchestration', 'h2h ppob'],
  authors: [{ name: 'STSPoint Team' }],
  creator: 'STSPoint',
  publisher: 'STSPoint',
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
    title: 'STSPoint | Professional Digital Infrastructure & Payment Bridge',
    description: 'Scale your business with our robust payment and product distribution infrastructure.',
    url: 'https://stspoint.id',
    siteName: 'STSPoint',
    images: [
      {
        url: '/assets/img/og-image.png',
        width: 1200,
        height: 630,
        alt: 'STSPoint Infrastructure Dashboard',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'STSPoint | Digital Infrastructure',
    description: 'High-speed APIs for payments and digital goods.',
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
        {/* GEO Meta Tags */}
        <meta name="geo.region" content="ID-JK" />
        <meta name="geo.placename" content="Jakarta" />
        <meta name="geo.position" content="-6.2088;106.8456" />
        <meta name="ICBM" content="-6.2088, 106.8456" />
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
