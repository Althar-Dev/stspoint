"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Package, 
  Settings2, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  RefreshCcw,
  Smartphone,
  MessageSquare,
  Users,
  Globe,
  Loader2,
  ChevronRight,
  Database
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "@/hooks/use-toast";

const PROVIDERS = [
  { 
    id: "digiflazz", 
    name: "DigiFlazz", 
    type: "PPOB & Game", 
    icon: Smartphone, 
    color: "text-blue-500",
    endpoint: "https://api.digiflazz.com/v1"
  },
  { 
    id: "orderkuota", 
    name: "Orderkuota", 
    type: "OTP & QRIS", 
    icon: Zap, 
    color: "text-orange-500",
    endpoint: "https://api.qrispay.biz.id/orderkuota"
  },
  { 
    id: "gomerchant", 
    name: "GoMerchant", 
    type: "GoMerchant", 
    icon: Globe, 
    color: "text-cyan-500",
    endpoint: "https://api.gomerchant.biz.id/v1"
  },
  { 
    id: "smm", 
    name: "SMM Panel", 
    type: "Social Media", 
    icon: Users, 
    color: "text-indigo-500",
    endpoint: "https://smm-bridge.stspoint.id"
  },
];

export default function ServiceManagementPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSync = (id: string) => {
    setLoading(id);
    setTimeout(() => {
      setLoading(null);
      toast({ title: "Sync Complete", description: `Service ${id} is fully operational.` });
    }, 1500);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h1 className="text-xl sm:text-2xl font-headline font-bold tracking-tight">Service <span className="text-primary">Management</span></h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Control global upstream providers and infrastructure connectivity.</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-md font-bold text-[10px] uppercase tracking-widest gap-2 h-10 sm:h-11 px-4 sm:px-6 w-full sm:w-auto">
          <RefreshCcw className="w-3.5 h-3.5" /> Check All Health
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {PROVIDERS.map((p) => (
          <Card key={p.id} className="border-border shadow-sm rounded-xl sm:rounded-2xl bg-card overflow-hidden group hover:border-primary/20 transition-all">
            <CardHeader className="bg-muted/30 dark:bg-black/20 px-4 sm:px-6 py-4 sm:py-5 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-background border border-border flex items-center justify-center ${p.color} shadow-sm group-hover:scale-105 transition-transform`}>
                    <p.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg font-bold">{p.name}</CardTitle>
                    <CardDescription className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest">{p.type}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-bold text-[8px] sm:text-[9px] uppercase px-2 py-0.5">Active</Badge>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Upstream Endpoint</Label>
                  <div className="flex gap-2">
                    <Input readOnly value={p.endpoint} className="h-10 bg-muted/30 font-mono text-[10px] sm:text-[11px] rounded-lg border-transparent" />
                    <Button variant="outline" size="icon" className="h-10 w-10 shrink-0" onClick={() => handleSync(p.id)}>
                      {loading === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 p-3 sm:p-4 rounded-xl bg-muted/30 border border-transparent hover:border-border transition-colors">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Latency</p>
                    <p className="text-xs sm:text-sm font-bold font-mono">64ms</p>
                  </div>
                  <div className="space-y-1 p-3 sm:p-4 rounded-xl bg-muted/30 border border-transparent hover:border-border transition-colors">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Success Rate</p>
                    <p className="text-xs sm:text-sm font-bold font-mono">99.8%</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest h-8 px-3 rounded-lg hover:bg-primary/5 hover:text-primary">
                  Configure Keys
                </Button>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  STSP_VERIFIED
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm rounded-xl sm:rounded-2xl bg-zinc-900 text-white p-5 sm:p-8 overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32 transition-transform group-hover:scale-110"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-10">
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center text-primary">
                <Database className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-headline font-bold">Global Master Keys</h3>
            </div>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-xl leading-relaxed">
              Kunci utama sistem yang digunakan sebagai jembatan (*bridge*) untuk seluruh transaksi mitra. Perubahan pada bagian ini akan berdampak langsung pada seluruh infrastruktur layanan.
            </p>
          </div>
          <Button className="bg-white text-black hover:bg-white/90 font-bold rounded-xl h-10 sm:h-11 px-6 sm:px-8 uppercase tracking-widest text-[10px] sm:text-[11px] shrink-0 shadow-xl shadow-white/5 w-full md:w-auto">
            Manage Keys
          </Button>
        </div>
      </Card>
    </div>
  );
}
