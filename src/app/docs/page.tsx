
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Copy, 
  Terminal, 
  ShieldCheck, 
  Zap, 
  Info,
  Check,
  Braces,
  ArrowRight,
  Code2
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function DocsPage() {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    toast({ title: "Copied!", description: `${type} copied to clipboard.` });
    setTimeout(() => setCopiedType(null), 2000);
  };

  const CodeBlock = ({ title, code, type }: { title: string, code: string, type: string }) => (
    <div className="space-y-3 my-6">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Terminal className="w-3 h-3" />
          {title}
        </span>
      </div>
      <div className="rounded-2xl overflow-hidden border border-border shadow-xl bg-[#0D0D0D]">
        <div className="bg-white/5 px-4 h-10 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/40"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/40"></div>
          </div>
          <button 
            onClick={() => copyToClipboard(code, type)}
            className="p-1.5 rounded hover:bg-white/5 text-muted-foreground hover:text-white transition-all"
          >
            {copiedType === type ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <div className="p-6 font-mono text-[12px] leading-relaxed text-zinc-300 overflow-x-auto">
          <pre>{code}</pre>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-24 animate-in fade-in duration-700">
      {/* Intro */}
      <section id="intro" className="space-y-6 scroll-mt-24">
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight">
          API <span className="text-primary/40">Reference.</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Selamat datang di dokumentasi resmi STSPoint. Gunakan API kami untuk membangun infrastruktur digital yang cepat, aman, dan skala enterprise.
        </p>
        <div className="flex flex-wrap gap-4 pt-4">
           <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 border border-primary/10 text-xs font-bold uppercase tracking-widest text-primary">
              <Zap className="w-3.5 h-3.5" /> High Performance
           </div>
           <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 border border-primary/10 text-xs font-bold uppercase tracking-widest text-primary">
              <ShieldCheck className="w-3.5 h-3.5" /> Secure HMAC
           </div>
        </div>
      </section>

      {/* Auth */}
      <section id="auth" className="space-y-8 scroll-mt-32">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-primary" />
            Autentikasi
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Setiap permintaan ke endpoint API STSPoint harus menyertakan kredensial merchant Anda di dalam body request untuk validasi keamanan. Jangan pernah membagikan <code className="text-primary font-bold">secret_key</code> Anda di sisi client.
          </p>
        </div>

        <CodeBlock 
          title="JSON Credentials Structure"
          type="auth-json"
          code={`{
  "merchant_id": "STS-XXXXXXXX",
  "secret_key": "STS-Key-XXXXXXXX"
}`}
        />
      </section>

      {/* STSPay Gateway */}
      <section id="pay-create" className="space-y-8 scroll-mt-32">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Zap className="w-6 h-6 text-[#00AED6]" />
            STSPay: Create Payment
          </h2>
          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-500 text-white border-none uppercase font-bold">POST</Badge>
            <code className="text-sm font-bold text-primary">/api/payments/create</code>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Gunakan endpoint ini untuk membuat link pembayaran baru. Anda akan mendapatkan <code className="text-primary font-bold">checkout_url</code> yang mengarah ke halaman pembayaran modern STSPay.
          </p>
        </div>

        <CodeBlock 
          title="Request Payload"
          type="pay-create-req"
          code={`curl -X POST https://stspoint.com/api/payments/create \\
  -H "Content-Type: application/json" \\
  -d '{
    "merchant_id": "STS-XXXX",
    "secret_key": "STS-XXXX",
    "amount": 50000,
    "payer_email": "customer@email.com",
    "description": "Pembayaran Item Digital"
  }'`}
        />
      </section>

      {/* Orderkuota */}
      <section id="orkut-create" className="space-y-8 scroll-mt-32">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Code2 className="w-6 h-6 text-primary" />
            Orkut: QRIS Dynamic
          </h2>
          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-500 text-white border-none uppercase font-bold">POST</Badge>
            <code className="text-sm font-bold text-primary">/api/orkut/create</code>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Endpoint ini memungkinkan Anda menghasilkan payload QRIS dinamis menggunakan saldo Orderkuota Anda sendiri. Setiap request akan memotong 1 unit kuota API Anda.
          </p>
        </div>

        <CodeBlock 
          title="Request Body"
          type="orkut-create-req"
          code={`{
  "secret_key": "STS-Key-XXXX",
  "amount": 25000,
  "description": "Top Up Game #912"
}`}
        />

        <CodeBlock 
          title="Success Response"
          type="orkut-create-res"
          code={`{
  "success": true,
  "data": {
    "external_id": "OKT-1730-XXXX",
    "qr_string": "0002010102122666...",
    "amount": 25312,
    "status": "PENDING"
  }
}`}
        />
      </section>

      {/* AI */}
      <section id="ai-chat" className="space-y-8 scroll-mt-32">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Braces className="w-6 h-6 text-amber-500" />
            AI: Intelligent Chat
          </h2>
          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-500 text-white border-none uppercase font-bold">POST</Badge>
            <code className="text-sm font-bold text-primary">/api/ai/chat</code>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Akses model AI tingkat tinggi (STS Core/Prime) melalui API REST. Mendukung pemahaman konteks dan instruksi sistem kustom.
          </p>
        </div>

        <CodeBlock 
          title="AI Request"
          type="ai-chat-req"
          code={`{
  "secret_key": "STS-Key-XXXX",
  "model": "sts-prime",
  "messages": [
    { "role": "system", "content": "You are a senior dev helper." },
    { "role": "user", "content": "How to handle HMAC in PHP?" }
  ]
}`}
        />
      </section>

      {/* Webhooks */}
      <section id="webhooks" className="space-y-8 scroll-mt-32">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Webhook className="w-6 h-6 text-primary" />
            Webhooks
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            STSPoint mengirimkan notifikasi ke URL server Anda untuk setiap perubahan status transaksi. Gunakan <code className="text-primary font-bold">X-STS-Signature</code> pada header request untuk memvalidasi bahwa webhook dikirim secara resmi oleh sistem kami.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
           <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
           <div className="space-y-1">
             <p className="text-sm font-bold text-amber-900">Validasi Webhook</p>
             <p className="text-xs text-amber-800 leading-relaxed">
               Signature dihitung menggunakan <code className="font-bold">HMAC-SHA256</code> dengan <code className="font-bold">webhook_secret</code> atau <code className="font-bold">secret_key</code> Anda sebagai kunci rahasia.
             </p>
           </div>
        </div>
      </section>

      <div className="pt-20 text-center border-t border-border">
         <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.5em] opacity-30">Documentation Engine v1.5.0-stable</p>
      </div>
    </div>
  );
}
