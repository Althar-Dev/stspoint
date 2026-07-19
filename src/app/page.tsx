
"use client";

import { LandingLayout } from "@/components/layouts/landing-layout";
import { HeroSection } from "@/components/sections/hero";
import { ServicesSection } from "@/components/sections/services";
import { HowItWorksSection } from "@/components/sections/how-it-works";
import { CatalogSection } from "@/components/sections/catalog";
import { TestimonialsSection } from "@/components/sections/testimonials";
import { FAQSection } from "@/components/sections/faq";
import { CTASection } from "@/components/sections/cta";
import { Zap, ShieldCheck, Cpu, Globe } from "lucide-react";

export default function Home() {
  return (
    <LandingLayout>
      <div className="space-y-24 pb-20">
        <HeroSection />

        {/* Global Performance Metrics */}
        <section className="bg-white py-16 border-y border-black/5">
          <div className="w-full max-w-screen-2xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-20">
              {[
                { icon: Zap, label: "64ms", sub: "Avg. API Latency" },
                { icon: ShieldCheck, label: "Certified", sub: "Enterprise Grade" },
                { icon: Cpu, label: "99.99%", sub: "Service Uptime" },
                { icon: Globe, label: "Anycast", sub: "Global Edge Nodes" },
              ].map((stat, i) => (
                <div key={i} className="text-center space-y-4 group">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-2 text-gray-900 shadow-sm border border-gray-100 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    <stat.icon className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-headline font-bold text-2xl md:text-3xl tracking-tighter">{stat.label}</h4>
                    <p className="text-[10px] md:text-[11px] text-muted-foreground uppercase tracking-[0.2em] font-bold">{stat.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-screen-2xl mx-auto px-6 space-y-32">
          <ServicesSection />
          <HowItWorksSection />
          <CatalogSection />
          <TestimonialsSection />
          <FAQSection />
          <CTASection />
        </div>
      </div>
    </LandingLayout>
  );
}
