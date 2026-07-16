"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Download, 
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  History
} from "lucide-react";
import React, { useState } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { format } from "date-fns";

export default function STSPayTransactionsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [search, setSearch] = useState("");

  const transactionsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
  }, [db, user?.uid]);

  const { data: transactions, loading } = useCollection(transactionsQuery);

  const filtered = transactions.filter(t => 
    t.id?.toLowerCase().includes(search.toLowerCase()) ||
    t.userId?.toLowerCase().includes(search.toLowerCase()) ||
    t.itemName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-md font-bold text-[10px] uppercase tracking-wider">
            <Download className="w-3.5 h-3.5 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Cari ID Transaksi, Produk, atau Pelanggan..." 
            className="pl-10 rounded-md border-border bg-card h-11 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="rounded-md h-11 px-4 gap-2 font-bold text-xs shrink-0">
          <Calendar className="w-4 h-4" /> Rentang Waktu
        </Button>
      </div>

      <div className="w-full max-w-full grid grid-cols-1 min-w-0 overflow-hidden">
        <Card className="w-full max-w-full border-border shadow-sm rounded-md overflow-hidden bg-card">
          <CardHeader className="px-6 py-4 border-b border-border bg-muted/30 dark:bg-[#0A0A0A] shrink-0">
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
              <History className="w-4 h-4 text-primary" />
              Riwayat Transaksi Masuk
            </CardTitle>
          </CardHeader>
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-full text-xs text-left">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-8 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">Transaction ID</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">Item / Product</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">Amount</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">Customer</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">Method</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">Status</th>
                  <th className="px-8 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground text-right whitespace-nowrap">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i}><td colSpan={7} className="px-8 py-6"><Skeleton className="h-4 w-full" /></td></tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-8 py-24 text-center text-muted-foreground italic">Tidak ada transaksi ditemukan.</td></tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-8 py-4 font-mono text-[10px] font-bold text-primary whitespace-nowrap">#{item.id?.substring(0, 10).toUpperCase()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <p className="font-bold">{item.itemName || "Digital Product"}</p>
                         <p className="text-[9px] text-muted-foreground uppercase">{item.gameName || item.gameId || "PPOB"}</p>
                      </td>
                      <td className="px-6 py-4 font-bold whitespace-nowrap">Rp {(item.priceAmount || 0).toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4 font-medium text-foreground/80 whitespace-nowrap">{item.userId || "Guest"}</td>
                      <td className="px-6 py-4 uppercase text-[10px] text-muted-foreground font-bold whitespace-nowrap">{item.paymentMethod || "QRIS"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <Badge className={`${
                          item.status === 'Success' ? 'bg-emerald-500/10 text-emerald-600' : 
                          item.status === 'Pending' ? 'bg-amber-500/10 text-amber-600' : 
                          'bg-red-500/10 text-red-600'
                        } border-none text-[8px] font-bold uppercase px-2 py-0.5 rounded-sm flex items-center w-fit gap-1`}>
                          {item.status === 'Success' && <CheckCircle2 className="w-2.5 h-2.5" />}
                          {item.status === 'Pending' && <Clock className="w-2.5 h-2.5" />}
                          {item.status === 'Failed' && <XCircle className="w-2.5 h-2.5" />}
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-8 py-4 text-right text-muted-foreground text-[10px] whitespace-nowrap">
                        {item.createdAt ? format(item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt), "dd/MM/yy HH:mm") : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
