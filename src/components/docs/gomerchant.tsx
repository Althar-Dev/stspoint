
"use client";

import React from "react";
import { 
  Globe, 
  Plus, 
  Braces, 
  Code2, 
  RefreshCcw, 
  Activity, 
  ShieldCheck, 
  Info,
  Terminal,
  Layers,
  CheckCircle2,
  Smartphone
} from "lucide-react";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "./shared/code-block";

export function DocsGoMerchant() {
  return (
    <div className="space-y-16 animate-in slide-in-from-bottom-2 w-full max-w-full overflow-hidden">
      {/* Intro Section */}
      <section className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/5 border border-cyan-500/10 text-[10px] font-bold uppercase tracking-widest text-cyan-600">
          <Globe className="w-3 h-3" />
          GoPay Merchant Bridge
        </div>
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight text-foreground">GoMerchant API</h1>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl">
          The GoMerchant API allows you to automate GoPay collections by bridging directly to your GoPay merchant account. It generates dynamic QRIS payloads and provides real-time transaction reconciliation through automated mutation scanning.
        </p>
      </section>

      {/* Create Transaction */}
      <section id="create-gopay" className="space-y-8 scroll-mt-24 pt-4 border-t border-border w-full">
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-foreground">
            <Plus className="w-6 h-6 text-cyan-500" />
            Create GoPay Payment
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Initialize a GoPay transaction. The system will generate a dynamic QRIS string that you can render as a QR code in your own application.
          </p>
          <div className="flex items-center gap-3 px-4 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-border w-fit font-mono text-xs font-bold">
            <UiBadge className="bg-emerald-500 text-white border-none uppercase font-bold text-[10px]">POST</UiBadge>
            <span className="text-primary">/gopay/create</span>
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
                       <td className="px-6 py-4 font-mono font-bold text-cyan-600 whitespace-nowrap">secret_key</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">String</td>
                       <td className="px-6 py-4 text-rose-500 font-bold whitespace-nowrap">Required</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Your API secret key for authentication.</td>
                    </tr>
                    <tr>
                       <td className="px-6 py-4 font-mono font-bold text-cyan-600 whitespace-nowrap">amount</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Number</td>
                       <td className="px-6 py-4 text-rose-500 font-bold whitespace-nowrap">Required</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Transaction amount. Minimal: 100.</td>
                    </tr>
                    <tr>
                       <td className="px-6 py-4 font-mono font-bold text-cyan-600 whitespace-nowrap">payer_email</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">String</td>
                       <td className="px-6 py-4 text-rose-500 font-bold whitespace-nowrap">Required</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Customer email for notification purposes.</td>
                    </tr>
                    <tr>
                       <td className="px-6 py-4 font-mono font-bold text-cyan-600 whitespace-nowrap">external_id</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">String</td>
                       <td className="px-6 py-4 text-muted-foreground/30 italic whitespace-nowrap">Optional</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Reference ID from your internal system.</td>
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
                  code={`curl -X POST https://api.stspoint.id/gopay/create \\
  -H "Content-Type: application/json" \\
  -d '{
    "secret_key": "STS-Key-XXXXXXXX",
    "amount": 50000,
    "payer_email": "customer@email.com",
    "description": "GoPay Order #101"
  }'`}
                />
              </TabsContent>

              <TabsContent value="node" className="w-full outline-none">
                <CodeBlock 
                  title="Node.js (Fetch API)"
                  type="node"
                  code={`const response = await fetch('https://api.stspoint.id/gopay/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    secret_key: 'STS-Key-XXXXXXXX',
    amount: 50000,
    payer_email: 'customer@email.com',
    description: 'GoPay Order #101'
  })
});

const result = await response.json();
console.log(result);`}
                />
              </TabsContent>

              <TabsContent value="python" className="w-full outline-none">
                <CodeBlock 
                  title="Python (Requests)"
                  type="python"
                  code={`import requests

url = "https://api.stspoint.id/gopay/create"
payload = {
    "secret_key": "STS-Key-XXXXXXXX",
    "amount": 50000,
    "payer_email": "customer@email.com",
    "description": "GoPay Order #101"
}

response = requests.post(url, json=payload)
print(response.json())`}
                />
              </TabsContent>

              <TabsContent value="php" className="w-full outline-none">
                <CodeBlock 
                  title="PHP (CURL)"
                  type="php"
                  code={`<?php
$url = "https://api.stspoint.id/gopay/create";
$payload = [
    "secret_key" => "STS-Key-XXXXXXXX",
    "amount" => 50000,
    "payer_email" => "customer@email.com",
    "description" => "GoPay Order #101"
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>`}
                />
              </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-2 px-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Success Response
          </p>
          <CodeBlock 
            title="Payment Created JSON"
            type="json"
            code={`{
  "success": true,
  "data": {
    "external_id": "GPY-1730-XXXX",
    "qr_string": "00020101021226660011ID.CO.GOPAY.WWW...",
    "amount": 50428,
    "base_amount": 50000,
    "random_code": 428,
    "status": "PENDING",
    "remaining_quota": 14999
  }
}`}
          />
        </div>
      </section>

      {/* Check Status */}
      <section id="check-status" className="space-y-8 scroll-mt-24 pt-4 border-t border-border w-full">
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-foreground">
            <RefreshCcw className="w-6 h-6 text-cyan-500" />
            Verify Payment Status
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Check the current state of a GoPay transaction. The system will perform a live reconciliation against your GoPay merchant settlement reports.
          </p>
          <div className="flex items-center gap-3 px-4 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-border w-fit font-mono text-xs font-bold">
            <UiBadge className="bg-emerald-500 text-white border-none uppercase font-bold text-[10px]">POST</UiBadge>
            <span className="text-primary">/gopay/status</span>
          </div>
        </div>

        <CodeBlock 
          title="Status Success JSON"
          type="json"
          code={`{
  "success": true,
  "data": {
    "external_id": "GPY-1730-XXXX",
    "status": "PAID",
    "amount": 50428,
    "paid_at": "2024-10-24T08:45:12Z",
    "remaining_quota": 14982
  }
}`}
        />
      </section>

      {/* Quota Note */}
      <section id="notes" className="space-y-6 scroll-mt-24 pt-4 border-t border-border w-full">
         <div className="p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 flex items-start gap-4">
            <Info className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
               <p className="text-sm font-bold text-cyan-900 uppercase tracking-tight">API Quota Management</p>
               <p className="text-xs text-cyan-800 leading-relaxed">
                  Both <strong>creation</strong> and <strong>status verification</strong> requests consume your service quota. Ensure your polling logic is optimized to avoid hitting rate limits.
               </p>
            </div>
         </div>
      </section>
    </div>
  );
}
