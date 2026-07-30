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
          Integrasi OVO memungkinkan sistem Anda untuk memantau mutasi secara real-time, melakukan verifikasi akun tujuan, serta mengeksekusi transfer dana ke sesama OVO maupun ke rekening bank melalui saldo akun OVO Anda yang terhubung.
        </p>
      </section>

      {/* Transactions Section */}
      <section id="ovo-transactions" className="space-y-8 scroll-mt-24 pt-4 border-t border-border w-full">
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-foreground">
            <History className="w-6 h-6 text-purple-600" />
            Get OVO Transactions
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Menarik riwayat mutasi dana masuk dan keluar dari akun OVO yang terhubung.
          </p>
          <div className="flex items-center gap-3 px-4 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-border w-fit font-mono text-xs font-bold">
            <UiBadge className="bg-emerald-500 text-white border-none uppercase font-bold text-[10px]">POST</UiBadge>
            <span className="text-primary">/api/ovo/transactions</span>
          </div>
        </div>

        <div className="space-y-4">
           <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-1">
             <Code2 className="w-3.5 h-3.5" />
             Request Example
           </h4>
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
        </div>
      </section>

      {/* Inquiry OVO Section */}
      <section id="ovo-check" className="space-y-8 scroll-mt-24 pt-4 border-t border-border w-full">
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-foreground">
            <Search className="w-6 h-6 text-purple-600" />
            Check OVO Number
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Melakukan inkuiri nomor telepon untuk mendapatkan nama pemilik akun OVO sebelum melakukan transfer.
          </p>
          <div className="flex items-center gap-3 px-4 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-border w-fit font-mono text-xs font-bold">
            <UiBadge className="bg-emerald-500 text-white border-none uppercase font-bold text-[10px]">POST</UiBadge>
            <span className="text-primary">/api/ovo/check</span>
          </div>
        </div>

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
            Transfer to OVO
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Eksekusi pengiriman dana dari akun Anda ke akun OVO lain.
          </p>
          <div className="flex items-center gap-3 px-4 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-border w-fit font-mono text-xs font-bold">
            <UiBadge className="bg-emerald-500 text-white border-none uppercase font-bold text-[10px]">POST</UiBadge>
            <span className="text-primary">/api/ovo/transfer</span>
          </div>
        </div>

        <div className="space-y-6">
           <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Request Parameters</h4>
           <div className="rounded-2xl border border-border overflow-x-auto bg-card shadow-sm w-full block">
              <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                 <thead className="bg-muted/50 border-b border-border">
                    <tr>
                       <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap">Parameter</th>
                       <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap">Type</th>
                       <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap">Description</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-border">
                    <tr>
                       <td className="px-6 py-4 font-mono font-bold text-purple-600 whitespace-nowrap">phone</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">String</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Nomor tujuan (e.g. 0812xxx)</td>
                    </tr>
                    <tr>
                       <td className="px-6 py-4 font-mono font-bold text-purple-600 whitespace-nowrap">amount</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Number</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Nominal transfer (IDR)</td>
                    </tr>
                    <tr>
                       <td className="px-6 py-4 font-mono font-bold text-purple-600 whitespace-nowrap">message</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">String</td>
                       <td className="px-6 py-4 text-muted-foreground whitespace-nowrap italic">Opsional. Catatan transfer.</td>
                    </tr>
                 </tbody>
              </table>
           </div>
        </div>
      </section>

      {/* Bank Transfer Section */}
      <section id="ovo-bank" className="space-y-8 scroll-mt-24 pt-4 border-t border-border w-full">
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-foreground">
            <Landmark className="w-6 h-6 text-purple-600" />
            Bank Disbursement
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Kirim dana dari saldo OVO Anda ke seluruh rekening bank di Indonesia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Card className="border-border shadow-none bg-muted/20 rounded-2xl overflow-hidden">
              <CardContent className="p-6 space-y-4">
                 <div className="flex items-center gap-2">
                    <UiBadge className="bg-emerald-500 text-white border-none uppercase font-bold text-[9px]">POST</UiBadge>
                    <span className="font-bold text-xs font-mono">/api/transfer/banks</span>
                 </div>
                 <p className="text-xs text-muted-foreground">Mengambil daftar kode bank tujuan yang didukung oleh OVO Bridge.</p>
              </CardContent>
           </Card>
           <Card className="border-border shadow-none bg-muted/20 rounded-2xl overflow-hidden">
              <CardContent className="p-6 space-y-4">
                 <div className="flex items-center gap-2">
                    <UiBadge className="bg-emerald-500 text-white border-none uppercase font-bold text-[9px]">POST</UiBadge>
                    <span className="font-bold text-xs font-mono">/api/ovo/transfer/bank-inquiry</span>
                 </div>
                 <p className="text-xs text-muted-foreground">Verifikasi nomor rekening bank dan nama pemilik sebelum transfer.</p>
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
              title="Bank Transfer Request Payload"
              type="json"
              code={`{
  "secret_key": "STS-Key-XXXXXXXX",
  "bank_code": "014",
  "account_no": "1234567890",
  "amount": 50000,
  "message": "Payout ID #8329"
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
                  Semua transaksi transfer dana OVO bersifat final dan tidak dapat dibatalkan. Pastikan Anda melakukan <strong>Check Number</strong> atau <strong>Bank Inquiry</strong> terlebih dahulu untuk meminimalisir kesalahan kirim.
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
