import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Masuk ke dashboard konsol developer STSPoint untuk mengelola API Key, mutasi transaksi, dan pengaturan webhook.',
  alternates: {
    canonical: 'https://stspoint.id/signin',
  },
  openGraph: {
    title: 'Login | STSPoint',
    description: 'Masuk ke dashboard konsol STSPoint.',
    url: 'https://stspoint.id/signin',
    type: 'website',
    images: ['/assets/img/logo.png'],
  },
};

export default function SigninLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
