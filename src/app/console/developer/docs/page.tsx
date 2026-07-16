"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search, Code, Terminal, ExternalLink, ArrowRight, ShieldAlert } from "lucide-react";

export default function DocsPage() {
  const sections = [
    { title: "Authentication", desc: "Learn how to authenticate your API requests using Bearer tokens.", icon: ShieldAlert },
    { title: "Endpoints", desc: "List of all available REST endpoints for PPOB, SMM, and Nokos.", icon: Terminal },
    { title: "Error Codes", desc: "Understand our error reporting and how to handle exceptions.", icon: Code },
    { title: "Webhooks", desc: "Configure real-time event notifications for your transaction updates.", icon: ExternalLink },
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Documentation</h1>
        <p className="text-muted-foreground">Everything you need to integrate STS Point services into your application. Explore our guides and API references.</p>
        
        <div className="relative mt-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            className="w-full h-12 bg-white border border-black/5 rounded-2xl shadow-sm pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Search documentation..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
        {sections.map((section, i) => (
          <Card key={i} className="border-none shadow-sm rounded-[2rem] overflow-hidden group hover:shadow-md transition-all cursor-pointer">
            <CardContent className="p-8 flex items-start gap-6">
              <div className="p-4 rounded-2xl bg-slate-50 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <section.icon className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{section.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{section.desc}</p>
                <div className="flex items-center gap-1 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0 pt-2">
                  Read Guide
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm rounded-[2.5rem] bg-slate-900 text-white p-8 md:p-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32"></div>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 space-y-6">
            <Badge className="bg-white/10 text-white border-none uppercase tracking-widest text-[10px] px-3 py-1">Quick Start</Badge>
            <h2 className="text-3xl font-headline font-bold leading-tight">Integration in <span className="text-primary">5 Minutes</span></h2>
            <p className="text-white/60 leading-relaxed">Copy-paste our SDK examples and start processing game top-ups or PPOB transactions instantly. We support Node.js, Python, and PHP.</p>
            <div className="flex gap-4">
              <Button className="bg-white text-slate-900 hover:bg-white/90 font-bold rounded-xl px-6">Explore SDK</Button>
              <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 font-bold rounded-xl px-6">Postman Collection</Button>
            </div>
          </div>
          <div className="md:col-span-5 bg-black/40 rounded-2xl p-6 border border-white/5 font-mono text-[11px] space-y-2">
            <p className="text-green-400">// npm install sts-sdk</p>
            <p className="text-white/80">const sts = require(&apos;sts-sdk&apos;);</p>
            <p className="text-white/80">const client = new sts.Client(&apos;STS_KEY&apos;);</p>
            <p className="text-white/80">client.ppob.pulsa(&#123; &apos;phone&apos;: &apos;0812..&apos; &#125;)</p>
            <p className="text-green-400">  .then(res =&gt; console.log(res));</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
