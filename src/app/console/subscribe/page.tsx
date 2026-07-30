
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Crown, Building2, Briefcase, X, Loader2, ShieldCheck } from "lucide-react";
import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

const servicePlans = {
  gomerchant: [
    {
      id: "pro",
      name: "Pro",
      price: 25000,
      description: "Essential package for automatic GoPay integration.",
      features: [
        { text: "5,000 API Quota Requests", available: true },
        { text: "Rate Limit 60 RPM", available: true },
        { text: "7-Day Transaction History", available: true },
        { text: "Export Data (CSV/PDF)", available: true },
        { text: "Priority Support", available: false },
      ],
      icon: Briefcase,
      button: "Buy Pro Plan",
    },
    {
      id: "premium",
      name: "Premium",
      price: 50000,
      description: "High-performance package for growing businesses.",
      features: [
        { text: "15,000 API Quota Requests", available: true },
        { text: "Rate Limit 180 RPM", available: true },
        { text: "30-Day Transaction History", available: true },
        { text: "Export Data (CSV/PDF)", available: true },
        { text: "Priority Support", available: true },
      ],
      icon: Crown,
      button: "Upgrade to Premium",
      highlight: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Custom",
      description: "Exclusive infrastructure without limits.",
      features: [
        { text: "Unlimited API Quota", available: true },
        { text: "Unlimited Rate Limit", available: true },
        { text: "Unlimited History", available: true },
        { text: "Full Data Export", available: true },
        { text: "24/7 Dedicated Support", available: true },
      ],
      icon: Building2,
      button: "Contact Sales",
    }
  ],
  orderkuota: [
    {
      id: "pro",
      name: "Pro",
      price: 15000,
      description: "Paket hemat untuk otomatisasi PPOB & OTP standar.",
      features: [
        { text: "3,000 API Quota Requests", available: true },
        { text: "Rate Limit 100 RPM", available: true },
        { text: "Transaction List 7 Day", available: true },
        { text: "Export Data (CSV/PDF)", available: true },
        { text: "Priority Support", available: false },
        { text: "Priority Process", available: false },
      ],
      icon: Briefcase,
      button: "Beli Paket Pro",
    },
    {
      id: "premium",
      name: "Premium",
      price: 30000,
      description: "Performa tinggi untuk transaksi volume besar.",
      features: [
        { text: "10,000 API Quota Requests", available: true },
        { text: "Rate Limit 300 RPM", available: true },
        { text: "Transaction List 30 Day", available: true },
        { text: "Export Data (CSV/PDF)", available: true },
        { text: "Priority Support", available: true },
        { text: "Priority Process", available: false },
      ],
      icon: Crown,
      button: "Upgrade ke Premium",
      highlight: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Custom",
      description: "Infrastruktur eksklusif untuk skala industri.",
      features: [
        { text: "Unlimited API Quota", available: true },
        { text: "Unlimited RPM Speed", available: true },
        { text: "Unlimited History", available: true },
        { text: "Full Data Export", available: true },
        { text: "24/7 Dedicated Support", available: true },
        { text: "Priority Process", available: true },
      ],
      icon: Building2,
      button: "Hubungi Sales",
    }
  ],
  shopeepay: [
    {
      id: "pro",
      name: "Pro",
      price: 25000,
      description: "Essential package for automatic ShopeePay integration.",
      features: [
        { text: "5,000 API Quota Requests", available: true },
        { text: "Rate Limit 60 RPM", available: true },
        { text: "7-Day Transaction History", available: true },
        { text: "Export Data (CSV/PDF)", available: true },
        { text: "Priority Support", available: false },
      ],
      icon: Briefcase,
      button: "Buy Pro Plan",
    },
    {
      id: "premium",
      name: "Premium",
      price: 50000,
      description: "High-performance package for growing businesses.",
      features: [
        { text: "15,000 API Quota Requests", available: true },
        { text: "Rate Limit 180 RPM", available: true },
        { text: "30-Day Transaction History", available: true },
        { text: "Export Data (CSV/PDF)", available: true },
        { text: "Priority Support", available: true },
      ],
      icon: Crown,
      button: "Upgrade to Premium",
      highlight: true,
    }
  ],
  ovo: [
    {
      id: "pro",
      name: "Pro",
      price: 25000,
      description: "Automate OVO P2P and Bank transfers for your system.",
      features: [
        { text: "5,000 API Quota Requests", available: true },
        { text: "Rate Limit 60 RPM", available: true },
        { text: "Unlimited Bank Inquiry", available: true },
        { text: "7-Day History Access", available: true },
        { text: "Priority Support", available: false },
      ],
      icon: Briefcase,
      button: "Buy Pro Plan",
    },
    {
      id: "premium",
      name: "Premium",
      price: 50000,
      description: "Advanced automation for high-scale disbursement.",
      features: [
        { text: "15,000 API Quota Requests", available: true },
        { text: "Rate Limit 180 RPM", available: true },
        { text: "Unlimited Bank Inquiry", available: true },
        { text: "30-Day History Access", available: true },
        { text: "Priority Support", available: true },
      ],
      icon: Crown,
      button: "Upgrade to Premium",
      highlight: true,
    }
  ]
};

export default function SubscriptionPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [refId, setRefId] = useState("");
  const [basePath, setBasePath] = useState("/console/subscribe/checkout");

  useEffect(() => {
    // Generate stable ref ID on mount to avoid hydration mismatch
    const randomRef = `STS${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    setRefId(randomRef);

    // Adjust path for subdomain production
    if (typeof window !== 'undefined' && window.location.hostname.startsWith("console.")) {
      setBasePath("/subscribe/checkout");
    }
  }, []);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);
  const { data: profile } = useDoc(profileRef);

  const orkutRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid, "services", "orderkuota");
  }, [db, user?.uid]);
  const { data: orkutSvc } = useDoc(orkutRef);

  const gmRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid, "services", "gomerchant");
  }, [db, user?.uid]);
  const { data: gmSvc } = useDoc(gmRef);

  const spSvcRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid, "services", "shopeepay");
  }, [db, user?.uid]);
  const { data: spSvc } = useDoc(spSvcRef);

  const ovoSvcRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid, "services", "ovo");
  }, [db, user?.uid]);
  const { data: ovoSvc } = useDoc(ovoSvcRef);

  const isDev = profile?.dev === true;

  const currentPlans: Record<string, string> = {
    orderkuota: orkutSvc?.plan || "",
    gomerchant: gmSvc?.plan || "",
    shopeepay: spSvc?.plan || "",
    ovo: ovoSvc?.plan || ""
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-500 px-4">
      {/* Header Section */}
      <div className="flex flex-col items-center justify-center text-center gap-3 md:gap-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-primary/5 border border-primary/10 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          Premium Infrastructure
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-headline font-bold tracking-tight text-foreground">
          Upgrade <span className="text-primary/40">Business</span> Account.
        </h1>
        <p className="text-muted-foreground text-xs md:text-sm max-w-md mx-auto leading-relaxed">
          Pilih paket infrastruktur terbaik untuk mendukung pertumbuhan bisnis digital Anda tanpa batasan teknis.
        </p>
      </div>

      <Tabs defaultValue="gomerchant" className="w-full">
        <div className="flex justify-center mb-8 md:mb-12">
          <TabsList className="bg-muted p-1 rounded-xl md:rounded-2xl h-12 md:h-16 flex items-center border border-border shadow-sm overflow-x-auto no-scrollbar w-full sm:w-fit sm:min-w-[400px]">
            <TabsTrigger 
              value="gomerchant" 
              className="flex-1 sm:flex-none min-w-[100px] rounded-lg md:rounded-xl px-4 md:px-8 font-bold data-[state=active]:bg-background data-[state=active]:shadow-md h-full text-[9px] md:text-[11px] uppercase tracking-widest transition-all shrink-0"
            >
              GoMerchant
            </TabsTrigger>
            <TabsTrigger 
              value="orderkuota" 
              className="flex-1 sm:flex-none min-w-[100px] rounded-lg md:rounded-xl px-4 md:px-8 font-bold data-[state=active]:bg-background data-[state=active]:shadow-md h-full text-[9px] md:text-[11px] uppercase tracking-widest transition-all shrink-0"
            >
              Orderkuota
            </TabsTrigger>
            <TabsTrigger 
              value="shopeepay" 
              className="flex-1 sm:flex-none min-w-[100px] rounded-lg md:rounded-xl px-4 md:px-8 font-bold data-[state=active]:bg-background data-[state=active]:shadow-md h-full text-[9px] md:text-[11px] uppercase tracking-widest transition-all shrink-0"
            >
              ShopeePay
            </TabsTrigger>
            <TabsTrigger 
              value="ovo" 
              className="flex-1 sm:flex-none min-w-[100px] rounded-lg md:rounded-xl px-4 md:px-8 font-bold data-[state=active]:bg-background data-[state=active]:shadow-md h-full text-[9px] md:text-[11px] uppercase tracking-widest transition-all shrink-0"
            >
              OVO
            </TabsTrigger>
          </TabsList>
        </div>

        {Object.entries(servicePlans).map(([serviceId, plans]) => (
          <TabsContent key={serviceId} value={serviceId} className="space-y-6 focus-visible:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {plans.map((plan, i) => {
                const displayPrice = isDev && typeof plan.price === 'number' ? 1 : plan.price;
                const priceString = typeof displayPrice === 'number' ? `Rp ${displayPrice.toLocaleString('id-ID')}` : displayPrice;
                const isCurrent = currentPlans[serviceId] === plan.id;

                return (
                  <Card 
                    key={i} 
                    className={`border-none shadow-sm rounded-[1.5rem] md:rounded-[2.5rem] flex flex-col overflow-hidden relative transition-all duration-300 group ${
                      plan.highlight 
                      ? 'bg-primary text-primary-foreground shadow-2xl shadow-primary/20 ring-4 ring-primary/5' 
                      : 'bg-card border border-border hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5'
                    }`}
                  >
                    {isCurrent && (
                      <div className="absolute top-6 right-6 md:top-8 md:right-8">
                        <Badge className="bg-emerald-500 text-white border-none font-bold text-[8px] uppercase tracking-tighter px-2 md:px-3 py-1 rounded-md ring-2 ring-emerald-400/20">ACTIVE PLAN</Badge>
                      </div>
                    )}
                    {!isCurrent && plan.highlight && (
                      <div className="absolute top-6 right-6 md:top-8 md:right-8">
                        <Badge className="bg-primary text-primary-foreground border-none font-bold text-[8px] uppercase tracking-tighter px-2 md:px-3 py-1 rounded-md ring-2 ring-primary-foreground/20">RECOMMENDED</Badge>
                      </div>
                    )}
                    <CardHeader className="p-6 md:p-10 pb-4 md:pb-6">
                      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-8 shadow-sm transition-transform group-hover:scale-110 ${plan.highlight ? 'bg-primary-foreground/10 text-primary-foreground' : 'bg-primary/5 text-primary'}`}>
                        <plan.icon className="w-6 h-6 md:w-8 md:h-8" />
                      </div>
                      <CardTitle className="text-xl md:text-2xl font-headline font-bold">{plan.name}</CardTitle>
                      <CardDescription className={`text-[11px] md:text-xs font-medium mt-1 md:mt-2 leading-relaxed ${plan.highlight ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                        {plan.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-6 md:px-10 pb-6 md:pb-10 flex-1 space-y-6 md:space-y-10">
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl md:text-4xl font-headline font-bold tracking-tight">{priceString}</span>
                          {plan.price !== "Custom" && <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest ml-1 ${plan.highlight ? 'text-primary-foreground/30' : 'text-muted-foreground/40'}`}>/ month</span>}
                        </div>
                        {isDev && typeof plan.price === 'number' && (
                          <p className={`text-[8px] md:text-[9px] font-bold uppercase mt-1 ${plan.highlight ? 'text-white/40' : 'text-primary/40'}`}>
                            <span className="line-through mr-1">Rp {plan.price.toLocaleString('id-ID')}</span>
                            Developer Discount
                          </p>
                        )}
                      </div>
                      
                      <div className={`h-px w-full ${plan.highlight ? 'bg-primary-foreground/10' : 'bg-border'}`} />
                      
                      <ul className="space-y-3 md:space-y-5">
                        {plan.features.map((feature, idx) => {
                          const isString = typeof feature === 'string';
                          const text = isString ? feature : feature.text;
                          const available = isString ? true : feature.available;

                          return (
                            <li key={idx} className={`flex items-start gap-3 md:gap-3.5 ${!available ? 'opacity-30' : ''}`}>
                              <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                !available 
                                  ? 'bg-muted text-muted-foreground' 
                                  : plan.highlight 
                                    ? 'bg-primary-foreground/10 text-primary-foreground' 
                                    : 'bg-primary/10 text-primary'
                              }`}>
                                {available ? <Check className="w-2.5 h-2.5 md:w-3 md:h-3" /> : <X className="w-2.5 h-2.5 md:w-3 md:h-3" />}
                              </div>
                              <span className={`text-[11px] md:text-xs font-medium leading-tight ${plan.highlight ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                {text}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </CardContent>
                    <CardFooter className="p-6 md:p-10 pt-0">
                      {plan.price === "Custom" ? (
                        <Button 
                          asChild
                          variant="outline" 
                          className="w-full rounded-xl md:rounded-2xl h-11 md:h-14 font-bold uppercase tracking-widest text-[9px] md:text-[11px] border-border hover:bg-primary hover:text-primary-foreground transition-all"
                        >
                          <Link href="/support">Hubungi Kami</Link>
                        </Button>
                      ) : (
                        <Button 
                          asChild
                          variant={plan.highlight ? "default" : "outline"} 
                          className={`w-full rounded-xl md:rounded-2xl h-11 md:h-14 font-bold transition-all active:scale-95 uppercase tracking-widest text-[9px] md:text-[11px] ${
                            plan.highlight 
                            ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90 border-none' 
                            : 'border-border bg-card'
                          }`}
                          disabled={isCurrent || !refId}
                        >
                          {isCurrent ? (
                             <span className="flex items-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4" /> Currently Active
                             </span>
                          ) : (
                            <Link href={`${basePath}?service=${serviceId}&plan=${plan.id}&ref=${refId}`}>
                              {plan.button}
                            </Link>
                          )}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="text-center pt-8 md:pt-10 border-t border-border/50 max-w-4xl mx-auto">
         <p className="text-[8px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-[0.3em] md:tracking-[0.5em] opacity-30">Infrastruktur tepat untuk pertumbuhan yang cepat</p>
      </div>
    </div>
  );
}
