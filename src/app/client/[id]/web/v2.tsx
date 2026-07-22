"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Activity,
  Cpu,
  Globe,
  ShieldCheck,
  Zap,
  Terminal,
  Server,
  CloudLightning,
  Signal
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
            Instance <span className="text-primary">Performance</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Operational dashboard for your Premium Application instance.
          </p>
        </div>
        <div className="flex items-center gap-2">
           <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-bold text-[10px] uppercase h-7 px-3 rounded-full flex items-center gap-2">
             <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
             Instance Healthy
           </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {[
          { label: "CPU Usage", value: "12%", icon: Cpu, color: "text-blue-500" },
          { label: "Memory", value: "248MB", icon: Server, color: "text-purple-500" },
          { label: "API Latency", value: "42ms", icon: Zap, color: "text-amber-500" },
          { label: "Uptime", value: "99.9%", icon: Activity, color: "text-emerald-500" },
        ].map((stat, i) => (
          <Card key={i} className="border-border shadow-sm rounded-md bg-card p-6">
            <div className="flex items-center justify-between mb-2">
               <div className={`p-2 rounded-md bg-muted ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
               </div>
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
            </div>
            <h3 className="text-xl font-headline font-bold">{stat.value}</h3>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-border shadow-sm rounded-md bg-card overflow-hidden">
            <CardHeader className="px-8 py-6 border-b border-border bg-muted/30 dark:bg-[#0A0A0A]">
              <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
                <Terminal className="w-4 h-4 text-primary" />
                Live Deployment Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 font-mono text-[11px] space-y-2 bg-muted/10 min-h-[300px]">
               <p className="text-muted-foreground/60">[08:42:11] <span className="text-emerald-500 font-bold">INFO:</span> Instance initialized successfully.</p>
               <p className="text-muted-foreground/60">[08:42:15] <span className="text-blue-500 font-bold">INFO:</span> SSL Certificate verified (Let's Encrypt).</p>
               <p className="text-muted-foreground/60">[09:12:01] <span className="text-emerald-500 font-bold">SUCCESS:</span> Scheduled database maintenance completed.</p>
               <p className="text-muted-foreground/60">[10:05:44] <span className="text-amber-500 font-bold">WARN:</span> Slight latency increase detected in upstream node.</p>
               <p className="text-muted-foreground/60">[11:30:22] <span className="text-blue-500 font-bold">INFO:</span> Traffic spike handled by auto-scaling group.</p>
               <p className="text-foreground animate-pulse">_</p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-xl shadow-primary/10 bg-zinc-900 text-white p-8 relative overflow-hidden rounded-md">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[40px] -mr-16 -mt-16"></div>
             <div className="relative z-10 space-y-4">
                <CloudLightning className="w-10 h-10 text-primary" />
                <h3 className="text-lg font-headline font-bold">Infrastructure Control</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                   Your application is running on STS-Premium Node Cluster 01. All resources are dedicated to your instance.
                </p>
                <div className="pt-4 space-y-2">
                   <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      <span>Server Location</span>
                      <span className="text-white">Jakarta, ID</span>
                   </div>
                   <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      <span>Public IP</span>
                      <span className="text-white">103.12.XX.XX</span>
                   </div>
                </div>
                <Button className="w-full bg-white text-black hover:bg-zinc-200 font-bold h-11 rounded-md text-[10px] uppercase tracking-widest">
                   Restart Instance
                </Button>
             </div>
          </Card>

          <Card className="border-border shadow-sm rounded-md bg-card p-6">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Security Overview</h4>
            <div className="space-y-4">
               {[
                 { label: 'WAF Protection', icon: ShieldCheck, status: 'Active' },
                 { label: 'DDoS Mitigation', icon: Signal, status: 'Active' },
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <item.icon className="w-4 h-4 text-emerald-500" />
                       <span className="text-xs font-medium">{item.label}</span>
                    </div>
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