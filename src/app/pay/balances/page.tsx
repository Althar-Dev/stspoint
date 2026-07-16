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

  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile, loading } = useDoc(profileRef);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border border-border shadow-sm rounded-md bg-card overflow-hidden">
          <CardHeader className="px-8 py-8 border-b border-border bg-muted/30 dark:bg-[#0A0A0A]">
             <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Total Saldo Tersedia</p>
                {loading ? <Skeleton className="h-10 w-48 mt-2" /> : (
                  <h2 className="text-5xl font-headline font-bold">
                    Rp {(profile?.balance || 0).toLocaleString('id-ID')}
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
                         <p className="text-xs font-bold whitespace-nowrap">BCA • **** 1283</p>
                         <p className="text-[10px] text-muted-foreground uppercase font-bold whitespace-nowrap">Utama • Terverifikasi</p>
                      </div>
                   </div>
                   <Button variant="ghost" className="w-full text-[10px] font-bold uppercase h-8 hover:bg-primary/5 text-primary border border-transparent hover:border-primary/20">
                      Ubah Rekening
                   </Button>
                </div>

                <div className="flex flex-col justify-center gap-3">
                   <Button className="w-full h-12 rounded-md font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10">
                      Tarik Dana Sekarang
                   </Button>
                   <p className="text-[10px] text-center text-muted-foreground">Proses penarikan estimasi 1-3 jam hari kerja.</p>
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
                    <h5 className="text-[11px] font-bold uppercase tracking-tight">Kebijakan Payout</h5>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                       Batas minimal penarikan adalah <span className="text-foreground font-bold">Rp 50.000</span>. Biaya admin FLAT Rp 2.500 per transaksi.
                    </p>
                 </div>
              </div>
           </Card>

           <Card className="border-border shadow-sm rounded-md bg-primary text-primary-foreground p-8 flex flex-col justify-center relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[40px] -mr-16 -mt-16"></div>
             <div className="relative z-10 space-y-4">
               <ShieldCheck className="w-8 h-8 opacity-80" />
               <h3 className="text-lg font-headline font-bold">Automated Payout</h3>
               <p className="text-xs opacity-70 leading-relaxed">
                 Aktifkan fitur pencairan otomatis harian ke rekening utama Anda setiap jam 23:59 WIB.
               </p>
               <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold rounded-md text-[10px] uppercase tracking-widest h-9 px-6 border-none">
                 Konfigurasi
               </Button>
             </div>
           </Card>
        </div>
      </div>

      <div className="w-full max-w-full grid grid-cols-1 min-w-0 overflow-hidden">
        <Card className="border-border shadow-sm rounded-md bg-card overflow-hidden">
          <CardHeader className="px-8 py-6 border-b border-border bg-muted/30 dark:bg-[#0A0A0A] flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
              <History className="w-4 h-4 text-primary" />
              Riwayat Penarikan Dana
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest gap-2">
              <RefreshCcw className="w-3 h-3" /> Refresh
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full overflow-x-auto">
              <div className="divide-y divide-border min-w-[600px]">
                {[
                  { id: 'WD-91283', date: '24 Okt 2024', amount: 'Rp 2.500.000', status: 'Selesai', bank: 'BCA' },
                  { id: 'WD-91255', date: '20 Okt 2024', amount: 'Rp 1.200.000', status: 'Selesai', bank: 'BCA' },
                  { id: 'WD-91211', date: '15 Okt 2024', amount: 'Rp 450.000', status: 'Gagal', bank: 'BCA' },
                ].map((item, i) => (
                  <div key={i} className="px-8 py-5 flex items-center justify-between hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-9 h-9 rounded-md flex items-center justify-center ${item.status === 'Selesai' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                        <ArrowUpRight className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold whitespace-nowrap">{item.amount}</p>
                        <p className="text-[10px] text-muted-foreground whitespace-nowrap">{item.date} • {item.bank} ({item.id})</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`border-none text-[8px] font-bold uppercase rounded-sm ${item.status === 'Selesai' ? 'text-emerald-600 bg-emerald-500/5' : 'text-red-600 bg-red-500/5'}`}>
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
