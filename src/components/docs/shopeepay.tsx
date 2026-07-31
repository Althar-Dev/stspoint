"use client";

import React from "react";
import { 
  ShoppingBag, 
  Plus, 
  Braces, 
  Code2, 
  RefreshCcw, 
  Activity, 
  ShieldCheck, 
  Info,
  Terminal,
  Layers,
  CheckCircle2
} from "lucide-react";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "./shared/code-block";

export function DocsShopeePay() {
  return (
    <div className="space-y-16 animate-in slide-in-from-bottom-2 w-full max-w-full overflow-hidden">
      {/* Intro Section */}
      <section className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EE4D2D]/5 border border-[#EE4D2D]/10 text-[10px] font-bold uppercase tracking-widest text-[#EE4D2D]">
          <ShoppingBag className="w-3 h-3" />
          ShopeePay Merchant Bridge
        </div>
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight text-foreground">ShopeePay API</h1>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl">
          Integrasi ShopeePay memungkinkan Anda untuk menghasilkan pembayaran QRIS dinamis secara instan dan melakukan rekonsiliasi otomatis dengan memantau mutasi saldo akun ShopeePay Merchant Anda secara real-time.
        </p>
      </section>

      {/* Create Transaction */}
      <section id="create-shopee" className="space-y-8 scroll-mt-24 pt-4 border-t border-border w-full">
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-foreground">
            <Plus className="w-6 h-6 text-[#EE4D2D]" />
            Create ShopeePay Payment
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Inisialisasi transaksi baru untuk mendapatkan payload QRIS dinamis. Sistem akan secara otomatis menambahkan kode unik jika dikonfigurasi di dashboard.
          </p>
          <div className="flex items-center gap-3 px-4 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-border w-fit font-mono text-xs font-bold">
            <UiBadge className="bg-emerald-500 text-white border-none uppercase font-bold text-[10px]">POST</UiBadge>
            <span className="text-primary">/api/shopee/create</span>
          </div>
        </div>

        <div className="space-y-6 w-full min-w-0">
           <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-1">
             <Braces className="w-3.5 h-3.5" />
             Request Body (JSON)
           </h4>
           <div className="rounded-2xl border border-border overflow-x-auto bg-card shadow-sm w-full block">
              <table className="w-full text-left text-xs border-collapse min-w-[600px]">
                 <thead className="bg-muted/50 border-b border-border">
                    <tr>
                       <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap">Parameter</th>
                       <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap">Type</th>
                       <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap">Status</th>
                       <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap">Description</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-border">
                    <tr>
                       <td className="px-6 py-4 font-mono font-bold text-[#EE4D2D] whitespace-nowrap">secret_key</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">String</td>
                       <td className="px-6 py-4 text-rose-500 font-bold whitespace-nowrap">Required</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">API Secret Key Anda.</td>
                    </tr>
                    <tr>
                       <td className="px-6 py-4 font-mono font-bold text-[#EE4D2D] whitespace-nowrap">amount</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Number</td>
                       <td className="px-6 py-4 text-rose-500 font-bold whitespace-nowrap">Required</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Nominal transaksi (Min. 100).</td>
                    </tr>
                    <tr>
                       <td className="px-6 py-4 font-mono font-bold text-[#EE4D2D] whitespace-nowrap">payer_email</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">String</td>
                       <td className="px-6 py-4 text-rose-500 font-bold whitespace-nowrap">Required</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Email pelanggan untuk identifikasi.</td>
                    </tr>
                 </tbody>
              </table>
           </div>
        </div>

        <div className="space-y-4 w-full min-w-0 overflow-hidden">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-1">
             <Code2 className="w-3.5 h-3.5" />
             Implementation Snippets
          </h4>
          <Tabs defaultValue="curl" className="w-full">
              <div className="w-full overflow-x-auto no-scrollbar mb-2 block">
                <TabsList className="bg-muted p-1 rounded-xl h-11 w-fit min-w-0 justify-start flex">
                  <TabsTrigger value="curl" className="rounded-lg px-4 text-xs font-bold uppercase">cURL</TabsTrigger>
                  <TabsTrigger value="node" className="rounded-lg px-4 text-xs font-bold uppercase">NodeJS</TabsTrigger>
                  <TabsTrigger value="python" className="rounded-lg px-4 text-xs font-bold uppercase">Python</TabsTrigger>
                  <TabsTrigger value="php" className="rounded-lg px-4 text-xs font-bold uppercase">PHP</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="curl" className="w-full outline-none">
                <CodeBlock 
                  title="Shell / cURL"
                  type="curl"
                  code={`curl -X POST https://api.stspoint.id/shopee/create \\
  -H "Content-Type: application/json" \\
  -d '{
    "secret_key": "STS-Key-XXXXXXXX",
    "amount": 10000,
    "payer_email": "customer@email.com",
    "description": "Topup Diamond"
  }'`}
                />
              </TabsContent>

              <TabsContent value="node" className="w-full outline-none">
                <CodeBlock 
                  title="Node.js (Fetch)"
                  type="node"
                  code={`const res = await fetch('https://api.stspoint.id/shopee/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    secret_key: 'STS-Key-XXXXXXXX',
    amount: 10000,
    payer_email: 'customer@email.com'
  })
});
const data = await res.json();`}
                />
              </TabsContent>

              <TabsContent value="python" className="w-full outline-none">
                <CodeBlock 
                  title="Python (Requests)"
                  type="python"
                  code={`import requests

payload = {
    "secret_key": "STS-Key-XXXXXXXX",
    "amount": 10000,
    "payer_email": "customer@email.com"
}
res = requests.post("https://api.stspoint.id/shopee/create", json=payload)
print(res.json())`}
                />
              </TabsContent>

              <TabsContent value="php" className="w-full outline-none">
                <CodeBlock 
                  title="PHP (CURL)"
                  type="php"
                  code={`<?php
$payload = [
    "secret_key" => "STS-Key-XXXXXXXX",
    "amount" => 10000,
    "payer_email" => "customer@email.com"
];

$ch = curl_init("https://api.stspoint.id/shopee/create");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$response = curl_exec($ch);
?>`}
                />
              </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-2 px-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Response Example (Success)
          </p>
          <CodeBlock 
            title="Create Response JSON"
            type="json"
            code={`{
  "success": true,
  "data": {
    "external_id": "SPP-1730-XXXX",
    "qr_string": "00020101021226660011ID.CO.SHOPEE.WWW...",
    "amount": 10170,
    "base_amount": 10000,
    "random_code": 170,
    "status": "PENDING"
  }
}`}
          />
        </div>
      </section>

      {/* Check Status */}
      <section id="check-status" className="space-y-8 scroll-mt-24 pt-4 border-t border-border w-full">
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-foreground">
            <RefreshCcw className="w-6 h-6 text-[#EE4D2D]" />
            Verify Payment Status
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Lakukan verifikasi status transaksi secara manual melalui rekonsiliasi mutasi live.
          </p>
          <div className="flex items-center gap-3 px-4 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-border w-fit font-mono text-xs font-bold">
            <UiBadge className="bg-emerald-500 text-white border-none uppercase font-bold text-[10px]">POST</UiBadge>
            <span className="text-primary">/api/shopee/status</span>
          </div>
        </div>

        <CodeBlock 
          title="Status Success JSON"
          type="json"
          code={`{
  "success": true,
  "data": {
    "external_id": "SPP-1730-XXXX",
    "status": "PAID",
    "amount": 10170,
    "paid_at": "2024-10-24 08:42:11",
    "remaining_quota": 4921
  }
}`}
        />
      </section>

      {/* Important Notes */}
      <section id="notes" className="space-y-6 scroll-mt-24 pt-4 border-t border-border w-full">
         <div className="p-6 rounded-2xl bg-[#EE4D2D]/5 border border-[#EE4D2D]/10 flex items-start gap-4">
            <Info className="w-5 h-5 text-[#EE4D2D] shrink-0 mt-0.5" />
            <div className="space-y-1">
               <p className="text-sm font-bold text-[#EE4D2D] uppercase tracking-tight">API Quota & Limits</p>
               <p className="text-xs text-muted-foreground leading-relaxed">
                  Permintaan ke endpoint <strong>create</strong> dan <strong>status</strong> akan memotong kuota API ShopeePay Anda. Pastikan sesi token ShopeePay Anda di Dashboard tetap aktif untuk kelancaran sinkronisasi.
               </p>
            </div>
         </div>
      </section>

      <div className="text-center pt-8 border-t border-border">
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.4em] opacity-30">STSPoint ShopeePay Bridge • v1.0.5</p>
      </div>
    </div>
  );
}
