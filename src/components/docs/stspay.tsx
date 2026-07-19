"use client";

import React from "react";
import { Zap, Plus, Braces, Code2, RefreshCcw, Activity, CheckCircle2 } from "lucide-react";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "./shared/code-block";

export function DocsStsPay() {
  return (
    <div className="space-y-16 animate-in slide-in-from-bottom-2 w-full max-w-full overflow-hidden">
      <section className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary">
          <Zap className="w-3 h-3" />
          Unified Gateway
        </div>
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight text-foreground">STSPay</h1>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl">
          STSPay is our core payment orchestration layer. It supports two main creation modes: hosting a checkout page for your customers or retrieving a raw QRIS payload for custom frontend implementations.
        </p>
      </section>

      <section id="create-payment" className="space-y-8 scroll-mt-24 pt-4 border-t border-border w-full">
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3">
            <Plus className="w-6 h-6 text-primary" />
            Create Payment
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Initialize a transaction. Use the <code className="font-bold text-foreground">type</code> parameter to switch between a hosted link or a direct QRIS string.
          </p>
          <div className="flex items-center gap-3 px-4 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-border w-fit font-mono text-xs font-bold">
            <UiBadge className="bg-emerald-500 text-white border-none uppercase font-bold text-[10px]">POST</UiBadge>
            <span className="text-primary">/payments/create</span>
          </div>
        </div>

        <div className="space-y-6 w-full min-w-0">
           <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-1">
             <Braces className="w-3.5 h-3.5" />
             Request Parameters
           </h4>
           <div className="rounded-2xl border border-border overflow-x-auto bg-card shadow-sm w-full block">
              <table className="w-full text-left text-xs border-collapse min-w-[600px]">
                 <thead className="bg-muted/50 border-b border-border">
                    <tr>
                       <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap">Parameter</th>
                       <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap">Type</th>
                       <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap">Default</th>
                       <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap">Description</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-border">
                    <tr>
                       <td className="px-6 py-4 font-mono font-bold text-amber-600 whitespace-nowrap">merchant_id</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">String</td>
                       <td className="px-6 py-4 text-[10px] text-muted-foreground/30 italic whitespace-nowrap">Required</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Your unique STS Merchant ID. Found in Console dashboard.</td>
                    </tr>
                    <tr>
                       <td className="px-6 py-4 font-mono font-bold text-amber-600 whitespace-nowrap">secret_key</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">String</td>
                       <td className="px-6 py-4 text-[10px] text-muted-foreground/30 italic whitespace-nowrap">Required</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Your private API Secret Key. Used for authentication.</td>
                    </tr>
                    <tr>
                       <td className="px-6 py-4 font-mono font-bold text-amber-600 whitespace-nowrap">type</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Enum</td>
                       <td className="px-6 py-4 font-mono text-[9px] whitespace-nowrap">payment_link</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Creation mode. Options: <code className="text-primary font-bold">payment_link</code> or <code className="text-primary font-bold">qris</code>.</td>
                    </tr>
                    <tr>
                       <td className="px-6 py-4 font-mono font-bold text-amber-600 whitespace-nowrap">amount</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Number</td>
                       <td className="px-6 py-4 text-[10px] text-muted-foreground/30 italic whitespace-nowrap">Required</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Total transaction amount in IDR. Min: 100.</td>
                    </tr>
                    <tr>
                       <td className="px-6 py-4 font-mono font-bold text-amber-600 whitespace-nowrap">payer_email</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">String</td>
                       <td className="px-6 py-4 text-[10px] text-muted-foreground/30 italic whitespace-nowrap">Required</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Customer email address for identification.</td>
                    </tr>
                 </tbody>
              </table>
           </div>
        </div>

        <div className="space-y-4 w-full min-w-0 overflow-hidden">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-1">
             <Code2 className="w-3.5 h-3.5" />
             Implementation Examples
          </h4>
          <Tabs defaultValue="curl" className="w-full">
            <div className="w-full overflow-x-auto no-scrollbar mb-2 block">
              <TabsList className="bg-muted p-1 rounded-xl h-11 w-max min-w-full justify-start flex">
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
                code={`curl -X POST https://api.stspoint.id/payments/create \\
  -H "Content-Type: application/json" \\
  -H "X-Callback-URL: https://your-server.com/callback" \\
  -d '{
    "merchant_id": "STS-XXXXXXXX",
    "secret_key": "STS-Key-XXXXXXXX",
    "type": "payment_link",
    "amount": 50000,
    "payer_email": "customer@email.com",
    "description": "Digital Product Purchase"
  }'`}
              />
            </TabsContent>

            <TabsContent value="node" className="w-full outline-none">
              <CodeBlock 
                title="Node.js (Fetch API)"
                type="node"
                code={`const response = await fetch('https://api.stspoint.id/payments/create', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'X-Callback-URL': 'https://your-server.com/callback'
  },
  body: JSON.stringify({
    merchant_id: 'STS-XXXXXXXX',
    secret_key: 'STS-Key-XXXXXXXX',
    type: 'payment_link',
    amount: 50000,
    payer_email: 'customer@email.com',
    description: 'Digital Product Purchase'
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

url = "https://api.stspoint.id/payments/create"
headers = {
    "X-Callback-URL": "https://your-server.com/callback"
}
payload = {
    "merchant_id": "STS-XXXXXXXX",
    "secret_key": "STS-Key-XXXXXXXX",
    "type": "payment_link",
    "amount": 50000,
    "payer_email": "customer@email.com",
    "description": "Digital Product Purchase"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`}
              />
            </TabsContent>

            <TabsContent value="php" className="w-full outline-none">
              <CodeBlock 
                title="PHP (CURL)"
                type="php"
                code={`<?php
$url = "https://api.stspoint.id/payments/create";
$payload = [
    "merchant_id" => "STS-XXXXXXXX",
    "secret_key" => "STS-Key-XXXXXXXX",
    "type" => "payment_link",
    "amount" => 50000,
    "payer_email" => "customer@email.com",
    "description" => "Digital Product Purchase"
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'X-Callback-URL: https://your-server.com/callback'
]);

$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>`}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full min-w-0">
           <div className="space-y-4 min-w-0 overflow-hidden">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Mode: Payment Link</p>
              <CodeBlock 
                title="Hosted Checkout Response"
                type="json"
                code={`{
  "success": true,
  "data": {
    "external_id": "PAY-12345",
    "checkout_url": "https://api.stspoint.id/checkout/PAY-12345",
    "status": "PENDING",
    "amount": 50000
  }
}`}
              />
           </div>
           <div className="space-y-4 min-w-0 overflow-hidden">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Mode: QRIS</p>
              <CodeBlock 
                title="Direct QRIS Payload"
                type="json"
                code={`{
  "success": true,
  "data": {
    "external_id": "PAY-12345",
    "qr_string": "00020101021226660011ID.CO.XENDIT.WWW...",
    "status": "PENDING",
    "amount": 50000
  }
}`}
              />
           </div>
        </div>
      </section>

      <section id="check-status" className="space-y-8 scroll-mt-24 pt-4 border-t border-border w-full">
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-foreground">
            <RefreshCcw className="w-6 h-6 text-primary" />
            Status Verification
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Poll the current state of a transaction using the <code className="font-bold text-foreground">external_id</code>.
          </p>
          <div className="flex items-center gap-3 px-4 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-border w-fit font-mono text-xs font-bold">
            <UiBadge className="bg-emerald-500 text-white border-none uppercase font-bold text-[10px]">POST</UiBadge>
            <span className="text-primary">/payments/status</span>
          </div>
        </div>

        <CodeBlock 
          title="Status Success Response"
          type="json"
          code={`{
  "success": true,
  "data": {
    "external_id": "PAY-12345",
    "status": "PAID",
    "amount": 50000,
    "payer_email": "customer@email.com",
    "created_at": "2024-10-24T08:42:11Z",
    "updated_at": "2024-10-24T08:45:02Z"
  }
}`}
        />

        <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 flex items-start gap-4">
          <Activity className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm font-bold text-foreground">Transaction States</p>
            <div className="flex flex-wrap gap-2">
               <UiBadge variant="outline" className="bg-background text-[9px] uppercase font-bold">PENDING</UiBadge>
               <UiBadge variant="outline" className="bg-background text-[9px] uppercase font-bold text-emerald-600">PAID</UiBadge>
               <UiBadge variant="outline" className="bg-background text-[9px] uppercase font-bold text-rose-600">EXPIRED</UiBadge>
               <UiBadge variant="outline" className="bg-background text-[9px] uppercase font-bold text-amber-600">FAILED</UiBadge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-2">
              For better efficiency, we highly recommend using dynamic **Webhooks** via the `X-Callback-URL` header.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
