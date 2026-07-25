
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  RefreshCcw, 
  Calendar,
  Clock,
  Download
} from "lucide-react";
import React from "react";

export default function ShopeepayTransactionsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold tracking-tight">ShopeePay <span className="text-[#EE4D2D]">History</span></h1>
          <p className="text-muted-foreground text-sm">Monitor seluruh log mutasi masuk dari akun ShopeePay Anda.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-10 rounded-xl border-border bg-card shadow-sm gap-2 font-bold text-xs">
            <Download className="w-4 h-4 text-emerald-500" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-9 h-11 bg-card border-border rounded-xl shadow-sm text-sm" 
            placeholder="Cari ID Transaksi..." 
          />
        </div>
        <Button variant="outline" className="h-11 px-6 rounded-xl border-border bg-card shadow-sm font-bold text-xs">
          <Calendar className="w-4 h-4 mr-2" /> Filter Tanggal
        </Button>
      </div>

      <Card className="border border-border shadow-sm rounded-xl overflow-hidden bg-card h-[600px] flex flex-col">
        <CardHeader className="bg-slate-50/50 dark:bg-[#0A0A0A] py-4 px-6 border-b border-border">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#EE4D2D]" />
            Mutation Logs
          </CardTitle>
        </CardHeader>
        <div className="flex-1 flex items-center justify-center text-muted-foreground/30 italic text-sm">
           Belum ada data mutasi yang ditemukan.
        </div>
      </Card>
    </div>
  );
}
