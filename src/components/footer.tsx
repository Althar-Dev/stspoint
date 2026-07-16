import Link from "next/link";
import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="bg-secondary/30 w-full py-16 px-6 md:px-12 lg:px-20 border-t border-black/5">
      <div className="w-full max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <Logo className="w-10 h-10" />
              <span className="font-headline font-bold text-2xl tracking-tighter">Point</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-sm">
              Platform infrastruktur gerbang digital terintegrasi untuk bisnis modern. Kami menyediakan solusi API, pembayaran, dan layanan cloud dalam satu pintu.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-4">Layanan</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/console/developer/docs" className="hover:text-primary transition-colors">Dokumentasi API</Link></li>
              <li><Link href="/console" className="hover:text-primary transition-colors">Dashboard H2H</Link></li>
              <li><Link href="/support" className="hover:text-primary transition-colors">Pusat Bantuan</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-4">Perusahaan</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">Tentang Kami</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">Syarat & Ketentuan</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-black/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-[10px] md:text-xs">© 2024 STSPoint. Infrastructure as a Service.</p>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center hover:bg-primary/10 cursor-pointer transition-colors">
              <span className="text-xs font-bold">IG</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center hover:bg-primary/10 cursor-pointer transition-colors">
              <span className="text-xs font-bold">TW</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center hover:bg-primary/10 cursor-pointer transition-colors">
              <span className="text-xs font-bold">FB</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
