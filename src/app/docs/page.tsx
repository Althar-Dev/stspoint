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
  Layers
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
              API Onboarding
            </div>
            <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight">
              Get <span className="text-primary/40">Started.</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              Welcome to the STSPoint Infrastructure. Our REST API allows you to programmatically manage payments, digital products (PPOB), and cloud automation bridges. 
              This guide will help you authenticate your requests and set up real-time notifications.
            </p>
          </section>

          <section id="base-url" className="space-y-6 scroll-mt-24">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Globe className="w-6 h-6 text-primary" />
                Base URL
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                All API requests must be made over <span className="font-bold text-foreground">HTTPS</span>. 
                Data is sent and received in <span className="font-bold text-foreground">JSON</span> format.
              </p>
              <div className="flex items-center gap-2 px-4 h-12 rounded-xl bg-muted/50 border border-border w-fit font-mono text-xs font-bold text-primary">
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
                STSPoint uses key-based authentication. You can find your unique credentials in the <span className="font-bold text-foreground">Developer > API Keys</span> section of your Console.
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
                        <p className="text-xs text-muted-foreground leading-relaxed">Your private signature used to authorize every request. Never expose this in client-side code.</p>
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
                        <p className="text-xs text-muted-foreground leading-relaxed">Identifies your business account within our system for transactions and ledger tracking.</p>
                     </div>
                  </CardContent>
               </Card>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-bold text-foreground flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Auth Payload Example:
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

          <section id="webhooks" className="space-y-8 scroll-mt-24 pt-4 border-t border-border">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Webhook className="w-6 h-6 text-primary" />
                Webhooks (Callbacks)
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Webhooks allow your application to receive real-time updates when a transaction status changes (e.g., from <Badge variant="outline" className="h-4 py-0 text-[9px]">PENDING</Badge> to <Badge variant="outline" className="h-4 py-0 text-[9px] bg-emerald-500/10 text-emerald-600 border-none">PAID</Badge>).
              </p>
            </div>

            <div className="space-y-6">
               <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
                <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-bold text-amber-900">Security Verification</p>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    To ensure the webhook is authentic, we include an <code className="font-bold">X-STS-Signature</code> header. This is an 
                    <span className="font-bold"> HMAC-SHA256</span> hash of the request body using your <code className="font-bold">Webhook Secret</code> as the key.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Standard Webhook Header:</p>
                <div className="p-4 rounded-xl bg-muted border border-border font-mono text-[11px] text-primary">
                  X-STS-Signature: 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd6...
                </div>
              </div>
            </div>
          </section>

          <section id="errors" className="space-y-8 scroll-mt-24 pt-4 border-t border-border">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <X className="w-6 h-6 text-primary" />
                Response States
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Our API uses standard HTTP response codes and a consistent JSON wrapper.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Success Template</p>
                <div className="p-4 rounded-xl bg-[#0D0D0D] text-zinc-400 font-mono text-[11px]">
                  <p>{"{"}</p>
                  <p className="pl-4">"success": <span className="text-blue-400">true</span>,</p>
                  <p className="pl-4">"data": {"{ ... }"}</p>
                  <p>{"}"}</p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-600">Error Template</p>
                <div className="p-4 rounded-xl bg-[#0D0D0D] text-zinc-400 font-mono text-[11px]">
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
                Automated payment links with a modern checkout UI supporting QRIS, VA, and E-Wallets. Perfect for manual billing or custom store integrations.
              </p>
              <div className="flex items-center gap-4 mt-6">
                <Badge className="bg-emerald-500 text-white border-none uppercase font-bold text-[10px]">POST</Badge>
                <code className="text-sm font-bold text-primary">/api/payments/create</code>
              </div>
            </div>
            <CodeBlock 
              title="Payment Link Request"
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

          <section className="space-y-8 pt-4 border-t border-border">
             <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#00AED6]" />
                  Status Polling
                </h3>
                <p className="text-sm text-muted-foreground">Check the status of any STSPay transaction if you prefer polling over webhooks.</p>
                <div className="flex items-center gap-4">
                  <Badge className="bg-emerald-500 text-white border-none uppercase font-bold text-[10px]">POST</Badge>
                  <code className="text-sm font-bold text-primary">/api/payments/status</code>
                </div>
             </div>
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
                Connect your system to thousands of digital products including Airtime (Pulsa), Data Packages, and Electricity Tokens.
              </p>
              <div className="flex items-center gap-4">
                <Badge className="bg-emerald-500 text-white border-none uppercase font-bold text-[10px]">POST</Badge>
                <code className="text-sm font-bold text-primary">/api/ppob/order</code>
              </div>
            </div>
            <CodeBlock 
              title="Order Transaction Body"
              type="ppob-create-req"
              code={`{
  "secret_key": "STS-Key-XXXX",
  "sku": "TSEL10",
  "target": "081234567890",
  "ref_id": "ORDER-UNIQUE-ID"
}`}
            />
          </section>

          <section className="space-y-8 pt-4 border-t border-border">
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <RefreshCcw className="w-5 h-5 text-blue-500" />
                Order Verification
              </h3>
              <div className="flex items-center gap-4">
                <Badge className="bg-blue-500 text-white border-none uppercase font-bold text-[10px]">GET</Badge>
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary">
                <Code2 className="w-3 h-3" />
                Balance Bridge
              </div>
              <h2 className="text-3xl font-bold">Orderkuota</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Bridge your Orderkuota balance to generate dynamic QRIS payloads with automated mutation matching.
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
  "description": "Payment for Invoice #99"
}`}
            />
          </section>
          
          <section className="space-y-8 pt-4 border-t border-border">
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <RefreshCcw className="w-5 h-5 text-primary" />
                Mutation Reconciliation
              </h3>
              <div className="flex items-center gap-4">
                <Badge className="bg-emerald-500 text-white border-none uppercase font-bold text-[10px]">POST</Badge>
                <code className="text-sm font-bold text-primary">/api/orkut/status</code>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Matches the transaction amount against your Orderkuota "IN" mutation logs to automatically confirm payments.
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00AED6]/5 border border-[#00AED6]/10 text-[10px] font-bold uppercase tracking-widest text-[#00AED6]">
                <Globe className="w-3 h-3" />
                GoBiz Bridge
              </div>
              <h2 className="text-3xl font-bold">GoMerchant</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Enable automated GoPay payments by bridging your GoBiz account with unique nominal verification.
              </p>
              <div className="flex items-center gap-4">
                <Badge className="bg-emerald-500 text-white border-none uppercase font-bold text-[10px]">POST</Badge>
                <code className="text-sm font-bold text-primary">/api/gopay/create</code>
              </div>
            </div>
            <CodeBlock 
              title="GoPay Bridge Request"
              type="gopay-create-req"
              code={`{
  "secret_key": "STS-Key-XXXX",
  "amount": 10500,
  "description": "Store Order #442"
}`}
            />
          </section>

          <section className="space-y-8 pt-4 border-t border-border">
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#00AED6]" />
                Live Recon
              </h3>
              <div className="flex items-center gap-4">
                <Badge className="bg-emerald-500 text-white border-none uppercase font-bold text-[10px]">POST</Badge>
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
