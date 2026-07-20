
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Terminal, 
  Code2, 
  Webhook, 
  ShieldCheck, 
  Copy, 
  CheckCircle2, 
  Zap, 
  ArrowRight,
  BookOpen,
  Info
} from "lucide-react";
import React from "react";
import { toast } from "@/hooks/use-toast";

export default function STSPayDocsPage() {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} copied to clipboard.` });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Introduction */}
      <section className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary">
          Technical Reference
        </div>
        <h2 className="text-3xl font-headline font-bold tracking-tight">API <span className="text-primary">Documentation</span></h2>
        <p className="text-muted-foreground text-sm max-w-3xl leading-relaxed">
          Gunakan STSPay API untuk menerima pembayaran otomatis melalui QRIS, Virtual Account, E-Wallet, dan Retail Outlet. Dokumentasi ini memberikan panduan teknis lengkap untuk integrasi sistem ke sistem (H2H).
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-12">
          {/* Authentication Section */}
          <section id="auth" className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold">Autentikasi</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Setiap request ke STSPay API harus menyertakan kredensial merchant Anda di dalam payload JSON untuk validasi keamanan.
            </p>
            <Card className="bg-zinc-900 border-none text-zinc-300 font-mono text-xs overflow-hidden shadow-xl">
              <CardHeader className="bg-zinc-800/50 px-6 py-3 flex flex-row items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Required Credentials</span>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:text-white" onClick={() => copyToClipboard('merchant_id, secret_key', 'Keys')}>
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-2">
                <p>{"{"}</p>
                <p className="pl-4">"merchant_id": <span className="text-emerald-400">"STS-XXXXXXXX"</span>,</p>
                <p className="pl-4">"secret_key": <span className="text-emerald-400">"STS-Key-XXXXXXXX"</span></p>
                <p>{"}"}</p>
              </CardContent>
            </Card>
          </section>

          {/* Create Payment Link */}
          <section id="create-payment" className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold">Create Payment Link</h3>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-emerald-500/10 text-emerald-600 border-none px-3 font-bold">POST</Badge>
              <code className="text-xs font-bold text-primary">/payments/create</code>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Endpoint ini digunakan untuk menginisialisasi transaksi baru dan mendapatkan tautan halaman checkout kustom STSPay.
            </p>

            <Card className="bg-zinc-900 border-none text-zinc-300 font-mono text-xs overflow-hidden shadow-xl">
              <CardHeader className="bg-zinc-800/50 px-6 py-3">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Request Body</span>
              </CardHeader>
              <CardContent className="p-6 space-y-2">
                <p>{"{"}</p>
                <p className="pl-4">"merchant_id": "STS-XXXX",</p>
                <p className="pl-4">"secret_key": "STS-Key-XXXX",</p>
                <p className="pl-4">"amount": <span className="text-amber-400">50000</span>,</p>
                <p className="pl-4">"payer_email": "customer@email.com",</p>
                <p className="pl-4">"description": "Pembayaran Item Digital"</p>
                <p>{"}"}</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-none text-zinc-300 font-mono text-xs overflow-hidden shadow-xl">
              <CardHeader className="bg-zinc-800/50 px-6 py-3">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Success Response</span>
              </CardHeader>
              <CardContent className="p-6 space-y-2">
                <p>{"{"}</p>
                <p className="pl-4">"success": true,</p>
                <p className="pl-4">"data": {"{"}</p>
                <p className="pl-8">"external_id": "PAY-1730-XXXX",</p>
                <p className="pl-8">"checkout_url": <span className="text-emerald-400">"https://api.stspoint.id/checkout/..."</span>,</p>
                <p className="pl-8">"status": "PENDING"</p>
                <p className="pl-4">{"}"}</p>
                <p>{"}"}</p>
              </CardContent>
            </Card>
          </section>

          {/* Webhooks Section */}
          <section id="webhooks" className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                <Webhook className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold">Webhooks (Callback)</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              STSPay akan mengirimkan POST request ke URL yang Anda daftarkan di pengaturan setiap kali status transaksi berubah menjadi <span className="text-foreground font-bold">PAID</span>, <span className="text-foreground font-bold">EXPIRED</span>, atau <span className="text-foreground font-bold">FAILED</span>.
            </p>
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 leading-relaxed uppercase font-bold">
                PENTING: Pastikan server Anda merespon dengan HTTP 200 OK untuk mengonfirmasi penerimaan Webhook.
              </p>
            </div>
          </section>
        </div>

        {/* Navigation Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <Card className="border-border shadow-sm rounded-xl bg-card sticky top-24">
            <CardHeader className="px-6 py-5 border-b border-border bg-muted/20">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5" />
                Daftar Isi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <nav className="space-y-1">
                {[
                  { id: 'auth', label: 'Autentikasi API' },
                  { id: 'create-payment', label: 'Create Payment Link' },
                  { id: 'check-status', label: 'Check Payment Status' },
                  { id: 'webhooks', label: 'Webhook Configuration' },
                  { id: 'errors', label: 'Error Codes' },
                ].map((link) => (
                  <button 
                    key={link.id}
                    onClick={() => document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted text-left group transition-all"
                  >
                    <span className="text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors">{link.label}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm rounded-xl p-8 bg-primary text-primary-foreground relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[40px] -mr-16 -mt-16"></div>
             <div className="relative z-10 space-y-4">
                <Code2 className="w-8 h-8 opacity-80" />
                <h3 className="text-lg font-headline font-bold">SDK Support</h3>
                <p className="text-xs opacity-70 leading-relaxed">
                  Kami menyediakan SDK untuk Node.js, PHP, dan Python untuk mempermudah proses integrasi Anda.
                </p>
                <Button className="w-full bg-white text-primary hover:bg-white/90 font-bold rounded-md text-[10px] uppercase tracking-widest h-9">
                  Download SDK
                </Button>
             </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
