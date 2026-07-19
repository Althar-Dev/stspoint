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
  ArrowRight
} from "lucide-react";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "./shared/code-block";

export function DocsPpob() {
  return (
    <div className="space-y-16 animate-in slide-in-from-bottom-2 w-full max-w-full overflow-hidden">
      {/* Intro */}
      <section className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/10 text-[10px] font-bold uppercase tracking-widest text-blue-500">
          <Smartphone className="w-3 h-3" />
          H2H Distribution Bridge
        </div>
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight text-foreground">PPOB Service</h1>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl">
          Layanan PPOB (Payment Point Online Bank) memungkinkan Anda untuk melakukan transaksi produk digital seperti pulsa, paket data, token PLN, hingga tagihan pascabayar secara otomatis melalui satu koneksi API terpadu.
        </p>
      </section>

      {/* Product List */}
      <section id="product-list" className="space-y-8 scroll-mt-24 pt-4 border-t border-border w-full">
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-foreground">
            <Package className="w-6 h-6 text-blue-500" />
            Get Product List
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Ambil daftar produk yang tersedia, harga modal, dan status terkini dari seluruh provider yang terhubung dalam ekosistem STSPoint.
          </p>
          <div className="flex items-center gap-3 px-4 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-border w-fit font-mono text-xs font-bold">
            <UiBadge className="bg-blue-500 text-white border-none uppercase font-bold text-[10px]">GET</UiBadge>
            <span className="text-primary">/ppob/order</span>
          </div>
        </div>

        <div className="space-y-4 w-full min-w-0">
           <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-1">
             <Layers className="w-3.5 h-3.5" />
             Query Parameters
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
                       <td className="px-6 py-4 font-mono font-bold text-blue-600 whitespace-nowrap">secret_key</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">String</td>
                       <td className="px-6 py-4 text-rose-500 font-bold whitespace-nowrap">Required</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Kunci rahasia API Anda untuk autentikasi.</td>
                    </tr>
                    <tr>
                       <td className="px-6 py-4 font-mono font-bold text-blue-600 whitespace-nowrap">type</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Enum</td>
                       <td className="px-6 py-4 text-muted-foreground/30 italic whitespace-nowrap">Optional</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Filter tipe produk: <code className="text-primary font-bold">prepaid</code> atau <code className="text-primary font-bold">pasca</code>.</td>
                    </tr>
                 </tbody>
              </table>
           </div>
        </div>

        <CodeBlock 
          title="Product Response Example"
          type="json"
          code={`{
  "success": true,
  "data": [
    {
      "buyer_sku_code": "TSEL10",
      "product_name": "Telkomsel 10.000",
      "category": "Pulsa",
      "brand": "TELKOMSEL",
      "type": "Prepaid",
      "price": 10250,
      "buyer_product_status": true,
      "desc": "Pulsa Reguler Telkomsel 10rb"
    }
  ]
}`}
        />
      </section>

      {/* Create Order */}
      <section id="create-order" className="space-y-8 scroll-mt-24 pt-4 border-t border-border w-full">
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-foreground">
            <ShoppingCart className="w-6 h-6 text-blue-500" />
            Place Order
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Kirim instruksi transaksi ke server bridge untuk diproses oleh provider. Saldo Anda akan terpotong secara otomatis jika produk bertipe Prepaid.
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
                       <td className="px-6 py-4 font-mono font-bold text-blue-600 whitespace-nowrap">sku</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">String</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Kode SKU produk (didapat dari GET /ppob/order).</td>
                    </tr>
                    <tr>
                       <td className="px-6 py-4 font-mono font-bold text-blue-600 whitespace-nowrap">target</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">String</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Nomor tujuan (HP, No. Meteran, ID Pelanggan).</td>
                    </tr>
                    <tr>
                       <td className="px-6 py-4 font-mono font-bold text-blue-600 whitespace-nowrap">ref_id</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">String</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">ID transaksi unik dari sistem Anda (External ID).</td>
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
                <TabsList className="bg-muted p-1 rounded-xl h-11 w-fit min-w-0 justify-start flex">
                  <TabsTrigger value="curl" className="rounded-lg px-4 text-xs font-bold uppercase">cURL</TabsTrigger>
                  <TabsTrigger value="node" className="rounded-lg px-4 text-xs font-bold uppercase">NodeJS</TabsTrigger>
                  <TabsTrigger value="python" className="rounded-lg px-4 text-xs font-bold uppercase">Python</TabsTrigger>
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
                  title="Node.js (Fetch)"
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

payload = {
    "secret_key": "STS-Key-XXXXXXXX",
    "sku": "TSEL10",
    "target": "081234567890",
    "ref_id": "ORDER-9921"
}
headers = {"X-Callback-URL": "https://your-server.com/ppob-webhook"}

response = requests.post("https://api.stspoint.id/ppob/order", json=payload, headers=headers)
print(response.json())`}
                />
              </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Transaction Status */}
      <section id="check-status" className="space-y-8 scroll-mt-24 pt-4 border-t border-border w-full">
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-foreground">
            <RefreshCcw className="w-6 h-6 text-blue-500" />
            Check Order Status
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Lakukan sinkronisasi status transaksi secara manual menggunakan <code className="font-bold text-foreground">ref_id</code> yang Anda kirimkan saat pembuatan pesanan.
          </p>
          <div className="flex items-center gap-3 px-4 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-border w-fit font-mono text-xs font-bold">
            <UiBadge className="bg-blue-500 text-white border-none uppercase font-bold text-[10px]">GET</UiBadge>
            <span className="text-primary">/ppob/status</span>
          </div>
        </div>

        <CodeBlock 
          title="Status Response"
          type="json"
          code={`{
  "success": true,
  "status": "Success",
  "message": "Transaksi berhasil",
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
               Gunakan header <code className="text-primary font-bold">X-Callback-URL</code> untuk menerima notifikasi otomatis saat status transaksi berubah menjadi <strong>Success</strong> atau <strong>Failed</strong>.
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
    "message": "Transaksi berhasil",
    "timestamp": "2024-10-24T08:42:11Z"
  }
}`}
         />

         <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-4">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
               <p className="text-sm font-bold text-blue-900 uppercase tracking-tight">Security Header</p>
               <p className="text-xs text-blue-800 leading-relaxed">
                  Setiap webhook akan menyertakan header <code className="font-bold">X-STS-Signature</code> (HMAC-SHA256) untuk memastikan data berasal dari infrastruktur resmi STSPoint.
               </p>
            </div>
         </div>
      </section>
    </div>
  );
}
