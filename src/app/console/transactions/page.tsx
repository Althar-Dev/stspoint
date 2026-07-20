
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
  XCircle,
  Timer
} from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { format, isToday, isYesterday, isSameYear } from "date-fns";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, updateDoc, serverTimestamp } from "firebase/firestore";
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

  // Helper to determine effective status based on 15m rule
  const getEffectiveStatus = (status: string, createdAt: any) => {
    if (status !== 'Pending' && status !== 'PENDING') return status;
    if (!createdAt) return status;
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    const diffInMinutes = (new Date().getTime() - date.getTime()) / 60000;
    return diffInMinutes > 15 ? 'Expired' : status;
  };

  const transactions = useMemo(() => {
    const processed = rawTransactions.map(tx => ({
      ...tx,
      effectiveStatus: getEffectiveStatus(tx.status, tx.createdAt)
    }));

    const sorted = processed.sort((a, b) => {
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
    <div className="w-full max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500 min-w-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-4 min-w-0">
          <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-accent shrink-0">
            <Link href="/console">
              <ChevronLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-headline font-bold tracking-tight truncate">
              Transaction <span className="text-primary">History</span>
            </h1>
            <p className="text-muted-foreground text-xs truncate">Menampilkan 50 transaksi terakhir Anda.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="rounded-md font-bold text-[10px] uppercase tracking-widest gap-2 h-10 px-4">
            <Calendar className="w-3.5 h-3.5" /> Filter
          </Button>
          <Button variant="outline" size="sm" className="rounded-md font-bold text-[10px] uppercase tracking-widest gap-2 h-10 px-4">
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
        </div>
      </div>

      <div className="relative group max-w-md w-full px-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Cari Ref ID atau nama produk..." 
          className="h-12 text-sm pl-11 bg-card border-border rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-primary/10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="w-full min-w-0 overflow-hidden">
        <Card className="border-border shadow-sm rounded-2xl md:rounded-3xl overflow-hidden bg-card"> 
          <CardHeader className="px-6 py-4 md:py-6 border-b border-border bg-slate-50/50 dark:bg-[#0A0A0A]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                <CardTitle className="text-xs md:text-sm font-bold uppercase tracking-widest text-muted-foreground">Transaction Logs</CardTitle>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold border-border bg-background">
                {transactions.length} Records
              </Badge>
            </div>
          </CardHeader>
          <div className="w-full overflow-x-auto min-w-0"> 
            <table className="w-full min-w-[850px] text-xs text-left border-collapse"> 
              <thead className="bg-slate-50/50 border-b border-border dark:bg-[#0F0F0F]">
                <tr>
                  <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[9px] tracking-widest whitespace-nowrap">Time</th>
                  <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[9px] tracking-widest whitespace-nowrap">Service</th>
                  <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[9px] tracking-widest whitespace-nowrap">Ref ID</th>
                  <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[9px] tracking-widest whitespace-nowrap">Product Name</th>
                  <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[9px] tracking-widest whitespace-nowrap">Amount</th>
                  <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[9px] tracking-widest text-right whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {txLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="px-6 py-5"><Skeleton className="h-4 w-full" /></td></tr>
                  ))
                ) : transactions.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-24 text-center text-muted-foreground italic font-medium">Belum ada riwayat transaksi ditemukan.</td></tr>
                ) : (
                  transactions.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{formatTransactionDate(row.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="outline" className="bg-muted/50 border-none text-[8px] font-bold px-2 py-0.5 h-5 rounded-md uppercase">
                          {row.gameName || row.gameId}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-mono text-[10px] text-muted-foreground whitespace-nowrap uppercase tracking-tighter">#{row.id?.substring(0, 14)}</td>
                      <td className="px-6 py-4 font-bold whitespace-nowrap max-w-[200px] truncate">{row.itemName}</td>
                      <td className="px-6 py-4 font-bold text-primary whitespace-nowrap">{row.price}</td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <Badge className={`${
                          row.effectiveStatus === 'Success' ? 'bg-green-500/10 text-green-600' : 
                          row.effectiveStatus === 'Pending' ? 'bg-orange-500/10 text-orange-600' : 
                          'bg-rose-500/10 text-rose-600'
                        } border-none text-[9px] font-bold px-2.5 py-0.5 h-6 rounded-md uppercase inline-flex items-center gap-1`}>
                          {row.effectiveStatus === 'Success' && <CheckCircle2 className="w-3 h-3" />}
                          {row.effectiveStatus === 'Pending' && <Clock className="w-3 h-3" />}
                          {(row.effectiveStatus === 'Failed' || row.effectiveStatus === 'Expired') && <XCircle className="w-3 h-3" />}
                          {row.effectiveStatus === 'Expired' && <Timer className="w-3 h-3" />}
                          {row.effectiveStatus}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      
      <div className="text-center py-8">
         <p className="text-[10px] text-muted-foreground/30 font-bold uppercase tracking-[0.4em]">STSPoint Transaction Ledger • Secure Data Storage</p>
      </div>
    </div>
  );
}
