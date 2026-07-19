
"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Terminal } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-12 md:py-24 w-full px-4">
      <div className="relative rounded-[2rem] md:rounded-[2.5rem] bg-[#222222] text-white p-8 sm:p-12 md:p-20 overflow-hidden text-center space-y-6 md:space-y-8 shadow-2xl border border-white/5">
        {/* Decorative Gradients */}
        <div className="absolute top-0 left-1/4 w-48 h-48 md:w-96 md:h-96 bg-primary/20 blur-[60px] md:blur-[120px] -translate-y-1/2 opacity-50"></div>
        <div className="absolute bottom-0 right-1/4 w-48 h-48 md:w-96 md:h-96 bg-zinc-500/10 blur-[60px] md:blur-[120px] translate-y-1/2 opacity-50"></div>

        <div className="relative z-10 space-y-6 md:space-y-8 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/5 border border-white/10 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-white/80 mb-1 md:mb-2">
            <Terminal className="w-3.5 h-3.5 text-primary" />
            Infrastructure for the Future
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-headline font-bold leading-[1.15] tracking-tight">
            Ready to <span className="text-white/30">Scale</span> Your Digital Business?
          </h2>
          <p className="text-white/50 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
            Join hundreds of enterprises relying on Point's robust infrastructure. Get high-speed API access, real-time webhooks, and enterprise SLA.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 pt-4">
            <Button asChild className="w-full sm:w-auto h-12 md:h-14 px-8 md:px-10 rounded-xl bg-white text-black hover:bg-white/90 font-bold text-sm md:text-base transition-all active:scale-95 shadow-xl shadow-white/5">
              <Link href="/console">
                Mulai Sekarang
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto h-12 md:h-14 px-8 md:px-10 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 font-bold text-sm md:text-base transition-all active:scale-95">
              <Link href="/console/developer/docs">
                Dokumentasi API
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
