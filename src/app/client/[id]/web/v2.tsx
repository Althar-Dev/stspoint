"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ShoppingCart, 
  History,
  ChevronRight,
  TrendingUp,
  ArrowUpRight,
  Package,
  ShieldCheck
} from "lucide-react";
import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface V2DashboardProps {
  profile: any;
  isLoading: boolean;
}

export function V2Dashboard({ profile, isLoading }: V2DashboardProps) {
  const { id: appId } = useParams();

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      {/* Header Responsif */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-headline font-bold tracking-tight">
            Ringkasan <span className="text-primary">Toko</span>
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm">
            Pantau performa penjualan dan pendapatan website top-up Anda.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {/* Quick Stats - Identik dengan V1 */}
        <Card className="border-border shadow-sm rounded-xl bg-card p-5 md:p-6 flex flex-col justify-center group hover:border-primary/20 transition-all">
          <div className="flex items-center justify-between mb-4">
             <div className="p-2.5 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <ShoppingCart className="w-5 h-5" />
             </div>
             <Badge variant="secondary" className="bg-green-50/10 text-green-600 border-none font-bold text-[10px]">Hari Ini</Badge>
          </div>
          <h4 className="text-2xl font-headline font-bold">124</h4>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Pesanan Sukses</p>
        </Card>
        <Card className="border-border shadow-sm rounded-xl bg-card p-5 md:p-6 flex flex-col justify-center group hover:border-primary/20 transition-all">
          <div className="flex items-center justify-between mb-4">
             <div className="p-2.5 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <TrendingUp className="w-5 h-5" />
             </div>
             <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold text-[10px]">Real-time</Badge>
          </div>
          <h4 className="text-2xl font-headline font-bold text-primary">Rp 1.250.000</h4>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Volume Transaksi</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Recent Activity Table - Identik dengan V1 */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-border shadow-sm rounded-2xl overflow-hidden bg-card">
            <CardHeader className="px-6 py-4 md:py-6 border-b border-border bg-muted/30 dark:bg-[#0A0A0A]">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                    <History className="w-4 h-4 text-primary" />
                    Aktivitas Terbaru
                  </CardTitle>
                  <Button asChild variant="ghost" size="sm" className="w-full sm:w-auto text-[10px] font-bold uppercase tracking-widest hover:text-primary cursor-pointer h-8 rounded-lg">
                    <Link href={`/client/${appId}/orders`}>
                      Semua Pesanan <ChevronRight className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
               </div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-border">
                  {[
                    { item: 'Diamond MLBB 86', status: 'Success', time: '2 menit lalu', amount: 'Rp 19.500' },
                    { item: 'Pulsa Telkomsel 10k', status: 'Success', time: '15 menit lalu', amount: 'Rp 10.250' },
                    { item: 'PLN Token 50k', status: 'Process', time: '22 menit lalu', amount: 'Rp 50.000' },
                    { item: 'Free Fire 70 Diamonds', status: 'Success', time: '1 jam lalu', amount: 'Rp 9.000' },
                  ].map((log, i) => (
                    <div key={i} className="px-6 md:px-8 py-5 flex items-center justify-between hover:bg-muted/10 transition-colors">
                       <div className="flex items-center gap-4 min-w-0">
                          <div className={`shrink-0 w-2 h-2 rounded-full ${log.status === 'Success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'}`}></div>
                          <div className="min-w-0">
                             <p className="text-sm font-bold truncate max-w-[140px] sm:max-w-xs">{log.item}</p>
                             <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">{log.time}</p>
                          </div>
                       </div>
                       <div className="text-right whitespace-nowrap ml-4">
                          <p className="text-sm font-bold text-primary">{log.amount}</p>
                          <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">{log.status}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info - Identik dengan V1 */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border shadow-sm rounded-2xl bg-card p-6 md:p-8">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6">Informasi Cepat</h4>
            <div className="space-y-4">
               {[
                 { label: 'Panduan Merchant', icon: Package },
                 { label: 'Hubungi Support', icon: TrendingUp },
               ].map((item, i) => (
                 <button key={i} className="w-full flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all group text-left">
                    <div className="flex items-center gap-3">
                       <item.icon className="w-4 h-4 text-primary" />
                       <span className="text-xs font-bold text-foreground/80">{item.label}</span>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                 </button>
               ))}
            </div>
            <div className="mt-8 p-5 rounded-2xl bg-primary/5 border border-primary/10">
               <p className="text-[10px] text-primary font-bold uppercase mb-1.5 flex items-center gap-2">
                 <ShieldCheck className="w-3.5 h-3.5" />
                 Sistem Terverifikasi
               </p>
               <p className="text-[10px] text-muted-foreground leading-relaxed">Website Anda menggunakan infrastruktur STS v2.0 yang stabil dan aman.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
