
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Check, ShieldCheck, Crown, Star, CreditCard, Building2, Rocket } from "lucide-react";
import React from "react";

const servicePlans = {
  digiflazz: [
    {
      name: "Starter",
      price: "Rp 0",
      description: "Untuk pengujian API DigiFlazz.",
      features: ["1 API Key", "Shared Server", "Standard Support"],
      icon: Star,
      button: "Current Plan",
      current: true,
    },
    {
      name: "Premium",
      price: "Rp 250.000",
      description: "Optimalkan transaksi PPOB Anda.",
      features: ["Unlimited API Keys", "Priority Queue", "Dedicated Server", "Webhooks", "24/7 Support"],
      icon: Crown,
      button: "Upgrade Premium",
      current: false,
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Solusi volume besar untuk korporasi.",
      features: ["Custom SLA", "Dedicated Manager", "Auto-Scale Infrastructure", "API Whitelabeling"],
      icon: Building2,
      button: "Contact Sales",
      current: false,
    }
  ],
  orderkuota: [
    {
      name: "Starter",
      price: "Rp 0",
      description: "Akses dasar ke produk Orderkuota.",
      features: ["Akses Katalog", "Standard Margin", "Auto-Refill Manual"],
      icon: Star,
      button: "Current Plan",
      current: true,
    },
    {
      name: "Premium",
      price: "Rp 100.000",
      description: "Harga khusus untuk reseller besar.",
      features: ["VIP Margin", "Auto-Refill Pro", "Whitelabel Panel", "API Access"],
      icon: Crown,
      button: "Upgrade Premium",
      current: false,
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Solusi bisnis skala industri.",
      features: ["Zero Margin Fees", "Private Instance", "Custom Integration", "Direct API Support"],
      icon: Building2,
      button: "Contact Sales",
      current: false,
    }
  ],
  gomerchant: [
    {
      name: "Starter",
      price: "Rp 0",
      description: "Monitor saldo GoPay Anda.",
      features: ["Balance Inquiry", "Transaction List (7 hari)", "Email Notification"],
      icon: Star,
      button: "Current Plan",
      current: true,
    },
    {
      name: "Premium",
      price: "Rp 150.000",
      description: "Automasi menengah untuk merchant.",
      features: ["Real-time Callback", "Transaction History (30 hari)", "Priority Notification", "Webhooks"],
      icon: Crown,
      button: "Upgrade Premium",
      current: false,
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Automasi penuh GoPay Merchant.",
      features: ["Auto-Withdraw", "Multi-Account Support", "Dedicated Manager", "Direct Bank Transfer"],
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
        <h1 className="text-3xl font-headline font-bold tracking-tight text-foreground">
          Subscriptions
        </h1>
      </div>

      <Tabs defaultValue="digiflazz" className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="bg-muted p-1 rounded-2xl h-12 flex items-center">
            <TabsTrigger 
              value="digiflazz" 
              className="rounded-xl px-3 sm:px-6 font-bold data-[state=active]:bg-background h-full text-[10px] sm:text-sm"
            >
              DigiFlazz
            </TabsTrigger>
            <TabsTrigger 
              value="orderkuota" 
              className="rounded-xl px-3 sm:px-6 font-bold data-[state=active]:bg-background h-full text-[10px] sm:text-sm"
            >
              Orderkuota
            </TabsTrigger>
            <TabsTrigger 
              value="gomerchant" 
              className="rounded-xl px-3 sm:px-6 font-bold data-[state=active]:bg-background h-full text-[10px] sm:text-sm"
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
                      <Badge className="bg-primary text-primary-foreground border-none font-bold text-[10px]">REKOMENDASI</Badge>
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
                      className={`w-full rounded-2xl h-14 font-bold transition-all active:scale-95 ${
                        plan.highlight 
                        ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90' 
                        : 'border-border'
                      }`}
                      disabled={plan.current}
                    >
                      {plan.button}
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
