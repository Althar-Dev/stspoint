"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ShieldCheck, Zap, Globe, Cpu, Code2, Building } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/footer";

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10 selection:text-primary flex flex-col">
      {/* Custom Back Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 p-6 flex items-center max-w-7xl mx-auto w-full">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="group flex items-center gap-2 hover:bg-accent transition-all rounded-xl px-4"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="font-bold text-sm">Back</span>
        </Button>
      </div>

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20 space-y-20 flex-1">
        {/* Intro Section */}
        <section className="space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary">
            A StarVale Technology Solution Product
          </div>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter leading-tight">
            Membangun <span className="text-primary">Masa Depan</span> Infrastruktur Digital.
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
            STSPoint hadir sebagai solusi infrastruktur terintegrasi oleh <strong>StarVale Technology Solution</strong>. Didirikan oleh <strong>Alhadi Adriano (AltharDev)</strong>, kami percaya bahwa teknologi yang rumit di balik layar seharusnya dapat diakses dengan mudah, aman, dan handal bagi semua level bisnis.
          </p>
        </section>

        {/* Vision & Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-border shadow-sm rounded-xl p-8 bg-card">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-primary" />
              Visi Kami
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Menjadi gerbang digital utama yang menghubungkan ekosistem layanan mikro ke seluruh penjuru dunia dengan stabilitas tinggi dan latensi rendah melalui inovasi berkelanjutan dari StarVale.
            </p>
          </Card>
          <Card className="border-border shadow-sm rounded-xl p-8 bg-card">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              Misi Kami
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Menyediakan API yang handal, sistem keamanan yang teruji, dan dukungan infrastruktur skala korporasi yang dirancang oleh AltharDev untuk dapat dijangkau oleh semua level bisnis.
            </p>
          </Card>
        </div>

        {/* Core Values */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-headline font-bold uppercase tracking-widest">Keunggulan Sistem</h2>
            <div className="w-12 h-1 bg-primary mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            {[
              { icon: Zap, title: "Kecepatan Maksimal", desc: "Infrastruktur kami dioptimalkan untuk memproses ribuan permintaan per detik dengan rata-rata latensi 64ms." },
              { icon: ShieldCheck, title: "Keamanan Enterprise", desc: "Setiap transaksi dilindungi dengan protokol enkripsi mutakhir dan sistem deteksi anomali real-time." },
              { icon: Globe, title: "Akses Global", desc: "Terhubung dengan ratusan provider layanan digital di seluruh dunia melalui satu pintu integrasi Anycast." },
              { icon: Cpu, title: "Uptime 99.99%", desc: "Dukungan server multi-region StarVale memastikan layanan Anda tetap aktif tanpa gangguan teknis berarti." },
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-start group">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-lg">{item.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
