import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan Layanan',
  description: 'Syarat dan ketentuan penggunaan layanan API, payment bridge STSPay, dan infrastruktur transaksi digital STSPoint oleh StarVale.',
  alternates: {
    canonical: 'https://stspoint.id/terms-of-service',
  },
  openGraph: {
    title: 'Syarat & Ketentuan Layanan',
    description: 'Panduan dan ketentuan resmi penggunaan layanan & API STSPoint.',
    url: 'https://stspoint.id/terms-of-service',
    type: 'website',
    images: ['/assets/img/logo.png'],
  },
};

export default function TermsOfServiceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
