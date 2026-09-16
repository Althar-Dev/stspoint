
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Check, 
  Crown, 
  Building2, 
  Briefcase, 
  X, 
  Loader2, 
  ShieldCheck,
  Globe,
  Code2,
  ShoppingBag,
  Wallet
} from "lucide-react";
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
        { text: "30-Day History Access", available: true },
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
  ]
};

export default function SubscriptionPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [refId, setRefId] = useState("");
  const [basePath, setBasePath] = useState("/console/subscribe/checkout");

  useEffect(() => {
    const randomRef = `STS${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    setRefId(randomRef);

    if (typeof window !== 'undefined' && window.location.hostname.startsWith("console.")) {
      setBasePath("/subscribe/checkout");
    }
  }, []);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);
  const { data: profile } = useDoc(profileRef);

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
    gomerchant: gmSvc?.plan || "",
    shopeepay: spSvc?.plan || "",
    ovo: ovoSvc?.plan || ""
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 sm:space-y-10 animate-in fade-in duration-500 px-3 sm:px-6">
      <div className="flex flex-col items-center justify-center text-center gap-2 sm:gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary">
          Premium Infrastructure
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-headline font-bold tracking-tight text-foreground">
          Upgrade <span className="text-primary/40">Business</span> Account.
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
          Pilih paket infrastruktur terbaik untuk mendukung pertumbuhan bisnis digital Anda tanpa batasan teknis.
        </p>
      </div>

      <Tabs defaultValue="gomerchant" className="w-full">
        <div className="flex justify-center mb-6 sm:mb-8 overflow-x-auto no-scrollbar">
          <TabsList className="bg-muted p-1 rounded-xl h-10 sm:h-12 flex items-center border border-border shadow-sm max-w-full overflow-x-auto no-scrollbar">
            <TabsTrigger 
              value="gomerchant" 
              className="rounded-lg px-3 sm:px-5 font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm h-full text-[10px] sm:text-xs uppercase tracking-wider transition-all shrink-0 gap-1.5"
            >
              <img src="/assets/main/gm.png" alt="GM" className="w-4 h-4 object-contain" />
              <span>GoMerchant</span>
            </TabsTrigger>
            <TabsTrigger 
              value="shopeepay" 
              className="rounded-lg px-3 sm:px-5 font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm h-full text-[10px] sm:text-xs uppercase tracking-wider transition-all shrink-0 gap-1.5"
            >
              <img src="/assets/main/spm.png" alt="ShopeePay" className="w-4 h-4 object-contain" />
              <span>ShopeePay</span>
            </TabsTrigger>
            <TabsTrigger 
              value="ovo" 
              className="rounded-lg px-3 sm:px-5 font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm h-full text-[10px] sm:text-xs uppercase tracking-wider transition-all shrink-0 gap-1.5"
            >
              <img src="/assets/main/ovo.png" alt="OVO" className="w-4 h-4 object-contain" />
              <span>OVO</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {Object.entries(servicePlans).map(([serviceId, plans]) => (
          <TabsContent key={serviceId} value={serviceId} className="space-y-4 focus-visible:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {plans.map((plan, i) => {
                const displayPrice = isDev && typeof plan.price === 'number' ? 1 : plan.price;
                const priceString = typeof displayPrice === 'number' ? `Rp ${displayPrice.toLocaleString('id-ID')}` : displayPrice;
                const isCurrent = currentPlans[serviceId] === plan.id;

                return (
                  <Card 
                    key={i} 
                    className={`border-none shadow-sm rounded-xl sm:rounded-2xl flex flex-col overflow-hidden relative transition-all duration-300 group ${
                      plan.highlight 
                      ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20 ring-2 ring-primary/10' 
                      : 'bg-card border border-border hover:border-primary/20 hover:shadow-lg'
                    }`}
                  >
                    {isCurrent && (
                      <div className="absolute top-4 right-4 sm:top-5 sm:right-5">
                        <Badge className="bg-emerald-500 text-white border-none font-bold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-md">ACTIVE PLAN</Badge>
                      </div>
                    )}
                    {!isCurrent && plan.highlight && (
                      <div className="absolute top-4 right-4 sm:top-5 sm:right-5">
                        <Badge className="bg-primary-foreground text-primary border-none font-bold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-md">RECOMMENDED</Badge>
                      </div>
                    )}
                    <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 shadow-sm transition-transform group-hover:scale-105 ${plan.highlight ? 'bg-primary-foreground/10 text-primary-foreground' : 'bg-primary/5 text-primary'}`}>
                        <plan.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <CardTitle className="text-lg sm:text-xl font-headline font-bold">{plan.name}</CardTitle>
                      <CardDescription className={`text-xs font-medium mt-1 leading-relaxed ${plan.highlight ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {plan.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0 flex-1 space-y-4 sm:space-y-6">
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl sm:text-2xl md:text-3xl font-headline font-bold tracking-tight">{priceString}</span>
                          {plan.price !== "Custom" && <span className={`text-[9px] font-bold uppercase tracking-widest ml-1 ${plan.highlight ? 'text-primary-foreground/40' : 'text-muted-foreground/50'}`}>/ month</span>}
                        </div>
                        {isDev && typeof plan.price === 'number' && (
                          <p className={`text-[8px] font-bold uppercase mt-0.5 ${plan.highlight ? 'text-white/50' : 'text-primary/50'}`}>
                            <span className="line-through mr-1">Rp {plan.price.toLocaleString('id-ID')}</span>
                            Dev Discount
                          </p>
                        )}
                      </div>
                      
                      <div className={`h-px w-full ${plan.highlight ? 'bg-primary-foreground/15' : 'bg-border'}`} />
                      
                      <ul className="space-y-2.5 sm:space-y-3">
                        {plan.features.map((feature, idx) => {
                          const isString = typeof feature === 'string';
                          const text = isString ? feature : feature.text;
                          const available = isString ? true : feature.available;

                          return (
                            <li key={idx} className={`flex items-start gap-2.5 ${!available ? 'opacity-30' : ''}`}>
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                !available 
                                  ? 'bg-muted text-muted-foreground' 
                                  : plan.highlight 
                                    ? 'bg-primary-foreground/15 text-primary-foreground' 
                                    : 'bg-primary/10 text-primary'
                              }`}>
                                {available ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                              </div>
                              <span className={`text-xs font-medium leading-tight ${plan.highlight ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}>
                                {text}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </CardContent>
                    <CardFooter className="p-4 sm:p-6 pt-0">
                      {plan.price === "Custom" ? (
                        <Button 
                          asChild
                          variant="outline" 
                          className="w-full rounded-lg sm:rounded-xl h-9 sm:h-11 font-bold uppercase tracking-wider text-[10px] sm:text-xs border-border hover:bg-primary hover:text-primary-foreground transition-all"
                        >
                          <Link href="/support">Hubungi Kami</Link>
                        </Button>
                      ) : (
                        <Button 
                          asChild
                          variant={plan.highlight ? "default" : "outline"} 
                          className={`w-full rounded-lg sm:rounded-xl h-9 sm:h-11 font-bold transition-all active:scale-95 uppercase tracking-wider text-[10px] sm:text-xs ${
                            plan.highlight 
                            ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90 border-none' 
                            : 'border-border bg-card'
                          }`}
                          disabled={isCurrent || !refId}
                        >
                          {isCurrent ? (
                             <span className="flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5" /> Currently Active
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

      <div className="text-center pt-6 border-t border-border/50 max-w-4xl mx-auto">
         <p className="text-[8px] sm:text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-40">Infrastruktur tepat untuk pertumbuhan yang cepat</p>
      </div>
    </div>
  );
}
