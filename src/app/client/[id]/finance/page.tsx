"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { 
  Wallet, 
  ArrowUpRight, 
  TrendingUp, 
  CreditCard,
  History,
  AlertCircle,
  Banknote,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import React from "react";
import Link from "next/link";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export default function ClientFinancePage() {
  const { user } = useUser();
  const db = useFirestore();

  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile, loading: profileLoading } = useDoc(profileRef);

  // Fetch STSPay specific balance (Revenue)
  const stspaySvcRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid, "services", "stspay");
  }, [db, user?.uid]);

  const { data: stspaySvc, loading: stspayLoading } = useDoc(stspaySvcRef);

  const isLoading = profileLoading || stspayLoading;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold tracking-tight">Financial <span className="text-primary">Management</span></h1>
          <p className="text-muted-foreground text-sm">Manage your store revenue and withdraw funds to your bank account.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Income Card - Gold Theme */}
        <Card className="lg:col-span-2 border-none shadow-xl shadow-amber-500/20 bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 text-white rounded-md overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] -mr-32 -mt-32 transition-transform group-hover:scale-110"></div>
          <CardContent className="p-8 md:p-12 relative z-10 space-y-8 h-full flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-white/80 text-xs font-bold uppercase tracking-[0.2em]">Total Store Balance</p>
                <Badge variant="outline" className="bg-white/10 border-white/20 text-white text-[8px] font-bold rounded-md">READY TO WITHDRAW</Badge>
              </div>
              {isLoading ? <Skeleton className="h-14 w-64 bg-white/20" /> : (
                <h2 className="text-5xl font-headline font-bold tracking-tighter">
                  Rp {(stspaySvc?.balance || 0).toLocaleString('id-ID')}
                </h2>
              )}
              <p className="text-white/60 text-[10px] font-medium max-sm:max-w-full max-w-sm leading-relaxed">
                This revenue originates from all successful transactions processed on your application.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-white text-amber-600 hover:bg-white/90 font-bold rounded-md px-10 h-12 uppercase tracking-widest text-[10px] border-none shadow-lg shadow-black/5">
                Withdraw Now
              </Button>
              <Button variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold rounded-md px-8 h-12 uppercase tracking-widest text-[10px]">
                PDF Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions / Stats */}
        <div className="space-y-6">
          <Card className="border-border shadow-sm rounded-md bg-card p-6">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Bank Account Info</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md border border-border">
                <div className="w-10 h-10 rounded-md bg-primary/5 flex items-center justify-center text-primary">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">
                    {profile?.payoutAccountNumber ? `${profile.payoutBankName} • **** ${profile.payoutAccountNumber.slice(-4)}` : "Not Set"}
                  </p>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold">
                    {profile?.payoutAccountStatus || "Pending"}
                  </p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <Button asChild variant="ghost" className="w-full text-xs font-bold h-10 hover:bg-primary/5 text-primary rounded-md cursor-pointer">
                <Link href="/client/settings">Manage Account</Link>
              </Button>
            </div>
          </Card>

          <Card className="border-border shadow-sm rounded-md bg-card p-6 border-l-4 border-l-primary">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/5 rounded-md">
                <AlertCircle className="w-4 h-4 text-primary" />
              </div>
              <div className="space-y-1">
                <h5 className="text-[11px] font-bold uppercase tracking-tight">Withdrawal System</h5>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Withdrawals under Rp 50.000 are processed automatically within <span className="text-foreground font-bold">5 minutes</span>.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-border shadow-sm rounded-md bg-card overflow-hidden">
          <CardHeader className="px-6 py-4 border-b border-border bg-muted/30 dark:bg-[#0A0A0A]">
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
              <History className="w-4 h-4 text-primary" />
              Latest Payouts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {[
                { date: '24 Oct 2024', amount: 'Rp 250.000', status: 'Completed', target: 'BCA' },
                { date: '20 Oct 2024', amount: 'Rp 1.200.000', status: 'Completed', target: 'BCA' },
                { date: '15 Oct 2024', amount: 'Rp 450.000', status: 'Failed', target: 'OVO' },
              ].map((item, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center ${item.status === 'Completed' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                      <Banknote className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{item.amount}</p>
                      <p className="text-[10px] text-muted-foreground">{item.date} • {item.target}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`border-none text-[8px] font-bold uppercase rounded-md ${item.status === 'Completed' ? 'text-green-600 bg-green-500/5' : 'text-red-600 bg-red-500/5'}`}>
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm rounded-md bg-primary text-primary-foreground p-8 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 blur-[60px] -mr-16 -mt-16"></div>
          <div className="relative z-10 space-y-4">
            <ShieldCheck className="w-8 h-8 opacity-80" />
            <h3 className="text-lg font-headline font-bold">Financial Security</h3>
            <p className="text-sm opacity-70 leading-relaxed">
              All your funds are protected by STSPoint's high-level encryption system. Withdrawals can only be made to accounts validated by our team.
            </p>
            <Button className="bg-white text-primary hover:bg-white/90 font-bold rounded-md text-[10px] uppercase tracking-widest h-10 px-6 border-none shadow-xl shadow-black/10">
              View Fund Policy
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
