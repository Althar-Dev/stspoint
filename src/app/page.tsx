
"use client";

import { LandingLayout } from "@/components/layouts/landing-layout";
import { HeroSection } from "@/components/sections/hero";
import { HowItWorksSection } from "@/components/sections/how-it-works";
import { TestimonialsSection } from "@/components/sections/testimonials";
import { FAQSection } from "@/components/sections/faq";
import { CTASection } from "@/components/sections/cta";
import { Zap, ShieldCheck, Cpu, Globe } from "lucide-react";

export default function Home() {
  return (
    <LandingLayout>
      <div className="space-y-20 pb-20">
        <HeroSection />

        {/* Core Infrastructure Stats */}
        <section className="bg-white py-12">
          <div className="w-full max-w-screen-2xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {[
                { icon: Zap, label: "64ms", sub: "Rata-rata Latency" },
                { icon: ShieldCheck, label: "Official", sub: "Legal & Enterprise" },
                { icon: Cpu, label: "99.99%", sub: "Uptime SLA" },
                { icon: Globe, label: "Global", sub: "Edge Infrastructure" },
              ].map((stat, i) => (
                <div key={i} className="text-center space-y-3 group">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4 text-gray-900 shadow-sm border border-gray-100 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    <stat.icon className="w-7 h-7" />
                  </div>
                  <h4 className="font-headline font-bold text-xl md:text-2xl">{stat.label}</h4>
                  <p className="text-[10px] md:text-[11px] text-muted-foreground uppercase tracking-[0.2em] font-bold">{stat.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-screen-2xl mx-auto px-6 space-y-32">
          <HowItWorksSection />
          <TestimonialsSection />
          <FAQSection />
          <CTASection />
        </div>
      </div>
    </LandingLayout>
  );
}
