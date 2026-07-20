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
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-headline font-bold tracking-tight">Service <span className="text-primary">Management</span></h1>
          <p className="text-muted-foreground text-sm">Control global upstream providers and infrastructure connectivity.</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-md font-bold text-[10px] uppercase tracking-widest gap-2 h-11 px-6">
          <RefreshCcw className="w-3.5 h-3.5" /> Check All Health
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {PROVIDERS.map((p) => (
          <Card key={p.id} className="border-border shadow-sm rounded-2xl bg-card overflow-hidden group hover:border-primary/20 transition-all">
            <CardHeader className="bg-muted/30 dark:bg-black/20 px-8 py-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center ${p.color} shadow-sm group-hover:scale-105 transition-transform`}>
                    <p.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">{p.name}</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-widest">{p.type}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-bold text-[9px] uppercase">Active</Badge>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Upstream Endpoint</Label>
                  <div className="flex gap-2">
                    <Input readOnly value={p.endpoint} className="h-10 bg-muted/30 font-mono text-[11px] rounded-lg border-transparent" />
                    <Button variant="outline" size="icon" className="h-10 w-10 shrink-0" onClick={() => handleSync(p.id)}>
                      {loading === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 p-4 rounded-xl bg-muted/30 border border-transparent hover:border-border transition-colors">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Latency</p>
                    <p className="text-sm font-bold font-mono">64ms</p>
                  </div>
                  <div className="space-y-1.5 p-4 rounded-xl bg-muted/30 border border-transparent hover:border-border transition-colors">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Success Rate</p>
                    <p className="text-sm font-bold font-mono">99.8%</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
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

      <Card className="border-none shadow-sm rounded-[2rem] bg-zinc-900 text-white p-10 overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32 transition-transform group-hover:scale-110"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-primary">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-headline font-bold">Global Master Keys</h3>
            </div>
            <p className="text-zinc-400 text-sm max-w-xl leading-relaxed">
              Kunci utama sistem yang digunakan sebagai jembatan (*bridge*) untuk seluruh transaksi mitra. Perubahan pada bagian ini akan berdampak langsung pada seluruh infrastruktur layanan.
            </p>
          </div>
          <Button className="bg-white text-black hover:bg-white/90 font-bold rounded-xl h-12 px-10 uppercase tracking-widest text-[11px] shrink-0 shadow-xl shadow-white/5">
            Manage Keys
          </Button>
        </div>
      </Card>
    </div>
  );
}
