import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get Started & Register',
  description: 'Daftar akun dan raih akses instan ke seluruh API bridge transaksi digital, PPOB, dan STSPay dari STSPoint.',
  alternates: {
    canonical: 'https://stspoint.id/signup',
  },
  openGraph: {
    title: 'Get Started & Register | STSPoint',
    description: 'Daftar akun STSPoint untuk integrasi API payment & PPOB.',
    url: 'https://stspoint.id/signup',
    type: 'website',
    images: ['/assets/img/logo.png'],
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
