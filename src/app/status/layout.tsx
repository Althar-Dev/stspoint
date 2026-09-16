import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System Status',
  description: 'Pantau status operasional, kesehatan server, dan latensi API STSPoint real-time untuk DigiFlazz, OrderKuota, Tripay, dan gateway payment.',
  keywords: [
    'STSPoint System Status',
    'Uptime Server PPOB',
    'Status API DigiFlazz',
    'Status API OrderKuota',
    'Latensi Payment Gateway'
  ],
  alternates: {
    canonical: 'https://stspoint.id/status',
  },
  openGraph: {
    title: 'System Status',
    description: 'Monitoring real-time kestabilan server dan latensi endpoint API STSPoint.',
    url: 'https://stspoint.id/status',
    type: 'website',
    images: ['/assets/img/logo.png'],
  },
};

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
