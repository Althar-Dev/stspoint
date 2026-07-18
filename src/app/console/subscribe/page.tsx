
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Check, ShieldCheck, Crown, Star, CreditCard, Building2, Rocket, Briefcase } from "lucide-react";
import React from "react";

const servicePlans = {
  digiflazz: [
    {
      name: "Pro",
      price: "Rp 99.000",
      description: "Ideal untuk bisnis PPOB yang baru berkembang.",
      features: ["3 API Keys", "Standard Queue", "Standard Support", "Basic Webhooks"],
      icon: Briefcase,
      button: "Subscribe Pro",
      current: true,
    },
    {
      name: "Premium",
      price: "Rp 250.000",
      description: "Optimalkan performa transaksi PPOB Anda.",
      features: ["Unlimited API Keys", "Priority Queue", "Dedicated Server", "Advanced Webhooks", "24/7 Priority Support"],
      icon: Crown,
      button: "Upgrade Premium",
      current: false,
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Solusi volume besar untuk korporasi.",
      features: ["Custom SLA", "Dedicated Account Manager", "Auto-Scale Infrastructure", "API Whitelabeling", "Zero Latency Path"],
      icon: Building2,
      button: "Contact Sales",
      current: false,
    }
  ],
  orderkuota: [
    {
      name: "Pro",
      price: "Rp 49.000",
      description: "Akses H2H produk Orderkuota dengan margin kompetitif.",
      features: ["Akses Katalog Lengkap", "Auto-Refill", "Standard Margin", "Standard Support"],
      icon: Briefcase,
      button: "Subscribe Pro",
      current: true,
    },
    {
      name: "Premium",
      price: "Rp 125.000",
      description: "Harga khusus untuk reseller volume tinggi.",
      features: ["VIP Margin (Cheapest)", "Auto-Refill Pro", "Whitelabel Panel", "Priority API Access", "Direct WhatsApp Support"],
      icon: Crown,
      button: "Upgrade Premium",
      current: false,
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Solusi bisnis skala industri.",
      features: ["Zero Margin Fees", "Private Server Instance", "Custom Integration", "Direct Infrastructure Support"],
      icon: Building2,
      button: "Contact Sales",
      current: false,
    }
  ],
  gomerchant: [
    {
      name: "Pro",
      price: "Rp 75.000",
      description: "Automasi dasar untuk satu akun GoPay.",
      features: ["Live Mutation Tracking", "Balance Inquiry", "Transaction List (14 hari)", "Email Notifications"],
      icon: Briefcase,
      button: "Subscribe Pro",
      current: true,
    },
    {
      name: "Premium",
      price: "Rp 175.000",
      description: "Automasi penuh untuk merchant aktif.",
      features: ["Real-time HTTP Callbacks", "History (Unlimited)", "Priority Jurnal Reconcile", "Advanced Webhooks", "Multi-Outlet Support"],
      icon: Crown,
      button: "Upgrade Premium",
      current: false,
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Sistem pembayaran korporasi terintegrasi.",
      features: ["Auto-Withdraw to Bank", "Custom Reconcile Logic", "Dedicated API Bridge", "Audit Logs Export", "Volume Discounting"],
      icon: Building2,
      button: "Contact Sales",
      current: false,
    }
  ]
};

export default function SubscriptionPage() {
  return (
    <div className="w-full max-w-full overflow-hidden space-y-8 animate-in fade-in duration-500 px-1">
      {/* Centered Header Section */}
      <div className="flex flex-col items-center justify-center text-center gap-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary">
          Paid Infrastructure Plans
        </div>
        <h1 className="text-3xl md:text-5xl font-headline font-bold tracking-tight text-foreground">
          Premium <span className="text-primary">Subscriptions</span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Pilih paket infrastruktur terbaik untuk mendukung pertumbuhan bisnis digital Anda tanpa batas.
        </p>
      </div>

      <Tabs defaultValue="digiflazz" className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="bg-muted p-1 rounded-2xl h-12 flex items-center">
            <TabsTrigger 
              value="digiflazz" 
              className="rounded-xl px-3 sm:px-8 font-bold data-[state=active]:bg-background h-full text-[10px] sm:text-xs uppercase tracking-widest"
            >
              DigiFlazz
            </TabsTrigger>
            <TabsTrigger 
              value="orderkuota" 
              className="rounded-xl px-3 sm:px-8 font-bold data-[state=active]:bg-background h-full text-[10px] sm:text-xs uppercase tracking-widest"
            >
              Orderkuota
            </TabsTrigger>
            <TabsTrigger 
              value="gomerchant" 
              className="rounded-xl px-3 sm:px-8 font-bold data-[state=active]:bg-background h-full text-[10px] sm:text-xs uppercase tracking-widest"
            >
              GoMerchant
            </TabsTrigger>
          </TabsList>
        </div>

        {Object.entries(servicePlans).map(([serviceId, plans]) => (
          <TabsContent key={serviceId} value={serviceId} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {plans.map((plan, i) => (
                <Card 
                  key={i} 
                  className={`border-none shadow-sm rounded-[2.5rem] flex flex-col overflow-hidden relative transition-all duration-300 ${
                    plan.highlight 
                    ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/10 dark:shadow-none ring-2 ring-primary' 
                    : 'bg-card border border-border'
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute top-6 right-6">
                      <Badge className="bg-primary text-primary-foreground border-none font-bold text-[10px] uppercase tracking-tighter">REKOMENDASI</Badge>
                    </div>
                  )}
                  <CardHeader className="p-8">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${plan.highlight ? 'bg-primary-foreground/10 text-primary-foreground' : 'bg-primary/5 text-primary'}`}>
                      <plan.icon className="w-7 h-7" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className={plan.highlight ? 'text-primary-foreground/60' : 'text-muted-foreground'}>
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-8 pb-8 flex-1">
                    <div className="mb-8">
                      <span className="text-4xl font-headline font-bold">{plan.price}</span>
                      {plan.price !== "Custom" && <span className={`text-xs ml-1 ${plan.highlight ? 'text-primary-foreground/40' : 'text-muted-foreground'}`}>/ bulan</span>}
                    </div>
                    <ul className="space-y-4">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${plan.highlight ? 'bg-primary-foreground/10 text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
                            <Check className="w-3 h-3" />
                          </div>
                          <span className={`text-sm ${plan.highlight ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="p-8 pt-0">
                    <Button 
                      variant={plan.highlight ? "default" : "outline"} 
                      className={`w-full rounded-2xl h-14 font-bold transition-all active:scale-95 uppercase tracking-widest text-[10px] ${
                        plan.highlight 
                        ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90' 
                        : 'border-border'
                      }`}
                      disabled={plan.current}
                    >
                      {plan.current ? "Active Plan" : plan.button}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
