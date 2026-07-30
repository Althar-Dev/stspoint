import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description: 'Kebijakan privasi dan perlindungan data pengguna pada penggunaan platform, API, dan layanan pembayaran STSPoint StarVale.',
  alternates: {
    canonical: 'https://stspoint.id/privacy-policy',
  },
  openGraph: {
    title: 'Kebijakan Privasi',
    description: 'Komitmen keamanan data dan perlindungan privasi pengguna STSPoint.',
    url: 'https://stspoint.id/privacy-policy',
    type: 'website',
    images: ['/assets/img/logo.jpg'],
  },
};

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
