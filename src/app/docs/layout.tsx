import type { Metadata } from 'next';
import { DocsLayoutClient } from './docs-layout-client';

export const metadata: Metadata = {
  title: 'Dokumentasi API & Integrasi H2H',
  description: 'Panduan lengkap dan dokumentasi integrasi API STSPoint untuk transaksi PPOB, STSPay payment bridge, OTP Center, dan webhook real-time.',
  keywords: [
    'Dokumentasi API STSPoint',
    'API PPOB Indonesia',
    'Integrasi H2H',
    'STSPay API',
    'OTP Center API',
    'API Payment Bridge'
  ],
  alternates: {
    canonical: 'https://stspoint.id/docs',
  },
  openGraph: {
    title: 'Dokumentasi API & Integrasi H2H',
    description: 'Integrasi API transaksi PPOB, STSPay, dan OTP Center dengan latensi rendah dan kepastian sukses tinggi.',
    url: 'https://stspoint.id/docs',
    type: 'website',
    images: ['/assets/img/logo.jpg'],
  },
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <DocsLayoutClient>{children}</DocsLayoutClient>;
}
