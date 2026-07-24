
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
  Download,
  Database,
  RefreshCcw,
  Mail,
  Key,
  Send
} from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, query, where, orderBy, doc } from "firebase/firestore";
import { format, isValid, parseISO } from "date-fns";
import { useParams } from "next/navigation";
import { getMongoTransactions } from "@/service/mongodb";
import { toast } from "@/hooks/use-toast";

export default function ClientOrdersPage() {
  const params = useParams();
  const { user } = useUser();
  const db = useFirestore();
  const [search, setSearch] = useState("");
  const [mongoTransactions, setMongoTransactions] = useState<any[]>([]);
  const [isMongoLoading, setIsMongoLoading] = useState(false);

  const appId = params.id as string;

  // 1. Ambil info aplikasi untuk menentukan sumber data
  const appRef = useMemoFirebase(() => {
    if (!db || !user?.uid || !appId) return null;
    return doc(db, "users", user.uid, "apps", appId);
  }, [db, user?.uid, appId]);

  const { data: app, loading: appLoading } = useDoc(appRef);

  const usesMongo = useMemo(() => {
    if (!app?.type) return false;
    return app.type.includes("appprem") || app.type === "bot_topup";
  }, [app]);

  // 2. Sumber Data Firestore (untuk Topup Store standar)
  const firestoreTransactionsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid || usesMongo) return null;
    return query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
  }, [db, user?.uid, usesMongo]);

  const { data: firestoreTransactions, loading: firestoreLoading } = useCollection(firestoreTransactionsQuery);

  // 3. Sumber Data MongoDB (untuk Premium/Bot apps)
  const fetchMongoData = async () => {
    if (!user?.uid || !appId || !usesMongo) return;
    setIsMongoLoading(true);
    try {
      const res = await getMongoTransactions(user.uid, appId);
      if (res.success) {
        setMongoTransactions(res.data);
      } else {
        toast({ variant: "destructive", title: "MongoDB Error", description: res.message });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsMongoLoading(false);
    }
  };

  useEffect(() => {
    if (!appLoading && usesMongo) {
      fetchMongoData();
    }
  }, [appLoading, usesMongo]);

  // 4. Penggabungan & Filtering
  const allTransactions = useMemo(() => {
    return usesMongo ? mongoTransactions : firestoreTransactions;
  }, [usesMongo, mongoTransactions, firestoreTransactions]);

  const filteredOrders = allTransactions.filter(tx => {
    const s = search.toLowerCase();
    const idMatch = (tx.id || tx.external_id || "").toLowerCase().includes(s);
    const descMatch = (tx.itemName || tx.description || "").toLowerCase().includes(s);
    const payerMatch = (tx.customer || tx.payer_email || "").toLowerCase().includes(s);
    const productNameMatch = (tx.productName || "").toLowerCase().includes(s);
    return idMatch || descMatch || payerMatch || productNameMatch;
  });

  const formatDate = (dateInput: any) => {
    if (!dateInput) return "-";
    
    // Firestore Timestamp
    if (dateInput.toDate) {
      return format(dateInput.toDate(), "dd/MM HH:mm");
    }
    
    // ISO String or standard date
    try {
      const date = typeof dateInput === 'string' ? parseISO(dateInput) : new Date(dateInput);
      if (isValid(date)) {
        return format(date, "dd/MM HH:mm");
      }
    } catch (e) {}
    
    return "-";
  };

  const isLoading = appLoading || firestoreLoading || isMongoLoading;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 w-full min-w-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <h1 className="text-xl md:text-2xl font-headline font-bold tracking-tight text-foreground">
              Riwayat <span className="text-primary">Pesanan</span>
            </h1>
            {usesMongo && (
              <Badge variant="outline" className="bg-blue-500/5 text-blue-600 border-blue-500/20 text-[9px] font-bold uppercase h-5 px-2">
                <Database className="w-3 h-3 mr-1" /> Server Live
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-xs md:text-sm text-center md:text-left">Kelola dan pantau semua transaksi pelanggan di website Anda.</p>
        </div>
        <div className="flex items-center gap-2">
          {usesMongo && (
            <Button variant="outline" size="sm" onClick={fetchMongoData} disabled={isLoading} className="h-9 px-4 rounded-md font-bold text-[10px] uppercase tracking-widest gap-2">
              <RefreshCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Sinkronisasi
            </Button>
          )}
          <Button variant="outline" size="sm" className="w-full md:w-auto rounded-md font-bold text-[10px] uppercase tracking-wider h-9 shadow-sm">
            <Download className="w-3.5 h-3.5 mr-2" /> Export
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Cari ID Pesanan, Produk, atau Email..." 
            className="pl-10 rounded-md border-border bg-card h-10 text-sm shadow-sm w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="rounded-md h-10 px-4 gap-2 font-bold text-xs shrink-0 bg-card border-border shadow-sm w-full sm:w-auto">
          <Calendar className="w-4 h-4" /> Pilih Tanggal
        </Button>
      </div>

      <Card className="border-border shadow-sm rounded-xl overflow-hidden bg-card w-full min-w-0">
        <CardHeader className="px-6 py-4 border-b border-border bg-muted/30 dark:bg-[#0A0A0A]">
          <CardTitle className="text-[10px] font-bold flex items-center gap-2 uppercase tracking-[0.2em] text-muted-foreground">
            <History className="w-4 h-4 text-primary" />
            Log Transaksi Terkini
          </CardTitle>
        </CardHeader>
        
        <div className="w-full overflow-x-auto block">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">ID Pesanan</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">Produk / Keterangan</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap">Pelanggan & Credentials</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground whitespace-nowrap text-right">Nominal</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground text-center whitespace-nowrap">Status</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] text-muted-foreground text-right whitespace-nowrap">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-6 py-6"><Skeleton className="h-4 w-full" /></td></tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-24 text-center text-muted-foreground font-medium italic text-xs">Belum ada data pesanan yang ditemukan.</td></tr>
              ) : (
                filteredOrders.map((order, idx) => (
                  <tr key={order.id || idx} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-[10px] font-bold text-primary whitespace-nowrap uppercase tracking-tighter">
                      #{ (order.external_id || order.id || "").substring(0, 14) }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-bold text-xs truncate max-w-[250px]">{order.itemName || order.description}</p>
                      <p className="text-[9px] text-muted-foreground uppercase flex items-center gap-1.5 mt-0.5">
                        {order.provider || order.gameName || "Internal"}
                        {order.fulfilledAt && <span className="text-[8px] bg-green-500/10 text-green-600 px-1 rounded-sm">FULFILLED</span>}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <p className="font-medium text-foreground/80 text-xs truncate max-w-[180px]">{order.customer || order.payer_email || order.userId || "-"}</p>
                        {order.emailSent && <Send className="w-2.5 h-2.5 text-blue-500" title="Email sent to customer" />}
                      </div>
                      {order.credentials ? (
                        <div className="mt-1 flex items-center gap-1.5 ml-4.5">
                          <Key className="w-2.5 h-2.5 text-amber-500" />
                          <p className="text-[9px] font-mono text-amber-600 font-bold truncate max-w-[150px]" title={order.credentials}>{order.credentials}</p>
                        </div>
                      ) : order.zoneId ? (
                        <p className="text-[9px] text-muted-foreground uppercase ml-4.5">Zone: {order.zoneId}</p>
                      ) : null}
                    </td>
                    <td className="px-6 py-4 font-bold text-primary text-xs whitespace-nowrap text-right">
                      Rp {(order.priceAmount || order.amount || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Badge className={`rounded-md border-none text-[8px] font-bold uppercase px-2 py-0.5 h-5 inline-flex items-center gap-1 shadow-sm ${
                        ['SUCCESS', 'Success', 'PAID'].includes(order.status) ? 'bg-green-500/10 text-green-600' : 
                        ['PENDING', 'Pending'].includes(order.status) ? 'bg-amber-500/10 text-amber-600' : 
                        'bg-red-500/10 text-red-600'
                      }`}>
                        {['SUCCESS', 'Success', 'PAID'].includes(order.status) && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {['PENDING', 'Pending'].includes(order.status) && <Clock className="w-2.5 h-2.5" />}
                        {(!['SUCCESS', 'Success', 'PAID', 'PENDING', 'Pending'].includes(order.status)) && <XCircle className="w-2.5 h-2.5" />}
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right text-muted-foreground text-[10px] whitespace-nowrap">
                      {formatDate(order.createdAt)}
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
