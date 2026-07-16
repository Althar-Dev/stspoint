"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Wallet, 
  ShoppingCart, 
  TrendingUp, 
  ArrowUpRight, 
  History,
  Activity,
  ChevronRight,
  ShieldCheck,
  Package,
  Users
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import Link from "next/link";

export default function ClientDashboardPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile, loading: profileLoading } = useDoc(profileRef);

  const isLoading = authLoading || profileLoading || !mounted;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold tracking-tight">
            Ringkasan <span className="text-primary">Toko</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Selamat datang, {profile?.name || "Admin"}. Pantau kinerja penjualan website Anda hari ini.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-card border-border py-1.5 px-3 flex items-center gap-2 rounded-md text-[10px] font-bold uppercase tracking-wider">
             <Activity className="w-3 h-3 text-green-500 animate-pulse" />
             Status Sistem: Normal
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Card - Golden Yellow */}
        <Card className="lg:col-span-1 border-none shadow-xl shadow-amber-500/20 bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 text-white rounded-md overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
          <CardContent className="p-8 space-y-6 relative z-10 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <div className="space-y-1">
                 <p className="text-white/80 text-[10px] font-bold uppercase tracking-[0.2em]">Total Pendapatan</p>
                 {isLoading ? <Skeleton className="h-10 w-32 bg-white/20" /> : (
                   <h2 className="text-3xl font-headline font-bold">
                     Rp {(profile?.balance || 0).toLocaleString('id-ID')}
                   </h2>
                 )}
               </div>
               <div className="w-12 h-12 rounded-md bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                 <Wallet className="w-6 h-6 text-white" />
               </div>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 bg-white text-amber-600 hover:bg-white/90 font-bold rounded-md h-11 text-xs uppercase tracking-wider border-none">
                Tarik Saldo
              </Button>
              <Button variant="outline" className="flex-1 border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold rounded-md h-11 text-xs uppercase tracking-wider">
                Laporan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
           <Card className="border-border shadow-sm rounded-md bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                 <div className="p-2 rounded-md bg-primary/5 text-primary">
                    <ShoppingCart className="w-5 h-5" />
                 </div>
                 <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-md">+5.2%</span>
              </div>
              <h4 className="text-2xl font-headline font-bold">428</h4>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Pesanan Sukses</p>
           </Card>
           <Card className="border-border shadow-sm rounded-md bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                 <div className="p-2 rounded-md bg-primary/5 text-primary">
                    <Users className="w-5 h-5" />
                 </div>
                 <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">Hari Ini</span>
              </div>
              <h4 className="text-2xl font-headline font-bold">1,024</h4>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Pengunjung Web</p>
           </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-border shadow-sm rounded-md overflow-hidden bg-card">
            <CardHeader className="px-8 py-6 border-b border-border bg-muted/30 dark:bg-[#0A0A0A]">
               <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
                    <History className="w-4 h-4 text-primary" />
                    Pesanan Terbaru
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest hover:text-primary">
                    Semua Pesanan <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
               </div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-border">
                  {[
                    { item: 'Diamond MLBB', status: 'Selesai', time: '2 menit lalu', amount: 'Rp 15.000' },
                    { item: 'Pulsa Telkomsel', status: 'Selesai', time: '12 menit lalu', amount: 'Rp 10.250' },
                    { item: 'Token PLN', status: 'Proses', time: '25 menit lalu', amount: 'Rp 50.000' },
                    { item: 'Diamond Free Fire', status: 'Selesai', time: '1 jam lalu', amount: 'Rp 20.000' },
                  ].map((log, i) => (
                    <div key={i} className="px-8 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                       <div className="flex items-center gap-4">
                          <div className={`w-2 h-2 rounded-full ${log.status === 'Selesai' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                          <div>
                             <p className="text-xs font-bold">{log.item}</p>
                             <p className="text-[10px] text-muted-foreground">{log.time}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-xs font-bold text-primary">{log.amount}</p>
                          <Badge variant="outline" className="border-none text-[8px] font-bold uppercase text-muted-foreground/60 p-0 h-auto">
                            {log.status}
                          </Badge>
                       </div>
                    </div>
                  ))}
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Support & Quick Links */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border shadow-sm rounded-md bg-card p-8">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6">Bantuan & Panduan</h4>
            <div className="space-y-4">
               {[
                 { label: 'Panduan Admin', icon: Package },
                 { label: 'Dukungan Teknis', icon: ShieldCheck },
               ].map((item, i) => (
                 <button key={i} className="w-full flex items-center justify-between p-4 rounded-md bg-muted/50 border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all group">
                    <div className="flex items-center gap-3">
                       <item.icon className="w-4 h-4 text-primary" />
                       <span className="text-xs font-bold text-foreground/80">{item.label}</span>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                 </button>
               ))}
            </div>
            
            <div className="mt-8 p-4 rounded-md bg-primary/5 border border-primary/10">
               <p className="text-[10px] text-primary font-bold uppercase mb-1">Butuh kustomasi?</p>
               <p className="text-[10px] text-muted-foreground leading-relaxed">Hubungi developer Anda untuk penambahan fitur khusus di panel ini.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}