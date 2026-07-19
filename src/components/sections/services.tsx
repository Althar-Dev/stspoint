
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
    <section id="services" className="py-12 scroll-mt-24">
      <div className="text-center space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary">
          Core Capabilities
        </div>
        <h2 className="text-3xl md:text-5xl font-headline font-bold tracking-tight">
          One Platform. <span className="text-primary/40">Multiple Solutions.</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          Integrated infrastructure designed to eliminate technical complexity and accelerate your business growth.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SERVICES.map((svc, i) => (
          <Card key={i} className="border-border shadow-sm rounded-[2rem] bg-card hover:border-primary/20 transition-all group">
            <CardContent className="p-8 space-y-6 flex flex-col h-full">
              <div className={`w-14 h-14 rounded-2xl ${svc.bg} ${svc.color} flex items-center justify-center transition-transform group-hover:scale-110 duration-500`}>
                <svc.icon className="w-7 h-7" />
              </div>
              <div className="space-y-3 flex-1">
                <h3 className="text-xl font-bold">{svc.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {svc.desc}
                </p>
              </div>
              <Link href={svc.link} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary group-hover:gap-3 transition-all pt-4">
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
