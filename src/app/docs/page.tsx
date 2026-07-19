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
  Rocket,
  Lock,
  Key,
  X,
  Activity,
  Fingerprint,
  RefreshCcw,
  ExternalLink,
  CreditCard,
  Mail,
  FileText,
  Plus,
  CheckCircle2
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

  const CodeBlock = ({ title, code, type }: { title: string, code: string, type: string }) => {
    const highlight = (str: string) => {
      if (type.includes('json')) {
        return str
          .replace(/"([^"]+)":/g, '<span class="text-amber-400">"$1"</span>:')
          .replace(/: "([^"]+)"/g, ': <span class="text-emerald-400">"$1"</span>')
          .replace(/: (\d+)/g, ': <span class="text-blue-400">$1</span>')
          .replace(/: (true|false)/g, ': <span class="text-blue-400">$1</span>');
      }
      if (type.includes('curl') || type.includes('shell')) {
        return str
          .replace(/^(curl)/g, '<span class="text-emerald-400 font-bold">$1</span>')
          .replace(/(-X POST|-X GET|-H |-d)/g, '<span class="text-blue-400">$1</span>');
      }
      return str;
    };

    return (
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
            <pre dangerouslySetInnerHTML={{ __html: highlight(code) }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="docs-content" className="space-y-12 animate-in fade-in duration-700">
      {/* --- GET STARTED --- */}
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
              The STSPoint Infrastructure API provides a unified interface to programmatically manage global payments, digital product fulfillment, and automation bridges. This documentation covers authentication, standardized responses, and core integration logic.
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
                https://api.stspoint.id
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
                STSPoint uses key-based authentication. You can find your unique credentials in the <span className="font-bold text-foreground">Developer &gt; API Keys</span> section of your Console.
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
                Auth Example (Shell):
              </p>
              <CodeBlock 
                title="cURL Authentication"
                type="curl"
                code={`curl -X POST https://api.stspoint.id/api/payments/create \\
  -H "Content-Type: application/json" \\
  -d '{
    "secret_key": "STS-Key-XXXXXXXX",
    "merchant_id": "STS-XXXXXXXX",
    "amount": 50000
  }'`}
              />
            </div>
          </section>

          <section id="responses" className="space-y-8 scroll-mt-24 pt-4 border-t border-border">
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
                <CodeBlock 
                  title="Success Wrapper"
                  type="json"
                  code={`{
  "success": true,
  "data": {
    "external_id": "PAY-12345",
    "status": "PENDING",
    "amount": 50000
  }
}`}
                />
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-600 flex items-center gap-2">
                  <X className="w-3 h-3" /> Error (HTTP 4xx/500)
                </p>
                <CodeBlock 
                  title="Error Wrapper"
                  type="json"
                  code={`{
  "success": false,
  "message": "Invalid secret_key",
  "error_code": "AUTH_FAILED"
}`}
                />
              </div>
            </div>
          </section>
        </div>
      )}

      {/* --- STSPAY --- */}
      {activeType === 'stspay' && (
        <div className="space-y-16 animate-in slide-in-from-bottom-2">
          <section className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary">
              <Zap className="w-3 h-3" />
              Core Payments
            </div>
            <h1 className="text-4xl font-headline font-bold tracking-tight">STSPay</h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              STSPay is the core payment engine of the STSPoint platform. It allows you to programmatically generate secure, modern checkout pages and verify transaction statuses in real-time.
            </p>
          </section>

          <section id="create-payment" className="space-y-8 scroll-mt-24 pt-4 border-t border-border">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Plus className="w-6 h-6 text-primary" />
                Create Payment Link
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Generate a unique transaction and receive a <code className="font-bold text-foreground">checkout_url</code> where your customer can select their preferred payment method (QRIS, VA, E-Wallet).
              </p>
              <div className="flex items-center gap-3 px-4 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-border w-fit font-mono text-xs font-bold">
                <Badge className="bg-emerald-500 text-white border-none uppercase font-bold text-[9px] h-5">POST</Badge>
                <span className="text-primary">/api/payments/create</span>
              </div>
            </div>

            <div className="space-y-6">
               <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                 <Braces className="w-3.5 h-3.5" />
                 Request Parameters
               </h4>
               <div className="rounded-2xl border border-border overflow-hidden">
                  <table className="w-full text-left text-xs">
                     <thead className="bg-muted/50 border-b border-border">
                        <tr>
                           <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px]">Parameter</th>
                           <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px]">Type</th>
                           <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px]">Required</th>
                           <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px]">Description</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-border">
                        <tr>
                           <td className="px-6 py-4 font-mono font-bold text-amber-600">merchant_id</td>
                           <td className="px-6 py-4 text-muted-foreground">String</td>
                           <td className="px-6 py-4"><Badge variant="outline" className="text-[8px] h-4 border-primary/20 text-primary uppercase font-bold">YES</Badge></td>
                           <td className="px-6 py-4 text-muted-foreground leading-relaxed">Your unique STS Merchant Identifier.</td>
                        </tr>
                        <tr>
                           <td className="px-6 py-4 font-mono font-bold text-amber-600">secret_key</td>
                           <td className="px-6 py-4 text-muted-foreground">String</td>
                           <td className="px-6 py-4"><Badge variant="outline" className="text-[8px] h-4 border-primary/20 text-primary uppercase font-bold">YES</Badge></td>
                           <td className="px-6 py-4 text-muted-foreground leading-relaxed">Your private API Secret Key.</td>
                        </tr>
                        <tr>
                           <td className="px-6 py-4 font-mono font-bold text-amber-600">amount</td>
                           <td className="px-6 py-4 text-muted-foreground">Number</td>
                           <td className="px-6 py-4"><Badge variant="outline" className="text-[8px] h-4 border-primary/20 text-primary uppercase font-bold">YES</Badge></td>
                           <td className="px-6 py-4 text-muted-foreground leading-relaxed">Transaction total in IDR (min: 100).</td>
                        </tr>
                        <tr>
                           <td className="px-6 py-4 font-mono font-bold text-amber-600">payer_email</td>
                           <td className="px-6 py-4 text-muted-foreground">String</td>
                           <td className="px-6 py-4"><Badge variant="outline" className="text-[8px] h-4 border-primary/20 text-primary uppercase font-bold">YES</Badge></td>
                           <td className="px-6 py-4 text-muted-foreground leading-relaxed">Customer's email address for notifications.</td>
                        </tr>
                        <tr>
                           <td className="px-6 py-4 font-mono font-bold text-amber-600">description</td>
                           <td className="px-6 py-4 text-muted-foreground">String</td>
                           <td className="px-6 py-4"><Badge variant="outline" className="text-[8px] h-4 border-border text-muted-foreground/50 uppercase font-bold">NO</Badge></td>
                           <td className="px-6 py-4 text-muted-foreground leading-relaxed">Brief label for the customer's invoice.</td>
                        </tr>
                     </tbody>
                  </table>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <CodeBlock 
                  title="Example Request Payload"
                  type="json"
                  code={`{
  "merchant_id": "STS-ABC12345",
  "secret_key": "STS-Key-XXXXXX",
  "amount": 50000,
  "payer_email": "customer@email.com",
  "description": "Purchase of Digital Items"
}`}
               />
               <CodeBlock 
                  title="Example Success Response"
                  type="json"
                  code={`{
  "success": true,
  "data": {
    "external_id": "PAY-17304291-K9X",
    "checkout_url": "https://api.stspoint.id/checkout/PAY-17304291-K9X",
    "status": "PENDING",
    "amount": 50000,
    "currency": "IDR"
  }
}`}
               />
            </div>
          </section>

          <section id="check-status" className="space-y-8 scroll-mt-24 pt-4 border-t border-border">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <RefreshCcw className="w-6 h-6 text-primary" />
                Check Payment Status
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Poll the current state of a transaction using the <code className="font-bold text-foreground">external_id</code> returned during creation.
              </p>
              <div className="flex items-center gap-3 px-4 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-border w-fit font-mono text-xs font-bold">
                <Badge className="bg-emerald-500 text-white border-none uppercase font-bold text-[9px] h-5">POST</Badge>
                <span className="text-primary">/api/payments/status</span>
              </div>
            </div>

            <div className="space-y-4">
              <CodeBlock 
                title="Status Request Body"
                type="json"
                code={`{
  "merchant_id": "STS-ABC12345",
  "secret_key": "STS-Key-XXXXXX",
  "external_id": "PAY-17304291-K9X"
}`}
              />
              <CodeBlock 
                title="Status Success Response"
                type="json"
                code={`{
  "success": true,
  "data": {
    "external_id": "PAY-17304291-K9X",
    "status": "PAID",
    "amount": 50000,
    "payer_email": "customer@email.com",
    "description": "Purchase of Digital Items",
    "created_at": "2024-10-24T08:42:11Z",
    "updated_at": "2024-10-24T08:45:02Z"
  }
}`}
              />
            </div>

            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 flex items-start gap-4">
              <Activity className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-bold">Transaction States</p>
                <div className="flex flex-wrap gap-2">
                   <Badge variant="outline" className="bg-background text-[9px] uppercase font-bold">PENDING</Badge>
                   <Badge variant="outline" className="bg-background text-[9px] uppercase font-bold text-emerald-600">PAID</Badge>
                   <Badge variant="outline" className="bg-background text-[9px] uppercase font-bold text-rose-600">EXPIRED</Badge>
                   <Badge variant="outline" className="bg-background text-[9px] uppercase font-bold text-amber-600">FAILED</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-2">
                  We recommend implementing **Webhooks** instead of continuous polling for better efficiency and real-time reconciliation.
                </p>
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
                Purchase digital products like Airtime, Data, and Tokens with real-time status updates.
              </p>
              <div className="flex items-center gap-4">
                <Badge className="bg-emerald-500 text-white border-none uppercase font-bold text-[10px]">POST</Badge>
                <code className="text-sm font-bold text-primary">https://api.stspoint.id/api/ppob/order</code>
              </div>
            </div>
            <CodeBlock 
              title="PPOB Order Body"
              type="json"
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
                <Braces className="w-3 h-3" />
                Account Bridge
              </div>
              <h2 className="text-3xl font-bold">Orderkuota</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Manage automated QRIS generation and mutation checking for linked Orderkuota accounts.
              </p>
              <div className="flex items-center gap-4">
                <Badge className="bg-emerald-500 text-white border-none uppercase font-bold text-[10px]">POST</Badge>
                <code className="text-sm font-bold text-primary">https://api.stspoint.id/api/orkut/create</code>
              </div>
            </div>
            <CodeBlock 
              title="Dynamic QRIS Request"
              type="json"
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary">
                <Globe className="w-3 h-3" />
                GoBiz Bridge
              </div>
              <h2 className="text-3xl font-bold">GoMerchant</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Integrate GoPay payments directly through GoBiz bridge with automated nominal verification.
              </p>
              <div className="flex items-center gap-4">
                <Badge className="bg-emerald-500 text-white border-none uppercase font-bold text-[10px]">POST</Badge>
                <code className="text-sm font-bold text-primary">https://api.stspoint.id/api/gopay/create</code>
              </div>
            </div>
            <CodeBlock 
              title="GoPay Request"
              type="json"
              code={`{
  "secret_key": "STS-Key-XXXX",
  "amount": 10500,
  "description": "Order #442"
}`}
            />
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
                Webhooks allow your server to receive real-time POST notifications when specific events occur. This is currently supported for **STSPay** and **PPOB** services.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-bold text-amber-900">Security Signature</p>
                <p className="text-xs text-amber-800/80 leading-relaxed">
                  Every webhook includes an <code className="font-bold">X-STS-Signature</code> header. This is an <span className="font-bold">HMAC-SHA256</span> hash of the raw body using your Secret Key.
                </p>
              </div>
            </div>

            <CodeBlock 
              title="Webhook Payload Example"
              type="json"
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

      {/* --- ERRORS --- */}
      {activeType === 'errors' && (
        <div className="space-y-16 animate-in slide-in-from-bottom-2">
          <section className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <X className="w-8 h-8 text-rose-500" />
                Error Codes
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Reference list for common error codes returned by the API.
              </p>
            </div>
            
            <div className="rounded-2xl border border-border overflow-hidden bg-card">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">HTTP</th>
                    <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Message</th>
                    <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-6 py-4 font-mono font-bold text-amber-600">401</td>
                    <td className="px-6 py-4 font-medium">Invalid secret_key</td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">Authentication key is missing or incorrect.</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-mono font-bold text-amber-600">403</td>
                    <td className="px-6 py-4 font-medium">Service not initialized</td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">The service is not configured for your account.</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-mono font-bold text-amber-600">429</td>
                    <td className="px-6 py-4 font-medium">Rate limit exceeded</td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">Too many requests in a short period.</td>
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
