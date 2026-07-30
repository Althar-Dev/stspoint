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
        url: '/assets/img/logo.jpg',
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
    title: 'STSPoint | Digital Infrastructure',
    description: 'High-speed APIs for payments and digital goods by StarVale Technology Solution.',
    creator: '@StarValeID',
    images: ['/assets/img/logo.jpg'],
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
    icon: '/assets/img/logo.jpg',
    shortcut: '/assets/img/logo.jpg',
    apple: '/assets/img/logo.jpg',
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
  return (
    <html lang="id-ID" className={`${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
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
