
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Wallet, 
  History,
  Activity,
  ShieldCheck,
  ChevronRight,
  Plus,
  RefreshCcw,
  Clock,
  XCircle,
  CheckCircle2,
  PieChart as PieChartIcon,
  Timer
} from "lucide-react";
import React, { useMemo, useState, useEffect } from "react";
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, where } from "firebase/firestore";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, isToday, isYesterday, isSameYear } from "date-fns";

export default function STSPayDashboard() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Membaca saldo khusus layanan STSPay
  const stspayRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid, "services", "stspay");
  }, [db, user?.uid]);

  const { data: stspaySvc, loading: stspayLoading } = useDoc(stspayRef);

  // Mengambil data langsung dari stspay_transactions
  const transactionsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, "stspay_transactions"),
      where("userId", "==", user.uid)
    );
  }, [db, user?.uid]);

  const { data: rawTransactions, loading: txLoading } = useCollection(transactionsQuery);

  const getEffectiveStatus = (status: string, createdAt: any) => {
    const s = String(status).toUpperCase();
    // Normalize Success States
    if (['SUCCESS', 'PAID', 'SETTLED', 'SUCCEEDED', 'COMPLETED'].includes(s)) return 'Success';
    if (['FAILED', 'CANCELED', 'EXPIRED'].includes(s)) return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    
    if (s !== 'PENDING') return status;
    if (!createdAt) return 'Pending';
    
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    const diffInMinutes = (new Date().getTime() - date.getTime()) / 60000;
    // Tampilkan sebagai Failed jika sudah lewat 15 menit
    return diffInMinutes > 15 ? 'Failed' : 'Pending';
  };

  const transactions = useMemo(() => {
    // FOKUS: Filter hanya transaksi STSPay (Keluarkan GoMerchant dan Orderkuota)
    const filtered = rawTransactions.filter(tx => 
      tx.provider !== 'GoMerchant' && tx.provider !== 'Orderkuota'
    );

    const processed = filtered.map(tx => ({
      ...tx,
      effectiveStatus: getEffectiveStatus(tx.status, tx.createdAt)
    }));

    return processed.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [rawTransactions]);

  const formatTransactionDate = (timestamp: any) => {
    if (!isMounted || !timestamp) return "...";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    if (isToday(date)) return format(date, "HH:mm");
    if (isYesterday(date)) return "Kemarin " + format(date, "HH:mm");
    if (isSameYear(date, now)) return format(date, "dd MMM HH:mm");
    return format(date, "yyyy MM dd HH:mm");
  };

  const statusDistribution = useMemo(() => {
    const counts = { success: 0, expired: 0, failed: 0 };
    transactions.forEach(tx => {
      const s = String(tx.effectiveStatus).toUpperCase();
      if (s === 'SUCCESS') counts.success++;
      else if (s === 'EXPIRED') counts.expired++;
      else if (s === 'FAILED' || s === 'CANCELED') counts.failed++;
    });
    
    return [
      { name: 'Success', value: counts.success, color: '#10b981' },
      { name: 'Expired', value: counts.expired, color: '#94a3b8' },
      { name: 'Failed', value: counts.failed, color: '#ef4444' },
    ].filter(item => item.value > 0 || transactions.length === 0);
  }, [transactions]);

  const totalVolume = useMemo(() => {
    return transactions
      .filter(t => t.effectiveStatus === 'Success')
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [transactions]);

  const getLogoSource = (methodId: string) => {
    if (!methodId || methodId === "Checkout Link" || methodId === "Multi") return null;
    const upperId = methodId.toUpperCase().replace(/\s/g, '');
    if (upperId === 'BSI') return '/assets/bank/bsi-logo.svg';
    if (upperId === 'SAHABAT_SAMPOERNA' || upperId === 'SAHABATSAMPOERNA') return '/assets/bank/bss-logo.svg';
    const commonLogos = ['BRI', 'BNI', 'MANDIRI', 'PERMATA', 'BJB', 'CIMB', 'OVO', 'ALFAMART', 'INDOMARET', 'QRIS'];
    if (commonLogos.includes(upperId)) {
      return `/assets/bank/${upperId.toLowerCase()}.png`;
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-md font-bold text-[10px] uppercase tracking-widest gap-2" onClick={() => window.location.reload()}>
            <RefreshCcw className="w-3" /> Sync Data
          </Button>
          <Button asChild size="sm" className="rounded-md font-bold text-[10px] uppercase tracking-widest gap-2 bg-primary">
            <Link href="/pay/payment-link">
              <Plus className="w-3" /> New Payment
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-border shadow-sm rounded-md bg-card overflow-hidden">
          <CardHeader className="px-6 py-6 border-b border-border flex flex-row items-center justify-between dark:bg-[#0A0A0A]">
            <div className="space-y-1">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Transaction</CardTitle>
              <h2 className="text-sm md:text-2xl font-headline font-bold">Status Distribution</h2>
            </div>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold text-[9px] uppercase px-2 h-6">
              {transactions.length} Records
            </Badge>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[250px] w-full flex flex-col md:flex-row items-center justify-center">
              {transactions.length === 0 && !txLoading ? (
                <div className="flex flex-col items-center justify-center space-y-2 opacity-20">
                   <PieChartIcon className="w-12 h-12" />
                   <p className="text-xs font-bold uppercase tracking-widest">No Data Available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1500}
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-xl shadow-primary/10 bg-primary text-primary-foreground rounded-md overflow-hidden relative group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[40px] -mr-16 -mt-16"></div>
             <CardContent className="p-6 space-y-4 relative z-10">
                <div className="flex items-center gap-2">
                   <Wallet className="w-4 h-4 opacity-70" />
                   <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">STSPay Balance</p>
                </div>
                {stspayLoading ? <Skeleton className="h-10 w-full bg-white/20" /> : (
                  <h3 className="text-xl md:text-3xl font-headline font-bold">Rp {(stspaySvc?.balance || 0).toLocaleString('id-ID')}</h3>
                )}
                <div className="pt-4 flex gap-2">
                   <Button asChild className="flex-1 bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold rounded-md h-9 text-[10px] uppercase">
                     <Link href="/pay/balances">Withdraw Revenue</Link>
                   </Button>
                </div>
             </CardContent>
          </Card>

          <Card className="border-border shadow-sm rounded-md bg-card p-6">
             <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Financial Metrics</h4>
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <Activity className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-xs font-medium text-muted-foreground">Successful Volume</span>
                   </div>
                   <span className="text-xs font-bold text-emerald-600">Rp {totalVolume.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-medium text-muted-foreground">Security Protocol</span>
                   </div>
                   <span className="text-xs font-bold">TLS 1.3</span>
                </div>
             </div>
          </Card>
        </div>
      </div>

      <div className="w-full max-w-full grid grid-cols-1 min-w-0 overflow-hidden">
        <Card className="border-border shadow-sm rounded-md overflow-hidden bg-card">
           <CardHeader className="px-8 py-6 border-b border-border bg-muted/30 dark:bg-[#0A0A0A] flex flex-row items-center justify-between">
              <CardTitle className="text-[12px] md:text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                <History className="w-4 h-4 text-primary" />
                Gateway Traffic
              </CardTitle>
           </CardHeader>
           <div className="w-full overflow-x-auto">
             <table className="w-full min-w-[800px] text-xs text-left">
               <thead>
                 <tr className="bg-muted/50 border-b border-border">
                   <th className="px-8 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">ID Transaksi</th>
                   <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">Deskripsi</th>
                   <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">Amount</th>
                   <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">Method</th>
                   <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">Status</th>
                   <th className="px-8 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground text-right whitespace-nowrap">Waktu</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border">
                 {txLoading ? (
                   Array.from({ length: 5 }).map((_, i) => (
                     <tr key={i}><td colSpan={6} className="px-8 py-6"><Skeleton className="h-4 w-full" /></td></tr>
                   ))
                 ) : transactions.length === 0 ? (
                   <tr><td colSpan={6} className="px-8 py-20 text-center text-muted-foreground italic">Belum ada aktivitas transaksi di gateway Anda.</td></tr>
                 ) : (
                   transactions.slice(0, 10).map((row) => {
                     const logo = getLogoSource(row.payment_method_id || row.paymentMethod);
                     const isPayout = row.type === 'payout';
                     return (
                      <tr 
                        key={row.id} 
                        className="hover:bg-muted/20 transition-colors cursor-pointer group"
                        onClick={() => router.push(`/pay/transactions/${row.id}`)}
                      >
                        <td className="px-8 py-4 font-mono text-[10px] font-bold text-primary whitespace-nowrap flex items-center gap-2">
                           <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                             <ChevronRight className="w-3 h-3" />
                           </span>
                           #{row.id?.substring(0, 12).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap max-w-[250px]">
                          <p className="font-bold truncate" title={row.description || "Digital Payment"}>
                            {row.description || (isPayout ? "Withdrawal Request" : "Digital Payment")}
                          </p>
                        </td>
                        <td className="px-6 py-4 font-bold whitespace-nowrap">
                          <span className={isPayout ? "text-amber-600" : "text-emerald-600"}>
                            {isPayout ? "-" : "+"}Rp {(row.amount || 0).toLocaleString('id-ID')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                             {logo ? (
                               <img src={logo} alt="Method" className="h-4 md:h-5 object-contain" />
                             ) : (
                               <Badge variant="outline" className="bg-muted/50 border-none text-[8px] font-bold px-1.5 py-0 h-4 rounded-sm uppercase">
                                 {row.payment_method_id || row.paymentMethod || "Direct"}
                               </Badge>
                             )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={`${
                            row.effectiveStatus === 'Success' ? 'bg-emerald-500/10 text-emerald-600' : 
                            row.effectiveStatus === 'Pending' ? 'bg-amber-500/10 text-amber-600' : 
                            'bg-red-500/10 text-red-600'
                          } border-none text-[8px] font-bold uppercase px-2 py-0.5 rounded-sm flex items-center w-fit gap-1`}>
                            {row.effectiveStatus === 'Success' && <CheckCircle2 className="w-2.5 h-2.5" />}
                            {row.effectiveStatus === 'Pending' && <Clock className="w-2.5 h-2.5" />}
                            {row.effectiveStatus === 'Failed' && <XCircle className="w-2.5 h-2.5" />}
                            {row.effectiveStatus}
                          </Badge>
                        </td>
                        <td className="px-8 py-4 text-right text-muted-foreground text-[10px] whitespace-nowrap">
                          {formatTransactionDate(row.createdAt)}
                        </td>
                      </tr>
                     );
                   })
                 )}
               </tbody>
             </table>
           </div>
        </Card>
      </div>
    </div>
  );
}
