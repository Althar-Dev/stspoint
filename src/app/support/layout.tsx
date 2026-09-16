import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pusat Bantuan & Layanan Pelanggan',
  description: 'Hubungi tim bantuan StarVale Technology Solution & STSPoint untuk bantuan integrasi API, kendala transaksi, dan konsultasi teknis 24/7.',
  keywords: [
    'Customer Support STSPoint',
    'Bantuan Integrasi API',
    'StarVale Support',
    'Kontak STSPoint',
    'Layanan Pelanggan PPOB'
  ],
  alternates: {
    canonical: 'https://stspoint.id/support',
  },
  openGraph: {
    title: 'Pusat Bantuan & Layanan Pelanggan',
    description: 'Dukungan teknis dan customer service 24/7 dari StarVale Technology Solution.',
    url: 'https://stspoint.id/support',
    type: 'website',
    images: ['/assets/img/logo.png'],
  },
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
