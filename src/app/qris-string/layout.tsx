import type { Metadata } from 'next';
import { QrisStringLayoutClient } from './qris-string-layout-client';

export const metadata: Metadata = {
  title: 'QRIS String Parser & Decoder Online Gratis',
  description: 'Tool gratis untuk membaca, mengekstrak, dan mendekode raw string QRIS standar EMVCo secara cepat dari file gambar atau foto QR Code.',
  keywords: [
    'QRIS String Parser',
    'QRIS Decoder Online',
    'Ekstrak String QRIS',
    'EMVCo QRIS Reader',
    'STSPoint QRIS Tools'
  ],
  alternates: {
    canonical: 'https://stspoint.id/qris-string',
  },
  openGraph: {
    title: 'QRIS String Parser & Decoder Online Gratis',
    description: 'Dekode string QRIS standar EMVCo secara cepat & tepat dari gambar QR Code.',
    url: 'https://stspoint.id/qris-string',
    type: 'website',
    images: ['/assets/img/logo.jpg'],
  },
};

export default function QrisStringLayout({ children }: { children: React.ReactNode }) {
  return <QrisStringLayoutClient>{children}</QrisStringLayoutClient>;
}
