
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Copy, 
  Terminal, 
  ShieldCheck, 
  Zap, 
  Info,
  Check,
  Code2,
  Webhook,
  Smartphone,
  Globe,
  Braces,
  ArrowRight,
  Server
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
    <div className="space-y-12 animate-in fade-in duration-700">
      <section className="space-y-6">
        <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight">
          API <span className="text-primary/40">Reference.</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Dokumentasi teknis untuk mengintegrasikan layanan STSPoint ke dalam sistem Anda.
        </p>
      </section>

      <Tabs defaultValue="general" className="w-full">
        <div className="sticky top-20 bg-background/80 backdrop-blur-md z-20 py-4 border-b border-border -mx-6 px-6 lg:-mx-12 lg:px-12">
          <TabsList className="bg-muted p-1 rounded-xl h-auto flex flex-wrap justify-start gap-1 overflow-x-auto no-scrollbar">
            <TabsTrigger value="general" className="rounded-lg px-4 py-2 font-bold text-[10px] uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:shadow-sm">General</TabsTrigger>
            <TabsTrigger value="stspay" className="rounded-lg px-4 py-2 font-bold text-[10px] uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:shadow-sm">STSPay</TabsTrigger>
            <TabsTrigger value="ppob" className="rounded-lg px-4 py-2 font-bold text-[10px] uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:shadow-sm">PPOB H2H</TabsTrigger>
            <TabsTrigger value="orderkuota" className="rounded-lg px-4 py-2 font-bold text-[10px] uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:shadow-sm">Orderkuota</TabsTrigger>
            <TabsTrigger value="gopay" className="rounded-lg px-4 py-2 font-bold text-[10px] uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:shadow-sm">GoMerchant</TabsTrigger>
          </TabsList>
        </div>

        {/* --- GENERAL DOCS --- */}
        <TabsContent value="general" className="pt-10 space-y-16 animate-in slide-in-from-bottom-2">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-primary" />
                Autentikasi
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Setiap permintaan API harus menyertakan <code className="text-primary font-bold">secret_key</code> di dalam body JSON.
              </p>
            </div>
            <CodeBlock 
              title="Authentication Header & Body"
              type="auth-json"
              code={`{
  "secret_key": "STS-Key-XXXXXXXX",
  "merchant_id": "STS-XXXXXXXX"
}`}
            />
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Webhook className="w-6 h-6 text-primary" />
                Webhooks
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Terima notifikasi status transaksi secara real-time melalui Webhook POST.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-amber-900">Keamanan Webhook</p>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Validasi payload menggunakan signature pada header <code className="font-bold">X-STS-Signature</code> menggunakan HMAC-SHA256.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* --- STSPAY DOCS --- */}
        <TabsContent value="stspay" className="pt-10 space-y-16 animate-in slide-in-from-bottom-2">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Zap className="w-6 h-6 text-[#00AED6]" />
                Create Payment Link
              </h2>
              <Badge className="bg-emerald-500 text-white border-none uppercase font-bold">POST</Badge>
              <code className="text-sm font-bold text-primary">/api/payments/create</code>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Hasilkan link pembayaran otomatis dengan UI checkout modern STSPay.
              </p>
            </div>
            <CodeBlock 
              title="Request Example"
              type="pay-create-req"
              code={`{
  "merchant_id": "STS-XXXX",
  "secret_key": "STS-XXXX",
  "amount": 50000,
  "payer_email": "customer@email.com",
  "description": "Top Up Game #123"
}`}
            />
          </div>
        </TabsContent>

        {/* --- PPOB H2H DOCS --- */}
        <TabsContent value="ppob" className="pt-10 space-y-16 animate-in slide-in-from-bottom-2">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Smartphone className="w-6 h-6 text-blue-500" />
                PPOB: Order Transaction
              </h2>
              <Badge className="bg-emerald-500 text-white border-none uppercase font-bold">POST</Badge>
              <code className="text-sm font-bold text-primary">/api/ppob/order</code>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Lakukan pengisian Pulsa, Paket Data, atau Token Listrik melalui bridge H2H.
              </p>
            </div>
            <CodeBlock 
              title="Order Body"
              type="ppob-create-req"
              code={`{
  "secret_key": "STS-Key-XXXX",
  "sku": "TSEL10",
  "target": "081234567890",
  "ref_id": "ORDER-UNIQUE-ID"
}`}
            />
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Server className="w-6 h-6 text-blue-500" />
                PPOB: Check Status
              </h2>
              <Badge className="bg-blue-500 text-white border-none uppercase font-bold">GET</Badge>
              <code className="text-sm font-bold text-primary">/api/ppob/status?secret_key=...&ref_id=...</code>
            </div>
          </div>
        </TabsContent>

        {/* --- ORDERKUOTA DOCS --- */}
        <TabsContent value="orderkuota" className="pt-10 space-y-16 animate-in slide-in-from-bottom-2">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Code2 className="w-6 h-6 text-primary" />
                Orkut: Dynamic QRIS Bridge
              </h2>
              <Badge className="bg-emerald-500 text-white border-none uppercase font-bold">POST</Badge>
              <code className="text-sm font-bold text-primary">/api/orkut/create</code>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Gunakan saldo Orderkuota Anda untuk menghasilkan QRIS dinamis di website Anda sendiri.
              </p>
            </div>
            <CodeBlock 
              title="Request Body"
              type="orkut-create-req"
              code={`{
  "secret_key": "STS-Key-XXXX",
  "amount": 25000,
  "description": "Pembayaran Invoice #99"
}`}
            />
          </div>
          
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <RefreshCcw className="w-6 h-6 text-primary" />
                Orkut: Mutation Sync
              </h2>
              <Badge className="bg-emerald-500 text-white border-none uppercase font-bold">POST</Badge>
              <code className="text-sm font-bold text-primary">/api/orkut/status</code>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Verifikasi pembayaran otomatis dengan mengecek mutasi masuk (IN) di akun Orderkuota.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* --- GOMERCHANT DOCS --- */}
        <TabsContent value="gopay" className="pt-10 space-y-16 animate-in slide-in-from-bottom-2">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Globe className="w-6 h-6 text-[#00AED6]" />
                GoMerchant: GoPay Bridge
              </h2>
              <Badge className="bg-emerald-500 text-white border-none uppercase font-bold">POST</Badge>
              <code className="text-sm font-bold text-primary">/api/gopay/create</code>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Bridge API untuk menerima pembayaran GoPay otomatis menggunakan akun GoBiz Anda.
              </p>
            </div>
            <CodeBlock 
              title="Request Body"
              type="gopay-create-req"
              code={`{
  "secret_key": "STS-Key-XXXX",
  "amount": 10000,
  "description": "Payment for Service"
}`}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="pt-20 text-center border-t border-border">
         <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.5em] opacity-30">Documentation Engine v2.0.0-stable</p>
      </div>
    </div>
  );
}
