"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Wallet, 
  ArrowUpRight, 
  TrendingUp, 
  CreditCard,
  History,
  Activity,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Plus,
  RefreshCcw,
  Clock,
  Terminal,
  XCircle,
  Timer,
  CheckCircle2
} from "lucide-react";
import React, { useMemo } from "react";
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, where } from "firebase/firestore";
import { Area, AreaChart, ResponsiveContainer, YAxis, XAxis, Tooltip } from "recharts";
import { format } from "date-fns";
import Link from "next/link";

export default function STSPayDashboard() {
  const { user } = useUser();
  const db = useFirestore();

  // Membaca saldo khusus layanan STSPay (Berbeda dengan saldo Console)
  const stspayRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid, "services", "stspay");
  }, [db, user?.uid]);

  const { data: stspaySvc, loading: stspayLoading } = useDoc(stspayRef);

  const transactionsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    // Hapus orderBy untuk menghindari error index-required yang menyebabkan dashboard kosong
    return query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      where("gameId", "==", "STSPAY")
    );
  }, [db, user?.uid]);

  const { data: rawTransactions, loading: txLoading } = useCollection(transactionsQuery);

  const getEffectiveStatus = (status: string, createdAt: any) => {
    const s = String(status).toUpperCase();
    if (s !== 'PENDING') return status;
    if (!createdAt) return status;
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    const diffInMinutes = (new Date().getTime() - date.getTime()) / 60000;
    // Tampilkan sebagai Failed jika sudah lewat 15 menit
    return diffInMinutes > 15 ? 'Failed' : status;
  };

  const transactions = useMemo(() => {
    // Mapping status efektif dan urutkan di sisi klien
    const processed = rawTransactions.map(tx => ({
      ...tx,
      effectiveStatus: getEffectiveStatus(tx.status, tx.createdAt)
    }));

    return processed.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    }).slice(0, 10); // Ambil 10 terbaru untuk overview
  }, [rawTransactions]);

  const chartData = [
    { time: '00:00', amount: 400 },
    { time: '04:00', amount: 300 },
    { time: '08:00', amount: 900 },
    { time: '12:00', amount: 1200 },
    { time: '16:00', amount: 800 },
    { time: '20:00', amount: 1100 },
    { time: '23:59', amount: 1500 },
  ];

  const totalVolume = useMemo(() => {
    return transactions.reduce((acc, curr) => acc + (curr.priceAmount || 0), 0);
  }, [transactions]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-md font-bold text-[10px] uppercase tracking-widest gap-2">
            <RefreshCcw className="w-3 h-3" /> Sync Data
          </Button>
          <Button asChild size="sm" className="rounded-md font-bold text-[10px] uppercase tracking-widest gap-2 bg-primary">
            <Link href="/pay/payment-link">
              <Plus className="w-3 h-3" /> New Payment
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-border shadow-sm rounded-md bg-card overflow-hidden">
          <CardHeader className="px-6 py-6 border-b border-border flex flex-row items-center justify-between dark:bg-[#0A0A0A]">
            <div className="space-y-1">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Gateway Volume (24h)</CardTitle>
              <h2 className="text-3xl font-headline font-bold">Rp {totalVolume.toLocaleString('id-ID')}</h2>
            </div>
            <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20 font-bold text-[9px] uppercase px-2 h-6">
              Active Flow
            </Badge>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="payGradient" x1="0" x1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '10px' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#payGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-xl shadow-primary/10 bg-primary text-primary-foreground rounded-md overflow-hidden relative group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[40px] -mr-16 -mt-16"></div>
             <CardContent className="p-6 space-y-4 relative z-10">
                <div className="flex items-center gap-2">
                   <Wallet className="w-4 h-4 opacity-70" />
                   <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">STSPay Payout Balance</p>
                </div>
                {stspayLoading ? <Skeleton className="h-10 w-full bg-white/20" /> : (
                  <h3 className="text-3xl font-headline font-bold">Rp {(stspaySvc?.balance || 0).toLocaleString('id-ID')}</h3>
                )}
                <div className="pt-4 flex gap-2">
                   <Button asChild className="flex-1 bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold rounded-md h-9 text-[10px] uppercase">
                     <Link href="/pay/balances">Withdraw Revenue</Link>
                   </Button>
                </div>
             </CardContent>
          </Card>

          <Card className="border-border shadow-sm rounded-md bg-card p-6">
             <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Infrastructure Health</h4>
             <div className="space-y-4">
                {[
                  { label: 'System Uptime', value: '99.98%', icon: Activity, color: 'text-emerald-500' },
                  { label: 'API Latency', value: '64ms', icon: Clock, color: 'text-blue-500' },
                  { label: 'Security SSL', value: 'Verified', icon: ShieldCheck, color: 'text-primary' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                        <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                     </div>
                     <span className="text-xs font-bold">{item.value}</span>
                  </div>
                ))}
             </div>
          </Card>
        </div>
      </div>

      <div className="w-full max-w-full grid grid-cols-1 min-w-0 overflow-hidden">
        <Card className="border-border shadow-sm rounded-md overflow-hidden bg-card">
           <CardHeader className="px-8 py-6 border-b border-border bg-muted/30 dark:bg-[#0A0A0A] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                <History className="w-4 h-4 text-primary" />
                Gateway Traffic
              </CardTitle>
           </CardHeader>
           <div className="w-full overflow-x-auto">
             <table className="w-full min-w-[800px] text-xs text-left">
               <thead>
                 <tr className="bg-muted/50 border-b border-border">
                   <th className="px-8 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">ID Transaksi</th>
                   <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">Item / Ref</th>
                   <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">Amount</th>
                   <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">Method</th>
                   <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground text-right whitespace-nowrap">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border">
                 {txLoading ? (
                   Array.from({ length: 5 }).map((_, i) => (
                     <tr key={i}><td colSpan={5} className="px-8 py-6"><Skeleton className="h-4 w-full" /></td></tr>
                   ))
                 ) : transactions.length === 0 ? (
                   <tr><td colSpan={5} className="px-8 py-20 text-center text-muted-foreground italic">Belum ada aktivitas transaksi di gateway Anda.</td></tr>
                 ) : (
                   transactions.map((row) => (
                     <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                       <td className="px-8 py-4 font-mono text-[10px] font-bold text-primary whitespace-nowrap">#{row.id?.substring(0, 12).toUpperCase()}</td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <p className="font-bold">{row.itemName || "STSPay Trx"}</p>
                         <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">{row.id}</p>
                       </td>
                       <td className="px-6 py-4 font-bold whitespace-nowrap">Rp {(row.priceAmount || 0).toLocaleString('id-ID')}</td>
                       <td className="px-6 py-4 font-medium uppercase text-[10px] text-muted-foreground whitespace-nowrap">
                         {row.paymentMethod || "Multi"}
                       </td>
                       <td className="px-6 py-4 text-right whitespace-nowrap">
                         <Badge className={`${
                           row.effectiveStatus === 'Success' ? 'bg-emerald-500/10 text-emerald-600' : 
                           row.effectiveStatus === 'Pending' ? 'bg-amber-500/10 text-amber-600' : 
                           'bg-red-500/10 text-red-600'
                         } border-none text-[8px] font-bold uppercase px-2 py-0.5 rounded-sm flex items-center justify-end w-full gap-1`}>
                           {row.effectiveStatus === 'Success' && <CheckCircle2 className="w-2.5 h-2.5" />}
                           {row.effectiveStatus === 'Pending' && <Clock className="w-2.5 h-2.5" />}
                           {row.effectiveStatus === 'Failed' && <XCircle className="w-2.5 h-2.5" />}
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
    </div>
  );
}
