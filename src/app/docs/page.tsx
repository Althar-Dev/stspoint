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
  Key,
  X,
  Activity,
  Cpu,
  Layers,
  Fingerprint
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
      {/* --- GET STARTED (GENERAL) --- */}
      {activeType === 'general' && (
        <div className="space-y-16 animate-in slide-in-from-bottom-2">
          <section id="intro" className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary">
              <Rocket className="w-3 h-3" />
              Infrastructure API v1.2
            </div>
            <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">
              Get <span className="text-primary/40">Started.</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              The STSPoint Infrastructure API provides a unified interface to programmatically manage global payments, digital product fulfillment (PPOB), and automation bridges. This documentation covers authentication, standardized responses, and core integration logic.
            </p>
          </section>

          <section id="base-url" className="space-y-6 scroll-mt-24 pt-4 border-t border-border">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Globe className="w-6 h-6 text-primary" />
                Base URL
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                All requests are served over <span className="font-bold text-foreground">HTTPS</span> to ensure data integrity and security. The API expects and returns data in <span className="font-bold text-foreground">JSON</span> format.
              </p>
              <div className="flex items-center gap-3 px-5 h-14 rounded-2xl bg-muted/50 border border-border w-fit font-mono text-xs font-bold text-primary shadow-sm">
                <Server className="w-4 h-4 opacity-30" />
                https://stspoint.id
              </div>
            </div>
          </section>

          <section id="auth" className="space-y-8 scroll-mt-24 pt-4 border-t border-border">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-primary" />
                Authentication
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                STSPoint uses key-based authentication. You can find your unique credentials in the <span className="font-bold text-foreground">Console &gt; Developer &gt; API Keys</span> section.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card className="border-border shadow-none bg-muted/20 rounded-2xl overflow-hidden group hover:border-primary/20 transition-all">
                  <CardContent className="p-6 space-y-4">
                     <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                        <Lock className="w-5 h-5" />
                     </div>
                     <div className="space-y-1">
                        <h4 className="font-bold text-sm">Secret Key</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">Your high-security signature used to authorize server-to-server requests. Never expose this key in client-side code.</p>
                     </div>
                  </CardContent>
               </Card>
               <Card className="border-border shadow-none bg-muted/20 rounded-2xl overflow-hidden group hover:border-primary/20 transition-all">
                  <CardContent className="p-6 space-y-4">
                     <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                        <Fingerprint className="w-5 h-5" />
                     </div>
                     <div className="space-y-1">
                        <h4 className="font-bold text-sm">Merchant ID</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">The unique identifier for your business account. Used for context isolation and ledger tracking.</p>
                     </div>
                  </CardContent>
               </Card>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5" />
                Authentication Payload:
              </p>
              <CodeBlock 
                title="JSON Body Authentication"
                type="auth-json"
                code={`{
  "secret_key": "STS-Key-XXXXXXXX",
  "merchant_id": "STS-XXXXXXXX"
}`}
              />
            </div>
          </section>

          <section id="errors" className="space-y-8 scroll-mt-24 pt-4 border-t border-border">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Activity className="w-6 h-6 text-primary" />
                Response Standards
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                The API utilizes standard HTTP status codes and a consistent JSON wrapper to simplify client-side integration and error handling.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                  <Check className="w-3 h-3" /> Success (HTTP 200)
                </p>
                <div className="p-5 rounded-2xl bg-[#0D0D0D] text-zinc-400 font-mono text-[11px] shadow-xl">
                  <p>{"{"}</p>
                  <p className="pl-4">"success": <span className="text-blue-400">true</span>,</p>
                  <p className="pl-4">"data": {"{ ... }"}</p>
                  <p>{"}"}</p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-600 flex items-center gap-2">
                  <X className="w-3 h-3" /> Error (HTTP 4xx/500)
                </p>
                <div className="p-5 rounded-2xl bg-[#0D0D0D] text-zinc-400 font-mono text-[11px] shadow-xl">
                  <p>{"{"}</p>
                  <p className="pl-4">"success": <span className="text-rose-400">false</span>,</p>
                  <p className="pl-4">"message": <span className="text-amber-400">"Invalid secret_key"</span></p>
                  <p>{"}"}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* --- WEBHOOKS --- */}
      {activeType === 'webhooks' && (
        <div className="space-y-16 animate-in slide-in-from-bottom-2">
           <section className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary">
                <Webhook className="w-3 h-3" />
                Real-time Notifications
              </div>
              <h2 className="text-3xl font-bold">Webhooks</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Webhooks allow your server to receive real-time POST notifications when specific events occur. This eliminates the need for constant polling.
              </p>
              <div className="flex gap-2">
                 <Badge variant="outline" className="text-[10px] uppercase font-bold h-5 px-1.5 border-blue-200 text-blue-600 bg-blue-50">STSPay</Badge>
                 <Badge variant="outline" className="text-[10px] uppercase font-bold h-5 px-1.5 border-blue-200 text-blue-600 bg-blue-50">PPOB</Badge>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-bold text-amber-900">Security & Signature Verification</p>
                <p className="text-xs text-amber-800/80 leading-relaxed">
                  Every webhook includes an <code className="font-bold">X-STS-Signature</code> header. This is an <span className="font-bold">HMAC-SHA256</span> hash of the raw request body. Use your <span className="font-bold">Webhook Secret</span> to verify it.
                </p>
              </div>
            </div>

            <CodeBlock 
              title="Webhook Payload Example"
              type="webhook-ex"
              code={`{
  "event": "payment.success",
  "data": {
    "external_id": "PAY-12345",
    "status": "PAID",
    "amount": 50000,
    "timestamp": "2024-10-24T08:42:11Z"
  }
}`}
            />
          </section>
        </div>
      )}

      {/* --- STSPAY --- */}
      {activeType === 'stspay' && (
        <div className="space-y-16 animate-in slide-in-from-bottom-2">
          <section className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00AED6]/5 border border-[#00AED6]/10 text-[10px] font-bold uppercase tracking-widest text-[#00AED6]">
                <Zap className="w-3 h-3" />
                Payment Gateway
              </div>
              <h2 className="text-3xl font-bold">STSPay</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Automated payment links with a modern checkout UI supporting QRIS, VA, and E-Wallets.
              </p>
              <div className="flex items-center gap-4 mt-6">
                <Badge className="bg-emerald-500 text-white border-none uppercase font-bold text-[10px]">POST</Badge>
                <code className="text-sm font-bold text-primary">/api/payments/create</code>
              </div>
            </div>
            <CodeBlock 
              title="Create Payment Request"
              type="pay-create-req"
              code={`{
  "merchant_id": "STS-XXXX",
  "secret_key": "STS-XXXX",
  "amount": 50000,
  "payer_email": "customer@email.com",
  "description": "Product Purchase"
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/10 text-[10px] font-bold uppercase tracking-widest text-blue-500">
                <Smartphone className="w-3 h-3" />
                Digital Products
              </div>
              <h2 className="text-3xl font-bold">PPOB</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Purchase digital products like Airtime, Data, and Tokens.
              </p>
              <div className="flex items-center gap-4">
                <Badge className="bg-emerald-500 text-white border-none uppercase font-bold text-[10px]">POST</Badge>
                <code className="text-sm font-bold text-primary">/api/ppob/order</code>
              </div>
            </div>
            <CodeBlock 
              title="PPOB Order Body"
              type="ppob-create-req"
              code={`{
  "secret_key": "STS-Key-XXXX",
  "sku": "TSEL10",
  "target": "081234567890",
  "ref_id": "ORDER-ID-001"
}`}
            />
          </section>
        </div>
      )}

      {/* --- ORDERKUOTA --- */}
      {activeType === 'orderkuota' && (
        <div className="space-y-16 animate-in slide-in-from-bottom-2">
          <section className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary">
                <Code2 className="w-3 h-3" />
                Account Bridge
              </div>
              <h2 className="text-3xl font-bold">Orderkuota</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Automated QRIS and mutation checking for Orderkuota users.
              </p>
              <div className="flex items-center gap-4">
                <Badge className="bg-emerald-500 text-white border-none uppercase font-bold text-[10px]">POST</Badge>
                <code className="text-sm font-bold text-primary">/api/orkut/create</code>
              </div>
            </div>
            <CodeBlock 
              title="Dynamic QRIS Request"
              type="orkut-create-req"
              code={`{
  "secret_key": "STS-Key-XXXX",
  "amount": 25000,
  "description": "Invoice #123"
}`}
            />
          </section>
        </div>
      )}

      {/* --- GOMERCHANT --- */}
      {activeType === 'gopay' && (
        <div className="space-y-16 animate-in slide-in-from-bottom-2">
          <section className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00AED6]/5 border border-[#00AED6]/10 text-[10px] font-bold uppercase tracking-widest text-[#00AED6]">
                <Globe className="w-3 h-3" />
                GoBiz Bridge
              </div>
              <h2 className="text-3xl font-bold">GoMerchant</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Bridge GoPay payments with unique nominal verification.
              </p>
              <div className="flex items-center gap-4">
                <Badge className="bg-emerald-500 text-white border-none uppercase font-bold text-[10px]">POST</Badge>
                <code className="text-sm font-bold text-primary">/api/gopay/create</code>
              </div>
            </div>
            <CodeBlock 
              title="GoPay Request"
              type="gopay-create-req"
              code={`{
  "secret_key": "STS-Key-XXXX",
  "amount": 10500,
  "description": "Order #442"
}`}
            />
          </section>
        </div>
      )}

      {/* --- ERRORS --- */}
      {activeType === 'errors' && (
        <div className="space-y-16 animate-in slide-in-from-bottom-2">
          <section className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <X className="w-8 h-8 text-rose-500" />
                Error Reference
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                List of common error codes returned by the STSPoint API.
              </p>
            </div>
            
            <div className="rounded-2xl border border-border overflow-hidden bg-card">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">HTTP Code</th>
                    <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Message</th>
                    <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-6 py-4 font-mono font-bold text-amber-600">401</td>
                    <td className="px-6 py-4 font-medium">Invalid secret_key</td>
                    <td className="px-6 py-4 text-muted-foreground">The authentication key is missing or incorrect.</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-mono font-bold text-amber-600">403</td>
                    <td className="px-6 py-4 font-medium">Service not initialized</td>
                    <td className="px-6 py-4 text-muted-foreground">The requested service is not configured for your account.</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-mono font-bold text-amber-600">429</td>
                    <td className="px-6 py-4 font-medium">Rate limit exceeded</td>
                    <td className="px-6 py-4 text-muted-foreground">Too many requests in a short period. Slow down.</td>
                  </tr>
                </tbody>
              </table>
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
