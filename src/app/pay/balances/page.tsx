
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
  Timer,
  ArrowUpRight,
  AlertCircle,
  Banknote,
  Loader2,
  QrCode
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
import React, { useMemo, useState, useEffect } from "react";
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from "@/firebase";
import { doc, collection, query, where, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { isAfter, format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

/**
 * STSPay Balances Page
 * Menghitung saldo tersedia dan tertahan berdasarkan masa settlement T+n (Hari Kerja).
 * Serta menangani proses penarikan dana (Withdrawal).
 */
export default function STSPayBalancesPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // Withdrawal State
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Ambil data profil pengguna untuk info rekening & status verifikasi
  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile, loading: profileLoading } = useDoc(profileRef);

  // 2. Ambil seluruh transaksi milik merchant ini (Payment & Payout)
  const txQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, "stspay_transactions"),
      where("userId", "==", user.uid)
    );
  }, [db, user?.uid]);

  const { data: allTransactions, loading: txLoading } = useCollection(txQuery);

  // 3. Ambil kebijakan channel untuk menentukan masa settlement
  const channelsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "payment_channels");
  }, [db]);

  const { data: channels } = useCollection(channelsQuery);

  // 4. FUNGSI INTI: Kalkulasi Saldo Tersedia & Tertahan
  const { availableBalance, pendingBalance, recentActivity } = useMemo(() => {
    let settledRevenue = 0;
    let pendingRevenue = 0;
    let totalWithdrawals = 0;
    const processedList: any[] = [];

    const now = new Date();

    allTransactions.forEach((tx) => {
      if (tx.type === 'payment' && ['PAID', 'SETTLED', 'SUCCEEDED'].includes(tx.status)) {
        const netAmount = (tx.amount || 0) - (tx.fee_amount || 0);
        const methodId = tx.payment_method_id || "";
        const channelInfo = channels.find(c => c.id.toUpperCase() === methodId.toUpperCase());
        const settlementStr = channelInfo?.settlement || "T+1";
        const daysToAdd = parseInt(settlementStr.replace(/[^0-9]/g, '')) || 1;

        const createdAt = tx.createdAt?.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt || 0);
        let settlementDate = new Date(createdAt);
        let businessDaysAdded = 0;
        
        while (businessDaysAdded < daysToAdd) {
          settlementDate.setDate(settlementDate.getDate() + 1);
          const dayOfWeek = settlementDate.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) businessDaysAdded++;
        }

        const isSettled = isAfter(now, settlementDate);
        if (isSettled) {
          settledRevenue += netAmount;
        } else {
          pendingRevenue += netAmount;
        }
        processedList.push({ ...tx, netAmount, settlementDate, isSettled });
      } 
      
      else if (tx.type === 'payout' && tx.status !== 'FAILED') {
        totalWithdrawals += (tx.amount || 0);
        processedList.push({ ...tx, netAmount: tx.amount, isSettled: true, isPayout: true });
      }
    });

    return { 
      availableBalance: Math.max(0, settledRevenue - totalWithdrawals), 
      pendingBalance: pendingRevenue,
      recentActivity: processedList.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      }).slice(0, 15)
    };
  }, [allTransactions, channels]);

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount);
    if (isNaN(amount) || amount < 1000) {
      toast({ variant: "destructive", title: "Nominal Salah", description: "Minimal penarikan adalah Rp 1.000." });
      return;
    }

    if (amount > availableBalance) {
      toast({ variant: "destructive", title: "Saldo Tidak Cukup", description: "Nominal melebihi saldo tersedia Anda." });
      return;
    }

    if (profile?.payoutAccountStatus !== 'VERIFIED') {
      toast({ variant: "destructive", title: "Rekening Belum Diverifikasi", description: "Harap tunggu atau hubungi admin untuk verifikasi rekening bank." });
      return;
    }

    setIsProcessing(true);
    const trxId = `WD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    try {
      const payoutData = {
        id: trxId,
        userId: user?.uid,
        amount: amount,
        type: 'payout',
        status: 'PENDING',
        description: `Penarikan Saldo STSPay`,
        bankInfo: {
          name: profile.payoutBankName,
          accountNumber: profile.payoutAccountNumber,
          accountName: profile.payoutAccountName
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const ledgerData = {
        id: trxId,
        gameId: "STSPAY",
        gameName: "STSPAY",
        itemName: "Withdrawal Request",
        price: `Rp ${amount.toLocaleString('id-ID')}`,
        priceAmount: amount,
        userId: user?.uid,
        status: "Pending",
        paymentMethod: "Bank Transfer",
        createdAt: serverTimestamp()
      };

      await Promise.all([
        setDoc(doc(db, "stspay_transactions", trxId), payoutData),
        setDoc(doc(db, "transactions", trxId), ledgerData)
      ]);

      toast({ title: "Berhasil Diajukan", description: "Permintaan penarikan dana Anda sedang diproses." });
      setIsWithdrawOpen(false);
      setWithdrawAmount("");
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal", description: "Terjadi kesalahan saat memproses penarikan." });
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading = profileLoading || txLoading || !mounted;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold tracking-tight">STSPay <span className="text-primary">Financials</span></h1>
          <p className="text-muted-foreground text-sm">Monitor revenue, available funds, and settlement cycles.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" className="rounded-md font-bold text-[10px] uppercase tracking-widest gap-2" onClick={() => window.location.reload()}>
            <RefreshCcw className={`w-3.5 h-3.5 ${isLoading && 'animate-spin'}`} /> Sync Balances
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                <DialogTrigger asChild>
                  <Button disabled={availableBalance < 1000 || isLoading} className="bg-white text-emerald-700 hover:bg-white/90 font-bold rounded-xl px-10 h-12 uppercase tracking-widest text-[10px] border-none shadow-lg">
                    Withdraw Funds
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl border-border max-w-md">
                   <DialogHeader>
                      <DialogTitle className="font-headline font-bold flex items-center gap-2">
                        <Banknote className="w-5 h-5 text-emerald-500" />
                        Tarik Saldo Tersedia
                      </DialogTitle>
                      <DialogDescription className="text-xs">
                        Dana akan dikirimkan ke rekening bank yang telah Anda daftarkan di pengaturan.
                      </DialogDescription>
                   </DialogHeader>

                   {profile?.payoutAccountStatus !== 'VERIFIED' ? (
                     <div className="py-6 space-y-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto border border-amber-500/20">
                           <AlertCircle className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                           <h4 className="font-bold">Verifikasi Diperlukan</h4>
                           <p className="text-xs text-muted-foreground leading-relaxed px-4">
                             Anda belum memiliki rekening yang terverifikasi. Silakan lengkapi data rekening di menu Settings untuk mengaktifkan fitur ini.
                           </p>
                        </div>
                        <Button asChild variant="outline" className="rounded-xl font-bold h-11 w-full">
                           <Link href="/pay/settings">Ke Pengaturan Rekening</Link>
                        </Button>
                     </div>
                   ) : (
                     <div className="space-y-6 py-4">
                        <div className="p-4 rounded-xl bg-muted/50 border border-border flex items-center justify-between">
                           <div className="space-y-0.5">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">Tujuan Transfer</p>
                              <p className="text-sm font-bold">{profile.payoutBankName} • {profile.payoutAccountNumber}</p>
                              <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">a.n {profile.payoutAccountName}</p>
                           </div>
                           <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        </div>

                        <div className="space-y-2">
                           <div className="flex items-center justify-between ml-1">
                              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Nominal Penarikan</Label>
                              <span className="text-[10px] font-bold text-emerald-600">Max: Rp {availableBalance.toLocaleString()}</span>
                           </div>
                           <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">Rp</span>
                              <Input 
                                type="number" 
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                className="h-14 pl-12 rounded-2xl bg-muted/30 border-transparent focus:bg-background focus:border-border transition-all text-xl font-headline font-bold"
                                placeholder="0"
                              />
                           </div>
                        </div>

                        <Button 
                          onClick={handleWithdraw}
                          disabled={isProcessing || !withdrawAmount || parseInt(withdrawAmount) > availableBalance}
                          className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-widest text-[11px] shadow-xl shadow-emerald-600/20"
                        >
                           {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ArrowUpRight className="w-5 h-5 mr-2" />}
                           Konfirmasi Penarikan
                        </Button>
                     </div>
                   )}
                </DialogContent>
              </Dialog>

              <Button variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl px-8 h-12 uppercase tracking-widest text-[10px]">
                Payment Reports
              </Button>
            </div>
          </CardContent>
        </Card>

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Settlements Activity */}
        <Card className="lg:col-span-12 border-border shadow-sm rounded-2xl bg-card overflow-hidden">
          <CardHeader className="px-6 py-5 border-b border-border bg-muted/30 dark:bg-[#0A0A0A]">
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
              <History className="w-4 h-4 text-primary" />
              Recent Financial Activity
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
               <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground">Transaction</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground text-center">Amount (Net)</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground text-center">Status</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground text-right">Reference Date</th>
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
                           <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.isPayout ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                                 {tx.isPayout ? <ArrowUpRight className="w-4 h-4" /> : <QrCode className="w-4 h-4" />}
                              </div>
                              <div className="flex flex-col">
                                 <span className="font-bold text-foreground/80">{tx.isPayout ? 'Penarikan Dana' : (tx.description || "Gateway Payment")}</span>
                                 <span className="text-[10px] font-mono text-muted-foreground uppercase">#{tx.id?.substring(0, 14)}</span>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                           <p className={`font-bold ${tx.isPayout ? 'text-amber-600' : 'text-emerald-600'}`}>
                             {tx.isPayout ? '-' : ''}Rp {tx.netAmount?.toLocaleString('id-ID')}
                           </p>
                           {!tx.isPayout && <p className="text-[8px] text-muted-foreground uppercase font-bold">Fee: -Rp {tx.fee_amount?.toLocaleString()}</p>}
                        </td>
                        <td className="px-6 py-4 text-center">
                           <Badge className={`border-none text-[8px] font-bold uppercase px-2 py-0.5 rounded-md gap-1 ${
                             tx.status === 'PAID' || tx.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-600' : 
                             tx.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600' : 'bg-red-500/10 text-red-600'
                           }`}>
                             {tx.status === 'PAID' || tx.status === 'SUCCESS' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Timer className="w-2.5 h-2.5 animate-pulse" />}
                             {tx.isPayout ? (tx.status === 'PAID' ? 'Completed' : tx.status) : (tx.isSettled ? 'Available' : 'Settling')}
                           </Badge>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                           <p className="text-[10px] font-bold text-foreground/80">
                             {tx.isPayout ? (tx.createdAt ? format(tx.createdAt.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt), "dd MMM yyyy") : '---') : format(tx.settlementDate, "dd MMM yyyy")}
                           </p>
                           <p className="text-[9px] text-muted-foreground uppercase">
                             {tx.isPayout ? 'Withdrawal Date' : 'Estimated Arrival'}
                           </p>
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
