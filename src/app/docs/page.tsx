"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "next/navigation";
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
  Server,
  RefreshCcw,
  BookOpen,
  Rocket,
  Lock,
  Key
} from "lucide-react";
import React, { useState, Suspense } from "react";
import { toast } from "@/hooks/use-toast";

function DocsContent() {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const activeType = searchParams.get("v") || "general";

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
      {/* --- GET STARTED --- */}
      {activeType === 'general' && (
        <div className="space-y-16 animate-in slide-in-from-bottom-2">
          <section id="intro" className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary">
              <Rocket className="w-3 h-3" />
              Developer Onboarding
            </div>
            <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">
              Get <span className="text-primary/40">Started.</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Selamat datang di dokumentasi teknis STSPoint. Platform kami dirancang untuk memudahkan integrasi layanan infrastruktur digital ke dalam aplikasi Anda dengan performa tinggi dan keamanan enterprise.
            </p>
          </section>

          <section id="auth" className="space-y-8 scroll-mt-24 pt-4">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-primary" />
                Authentication
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Keamanan adalah prioritas utama kami. Setiap permintaan API harus menyertakan kredensial merchant yang valid untuk memverifikasi hak akses Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card className="border-border shadow-none bg-muted/20">
                  <CardContent className="p-6 space-y-4">
                     <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                        <Lock className="w-5 h-5" />
                     </div>
                     <div className="space-y-1">
                        <h4 className="font-bold text-sm">Secret Key</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">Gunakan untuk autentikasi request di body JSON atau header. Jangan bagikan key ini ke pihak lain.</p>
                     </div>
                  </CardContent>
               </Card>
               <Card className="border-border shadow-none bg-muted/20">
                  <CardContent className="p-6 space-y-4">
                     <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                        <Key className="w-5 h-5" />
                     </div>
                     <div className="space-y-1">
                        <h4 className="font-bold text-sm">Merchant ID</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">ID unik akun Anda untuk referensi data pada integrasi tertentu (seperti STSPay).</p>
                     </div>
                  </CardContent>
               </Card>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-bold text-foreground">Contoh Payload Autentikasi:</p>
              <CodeBlock 
                title="API Authentication Body"
                type="auth-json"
                code={`{
  "secret_key": "STS-Key-XXXXXXXX",
  "merchant_id": "STS-XXXXXXXX"
}`}
              />
            </div>
          </section>

          <section id="webhooks" className="space-y-8 scroll-mt-24 pt-4 border-t border-border">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Webhook className="w-6 h-6 text-primary" />
                Webhooks
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Terima notifikasi status transaksi secara real-time melalui Webhook POST. Pastikan server Anda siap menerima payload JSON dan merespon dengan HTTP 200.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-amber-900">Keamanan Webhook</p>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Kami merekomendasikan validasi payload menggunakan signature pada header <code className="font-bold">X-STS-Signature</code> menggunakan HMAC-SHA256 untuk memastikan data berasal dari STSPoint.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* --- STSPAY DOCS --- */}
      {activeType === 'stspay' && (
        <div className="space-y-16 animate-in slide-in-from-bottom-2">
          <section className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <Zap className="w-8 h-8 text-[#00AED6]" />
                STSPay Gateway
              </h2>
              <p className="text-muted-foreground text-sm">Integrasi link pembayaran otomatis dengan UI checkout modern yang mendukung QRIS, VA, dan E-Wallet.</p>
              <div className="flex items-center gap-4 mt-4">
                <Badge className="bg-emerald-500 text-white border-none uppercase font-bold">POST</Badge>
                <code className="text-sm font-bold text-primary">/api/payments/create</code>
              </div>
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
          </section>
        </div>
      )}

      {/* --- PPOB --- */}
      {activeType === 'ppob' && (
        <div className="space-y-16 animate-in slide-in-from-bottom-2">
          <section className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <Smartphone className="w-8 h-8 text-blue-500" />
                PPOB
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Lakukan pengisian Pulsa, Paket Data, atau Token Listrik secara otomatis melalui satu koneksi API terpadu.
              </p>
              <div className="flex items-center gap-4">
                <Badge className="bg-emerald-500 text-white border-none uppercase font-bold">POST</Badge>
                <code className="text-sm font-bold text-primary">/api/ppob/order</code>
              </div>
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
          </section>

          <section className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Server className="w-6 h-6 text-blue-500" />
                Check Order Status
              </h2>
              <div className="flex items-center gap-4">
                <Badge className="bg-blue-500 text-white border-none uppercase font-bold">GET</Badge>
                <code className="text-sm font-bold text-primary">/api/ppob/status?secret_key=...&ref_id=...</code>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* --- ORDERKUOTA --- */}
      {activeType === 'orderkuota' && (
        <div className="space-y-16 animate-in slide-in-from-bottom-2">
          <section className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <Code2 className="w-8 h-8 text-primary" />
                Orderkuota
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Gunakan saldo Orderkuota Anda untuk menghasilkan QRIS dinamis di website Anda sendiri dengan sistem mutasi otomatis.
              </p>
              <div className="flex items-center gap-4">
                <Badge className="bg-emerald-500 text-white border-none uppercase font-bold">POST</Badge>
                <code className="text-sm font-bold text-primary">/api/orkut/create</code>
              </div>
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
          </section>
          
          <section className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <RefreshCcw className="w-6 h-6 text-primary" />
                Orderkuota: Mutation Sync
              </h2>
              <div className="flex items-center gap-4">
                <Badge className="bg-emerald-500 text-white border-none uppercase font-bold">POST</Badge>
                <code className="text-sm font-bold text-primary">/api/orkut/status</code>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Verifikasi pembayaran otomatis dengan mengecek mutasi masuk (IN) di akun Orderkuota sesuai nominal unik.
              </p>
            </div>
          </section>
        </div>
      )}

      {/* --- GOMERCHANT --- */}
      {activeType === 'gopay' && (
        <div className="space-y-16 animate-in slide-in-from-bottom-2">
          <section className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <Globe className="w-8 h-8 text-[#00AED6]" />
                GoMerchant
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Bridge API untuk menerima pembayaran GoPay otomatis menggunakan akun GoBiz dengan integrasi nominal unik.
              </p>
              <div className="flex items-center gap-4">
                <Badge className="bg-emerald-500 text-white border-none uppercase font-bold">POST</Badge>
                <code className="text-sm font-bold text-primary">/api/gopay/create</code>
              </div>
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
          </section>

          <section className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <RefreshCcw className="w-6 h-6 text-[#00AED6]" />
                GoMerchant: Mutation Recon
              </h2>
              <div className="flex items-center gap-4">
                <Badge className="bg-emerald-500 text-white border-none uppercase font-bold">POST</Badge>
                <code className="text-sm font-bold text-primary">/api/gopay/status</code>
              </div>
            </div>
          </section>
        </div>
      )}

      <div className="pt-20 text-center border-t border-border">
         <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.5em] opacity-30">Documentation Engine v2.1.0-stable</p>
      </div>
    </div>
  );
}

export default function DocsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center italic text-muted-foreground">Loading documentation...</div>}>
      <DocsContent />
    </Suspense>
  );
}
