import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tentang Kami',
  description: 'Mengenal STSPoint dan StarVale Technology Solution yang didirikan oleh Alhadi Adriano (AltharDev). Penyedia gerbang digital dan infrastruktur API payment bridge, PPOB, serta OTP Center terpercaya di Indonesia.',
  keywords: [
    'Tentang STSPoint',
    'StarVale Technology Solution',
    'Alhadi Adriano',
    'AltharDev',
    'Digital Infrastructure Indonesia',
    'Payment Gateway H2H'
  ],
  alternates: {
    canonical: 'https://stspoint.id/about',
  },
  openGraph: {
    title: 'Tentang Kami',
    description: 'Solusi infrastruktur digital terintegrasi skala korporasi oleh StarVale & AltharDev.',
    url: 'https://stspoint.id/about',
    type: 'website',
    images: ['/assets/img/logo.png'],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
