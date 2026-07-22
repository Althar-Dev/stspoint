"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Calendar,
  History,
  CheckCircle2,
  Clock,
  XCircle,
  Download
} from "lucide-react";
import React, { useState } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { format } from "date-fns";

export default function ClientOrdersPage() {
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

  const filteredOrders = transactions.filter(tx => 
    tx.itemName?.toLowerCase().includes(search.toLowerCase()) ||
    tx.id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-headline font-bold tracking-tight">Riwayat <span className="text-primary">Pesanan</span></h1>
          <p className="text-muted-foreground text-xs md:text-sm">Kelola dan pantau semua transaksi pelanggan di website Anda.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-md font-bold text-[10px] uppercase tracking-wider h-9">
            <Download className="w-3.5 h-3.5 mr-2" /> Export Excel
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Cari ID Pesanan atau Produk..." 
            className="pl-10 rounded-md border-border bg-card h-10 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="rounded-md h-10 px-4 gap-2 font-bold text-xs shrink-0 bg-card border-border">
          <Calendar className="w-4 h-4" /> Pilih Tanggal
        </Button>
      </div>

      <Card className="border-border shadow-sm rounded-xl overflow-hidden bg-card">
        <CardHeader className="px-6 py-4 border-b border-border bg-muted/30 dark:bg-[#0A0A0A]">
          <CardTitle className="text-[10px] font-bold flex items-center gap-2 uppercase tracking-[0.2em] text-muted-foreground">
            <History className="w-4 h-4 text-primary" />
            Daftar Transaksi Terkini
          </CardTitle>
        </CardHeader>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">ID Pesanan</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">Produk & Game</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">Tujuan / User ID</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">Harga</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">Status</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground text-right whitespace-nowrap">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-6 py-6"><Skeleton className="h-4 w-full" /></td></tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-24 text-center text-muted-foreground font-medium italic text-xs">Belum ada data pesanan.</td></tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-[10px] font-bold text-primary whitespace-nowrap">#{order.id?.substring(0, 10).toUpperCase()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-bold text-xs">{order.itemName}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{order.gameName || order.gameId}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium text-foreground/80 text-xs">{order.userId || "-"}</p>
                      <p className="text-[9px] text-muted-foreground uppercase">Zone: {order.zoneId || "-"}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-primary text-xs whitespace-nowrap">
                      Rp {(order.priceAmount || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={`rounded-md border-none text-[8px] font-bold uppercase px-2 py-0.5 h-5 flex items-center w-fit gap-1 ${
                        order.status === 'Success' ? 'bg-green-500/10 text-green-600' : 
                        order.status === 'Pending' ? 'bg-amber-500/10 text-amber-600' : 
                        'bg-red-500/10 text-red-600'
                      }`}>
                        {order.status === 'Success' && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {order.status === 'Pending' && <Clock className="w-2.5 h-2.5" />}
                        {order.status === 'Failed' && <XCircle className="w-2.5 h-2.5" />}
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right text-muted-foreground text-[10px] whitespace-nowrap">
                      {order.createdAt ? format(order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt), "dd/MM HH:mm") : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}