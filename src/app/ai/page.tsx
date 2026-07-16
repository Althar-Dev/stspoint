"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  MessageSquare, 
  Image as ImageIcon, 
  Bot, 
  Activity, 
  Cpu, 
  Zap,
  ArrowUpRight,
  History,
  ChevronRight,
  BrainCircuit
} from "lucide-react";
import Link from "next/link";
import React from "react";

export default function AiDashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* AI Hero Banner */}
      <Card className="border-none shadow-xl shadow-primary/10 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black text-white rounded-[2rem] overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] -mr-48 -mt-48 transition-transform group-hover:scale-110"></div>
        <CardContent className="p-8 md:p-16 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <Badge className="bg-primary/20 text-primary border-primary/30 font-bold px-4 py-1 rounded-full text-xs uppercase tracking-widest">
              AI Infrastructure
            </Badge>
            <h1 className="text-4xl md:text-6xl font-headline font-bold leading-tight tracking-tighter">
              Next-Gen <span className="text-primary">Intelligence</span> untuk Bisnis Anda.
            </h1>
            <p className="text-zinc-400 text-lg leading-relaxed max-w-md">
              Integrasikan kemampuan AI canggih ke dalam alur kerja Anda dengan SDK GenKit yang stabil dan performa tinggi.
            </p>
            <div className="flex gap-4">
              <Button asChild className="bg-white text-black hover:bg-zinc-200 font-bold rounded-xl h-14 px-8 shadow-xl shadow-white/5">
                <Link href="/ai/chat">Coba Chat AI</Link>
              </Button>
              <Button variant="outline" asChild className="border-zinc-700 bg-zinc-800/50 text-white hover:bg-zinc-800 font-bold rounded-xl h-14 px-8">
                <Link href="/console/developer/docs">Dokumentasi SDK</Link>
              </Button>
            </div>
          </div>
          <div className="hidden lg:flex justify-end">
             <div className="w-72 h-72 rounded-[3rem] bg-zinc-800/50 border border-zinc-700 p-8 flex items-center justify-center backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent"></div>
                <BrainCircuit className="w-32 h-32 text-primary animate-pulse" />
             </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "API Requests", value: "24.5k", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Tokens Processed", value: "1.2M", icon: Cpu, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Avg Latency", value: "840ms", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "AI Models Active", value: "4 Live", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="border-border shadow-sm rounded-2xl bg-card group hover:border-primary/20 transition-all">
            <CardContent className="p-6">
               <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
               </div>
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
               <h3 className="text-2xl font-headline font-bold">{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Core AI Tools */}
        <div className="lg:col-span-8 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {[
               { title: "Intelligent Chat", desc: "Chatbot berbasis Gemini 2.5 Flash dengan pemahaman konteks mendalam.", icon: MessageSquare, url: "/ai/chat", badge: "Flash" },
               { title: "Image Studio", desc: "Generate visual aset profesional menggunakan model Imagen 4 terbaru.", icon: ImageIcon, url: "/ai/images", badge: "New" },
             ].map((tool, i) => (
               <Link href={tool.url} key={i}>
                 <Card className="border-border shadow-sm rounded-3xl overflow-hidden bg-card hover:bg-accent/50 transition-all group cursor-pointer h-full">
                    <CardContent className="p-8 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                          <tool.icon className="w-6 h-6" />
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold uppercase border-primary/20 text-primary">{tool.badge}</Badge>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xl font-bold">{tool.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{tool.desc}</p>
                      </div>
                      <div className="pt-4 flex items-center text-xs font-bold text-primary gap-1 group-hover:gap-2 transition-all">
                        Luncurkan Tool
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </CardContent>
                 </Card>
               </Link>
             ))}
           </div>

           {/* Activity Log */}
           <Card className="border-border shadow-sm rounded-3xl overflow-hidden bg-card">
              <CardHeader className="px-8 py-6 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
                    <History className="w-4 h-4 text-primary" />
                    AI Activity Log
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest h-8">Lihat Semua</Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {[
                    { event: 'Image Generation', status: 'Success', time: '2 menit lalu', detail: 'Generated creative product showcase' },
                    { event: 'Chat Session', status: 'Success', time: '15 menit lalu', detail: 'Analysis of payment webhook logic' },
                    { event: 'Token Refresh', status: 'Info', time: '1 jam lalu', detail: 'AI Engine session renewed' },
                    { event: 'Support Assistant', status: 'Success', time: '3 jam lalu', detail: 'Troubleshooting payment #STS-921' },
                  ].map((log, i) => (
                    <div key={i} className="px-8 py-5 flex items-center justify-between hover:bg-muted/10 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${log.status === 'Success' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold">{log.event}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{log.detail}</p>
                        </div>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">{log.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
           </Card>
        </div>

        {/* Sidebar Cards */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border shadow-sm rounded-3xl bg-card p-8">
            <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-6">Capabilities Overview</h4>
            <div className="space-y-6">
              {[
                { label: 'Multimodal Input', desc: 'Dukung teks, gambar, dan file sebagai basis input AI.', icon: Zap },
                { label: 'Low Latency Inference', desc: 'Model dioptimalkan untuk respon sub-detik.', icon: Activity },
                { label: 'Enterprise Security', desc: 'Data Anda dienkripsi dan tidak digunakan untuk training.', icon: Bot },
              ].map((cap, i) => (
                <div key={i} className="flex gap-4">
                   <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0 mt-0.5">
                      <cap.icon className="w-5 h-5" />
                   </div>
                   <div className="space-y-1">
                      <h5 className="text-sm font-bold">{cap.label}</h5>
                      <p className="text-xs text-muted-foreground leading-relaxed">{cap.desc}</p>
                   </div>
                </div>
              ))}
            </div>
            <div className="mt-10 p-5 rounded-2xl bg-primary/5 border border-primary/10">
               <p className="text-[11px] text-primary font-bold uppercase mb-2">Butuh Bantuan?</p>
               <p className="text-[11px] text-muted-foreground leading-relaxed">Gunakan Intelligent Chat untuk bertanya mengenai cara implementasi GenKit ke dalam sistem Anda.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
