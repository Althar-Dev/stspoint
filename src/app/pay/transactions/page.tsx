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
  History,
  CreditCard,
  Timer
} from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { format } from "date-fns";

export default function STSPayTransactionsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [search, setSearch] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const transactionsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    // Mengambil data dari koleksi khusus stspay_transactions
    return query(
      collection(db, "stspay_transactions"),
      where("userId", "==", user.uid)
    );
  }, [db, user?.uid]);

  const { data: rawTransactions, loading } = useCollection(transactionsQuery);

  const getEffectiveStatus = (status: string, createdAt: any) => {
    const s = String(status).toUpperCase();
    
    // Normalisasi status sukses dari provider
    if (['SUCCESS', 'PAID', 'SETTLED', 'SUCCEEDED', 'COMPLETED'].includes(s)) return 'Success';
    if (['FAILED', 'CANCELED', 'EXPIRED'].includes(s)) return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

    if (s !== 'PENDING') return status;
    if (!createdAt) return 'Pending';
    
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    const diffInMinutes = (new Date().getTime() - date.getTime()) / 60000;
    
    // Anggap gagal jika sudah lewat 15 menit tanpa status PAID
    return diffInMinutes > 15 ? 'Failed' : 'Pending';
  };

  const transactions = useMemo(() => {
    const processed = rawTransactions.map(tx => ({
      ...tx,
      effectiveStatus: getEffectiveStatus(tx.status, tx.createdAt)
    }));

    // Urutkan berdasarkan waktu terbaru
    const sorted = processed.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });

    // Pencarian sederhana
    const filtered = sorted.filter(t => 
      t.id?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      (t.payerEmail || "").toLowerCase().includes(search.toLowerCase())
    );

    return filtered.slice(0, 50);
  }, [rawTransactions, search]);

  const getLogoSource = (methodId: string) => {
    if (!methodId) return null;
    const upperId = methodId.toUpperCase().replace(/\s/g, '');
    if (upperId === 'BSI') return '/assets/bank/bsi-logo.svg';
    if (upperId === 'SAHABAT_SAMPOERNA' || upperId === 'SAHABATSAMPOERNA') return '/assets/bank/bss-logo.svg';
    const commonLogos = ['BRI', 'BNI', 'MANDIRI', 'PERMATA', 'BJB', 'CIMB', 'OVO', 'ALFAMART', 'INDOMARET', 'QRIS'];
    if (commonLogos.includes(upperId)) {
      return `/assets/bank/${upperId.toLowerCase()}.png`;
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-headline font-bold tracking-tight">STSPay <span className="text-primary">Transactions</span></h1>
        <Button variant="outline" size="sm" className="rounded-md font-bold text-[10px] uppercase tracking-wider">
          <Download className="w-3.5 h-3.5 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Cari ID Transaksi, Deskripsi, atau Pelanggan..." 
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
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                <History className="w-4 h-4 text-primary" />
                Daftar Transaksi Gateway
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-bold border-border bg-background">
                {transactions.length} Records
              </Badge>
            </div>
          </CardHeader>
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[850px] text-xs text-left">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-8 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">ID Transaksi</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">Tipe / Deskripsi</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">Nominal</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">Customer</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">Metode</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">Status</th>
                  <th className="px-8 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground text-right whitespace-nowrap">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i}><td colSpan={7} className="px-8 py-6"><Skeleton className="h-4 w-full" /></td></tr>
                  ))
                ) : transactions.length === 0 ? (
                  <tr><td colSpan={7} className="px-8 py-24 text-center text-muted-foreground italic">Tidak ada transaksi ditemukan di koleksi stspay_transactions.</td></tr>
                ) : (
                  transactions.map((item) => {
                    const logo = getLogoSource(item.payment_method_id || item.paymentMethod);
                    const isPayout = item.type === 'payout';
                    
                    return (
                      <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-8 py-4 font-mono text-[10px] font-bold text-primary whitespace-nowrap">#{item.id?.substring(0, 10).toUpperCase()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <p className="font-bold">{item.description || "Digital Payment"}</p>
                           <Badge variant="secondary" className="text-[8px] uppercase font-bold px-1.5 h-4 border-none bg-muted/50">
                             {item.type || "payment"}
                           </Badge>
                        </td>
                        <td className="px-6 py-4 font-bold whitespace-nowrap">
                          <span className={isPayout ? "text-amber-600" : "text-emerald-600"}>
                            {isPayout ? "-" : "+"}Rp {(item.amount || 0).toLocaleString('id-ID')}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-foreground/80 whitespace-nowrap">{item.payerEmail || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {logo ? (
                              <img src={logo} alt="Method" className="h-4 md:h-5 object-contain" />
                            ) : (
                              <Badge variant="outline" className="bg-muted/50 border-none text-[8px] font-bold px-1.5 py-0 h-4 rounded-sm uppercase">
                                {item.payment_method_id || item.paymentMethod || "Direct"}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <Badge className={`${
                            item.effectiveStatus === 'Success' ? 'bg-emerald-500/10 text-emerald-600' : 
                            item.effectiveStatus === 'Pending' ? 'bg-amber-500/10 text-amber-600' : 
                            'bg-red-500/10 text-red-600'
                          } border-none text-[8px] font-bold uppercase px-2 py-0.5 rounded-sm flex items-center w-fit gap-1`}>
                            {item.effectiveStatus === 'Success' && <CheckCircle2 className="w-2.5 h-2.5" />}
                            {item.effectiveStatus === 'Pending' && <Clock className="w-2.5 h-2.5" />}
                            {item.effectiveStatus === 'Failed' && <XCircle className="w-2.5 h-2.5" />}
                            {item.effectiveStatus}
                          </Badge>
                        </td>
                        <td className="px-8 py-4 text-right text-muted-foreground text-[10px] whitespace-nowrap">
                          {item.createdAt ? format(item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt), "dd/MM/yy HH:mm") : "-"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      
      <div className="text-center py-6 opacity-30">
         <p className="text-[9px] font-bold uppercase tracking-[0.5em]">STSPay Private Ledger Engine</p>
      </div>
    </div>
  );
}
