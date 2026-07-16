"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Hendra Wijaya",
    role: "CEO TokoDigital ID",
    comment: "Pindah ke infrastruktur STSPoint adalah keputusan terbaik. Latency API mereka sangat rendah, membuat sistem kami jauh lebih responsif.",
    avatar: "https://picsum.photos/seed/hendra/100/100",
  },
  {
    name: "Sarah Annisa",
    role: "Fullstack Developer",
    comment: "Dokumentasi API-nya sangat lengkap. Integrasi PPOB dan OTP hanya butuh waktu kurang dari satu hari untuk live di aplikasi kami.",
    avatar: "https://picsum.photos/seed/sarah/100/100",
  },
  {
    name: "Rian Pratama",
    role: "Owner SMM Gateway",
    comment: "SLA Uptime yang mereka janjikan benar-benar terbukti. Sangat stabil bahkan saat trafik transaksi sedang di puncak.",
    avatar: "https://picsum.photos/seed/rian/100/100",
  },
];

export function TestimonialsSection() {
  return (
    <section id="about" className="py-12 scroll-mt-24">
      <div className="text-center space-y-4 mb-16">
        <h2 className="text-3xl md:text-5xl font-headline font-bold tracking-tight">
          Apa kata <span className="text-primary">mitra kami</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
          STSPoint menjadi tulang punggung bagi berbagai platform digital di Indonesia.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {TESTIMONIALS.map((t, i) => (
          <Card key={i} className="border border-black/5 shadow-sm rounded-2xl bg-slate-50 overflow-hidden hover:shadow-md transition-all">
            <CardContent className="p-8 space-y-6">
              <div className="flex gap-1">
                {[...Array(5)].map((_, idx) => (
                  <Star key={idx} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm italic leading-relaxed text-slate-700">"{t.comment}"</p>
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                  <AvatarImage src={t.avatar} alt={t.name} />
                  <AvatarFallback>{t.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold text-sm">{t.name}</h4>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{t.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
