"use client";

import { Terminal, Code2, Rocket } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    { icon: Terminal, title: "Dapatkan API Key", desc: "Daftar di konsol dan dapatkan kredensial akses API dalam hitungan detik." },
    { icon: Code2, title: "Integrasi Sistem", desc: "Hubungkan aplikasi Anda menggunakan dokumentasi SDK kami yang lengkap." },
    { icon: Rocket, title: "Mulai Skalakan Bisnis", desc: "Proses transaksi PPOB, SMM, dan OTP secara otomatis di seluruh dunia." },
  ];

  return (
    <section id="features" className="w-full py-12 scroll-mt-24">
      <div className="bg-slate-50 rounded-[2.5rem] p-8 md:p-16 border border-black/5 relative overflow-hidden w-full">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32"></div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-headline font-bold">Infrastruktur yang <span className="text-primary">Mudah Diintegrasi</span></h2>
            <p className="text-muted-foreground text-sm leading-relaxed">Kami membangun teknologi di balik layar agar Anda bisa fokus membesarkan bisnis digital Anda tanpa hambatan teknis.</p>
            <div className="space-y-4">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl bg-white border border-black/5 group hover:border-primary transition-all">
                  <div className="w-10 h-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-sm">{step.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-7 flex justify-center">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-black/5 shadow-2xl bg-black p-4 font-mono text-[10px] text-green-400">
              <div className="flex gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <p className="mb-1">{">"} npm install @stspoint/sdk</p>
              <p className="mb-1 text-white/50">// Initializing infrastructure client...</p>
              <p className="mb-1 text-blue-400">const client = new STSClient({"{"} apiKey: 'sts_live_83k9..' {"}"});</p>
              <p className="mb-1 text-blue-400">await client.ppob.transaction({"{"}</p>
              <p className="mb-1 text-blue-400">  sku: 'TSEL10',</p>
              <p className="mb-1 text-blue-400">  target: '08123456789'</p>
              <p className="mb-1 text-blue-400">{"}"});</p>
              <p className="text-white animate-pulse">{">"} Processing transaction... Success!</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
