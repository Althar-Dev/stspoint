"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Activity,
  Globe,
  ShieldCheck,
  Zap,
  Layout,
  Settings,
  Bell,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  User as UserIcon
} from "lucide-react";
import React from "react";

interface V2DashboardProps {
  profile: any;
  isLoading: boolean;
}

export function V2Dashboard({ profile, isLoading }: V2DashboardProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold tracking-tight">
            Manajemen <span className="text-primary">Aplikasi Premium</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Dashboard konfigurasi dan status operasional layanan premium Anda.
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
        {[
          { label: "Status Koneksi", value: "Online", icon: Globe, color: "text-emerald-500", bg: "bg-emerald-500/5" },
          { label: "Fitur Premium", value: "Aktif", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/5" },
          { label: "Terakhir Update", value: "Tadi Malam", icon: Clock, color: "text-blue-500", bg: "bg-blue-500/5" },
          { label: "SLA Keamanan", value: "Terjamin", icon: ShieldCheck, color: "text-primary", bg: "bg-primary/5" },
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
        {/* Info Detail */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-border shadow-sm rounded-2xl overflow-hidden bg-card h-full">
            <CardHeader className="px-8 py-6 border-b border-border bg-muted/30 dark:bg-[#0A0A0A]">
              <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                <Layout className="w-4 h-4 text-primary" />
                Informasi Layanan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Kepemilikan Akun</p>
                     <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                           <UserIcon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                           <p className="text-sm font-bold truncate">{profile?.name || "Member"}</p>
                           <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-tight">{profile?.email}</p>
                        </div>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Kategori Lisensi</p>
                     <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                           <Zap className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                           <p className="text-sm font-bold">Premium Application</p>
                           <p className="text-[9px] text-primary font-bold uppercase tracking-tight">Full Access</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="pt-6 border-t border-dashed border-border space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Fitur Aktif</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {[
                       "Dashboard Manajemen",
                       "Pengaturan SEO & Meta",
                       "Kontrol Webhook",
                       "Notifikasi Sistem",
                       "Whitelist Domain",
                       "Akses API Partner"
                     ].map((feat, i) => (
                       <div key={i} className="flex items-center gap-3 text-xs font-medium text-foreground/70">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          {feat}
                       </div>
                     ))}
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Actions */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-none shadow-xl shadow-primary/10 bg-zinc-900 text-white p-8 relative overflow-hidden rounded-[2rem]">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[40px] -mr-16 -mt-16"></div>
             <div className="relative z-10 space-y-6">
                <div className="space-y-2">
                   <h3 className="text-xl font-headline font-bold">Pusat Kontrol</h3>
                   <p className="text-xs text-zinc-400 leading-relaxed">
                      Kelola pengaturan inti aplikasi Anda langsung dari sini. Perubahan akan diterapkan secara instan.
                   </p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                   <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold h-12 rounded-xl text-[10px] uppercase tracking-widest gap-2">
                      <Settings className="w-4 h-4" /> Buka Pengaturan
                   </Button>
                   <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold h-12 rounded-xl text-[10px] uppercase tracking-widest gap-2">
                      <Bell className="w-4 h-4" /> Kelola Notifikasi
                   </Button>
                </div>
             </div>
          </Card>

          <Card className="border-border shadow-sm rounded-2xl bg-card p-6 flex flex-col justify-center gap-4">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Status Keamanan</h4>
            <div className="space-y-3">
               {[
                 { label: 'SSL Certificate', status: 'Valid' },
                 { label: 'DDoS Guard', status: 'Protected' },
                 { label: 'Access Log', status: 'Encrypted' },
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                    <Badge variant="outline" className="border-emerald-500/20 text-emerald-600 bg-emerald-500/5 text-[8px] font-bold h-5 uppercase">{item.status}</Badge>
                 </div>
               ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
