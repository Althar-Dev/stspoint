
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Zap, Smartphone, Users, MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";

const SERVICES = [
  {
    title: "STSPay Gateway",
    desc: "Unified payment orchestration supporting QRIS, Virtual Accounts, and E-Wallets with automatic settlement.",
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-500/5",
    link: "/pay"
  },
  {
    title: "PPOB Distribution",
    desc: "High-speed API for digital goods fulfillment including Credit, Data, PLN, and Game Vouchers.",
    icon: Smartphone,
    color: "text-blue-500",
    bg: "bg-blue-500/5",
    link: "/console/services/ppob"
  },
  {
    title: "OTP Center",
    desc: "Secure virtual number provisioning for global app verifications with instant SMS delivery.",
    icon: MessageSquare,
    color: "text-purple-500",
    bg: "bg-purple-500/5",
    link: "/console/services/nokos"
  },
  {
    title: "SMM Panel Bridge",
    desc: "Scale your social presence through our automated bridge to global social media service providers.",
    icon: Users,
    color: "text-emerald-500",
    bg: "bg-emerald-500/5",
    link: "/console/services/smm"
  }
];

export function ServicesSection() {
  return (
    <section id="services" className="py-12 md:py-24 scroll-mt-24">
      <div className="text-center space-y-4 mb-12 md:mb-20 px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary">
          Core Capabilities
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-headline font-bold tracking-tight">
          One Platform. <span className="text-primary/40">Multiple Solutions.</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          Integrated infrastructure designed to eliminate technical complexity and accelerate your business growth.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {SERVICES.map((svc, i) => (
          <Card key={i} className="border-border shadow-sm rounded-2xl md:rounded-[2rem] bg-card hover:border-primary/20 transition-all group">
            <CardContent className="p-6 md:p-8 space-y-4 md:space-y-6 flex flex-col h-full">
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl ${svc.bg} ${svc.color} flex items-center justify-center transition-transform group-hover:scale-110 duration-500`}>
                <svc.icon className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <div className="space-y-2 md:space-y-3 flex-1">
                <h3 className="text-lg md:text-xl font-bold">{svc.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {svc.desc}
                </p>
              </div>
              <Link href={svc.link} className="inline-flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary group-hover:gap-3 transition-all pt-2 md:pt-4">
                Explore Module
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
