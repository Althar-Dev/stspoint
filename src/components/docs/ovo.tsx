"use client";

import React from "react";
import { 
  Smartphone, 
  SmartphoneNfc,
  CheckCircle2, 
  Code2, 
  Braces, 
  RefreshCcw, 
  Send, 
  Landmark,
  ShieldCheck, 
  Info,
  ArrowRight,
  Terminal,
  History,
  Search
} from "lucide-react";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { CodeBlock } from "./shared/code-block";

export function DocsOvo() {
  return (
    <div className="space-y-16 animate-in slide-in-from-bottom-2 w-full max-w-full overflow-hidden">
      {/* Intro Section */}
      <section className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/5 border border-purple-500/10 text-[10px] font-bold uppercase tracking-widest text-purple-600">
          <Smartphone className="w-3 h-3" />
          Native Wallet Bridge
        </div>
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight text-foreground">OVO API</h1>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl">
          Integrasi OVO memungkinkan sistem Anda untuk memantau mutasi secara real-time, melakukan verifikasi akun tujuan, serta mengeksekusi transfer dana ke sesama OVO maupun ke rekening bank melalui saldo akun OVO Anda yang terhubung secara otomatis.
        </p>
      </section>

      {/* Transactions Section */}
      <section id="ovo-transactions" className="space-y-8 scroll-mt-24 pt-4 border-t border-border w-full">
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-foreground">
            <History className="w-6 h-6 text-purple-600" />
            Riwayat Mutasi
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Tarik log mutasi transaksi (dana masuk & keluar) dari akun OVO Anda untuk keperluan rekonsiliasi otomatis.
          </p>
          <div className="flex items-center gap-3 px-4 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-border w-fit font-mono text-xs font-bold">
            <UiBadge className="bg-emerald-500 text-white border-none uppercase font-bold text-[10px]">POST</UiBadge>
            <span className="text-primary">/api/ovo/transactions</span>
          </div>
        </div>

        <div className="space-y-4">
           <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-1">
             <Code2 className="w-3.5 h-3.5" />
             Implementation Snippets
           </h4>
           <Tabs defaultValue="curl" className="w-full">
              <TabsList className="bg-muted p-1 rounded-xl h-11 w-fit mb-4">
                <TabsTrigger value="curl" className="rounded-lg px-4 text-xs font-bold uppercase">cURL</TabsTrigger>
                <TabsTrigger value="node" className="rounded-lg px-4 text-xs font-bold uppercase">NodeJS</TabsTrigger>
                <TabsTrigger value="python" className="rounded-lg px-4 text-xs font-bold uppercase">Python</TabsTrigger>
                <TabsTrigger value="php" className="rounded-lg px-4 text-xs font-bold uppercase">PHP</TabsTrigger>
              </TabsList>
              
              <TabsContent value="curl">
                <CodeBlock 
                  title="Shell / cURL"
                  type="curl"
                  code={`curl -X POST https://api.stspoint.id/api/ovo/transactions \\
  -H "Content-Type: application/json" \\
  -d '{
    "secret_key": "STS-Key-XXXXXXXX",
    "page": 1,
    "limit": 10
  }'`}
                />
              </TabsContent>
              <TabsContent value="node">
                <CodeBlock 
                  title="Node.js (Fetch)"
                  type="node"
                  code={`const res = await fetch('https://api.stspoint.id/api/ovo/transactions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    secret_key: 'STS-Key-XXXXXXXX',
    page: 1,
    limit: 10
  })
});
const data = await res.json();
console.log(data);`}
                />
              </TabsContent>
              <TabsContent value="python">
                <CodeBlock 
                  title="Python (Requests)"
                  type="python"
                  code={`import requests

payload = {
    "secret_key": "STS-Key-XXXXXXXX",
    "page": 1,
    "limit": 10
}
res = requests.post("https://api.stspoint.id/api/ovo/transactions", json=payload)
print(res.json())`}
                />
              </TabsContent>
              <TabsContent value="php">
                <CodeBlock 
                  title="PHP (CURL)"
                  type="php"
                  code={`<?php
$payload = [
    "secret_key" => "STS-Key-XXXXXXXX",
    "page" => 1,
    "limit" => 10
];

$ch = curl_init("https://api.stspoint.id/api/ovo/transactions");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$response = curl_exec($ch);
echo $response;
?>`}
                />
              </TabsContent>
           </Tabs>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-2 px-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Response Example
          </p>
          <CodeBlock 
            title="Transactions JSON"
            type="json"
            code={`{
  "success": true,
  "data": [
    {
      "merchant_name": "OVO Cash Topup",
      "transaction_amount": "50000.00",
      "transaction_type": "TOPUP",
      "transaction_date": "2024-10-24",
      "transaction_time": "08:42:11",
      "status": "SUCCESS"
    }
  ]
}`}
          />
        </div>
      </section>

      {/* Inquiry OVO Section */}
      <section id="ovo-check" className="space-y-8 scroll-mt-24 pt-4 border-t border-border w-full">
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-foreground">
            <Search className="w-6 h-6 text-purple-600" />
            Inquiry Nomor OVO
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Dapatkan nama asli pemilik akun OVO berdasarkan nomor telepon untuk memastikan dana dikirim ke orang yang tepat.
          </p>
          <div className="flex items-center gap-3 px-4 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-border w-fit font-mono text-xs font-bold">
            <UiBadge className="bg-emerald-500 text-white border-none uppercase font-bold text-[10px]">POST</UiBadge>
            <span className="text-primary">/api/ovo/check</span>
          </div>
        </div>

        <CodeBlock 
          title="Request Payload"
          type="json"
          code={`{
  "secret_key": "STS-Key-XXXXXXXX",
  "phone": "081234567890",
  "amount": 10000
}`}
        />

        <CodeBlock 
          title="Response Success (200)"
          type="json"
          code={`{
  "success": true,
  "data": {
    "fullName": "ALHADI ADRIANO",
    "phone": "081234567890"
  }
}`}
        />
      </section>

      {/* Transfer OVO Section */}
      <section id="ovo-transfer" className="space-y-8 scroll-mt-24 pt-4 border-t border-border w-full">
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-foreground">
            <Send className="w-6 h-6 text-purple-600" />
            Transfer Sesama OVO
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Kirim dana secara instan dari saldo OVO Anda ke pengguna OVO lainnya tanpa biaya admin.
          </p>
          <div className="flex items-center gap-3 px-4 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-border w-fit font-mono text-xs font-bold">
            <UiBadge className="bg-emerald-500 text-white border-none uppercase font-bold text-[10px]">POST</UiBadge>
            <span className="text-primary">/api/ovo/transfer</span>
          </div>
        </div>

        <div className="space-y-4">
           <CodeBlock 
              title="Execute Transfer Request"
              type="json"
              code={`{
  "secret_key": "STS-Key-XXXXXXXX",
  "phone": "081234567890",
  "amount": 50000,
  "message": "Pembayaran Invoice #99"
}`}
           />
           <CodeBlock 
              title="Response Success"
              type="json"
              code={`{
  "success": true,
  "message": "Transfer berhasil ke ALHADI ADRIANO",
  "data": {
    "refId": "OVO-TRX-12345",
    "amount": 50000
  }
}`}
           />
        </div>
      </section>

      {/* Bank Transfer Section */}
      <section id="ovo-bank" className="space-y-8 scroll-mt-24 pt-4 border-t border-border w-full">
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-foreground">
            <Landmark className="w-6 h-6 text-purple-600" />
            Kirim ke Rekening Bank
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Gunakan saldo OVO Anda sebagai sumber dana untuk melakukan pencairan (*disbursement*) ke ratusan bank di Indonesia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Card className="border-border shadow-none bg-muted/20 rounded-2xl overflow-hidden">
              <CardContent className="p-6 space-y-4">
                 <div className="flex items-center gap-2">
                    <UiBadge className="bg-emerald-500 text-white border-none uppercase font-bold text-[9px]">POST</UiBadge>
                    <span className="font-bold text-xs font-mono">/api/transfer/banks</span>
                 </div>
                 <p className="text-xs text-muted-foreground">Mengambil daftar kode bank resmi (e.g. BCA: 014, Mandiri: 008).</p>
              </CardContent>
           </Card>
           <Card className="border-border shadow-none bg-muted/20 rounded-2xl overflow-hidden">
              <CardContent className="p-6 space-y-4">
                 <div className="flex items-center gap-2">
                    <UiBadge className="bg-emerald-500 text-white border-none uppercase font-bold text-[9px]">POST</UiBadge>
                    <span className="font-bold text-xs font-mono">/api/ovo/transfer/bank-inquiry</span>
                 </div>
                 <p className="text-xs text-muted-foreground">Verifikasi pemilik rekening bank secara real-time sebelum pengiriman.</p>
              </CardContent>
           </Card>
        </div>

        <div className="space-y-4">
           <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-1">
             <SmartphoneNfc className="w-3.5 h-3.5" />
             Execute Bank Transfer
           </h4>
           <div className="flex items-center gap-3 px-4 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-border w-fit font-mono text-xs font-bold mb-4">
              <UiBadge className="bg-emerald-500 text-white border-none uppercase font-bold text-[10px]">POST</UiBadge>
              <span className="text-primary">/api/ovo/transfer/bank</span>
           </div>
           <CodeBlock 
              title="Full Bank Payout Payload"
              type="json"
              code={`{
  "secret_key": "STS-Key-XXXXXXXX",
  "bank_code": "014",
  "account_no": "1234567890",
  "amount": 150000,
  "message": "Payout for Merchant ID #123",
  "account_name": "JOHN DOE"
}`}
           />
           <CodeBlock 
              title="Disbursement Success Response"
              type="json"
              code={`{
  "success": true,
  "message": "Transfer ke Rekening Bank Berhasil",
  "data": {
    "txId": "BANK-WD-8392",
    "amount": 150000,
    "fee": 2500
  }
}`}
           />
        </div>
      </section>

      {/* Footer Info */}
      <section className="pt-12 border-t border-border">
         <div className="p-6 rounded-2xl bg-purple-500/5 border border-purple-500/10 flex items-start gap-4">
            <Info className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
               <p className="text-sm font-bold text-purple-900 uppercase tracking-tight">Security Warning</p>
               <p className="text-xs text-purple-800 leading-relaxed">
                  Semua transaksi transfer dana OVO bersifat final dan tidak dapat dibatalkan. Pastikan Anda selalu melakukan <strong>Bank Inquiry</strong> atau <strong>OVO Check</strong> terlebih dahulu untuk meminimalisir kesalahan kirim.
               </p>
            </div>
         </div>
      </section>

      <div className="text-center pt-8 border-t border-border">
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.4em] opacity-30">STSPoint OVO Bridge • Technical Specs v1.2.0</p>
      </div>
    </div>
  );
}
