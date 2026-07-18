"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Crown, Building2, Briefcase, X } from "lucide-react";
import React, { useMemo } from "react";
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
        { text: "Rate Limit 60 RPM", available: true },
        { text: "7-Day Transaction History", available: true },
        { text: "Export Data (CSV/PDF)", available: true },
        { text: "Priority Support", available: false },
        { text: "Priority Processing", available: false },
      ],
      icon: Briefcase,
      button: "Buy Pro Plan",
      current: false,
    },
    {
      id: "premium",
      name: "Premium",
      price: 50000,
      description: "High-performance package for growing businesses.",
      features: [
        { text: "Rate Limit 180 RPM", available: true },
        { text: "30-Day Transaction History", available: true },
        { text: "Export Data (CSV/PDF)", available: true },
        { text: "Priority Support", available: true },
        { text: "Priority Processing", available: false },
      ],
      icon: Crown,
      button: "Upgrade to Premium",
      current: false,
      highlight: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Custom",
      description: "Exclusive infrastructure without limits.",
      features: [
        { text: "Unlimited Rate Limit", available: true },
        { text: "Unlimited History", available: true },
        { text: "Full Data Export", available: true },
        { text: "24/7 Dedicated Support", available: true },
        { text: "Priority Processing", available: true },
        { text: "Custom Features", available: true },
      ],
      icon: Building2,
      button: "Contact Sales",
      current: false,
    }
  ]
};

export default function SubscriptionPage() {
  const { user } = useUser();
  const db = useFirestore();

  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(profileRef);
  const isDev = profile?.dev === true;

  return (
    <div className="w-full max-w-full overflow-hidden space-y-12 animate-in fade-in duration-500 px-1">
      {/* Centered Header Section */}
      <div className="flex flex-col items-center justify-center text-center gap-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          Premium Infrastructure
        </div>
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight text-foreground">
          Upgrade <span className="text-primary/40">Business</span> Account.
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
          Choose the best infrastructure plan to support your digital business growth without technical limitations.
        </p>
      </div>

      <Tabs defaultValue="gomerchant" className="w-full">
        <div className="flex justify-center mb-12">
          <TabsList className="bg-muted p-1.5 rounded-2xl h-14 flex items-center border border-border shadow-sm">
            <TabsTrigger 
              value="gomerchant" 
              className="rounded-xl px-8 font-bold data-[state=active]:bg-background data-[state=active]:shadow-md h-full text-[11px] uppercase tracking-widest transition-all"
            >
              GoMerchant
            </TabsTrigger>
          </TabsList>
        </div>

        {Object.entries(servicePlans).map(([serviceId, plans]) => (
          <TabsContent key={serviceId} value={serviceId} className="space-y-6 focus-visible:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {plans.map((plan, i) => {
                const displayPrice = isDev && typeof plan.price === 'number' ? 1 : plan.price;
                const priceString = typeof displayPrice === 'number' ? `Rp ${displayPrice.toLocaleString('id-ID')}` : displayPrice;

                return (
                  <Card 
                    key={i} 
                    className={`border-none shadow-sm rounded-[2.5rem] flex flex-col overflow-hidden relative transition-all duration-300 group ${
                      plan.highlight 
                      ? 'bg-primary text-primary-foreground shadow-2xl shadow-primary/20 ring-4 ring-primary/5' 
                      : 'bg-card border border-border hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5'
                    }`}
                  >
                    {plan.highlight && (
                      <div className="absolute top-8 right-8">
                        <Badge className="bg-primary text-primary-foreground border-none font-bold text-[9px] uppercase tracking-tighter px-3 py-1 rounded-md ring-2 ring-primary-foreground/20">RECOMMENDED</Badge>
                      </div>
                    )}
                    <CardHeader className="p-10 pb-6">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-sm transition-transform group-hover:scale-110 ${plan.highlight ? 'bg-primary-foreground/10 text-primary-foreground' : 'bg-primary/5 text-primary'}`}>
                        <plan.icon className="w-8 h-8" />
                      </div>
                      <CardTitle className="text-2xl font-headline font-bold">{plan.name}</CardTitle>
                      <CardDescription className={`text-xs font-medium mt-2 leading-relaxed ${plan.highlight ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                        {plan.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-10 pb-10 flex-1 space-y-10">
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-headline font-bold tracking-tight">{priceString}</span>
                          {plan.price !== "Custom" && <span className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${plan.highlight ? 'text-primary-foreground/30' : 'text-muted-foreground/40'}`}>/ month</span>}
                        </div>
                        {isDev && typeof plan.price === 'number' && (
                          <p className={`text-[9px] font-bold uppercase mt-1 ${plan.highlight ? 'text-white/40' : 'text-primary/40'}`}>
                            <span className="line-through mr-1">Rp {plan.price.toLocaleString('id-ID')}</span>
                            Developer Discount Applied
                          </p>
                        )}
                      </div>
                      
                      <div className={`h-px w-full ${plan.highlight ? 'bg-primary-foreground/10' : 'bg-border'}`} />
                      
                      <ul className="space-y-5">
                        {plan.features.map((feature, idx) => {
                          const isString = typeof feature === 'string';
                          const text = isString ? feature : feature.text;
                          const available = isString ? true : feature.available;

                          return (
                            <li key={idx} className={`flex items-start gap-3.5 ${!available ? 'opacity-30' : ''}`}>
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                !available 
                                  ? 'bg-muted text-muted-foreground' 
                                  : plan.highlight 
                                    ? 'bg-primary-foreground/10 text-primary-foreground' 
                                    : 'bg-primary/10 text-primary'
                              }`}>
                                {available ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                              </div>
                              <span className={`text-xs font-medium leading-tight ${plan.highlight ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                {text}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </CardContent>
                    <CardFooter className="p-10 pt-0">
                      {plan.price === "Custom" ? (
                        <Button 
                          asChild
                          variant="outline" 
                          className="w-full rounded-2xl h-14 font-bold uppercase tracking-widest text-[11px] border-border hover:bg-primary hover:text-primary-foreground transition-all"
                        >
                          <Link href="/support">Contact Us</Link>
                        </Button>
                      ) : (
                        <Button 
                          asChild
                          variant={plan.highlight ? "default" : "outline"} 
                          className={`w-full rounded-2xl h-14 font-bold transition-all active:scale-95 uppercase tracking-widest text-[11px] ${
                            plan.highlight 
                            ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90 border-none' 
                            : 'border-border bg-card'
                          }`}
                          disabled={plan.current}
                        >
                          <Link href={`/console/subscribe/checkout?service=${serviceId}&plan=${plan.id}&ref=STS${Math.random().toString(36).substring(2, 9).toUpperCase()}`}>
                            {plan.current ? "Plan Currently Active" : plan.button}
                          </Link>
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

      <div className="text-center pt-10 border-t border-border/50 max-w-4xl mx-auto">
         <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.5em] opacity-30">Choose the right infrastructure for your growth</p>
      </div>
    </div>
  );
}
