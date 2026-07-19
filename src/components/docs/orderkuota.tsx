
"use client";

import React from "react";
import { 
  QrCode, 
  Code2, 
  RefreshCcw, 
  Activity, 
  Braces, 
  ShieldCheck, 
  Webhook, 
  Info,
  Terminal,
  Layers,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "./shared/code-block";

export function DocsOrderkuota() {
  return (
    <div className="space-y-16 animate-in slide-in-from-bottom-2 w-full max-w-full overflow-hidden">
      {/* Intro Section */}
      <section className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/5 border border-orange-500/10 text-[10px] font-bold uppercase tracking-widest text-orange-500">
          <QrCode className="w-3 h-3" />
          Direct QRIS Bridge
        </div>
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight text-foreground">Orderkuota API</h1>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl">
          Orderkuota integration allows you to generate dynamic QRIS codes with unique amounts instantly. This system connects directly to your Orderkuota balance for seamless automated reconciliation.
        </p>
      </section>

      {/* Create QRIS */}
      <section id="create-qris" className="space-y-8 scroll-mt-24 pt-4 border-t border-border w-full">
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-foreground">
            <QrCode className="w-6 h-6 text-orange-500" />
            Create Dynamic QRIS
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Generate a dynamic QRIS payload based on a specified amount. The system will automatically append a unique code (random digits) if configured in your dashboard.
          </p>
          <div className="flex items-center gap-3 px-4 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-border w-fit font-mono text-xs font-bold">
            <UiBadge className="bg-emerald-500 text-white border-none uppercase font-bold text-[10px]">POST</UiBadge>
            <span className="text-primary">/orkut/create</span>
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
                       <td className="px-6 py-4 font-mono font-bold text-orange-600 whitespace-nowrap">secret_key</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">String</td>
                       <td className="px-6 py-4 text-rose-500 font-bold whitespace-nowrap">Required</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Your API secret key.</td>
                    </tr>
                    <tr>
                       <td className="px-6 py-4 font-mono font-bold text-orange-600 whitespace-nowrap">amount</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Number</td>
                       <td className="px-6 py-4 text-rose-500 font-bold whitespace-nowrap">Required</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Base transaction amount (without unique code).</td>
                    </tr>
                    <tr>
                       <td className="px-6 py-4 font-mono font-bold text-orange-600 whitespace-nowrap">external_id</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">String</td>
                       <td className="px-6 py-4 text-muted-foreground/30 italic whitespace-nowrap">Optional</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Reference ID from your system.</td>
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
                  code={`curl -X POST https://api.stspoint.id/orkut/create \\
  -H "Content-Type: application/json" \\
  -d '{
    "secret_key": "STS-Key-XXXXXXXX",
    "amount": 50000,
    "description": "Balance Deposit #101"
  }'`}
                />
              </TabsContent>

              <TabsContent value="node" className="w-full outline-none">
                <CodeBlock 
                  title="Node.js (Fetch API)"
                  type="node"
                  code={`const response = await fetch('https://api.stspoint.id/orkut/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    secret_key: 'STS-Key-XXXXXXXX',
    amount: 50000,
    description: 'Balance Deposit #101'
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

url = "https://api.stspoint.id/orkut/create"
payload = {
    "secret_key": "STS-Key-XXXXXXXX",
    "amount": 50000,
    "description": "Balance Deposit #101"
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
$url = "https://api.stspoint.id/orkut/create";
$payload = [
    "secret_key" => "STS-Key-XXXXXXXX",
    "amount" => 50000,
    "description" => "Balance Deposit #101"
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
            Response Example (Success)
          </p>
          <CodeBlock 
            title="Create QRIS JSON"
            type="json"
            code={`{
  "success": true,
  "data": {
    "external_id": "OKT-1730-XXXX",
    "qr_string": "00020101021226660011ID.CO.ORKUT.WWW...",
    "amount": 50123,
    "random_code": 123,
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
            <RefreshCcw className="w-6 h-6 text-orange-500" />
            Check Transaction Status
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Verify payment status manually. The API will perform a live reconciliation against the Orderkuota mutation logs.
          </p>
          <div className="flex items-center gap-3 px-4 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-border w-fit font-mono text-xs font-bold">
            <UiBadge className="bg-emerald-500 text-white border-none uppercase font-bold text-[10px]">POST</UiBadge>
            <span className="text-primary">/orkut/status</span>
          </div>
        </div>

        <CodeBlock 
          title="Status Response JSON"
          type="json"
          code={`{
  "success": true,
  "data": {
    "external_id": "OKT-1730-XXXX",
    "status": "PAID",
    "amount": 50123,
    "remaining_quota": 4892
  }
}`}
        />
      </section>

      {/* Important Notes */}
      <section id="notes" className="space-y-6 scroll-mt-24 pt-4 border-t border-border w-full">
         <div className="p-6 rounded-2xl bg-orange-500/5 border border-orange-500/10 flex items-start gap-4">
            <Info className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
               <p className="text-sm font-bold text-orange-900 uppercase tracking-tight">Rate Limiting & Quota</p>
               <p className="text-xs text-orange-800 leading-relaxed">
                  Status checks (POLLING) via the API consume your transaction quota. We highly recommend using **Webhooks** for better quota efficiency and near-instant status updates.
               </p>
            </div>
         </div>
      </section>
    </div>
  );
}
