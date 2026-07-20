"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowUpRight, 
  Wallet, 
  History,
  AlertCircle,
  Banknote,
  ShieldCheck,
  ChevronRight,
  Info,
  RefreshCcw
} from "lucide-react";
import React from "react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export default function STSPayBalancesPage() {
  const { user } = useUser();
  const db = useFirestore();

  // Membaca saldo khusus layanan STSPay revenue
  const stspayRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid, "services", "stspay");
  }, [db, user?.uid]);

  const { data: stspaySvc, loading } = useDoc(stspayRef);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border border-border shadow-sm rounded-md bg-card overflow-hidden">
          <CardHeader className="px-8 py-8 border-b border-border bg-muted/30 dark:bg-[#0A0A0A]">
             <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">STSPay Revenue Balance</p>
                {loading ? <Skeleton className="h-10 w-48 mt-2" /> : (
                  <h2 className="text-5xl font-headline font-bold">
                    Rp {(stspaySvc?.balance || 0).toLocaleString('id-ID')}
                  </h2>
                )}
             </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-md bg-muted/50 border border-border space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                         <Banknote className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                         <p className="text-xs font-bold whitespace-nowrap">Withdrawal Account</p>
                         <p className="text-[10px] text-muted-foreground uppercase font-bold whitespace-nowrap">Verified Primary</p>
                      </div>
                   </div>
                   <Button variant="ghost" className="w-full text-[10px] font-bold uppercase h-8 hover:bg-primary/5 text-primary border border-transparent hover:border-primary/20">
                      Manage Account
                   </Button>
                </div>

                <div className="flex flex-col justify-center gap-3">
                   <Button className="w-full h-12 rounded-md font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10">
                      Withdraw Revenue
                   </Button>
                   <p className="text-[10px] text-center text-muted-foreground">Estimated processing: 1-3 business hours.</p>
                </div>
             </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
           <Card className="border-border shadow-sm rounded-md bg-card p-6 border-l-4 border-l-primary">
              <div className="flex items-start gap-4">
                 <div className="p-2 bg-primary/5 rounded-md">
                    <Info className="w-4 h-4 text-primary" />
                 </div>
                 <div className="space-y-1">
                    <h5 className="text-[11px] font-bold uppercase tracking-tight">Payout Policy</h5>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                       Minimal withdrawal <span className="text-foreground font-bold">Rp 50.000</span>. Settlement is processed via STSPoint secure disbursement engine.
                    </p>
                 </div>
              </div>
           </Card>

           <Card className="border-border shadow-sm rounded-md bg-primary text-primary-foreground p-8 flex flex-col justify-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[40px] -mr-16 -mt-16"></div>
             <div className="relative z-10 space-y-4">
               <ShieldCheck className="w-8 h-8 opacity-80" />
               <h3 className="text-lg font-headline font-bold">Automatic Payout</h3>
               <p className="text-xs opacity-70 leading-relaxed">
                 Enable daily auto-settlement to your bank account every midnight (23:59 WIB).
               </p>
               <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold rounded-md text-[10px] uppercase tracking-widest h-9 px-6 border-none">
                 Configure Now
               </Button>
             </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
