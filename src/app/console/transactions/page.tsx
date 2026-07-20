
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { 
  History, 
  Search, 
  ChevronLeft, 
  Download,
  Calendar,
  RefreshCcw,
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { format, isToday, isYesterday, isSameYear } from "date-fns";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import Link from "next/link";

export default function AllTransactionsPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const [search, setSearch] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const transactionsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, "transactions"),
      where("userId", "==", user.uid)
    );
  }, [db, user?.uid]);

  const { data: rawTransactions, loading: txLoading } = useCollection(transactionsQuery);

  const transactions = useMemo(() => {
    const sorted = [...rawTransactions].sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });

    const filtered = sorted.filter(tx => 
      tx.itemName?.toLowerCase().includes(search.toLowerCase()) ||
      tx.id?.toLowerCase().includes(search.toLowerCase()) ||
      tx.gameName?.toLowerCase().includes(search.toLowerCase())
    );

    return filtered.slice(0, 50);
  }, [rawTransactions, search]);

  const formatTransactionDate = (timestamp: any) => {
    if (!isMounted || !timestamp) return "...";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    if (isToday(date)) return format(date, "HH:mm");
    if (isYesterday(date)) return "Kemarin " + format(date, "HH:mm");
    if (isSameYear(date, now)) return format(date, "dd MMM HH:mm");
    return format(date, "yyyy MM dd HH:mm");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-accent">
            <Link href="/console">
              <ChevronLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-headline font-bold tracking-tight">Transaction <span className="text-primary">History</span></h1>
            <p className="text-muted-foreground text-xs">Menampilkan 50 transaksi terakhir Anda.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-md font-bold text-[10px] uppercase tracking-widest gap-2 h-10 px-4">
            <Calendar className="w-3.5 h-3.5" /> Filter Tanggal
          </Button>
          <Button variant="outline" size="sm" className="rounded-md font-bold text-[10px] uppercase tracking-widest gap-2 h-10 px-4">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="relative group max-w-md w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Cari Ref ID atau nama produk..." 
          className="h-11 text-sm pl-10 bg-card border-border rounded-xl transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="border-border shadow-sm rounded-xl md:rounded-2xl overflow-hidden bg-card"> 
        <CardHeader className="px-4 py-3 md:px-6 md:py-4 border-b border-border bg-slate-50/50 dark:bg-[#0A0A0A]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-primary" />
              <CardTitle className="text-xs md:text-sm font-bold uppercase tracking-widest text-muted-foreground">Transaction Logs</CardTitle>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold border-border bg-background">
              {transactions.length} Records
            </Badge>
          </div>
        </CardHeader>
        <div className="w-full overflow-x-auto"> 
          <table className="w-full min-w-[800px] text-[10px] md:text-xs text-left border-collapse"> 
            <thead className="bg-slate-50/50 border-b border-border dark:bg-[#0F0F0F]">
              <tr>
                <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[8px] md:text-[9px] tracking-widest whitespace-nowrap">Time</th>
                <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[8px] md:text-[9px] tracking-widest whitespace-nowrap">Service</th>
                <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[8px] md:text-[9px] tracking-widest whitespace-nowrap">Ref</th>
                <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[8px] md:text-[9px] tracking-widest whitespace-nowrap">Product</th>
                <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[8px] md:text-[9px] tracking-widest whitespace-nowrap">Price</th>
                <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[8px] md:text-[9px] tracking-widest text-right whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {txLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-6 py-5"><Skeleton className="h-4 w-full" /></td></tr>
                ))
              ) : transactions.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center text-muted-foreground italic font-medium">Belum ada riwayat transaksi.</td></tr>
              ) : (
                transactions.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-6 py-4 text-muted-foreground text-[9px] whitespace-nowrap">{formatTransactionDate(row.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className="bg-muted/50 border-none text-[8px] font-bold px-2 py-0 h-4 rounded-sm uppercase">
                        {row.gameName || row.gameId}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-mono text-[9px] text-muted-foreground whitespace-nowrap uppercase">{row.id?.substring(0, 10)}</td>
                    <td className="px-6 py-4 font-bold whitespace-nowrap truncate max-w-[200px]">{row.itemName}</td>
                    <td className="px-6 py-4 font-bold text-primary whitespace-nowrap">{row.price}</td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Badge className={`${
                        row.status === 'Success' ? 'bg-green-500/10 text-green-600' : 
                        row.status === 'Pending' ? 'bg-orange-500/10 text-orange-600' : 
                        'bg-rose-500/10 text-rose-600'
                      } border-none text-[8px] font-bold px-2 py-0 h-4 rounded-sm uppercase flex items-center w-fit gap-1 ml-auto`}>
                        {row.status === 'Success' && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {row.status === 'Pending' && <Clock className="w-2.5 h-2.5" />}
                        {row.status === 'Failed' && <XCircle className="w-2.5 h-2.5" />}
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      <div className="text-center py-6">
         <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-[0.4em]">STSPoint Transaction Ledger • v1.0.5</p>
      </div>
    </div>
  );
}
