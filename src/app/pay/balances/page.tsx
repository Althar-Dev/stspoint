"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Wallet, 
  History,
  ShieldCheck,
  ChevronRight,
  Info,
  RefreshCcw,
  Clock,
  CheckCircle2,
  Timer
} from "lucide-react";
import React, { useMemo, useState, useEffect } from "react";
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from "@/firebase";
import { doc, collection, query, where } from "firebase/firestore";
import { isAfter, format } from "date-fns";

/**
 * STSPay Balances Page
 * Menghitung saldo tersedia dan tertahan berdasarkan masa settlement T+n (Hari Kerja).
 */
export default function STSPayBalancesPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Ambil data layanan STSPay (Config)
  const stspayRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid, "services", "stspay");
  }, [db, user?.uid]);

  const { data: stspaySvc, loading: svcLoading } = useDoc(stspayRef);

  // 2. Ambil seluruh transaksi sukses (PAID) milik merchant ini
  const txQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, "stspay_transactions"),
      where("userId", "==", user.uid),
      where("status", "in", ["PAID", "SETTLED", "SUCCEEDED"])
    );
  }, [db, user?.uid]);

  const { data: paidTransactions, loading: txLoading } = useCollection(txQuery);

  // 3. Ambil kebijakan channel untuk menentukan masa settlement (T+1, T+2, dll)
  const channelsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "payment_channels");
  }, [db]);

  const { data: channels } = useCollection(channelsQuery);

  // 4. FUNGSI INTI: Kalkulasi Saldo Berdasarkan Masa Settlement (Hanya Hari Kerja)
  const { availableBalance, pendingBalance, settledTransactions, pendingTransactions } = useMemo(() => {
    let available = 0;
    let pending = 0;
    const settledList: any[] = [];
    const pendingList: any[] = [];

    const now = new Date();

    paidTransactions.forEach((tx) => {
      // Net Revenue = Amount - Fee
      const netAmount = (tx.amount || 0) - (tx.fee_amount || 0);
      
      // Cari info settlement dari channel (Default T+1 jika tidak ditemukan di registry)
      const methodId = tx.payment_method_id || "";
      const channelInfo = channels.find(c => c.id.toUpperCase() === methodId.toUpperCase());
      const settlementStr = channelInfo?.settlement || "T+1";
      
      // Parsing angka dari string "T+1", "T+2", dsb.
      const daysToAdd = parseInt(settlementStr.replace(/[^0-9]/g, '')) || 1;

      // Hitung tanggal estimasi cair (SKIP SABTU & MINGGU)
      const createdAt = tx.createdAt?.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt || 0);
      
      let settlementDate = new Date(createdAt);
      let businessDaysAdded = 0;
      
      while (businessDaysAdded < daysToAdd) {
        settlementDate.setDate(settlementDate.getDate() + 1);
        const dayOfWeek = settlementDate.getDay();
        // 0 = Sunday, 6 = Saturday. Hanya tambah jika hari kerja (1-5).
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          businessDaysAdded++;
        }
      }

      // Cek apakah sudah melewati waktu cair
      const isSettled = isAfter(now, settlementDate);

      if (isSettled) {
        available += netAmount;
        settledList.push({ ...tx, netAmount, settlementDate, isSettled: true });
      } else {
        pending += netAmount;
        pendingList.push({ ...tx, netAmount, settlementDate, isSettled: false });
      }
    });

    return { 
      availableBalance: available, 
      pendingBalance: pending,
      settledTransactions: settledList,
      pendingTransactions: pendingList
    };
  }, [paidTransactions, channels]);

  // Gabungkan dan urutkan untuk tampilan aktivitas terbaru
  const recentActivity = useMemo(() => {
    return [...settledTransactions, ...pendingTransactions]
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 15);
  }, [settledTransactions, pendingTransactions]);

  const isLoading = svcLoading || txLoading || !mounted;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold tracking-tight">STSPay <span className="text-primary">Financials</span></h1>
          <p className="text-muted-foreground text-sm">Monitor revenue, available funds, and settlement cycles.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" className="rounded-md font-bold text-[10px] uppercase tracking-widest gap-2">
            <RefreshCcw className={`w-3.5 h-3.5 ${isLoading && 'animate-spin'}`} /> Sync Balances
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Balance Card */}
        <Card className="lg:col-span-2 border-none shadow-xl shadow-emerald-500/10 bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-2xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] -mr-32 -mt-32 transition-transform group-hover:scale-110"></div>
          <CardContent className="p-8 md:p-12 relative z-10 space-y-8 h-full flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-white/70 text-xs font-bold uppercase tracking-[0.2em]">Available Balance</p>
                <Badge variant="outline" className="bg-white/10 border-white/20 text-white text-[8px] font-bold rounded-md">READY FOR PAYOUT</Badge>
              </div>
              {isLoading ? <Skeleton className="h-14 w-64 bg-white/10" /> : (
                <h2 className="text-5xl font-headline font-bold tracking-tighter">
                  Rp {availableBalance.toLocaleString('id-ID')}
                </h2>
              )}
              <p className="text-white/50 text-[10px] font-medium max-w-sm leading-relaxed">
                Dana ini telah melewati masa settlement hari kerja yang ditentukan dan siap ditarik ke rekening bank Anda.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-white text-emerald-700 hover:bg-white/90 font-bold rounded-xl px-10 h-12 uppercase tracking-widest text-[10px] border-none shadow-lg">
                Withdraw Funds
              </Button>
              <Button variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl px-8 h-12 uppercase tracking-widest text-[10px]">
                Payment Reports
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pending Balance & Small Stats */}
        <div className="space-y-6">
           <Card className="border-border shadow-sm rounded-2xl bg-card p-6 border-l-4 border-l-amber-500">
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
                       <Clock className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 text-[8px] font-bold uppercase">Settling</Badge>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pending Balance</p>
                    {isLoading ? <Skeleton className="h-8 w-32" /> : (
                      <h3 className="text-2xl font-headline font-bold">Rp {pendingBalance.toLocaleString('id-ID')}</h3>
                    )}
                    <p className="text-[9px] text-muted-foreground leading-relaxed mt-1">
                       Dana tertahan sementara menunggu hari kerja settlement provider (Xendit/Midtrans).
                    </p>
                 </div>
              </div>
           </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Settlements Activity */}
        <Card className="lg:col-span-8 border-border shadow-sm rounded-2xl bg-card overflow-hidden">
          <CardHeader className="px-6 py-5 border-b border-border bg-muted/30 dark:bg-[#0A0A0A]">
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
              <History className="w-4 h-4 text-primary" />
              Settlement Ledger Activity
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
               <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground">Transaction</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground text-center">Net Revenue</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground text-center">Settlement Status</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground text-right">Available Date</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-border">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}><td colSpan={4} className="px-6 py-6"><Skeleton className="h-4 w-full" /></td></tr>
                    ))
                  ) : recentActivity.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-20 text-center text-muted-foreground font-medium italic">Tidak ada aktivitas dana terbaru.</td></tr>
                  ) : (
                    recentActivity.map((tx) => (
                      <tr key={tx.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                           <div className="flex flex-col">
                              <span className="font-bold text-foreground/80">{tx.description || "Gateway Payment"}</span>
                              <span className="text-[10px] font-mono text-muted-foreground uppercase">#{tx.id?.substring(0, 12)}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                           <p className="font-bold text-emerald-600">Rp {tx.netAmount?.toLocaleString('id-ID')}</p>
                           <p className="text-[8px] text-muted-foreground uppercase font-bold">Fee: -Rp {tx.fee_amount?.toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <Badge className={`border-none text-[8px] font-bold uppercase px-2 py-0.5 rounded-md gap-1 ${
                             tx.isSettled ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                           }`}>
                             {tx.isSettled ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Timer className="w-2.5 h-2.5 animate-pulse" />}
                             {tx.isSettled ? 'Available' : 'Pending'}
                           </Badge>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                           <p className="text-[10px] font-bold text-foreground/80">{format(tx.settlementDate, "dd MMM yyyy")}</p>
                           <p className="text-[9px] text-muted-foreground uppercase">{format(tx.settlementDate, "HH:mm")} WIB</p>
                        </td>
                      </tr>
                    ))
                  )}
               </tbody>
            </table>
          </div>
        </Card>

        {/* Settlement Info Area */}
        <div className="lg:col-span-4 space-y-6">
           <div className="p-4 rounded-xl bg-muted/30 border border-border">
              <div className="flex items-center gap-2 mb-2">
                 <Info className="w-3.5 h-3.5 text-primary" />
                 <span className="text-[10px] font-bold uppercase tracking-widest">Settlement Note</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                 *Masa settlement dihitung sejak status transaksi berubah menjadi <span className="font-bold">PAID</span>. Hari Sabtu, Minggu, dan Libur Nasional tidak dihitung sebagai hari proses dari provider.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
