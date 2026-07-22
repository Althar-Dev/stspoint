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
  ShieldCheck,
  Activity,
  Globe
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold tracking-tight">
            Ringkasan <span className="text-primary">Aplikasi</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Pantau performa dan aktivitas operasional layanan premium Anda.
          </p>
        </div>
        <div className="flex items-center gap-2">
           <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-bold text-[10px] uppercase h-8 px-4 rounded-full flex items-center gap-2">
             <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
             Layanan Aktif
           </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Row 1 Stats - Tanpa Kartu Saldo */}
        {[
          { label: "Status Koneksi", value: "Online", icon: Globe, color: "text-emerald-500", bg: "bg-emerald-500/5" },
          { label: "Total Pesanan", value: "842", icon: ShoppingCart, color: "text-blue-500", bg: "bg-blue-500/5" },
          { label: "Volume Aktivitas", value: "Tinggi", icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/5" },
          { label: "Health Check", value: "99.9%", icon: Activity, color: "text-primary", bg: "bg-primary/5" },
        ].map((stat, i) => (
          <Card key={i} className="border-border shadow-sm rounded-xl bg-card p-6">
            <div className="flex items-center gap-3 mb-3">
               <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
               </div>
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
            </div>
            <h3 className="text-xl font-headline font-bold">{stat.value}</h3>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Activity Table (Kiri - Col 8) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-border shadow-sm rounded-2xl overflow-hidden bg-card">
            <CardHeader className="px-8 py-6 border-b border-border bg-muted/30 dark:bg-[#0A0A0A]">
               <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                    <History className="w-4 h-4 text-primary" />
                    Aktivitas Terbaru
                  </CardTitle>
                  <Button asChild variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest hover:text-primary cursor-pointer h-8">
                    <Link href={`/client/${appId}/orders`}>
                      Semua Pesanan <ChevronRight className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
               </div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-border">
                  {[
                    { item: 'Akses API Terverifikasi', status: 'Success', time: '2 menit lalu', detail: 'Token Session Valid' },
                    { item: 'Pembaruan Konfigurasi', status: 'Success', time: '15 menit lalu', detail: 'Meta SEO Updated' },
                    { item: 'Validasi Lisensi', status: 'Success', time: '1 jam lalu', detail: 'Lifetime License' },
                    { item: 'Sync Database', status: 'Success', time: '3 jam lalu', detail: 'Database Local Re-index' },
                  ].map((log, i) => (
                    <div key={i} className="px-8 py-5 flex items-center justify-between hover:bg-muted/10 transition-colors">
                       <div className="flex items-center gap-4">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                          <div className="min-w-0">
                             <p className="text-sm font-bold truncate max-w-[200px]">{log.item}</p>
                             <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">{log.time}</p>
                          </div>
                       </div>
                       <div className="text-right whitespace-nowrap">
                          <p className="text-xs font-bold text-primary">{log.detail}</p>
                          <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">{log.status}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info (Kanan - Col 4) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border shadow-sm rounded-2xl bg-card p-8">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6">Informasi Cepat</h4>
            <div className="space-y-4">
               {[
                 { label: 'Panduan Aplikasi', icon: Package },
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
                 Layanan Premium
               </p>
               <p className="text-[10px] text-muted-foreground leading-relaxed">
                 Aplikasi ini berjalan di atas infrastruktur premium dengan akses penuh ke seluruh fitur eksklusif.
               </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
