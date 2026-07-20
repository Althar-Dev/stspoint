"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Wallet, 
  Zap, 
  Key,
  ShieldCheck, 
  Smartphone,
  MessageSquare,
  Users,
  History,
  CheckCircle2,
  Activity,
  ChevronRight,
  Plus,
  Loader2,
  QrCode,
  Download,
  Coins,
  RefreshCcw,
  AlertCircle,
  XCircle,
  Timer,
  Clock
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState, useEffect, useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Area as RechartsArea } from "recharts";
import { format, isToday, isYesterday, isSameYear, startOfDay, subDays } from "date-fns";
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { generateDynamicQrisAction } from "@/app/orkut/qris/actions";
import { checkTopUpStatusAction } from "./actions";

export default function OverviewPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const [isMounted, setIsMounted] = useState(false);

  // Top Up State
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [finalAmount, setFinalAmount] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [qrisData, setQrisData] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);
  const { data: profile, loading: profileLoading } = useDoc(userProfileRef);

  const masterOrkutRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "settings", "orderkuota");
  }, [db]);
  const { data: masterConfig } = useDoc(masterOrkutRef);

  const orderkuotaRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid, "services", "orderkuota");
  }, [db, user?.uid]);
  const { data: orderkuota } = useDoc(orderkuotaRef);

  const gomerchantRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid, "services", "gomerchant");
  }, [db, user?.uid]);
  const { data: gomerchant } = useDoc(gomerchantRef);

  const transactionsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, "transactions"),
      where("userId", "==", user.uid)
    );
  }, [db, user?.uid]);
  const { data: rawTransactions, loading: txLoading } = useCollection(transactionsQuery);

  // Helper to determine effective status based on 15m rule
  const getEffectiveStatus = (status: string, createdAt: any) => {
    const s = String(status).toUpperCase();
    if (s !== 'PENDING') return status;
    if (!createdAt) return status;
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    const diffInMinutes = (new Date().getTime() - date.getTime()) / 60000;
    // Set to Failed if more than 15 minutes
    return diffInMinutes > 15 ? 'Failed' : status;
  };

  const transactions = useMemo(() => {
    return [...rawTransactions].sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    }).map(tx => ({
      ...tx,
      effectiveStatus: getEffectiveStatus(tx.status, tx.createdAt)
    }));
  }, [rawTransactions]);

  const handleGenerateTopUpQris = async () => {
    const baseAmount = parseInt(topUpAmount);
    if (isNaN(baseAmount) || baseAmount < 1) {
      toast({ variant: "destructive", title: "Nominal Minimal", description: "Minimal top up adalah Rp 1" });
      return;
    }

    if (!masterConfig?.baseQr) {
      toast({ variant: "destructive", title: "Sistem Belum Siap", description: "Base QRIS Master belum diatur oleh Admin." });
      return;
    }

    setIsGenerating(true);
    try {
      const digitSetting = Number(masterConfig.randomDigit) || 3;
      let randomSuffix = 0;
      
      if (digitSetting === 2) {
        randomSuffix = Math.floor(Math.random() * 90) + 10;
      } else {
        randomSuffix = Math.floor(Math.random() * 900) + 100;
      }

      const uniqueAmount = baseAmount + randomSuffix;
      const res = await generateDynamicQrisAction(masterConfig.baseQr, uniqueAmount.toString());
      
      if (res.success && res.dataUri) {
        setFinalAmount(uniqueAmount);
        setQrisData(res.dataUri);
        toast({ title: "QRIS Berhasil Dibuat", description: `Silakan bayar Rp ${uniqueAmount.toLocaleString('id-ID')}.` });
      } else {
        throw new Error(res.message);
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Gagal", description: e.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!user?.uid || !finalAmount) return;
    
    setIsCheckingStatus(true);
    try {
      const res = await checkTopUpStatusAction(user.uid, finalAmount);
      
      if (res.success) {
        toast({ 
          title: "Pembayaran Terdeteksi!", 
          description: res.message,
          className: "bg-emerald-500 text-white"
        });
        setIsTopUpOpen(false);
        setQrisData(null);
        setFinalAmount(null);
      } else {
        toast({ 
          variant: "destructive", 
          title: "Belum Diterima", 
          description: res.message 
        });
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: "Gagal memverifikasi status." });
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleDownloadQris = () => {
    if (!qrisData) return;
    const link = document.createElement("a");
    link.href = qrisData;
    link.download = `TOPUP-STS-${finalAmount}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const { stats, activityChartData, weeklyUsageTrend } = useMemo(() => {
    const counts = { success: 0, pending: 0, failed: 0 };
    const buckets = [
      { time: "00:00", success: 0, pending: 0, failed: 0 },
      { time: "04:00", success: 0, pending: 0, failed: 0 },
      { time: "08:00", success: 0, pending: 0, failed: 0 },
      { time: "12:00", success: 0, pending: 0, failed: 0 },
      { time: "16:00", success: 0, pending: 0, failed: 0 },
      { time: "20:00", success: 0, pending: 0, failed: 0 },
    ];

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = startOfDay(subDays(new Date(), i));
      return { date: d, count: 0 };
    }).reverse();

    if (transactions) {
      transactions.forEach(tx => {
        const effectiveStatus = tx.effectiveStatus;
        if (effectiveStatus === "Success") counts.success++;
        else if (effectiveStatus === "Pending" || effectiveStatus === "PENDING") counts.pending++;
        else counts.failed++;

        const txDate = tx.createdAt?.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt || 0);
        const hour = txDate.getHours();
        let bucketIdx = Math.floor(hour / 4);
        if (bucketIdx > 5) bucketIdx = 5;
        if (effectiveStatus === "Success") buckets[bucketIdx].success++;
        else if (effectiveStatus === "Pending" || effectiveStatus === "PENDING") buckets[bucketIdx].pending++;
        else buckets[bucketIdx].failed++;

        const txDayStart = startOfDay(txDate).getTime();
        const trendDay = last7Days.find(d => d.date.getTime() === txDayStart);
        if (trendDay) trendDay.count++;
      });
    }

    return { 
      stats: counts, 
      activityChartData: buckets,
      weeklyUsageTrend: last7Days.map(d => d.count)
    };
  }, [transactions]);

  const quotaUsageData = useMemo(() => {
    return [
      { name: "Orderkuota", value: orderkuota?.quota?.toLocaleString() || "0", chart: weeklyUsageTrend.map(v => v * 0.8) },
      { name: "GoMerchant", value: gomerchant?.quota?.toLocaleString() || "0", chart: weeklyUsageTrend.map(v => v * 0.5) },
    ];
  }, [orderkuota, gomerchant, weeklyUsageTrend]);

  const formatTransactionDate = (timestamp: any) => {
    if (!isMounted || !timestamp) return "...";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    if (isToday(date)) return format(date, "HH:mm");
    if (isYesterday(date)) return "Kemarin " + format(date, "HH:mm");
    if (isSameYear(date, now)) return format(date, "dd MMM HH:mm");
    return format(date, "yyyy MM dd HH:mm");
  };

  const isGlobalLoading = authLoading || profileLoading || (!!user && !userProfileRef);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500 min-w-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-1">
        <div>
          <h1 className="text-xl md:text-2xl font-headline font-bold tracking-tight text-foreground">
            Console <span className="text-primary">Overview</span>
          </h1>
          <div className="text-muted-foreground text-[10px] md:text-xs flex items-center gap-2 mt-0.5">
            {isGlobalLoading ? (
              <Skeleton className="h-3 w-40" />
            ) : (
              <div>Welcome back, {profile?.name || user?.displayName || "User"}!</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/status">
            <Badge 
              variant="outline" 
              className="px-2 py-1 md:px-3 md:py-1.5 flex items-center gap-2 font-bold text-[9px] md:text-[10px] rounded-lg transition-all hover:bg-accent cursor-pointer border-border group"
            >
              <Activity className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
              System Status <ChevronRight className="w-2.5 h-2.5 ml-1" />
            </Badge>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 min-w-0">
        <Card className="border border-border shadow-sm rounded-2xl md:rounded-3xl bg-card overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -mr-32 -mt-32 transition-transform group-hover:scale-110"></div>
          <CardContent className="p-6 md:p-8 flex flex-col justify-between min-h-[160px] md:min-h-[180px] relative z-10 h-full">
            {isGlobalLoading ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                </div>
                <Skeleton className="h-10 w-40" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center border border-border">
                      <Wallet className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-muted-foreground text-xs md:text-sm">Active Balance</h4>
                      <p className="text-[8px] md:text-[9px] text-muted-foreground/40 uppercase tracking-widest font-bold truncate">
                        {profile?.merchantId || profile?.clientKey || "N/A"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-500/5 text-green-600 border-green-500/20 font-bold text-[9px] px-2 py-0.5 rounded-md hidden sm:flex">Verified</Badge>
                </div>
                <div className="my-2 md:my-4">
                  <h2 className="text-2xl md:text-4xl font-headline font-bold tracking-tighter">
                    Rp {(profile?.balance || 0).toLocaleString('id-ID')}
                  </h2>
                </div>
                <div className="flex gap-2 pt-2 border-t border-border">
                  
                  <Dialog open={isTopUpOpen} onOpenChange={(o) => {
                    setIsTopUpOpen(o);
                    if(!o) { setTopUpAmount(""); setQrisData(null); setFinalAmount(null); }
                  }}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary text-primary-foreground font-bold rounded-lg px-4 h-9 md:h-10 flex-1 shadow-lg shadow-primary/10 transition-all text-[10px] uppercase">
                        Top Up
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[2rem] border-border w-[92vw] sm:max-w-[420px] max-h-[90vh] overflow-y-auto p-0">
                      <div className="p-6 sm:p-8 space-y-6">
                        <DialogHeader>
                          <DialogTitle className="font-headline font-bold flex items-center gap-2">
                             <Coins className="w-5 h-5 text-primary" />
                             Top Up Saldo
                          </DialogTitle>
                          <DialogDescription className="text-xs">
                            Isi saldo akun STS Point Anda menggunakan QRIS otomatis.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-2">
                           {!qrisData ? (
                             <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Nominal (IDR)</Label>
                                  <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">Rp</span>
                                    <Input 
                                      type="number"
                                      placeholder="Contoh: 5000"
                                      value={topUpAmount}
                                      onChange={(e) => setTopUpAmount(e.target.value)}
                                      className="h-12 pl-12 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all font-bold"
                                    />
                                  </div>
                                  <p className="text-[9px] text-muted-foreground ml-1">Sistem akan menambahkan kode unik secara otomatis.</p>
                                </div>
                                <Button 
                                  onClick={handleGenerateTopUpQris}
                                  disabled={isGenerating || !topUpAmount}
                                  className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-[10px]"
                                >
                                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <QrCode className="w-4 h-4 mr-2" />}
                                  Generate QRIS Pembayaran
                                </Button>
                             </div>
                           ) : (
                             <div className="flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-300">
                                <div className="p-4 bg-white border border-border rounded-3xl shadow-xl">
                                   <img src={qrisData} alt="Topup QRIS" className="w-48 h-48 sm:w-56 sm:h-56 object-contain" />
                                </div>
                                <div className="space-y-1">
                                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total yang harus dibayar</p>
                                   <h3 className="text-2xl font-headline font-bold text-primary">Rp {finalAmount?.toLocaleString('id-ID')}</h3>
                                   <div className="flex items-center justify-center gap-2 p-2 bg-amber-50 rounded-lg border border-amber-100 mt-2">
                                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                      <p className="text-[9px] font-bold text-amber-800 uppercase">Jangan bulatkan nominal!</p>
                                   </div>
                                </div>
                                <div className="flex flex-col gap-2 w-full">
                                   <Button 
                                    onClick={handleCheckStatus} 
                                    disabled={isCheckingStatus}
                                    className="w-full h-12 rounded-xl font-bold text-[10px] uppercase tracking-widest gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
                                   >
                                      {isCheckingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                                      Check Status Pembayaran
                                   </Button>
                                   <div className="flex gap-2 w-full">
                                      <Button onClick={handleDownloadQris} variant="outline" className="flex-1 h-11 rounded-xl font-bold text-[10px] uppercase tracking-widest gap-2">
                                         <Download className="w-4 h-4" /> Download
                                      </Button>
                                      <Button onClick={() => {setQrisData(null); setFinalAmount(null);}} variant="ghost" className="flex-1 h-11 rounded-xl font-bold text-[10px] uppercase">Batal</Button>
                                   </div>
                                </div>
                             </div>
                           )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" className="bg-transparent border border-border font-bold rounded-lg px-4 h-9 md:h-10 flex-1 text-[10px] uppercase">
                    Withdraw
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm rounded-2xl md:rounded-3xl bg-card p-6 md:p-8 flex flex-col min-w-0">
          <CardHeader className="p-0 mb-6 bg-transparent">
            <CardTitle className="text-xs md:text-sm font-bold uppercase tracking-widest text-muted-foreground">Quick Access</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 flex-1">
            {[
              { label: "API Key", icon: Key, color: "text-orange-500", bg: "bg-orange-500/10", href: "/console/developer/api-keys" },
              { label: "PPOB", icon: Smartphone, color: "text-blue-500", bg: "bg-blue-500/10", href: "/console/services/ppob" },
              { label: "SMM", icon: Users, color: "text-indigo-500", bg: "bg-indigo-500/10", href: "/console/services/smm" },
              { label: "OTP", icon: MessageSquare, color: "text-purple-500", bg: "bg-purple-500/10", href: "/console/services/nokos" },
            ].map((item, i) => (
              <Link href={item.href} key={i} className="block min-w-0">
                <Button variant="ghost" className="w-full h-auto py-4 px-1 flex flex-col gap-2 rounded-xl border border-border/50 hover:bg-primary/5 transition-all group overflow-hidden">
                  <div className={`p-2 rounded-lg ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider truncate w-full text-center">{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 min-w-0">
        <Card className="border-border shadow-sm rounded-2xl md:rounded-3xl bg-card overflow-hidden">
          <CardHeader className="px-6 py-4 md:py-5 border-b border-border bg-slate-50/50 dark:bg-[#0A0A0A]">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs md:text-sm font-bold flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Quota Usage Trend
              </CardTitle>
              <Badge variant="outline" className="text-[9px] font-bold h-6">Real-time</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {quotaUsageData.map((item, i) => (
                <div key={i} className="px-6 h-16 md:h-20 flex items-center gap-4 hover:bg-slate-50/50 transition-colors relative overflow-hidden">
                  <div className="flex items-center gap-4 z-10 py-3 shrink-0 w-32 md:w-40">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="text-xs font-bold leading-tight truncate">{item.name}</span>
                  </div>
                  <div className="flex-1 min-w-0 h-full relative z-0">
                    <div className="absolute inset-x-0 bottom-0 h-10 md:h-12">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={item.chart.map((v, idx) => ({ value: v, id: idx }))}>
                          <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#gradient-quota)" strokeWidth={2} dot={false} />
                          <defs>
                            <linearGradient id="gradient-quota" x1="0" x1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 z-10 py-3 shrink-0 justify-end">
                    <span className="text-xs font-bold font-mono text-foreground">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm rounded-2xl md:rounded-3xl bg-card overflow-hidden flex flex-col">
          <CardHeader className="px-6 py-4 md:py-5 border-b border-border bg-slate-50/50 dark:bg-[#0A0A0A]">
            <CardTitle className="text-xs md:text-sm font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Activity Status (24h)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            <div className="flex items-stretch w-full h-full min-h-[140px] md:min-h-[160px]">
              {[
                { label: "Success", value: stats.success.toLocaleString(), color: "text-green-500", key: "success", stroke: "#22c55e" },
                { label: "Pending", value: stats.pending.toLocaleString(), color: "text-orange-500", key: "pending", stroke: "#f97316" },
                { label: "Failed", value: stats.failed.toLocaleString(), color: "text-rose-500", key: "failed", stroke: "#f43f5e" },
              ].map((stat, i) => (
                <React.Fragment key={i}>
                  <div className="flex-1 relative flex flex-col items-center justify-center p-4">
                    <div className="z-10 text-center">
                      <h3 className="text-lg md:text-2xl font-headline font-bold">{stat.value}</h3>
                      <p className={`text-[8px] md:text-[10px] font-bold uppercase tracking-widest ${stat.color}`}>{stat.label}</p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-12 md:h-16 w-full opacity-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={activityChartData}>
                          <RechartsArea type="monotone" dataKey={stat.key} stroke={stat.stroke} fill={stat.stroke} fillOpacity={0.1} strokeWidth={2} dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  {i < 2 && <div className="w-[1px] bg-border opacity-50 h-full"></div>}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="w-full min-w-0 overflow-hidden">
        <Card className="border-border shadow-sm rounded-2xl md:rounded-3xl overflow-hidden bg-card"> 
          <CardHeader className="px-6 py-4 md:py-6 border-b border-border bg-slate-50/50 dark:bg-[#0A0A0A]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                <CardTitle className="text-xs md:text-sm font-bold uppercase tracking-widest text-muted-foreground">Recent Transactions</CardTitle>
              </div>
              <Button variant="outline" asChild className="rounded-lg h-8 md:h-9 text-[10px] font-bold px-4 transition-all hover:bg-primary hover:text-primary-foreground">
                <Link href="/console/transactions">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <div className="w-full overflow-x-auto min-w-0"> 
            <table className="w-full min-w-[800px] text-xs text-left border-collapse"> 
              <thead className="bg-slate-50/50 border-b border-border dark:bg-[#0F0F0F]">
                <tr>
                  <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[9px] tracking-widest whitespace-nowrap">Time</th>
                  <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[9px] tracking-widest whitespace-nowrap">Service</th>
                  <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[9px] tracking-widest whitespace-nowrap">Ref</th>
                  <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[9px] tracking-widest whitespace-nowrap">Product</th>
                  <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[9px] tracking-widest whitespace-nowrap">Price</th>
                  <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[9px] tracking-widest text-right whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {txLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="px-6 py-5"><Skeleton className="h-4 w-full" /></td></tr>
                  ))
                ) : transactions.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-20 text-center text-muted-foreground font-medium italic">Belum ada aktivitas transaksi.</td></tr>
                ) : (
                  transactions.slice(0, 10).map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{formatTransactionDate(row.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="outline" className="bg-muted/50 border-none text-[8px] font-bold px-2 py-0.5 h-5 rounded-md uppercase">
                          {row.gameName || row.gameId}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-mono text-[10px] text-muted-foreground whitespace-nowrap uppercase tracking-tighter">{row.id?.substring(0, 12)}</td>
                      <td className="px-6 py-4 font-bold whitespace-nowrap max-w-[200px] truncate">{row.itemName}</td>
                      <td className="px-6 py-4 font-bold text-primary whitespace-nowrap">{row.price}</td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <Badge className={`${
                          row.effectiveStatus === 'Success' ? 'bg-green-500/10 text-green-600' : 
                          row.effectiveStatus === 'Pending' ? 'bg-orange-500/10 text-orange-600' : 
                          'bg-rose-500/10 text-rose-600'
                        } border-none text-[9px] font-bold px-2.5 py-0.5 h-6 rounded-md uppercase inline-flex items-center gap-1`}>
                          {row.effectiveStatus === 'Success' && <CheckCircle2 className="w-3 h-3" />}
                          {row.effectiveStatus === 'Pending' && <Clock className="w-3 h-3" />}
                          {row.effectiveStatus === 'Failed' && <XCircle className="w-3 h-3" />}
                          {row.effectiveStatus}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="text-center pt-10 border-t border-border/50 max-w-2xl mx-auto">
         <p className="text-[10px] text-muted-foreground/30 font-bold uppercase tracking-[0.5em]">
           STS Point Gateway Console • Node ID: Cluster-01-JKT
         </p>
      </div>
    </div>
  );
}
