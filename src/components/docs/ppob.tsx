"use client";

import React from "react";
import { 
  Smartphone, 
  ShoppingCart, 
  RefreshCcw, 
  Code2, 
  Braces, 
  Terminal, 
  Info, 
  Activity,
  Package,
  Layers,
  Webhook,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "./shared/code-block";

export function DocsPpob() {
  return (
    <div className="space-y-8 sm:space-y-12 animate-in slide-in-from-bottom-2 w-full max-w-full overflow-hidden">
      {/* Intro */}
      <section className="space-y-4 sm:space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/10 text-[10px] font-bold uppercase tracking-widest text-blue-500">
          <Smartphone className="w-3 h-3" />
          H2H Distribution Bridge
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-headline font-bold tracking-tight text-foreground">PPOB Service</h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
          The PPOB (Payment Point Online Bank) service allows you to automatically process digital product transactions such as credit, data packages, PLN tokens, and postpaid bills through a single unified API connection.
        </p>
      </section>

      {/* Product List */}
      <section id="product-list" className="space-y-6 sm:space-y-8 scroll-mt-24 pt-4 border-t border-border w-full">
        <div className="space-y-3">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2.5 text-foreground">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
            Get Product List
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Retrieve the list of available products, base prices, and real-time status from all providers connected to the STSPoint ecosystem.
          </p>
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-border w-fit font-mono text-xs font-bold">
            <UiBadge className="bg-blue-500 text-white border-none uppercase font-bold text-[9px] sm:text-[10px]">GET</UiBadge>
            <span className="text-primary text-xs">/ppob/order</span>
          </div>
        </div>

        <div className="space-y-3 w-full min-w-0">
           <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-1">
             <Layers className="w-3.5 h-3.5" />
             Query Parameters
           </h4>
           <div className="rounded-xl sm:rounded-2xl border border-border overflow-x-auto bg-card shadow-sm w-full block">
              <table className="w-full text-left text-xs border-collapse min-w-[500px]">
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
                       <td className="px-6 py-4 font-mono font-bold text-blue-600 whitespace-nowrap">secret_key</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">String</td>
                       <td className="px-6 py-4 text-rose-500 font-bold whitespace-nowrap">Required</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Your API secret key for authentication.</td>
                    </tr>
                    <tr>
                       <td className="px-6 py-4 font-mono font-bold text-blue-600 whitespace-nowrap">type</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Enum</td>
                       <td className="px-6 py-4 text-muted-foreground/30 italic whitespace-nowrap">Optional</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Filter product type: <code className="text-primary font-bold">prepaid</code> or <code className="text-primary font-bold">pasca</code>.</td>
                    </tr>
                 </tbody>
              </table>
           </div>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-2 px-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Response Example (Product Array)
          </p>
          <CodeBlock 
            title="Product List JSON"
            type="json"
            code={`{
  "success": true,
  "data": [
    {
      "buyer_sku_code": "TSEL10",
      "product_name": "Telkomsel 10,000",
      "category": "Credit",
      "brand": "TELKOMSEL",
      "type": "Prepaid",
      "price": 10250,
      "buyer_product_status": true,
      "desc": "Telkomsel Regular Credit 10k"
    }
  ]
}`}
          />
        </div>
      </section>

      {/* Place Order */}
      <section id="create-order" className="space-y-8 scroll-mt-24 pt-4 border-t border-border w-full">
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-foreground">
            <ShoppingCart className="w-6 h-6 text-blue-500" />
            Place Order
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Send transaction instructions to the bridge server to be processed by the provider. Your balance will be deducted automatically for Prepaid products.
          </p>
          <div className="flex items-center gap-3 px-4 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-border w-fit font-mono text-xs font-bold">
            <UiBadge className="bg-emerald-500 text-white border-none uppercase font-bold text-[10px]">POST</UiBadge>
            <span className="text-primary">/ppob/order</span>
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
                       <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap">Description</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-border">
                    <tr>
                       <td className="px-6 py-4 font-mono font-bold text-blue-600 whitespace-nowrap">secret_key</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">String</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Your API secret key.</td>
                    </tr>
                    <tr>
                       <td className="px-6 py-4 font-mono font-bold text-blue-600 whitespace-nowrap">sku</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">String</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Product SKU code (obtained from GET /ppob/order).</td>
                    </tr>
                    <tr>
                       <td className="px-6 py-4 font-mono font-bold text-blue-600 whitespace-nowrap">target</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">String</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Destination number (Phone, Meter No, Customer ID).</td>
                    </tr>
                    <tr>
                       <td className="px-6 py-4 font-mono font-bold text-blue-600 whitespace-nowrap">ref_id</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">String</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Your system's unique transaction ID (External ID).</td>
                    </tr>
                    <tr>
                       <td className="px-6 py-4 font-mono font-bold text-blue-600 whitespace-nowrap">qty</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Number</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Nominal pembayaran untuk tipe <strong>Pasca</strong> (Wajib untuk Postpaid).</td>
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
                  <TabsTrigger value="pasca" className="rounded-lg px-4 text-xs font-bold uppercase">Pasca Example</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="curl" className="w-full outline-none">
                <CodeBlock 
                  title="Shell / cURL"
                  type="curl"
                  code={`curl -X POST https://api.stspoint.id/ppob/order \\
  -H "Content-Type: application/json" \\
  -H "X-Callback-URL: https://your-server.com/ppob-webhook" \\
  -d '{
    "secret_key": "STS-Key-XXXXXXXX",
    "sku": "TSEL10",
    "target": "081234567890",
    "ref_id": "ORDER-9921"
  }'`}
                />
              </TabsContent>

              <TabsContent value="node" className="w-full outline-none">
                <CodeBlock 
                  title="Node.js (Fetch API)"
                  type="node"
                  code={`const response = await fetch('https://api.stspoint.id/ppob/order', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'X-Callback-URL': 'https://your-server.com/ppob-webhook'
  },
  body: JSON.stringify({
    secret_key: 'STS-Key-XXXXXXXX',
    sku: 'TSEL10',
    target: '081234567890',
    ref_id: 'ORDER-9921'
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

url = "https://api.stspoint.id/ppob/order"
headers = {"X-Callback-URL": "https://your-server.com/ppob-webhook"}
payload = {
    "secret_key": "STS-Key-XXXXXXXX",
    "sku": "TSEL10",
    "target": "081234567890",
    "ref_id": "ORDER-9921"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`}
                />
              </TabsContent>

              <TabsContent value="php" className="w-full outline-none">
                <CodeBlock 
                  title="PHP (cURL)"
                  type="php"
                  code={`<?php
$url = "https://api.stspoint.id/ppob/order";
$payload = [
    "secret_key" => "STS-Key-XXXXXXXX",
    "sku" => "TSEL10",
    "target" => "081234567890",
    "ref_id" => "ORDER-9921"
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'X-Callback-URL: https://your-server.com/ppob-webhook'
]);

$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>`}
                />
              </TabsContent>

              <TabsContent value="pasca" className="w-full outline-none">
                <CodeBlock 
                  title="Postpaid (Pasca) JSON Example"
                  type="json"
                  code={`{
  "secret_key": "STS-Key-XXXXXXXX",
  "sku": "PLNPASCA",
  "target": "51234567890",
  "ref_id": "BILL-12345",
  "qty": 150000
}`}
                />
                <p className="mt-2 text-[11px] text-muted-foreground italic px-2">
                  *Untuk tipe Pasca, gunakan parameter <strong>qty</strong> untuk mengirimkan nominal tagihan (Open Denom).
                </p>
              </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-2 px-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Order Success Response
          </p>
          <CodeBlock 
            title="Order Initialized JSON"
            type="json"
            code={`{
  "success": true,
  "message": "Transaction is being processed",
  "data": {
    "ref_id": "ORDER-9921",
    "sku": "TSEL10",
    "target": "081234567890",
    "status": "Pending"
  }
}`}
          />
        </div>
      </section>

      {/* Check Order Status */}
      <section id="check-status" className="space-y-8 scroll-mt-24 pt-4 border-t border-border w-full">
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-foreground">
            <RefreshCcw className="w-6 h-6 text-blue-500" />
            Check Order Status
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Synchronize transaction status manually using the <code className="font-bold text-foreground">ref_id</code> you sent during order creation.
          </p>
          <div className="flex items-center gap-3 px-4 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-border w-fit font-mono text-xs font-bold">
            <UiBadge className="bg-blue-500 text-white border-none uppercase font-bold text-[10px]">POST</UiBadge>
            <span className="text-primary">/ppob/status</span>
          </div>
        </div>

        <CodeBlock 
          title="Status Response (Success Flow)"
          type="json"
          code={`{
  "success": true,
  "status": "Success",
  "message": "Transaction successful",
  "data": {
    "ref_id": "ORDER-9921",
    "sku": "TSEL10",
    "target": "081234567890",
    "status": "Success"
  }
}`}
        />
      </section>

      {/* Webhooks Detail */}
      <section id="webhooks" className="space-y-8 scroll-mt-24 pt-4 border-t border-border w-full">
         <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-foreground">
               <Webhook className="w-6 h-6 text-blue-500" />
               Real-time Callbacks
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
               Use the <code className="text-primary font-bold">X-Callback-URL</code> header to receive automatic notifications when a transaction status changes to <strong>Success</strong> or <strong>Failed</strong>.
            </p>
         </div>

         <CodeBlock 
          title="Webhook Payload (PPOB)"
          type="json"
          code={`{
  "event": "ppob.status_update",
  "data": {
    "ref_id": "ORDER-9921",
    "sku": "TSEL10",
    "target": "081234567890",
    "status": "Success",
    "sn": "83294829384923",
    "message": "Transaction successful",
    "timestamp": "2024-10-24T08:42:11Z"
  }
}`}
         />

         <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-4">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
               <p className="text-sm font-bold text-blue-900 uppercase tracking-tight">Security Header</p>
               <p className="text-xs text-blue-800 leading-relaxed">
                  Every webhook will include an <code className="font-bold">X-STS-Signature</code> header (HMAC-SHA256) to ensure the data originates from official STSPoint infrastructure.
               </p>
            </div>
         </div>
      </section>
    </div>
  );
}
