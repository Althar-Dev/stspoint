"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  RefreshCcw, 
  Calendar,
  Clock,
  Download,
  Loader2,
  FileText,
  ArrowLeft
} from "lucide-react";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { getOvoMutations } from "@/lib/ovo/data";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

export default function OvoTransactionsPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const [mutations, setMutations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const ovoRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid, "services", "ovo");
  }, [db, user?.uid]);
  
  const { data: ovo, loading: serviceLoading } = useDoc(ovoRef);

  const isConnected = !!ovo?.token;
  const isGlobalLoading = authLoading || serviceLoading;

  const parseNumericValue = (val: any): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') return parseFloat(val.replace(/[^0-9.-]+/g, "")) || 0;
    return 0;
  };

  const fetchMutations = useCallback(async () => {
    if (isConnected && ovo?.token && ovo?.deviceId) {
      setLoading(true);
      try {
        const res = await getOvoMutations({ 
          token: ovo.token, 
          deviceId: ovo.deviceId, 
          limit: 100 
        });
        
        // Aligned with Docs: Data is in data.orders
        if (res.success && res.data && Array.isArray(res.data.orders)) {
          setMutations(res.data.orders);
        } else {
          setMutations([]);
        }
      } catch (error) {
        console.error("Fetch OVO history error:", error);
        setMutations([]);
      } finally {
        setLoading(false);
      }
    }
  }, [isConnected, ovo?.token, ovo?.deviceId]);

  useEffect(() => {
    if (isConnected) {
      fetchMutations();
    }
  }, [isConnected, fetchMutations]);

  const filteredMutations = useMemo(() => {
    return mutations.filter(m => 
      (m.merchant_name || m.desc1 || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [mutations, search]);

  const handleExportPDF = () => {
    if (filteredMutations.length === 0) return;
    const doc = new jsPDF();
    doc.text("OVO Full Transaction Journal", 14, 15);
    
    const tableData = filteredMutations.map(m => [
      `${m.transaction_date || ""} ${m.transaction_time || ""}`,
      m.merchant_name || m.desc1 || "OVO Transaction",
      parseNumericValue(m.transaction_amount).toLocaleString(),
      m.status || "SUCCESS"
    ]);

    autoTable(doc, {
      head: [['Waktu', 'Merchant / Deskripsi', 'Amount (IDR)', 'Status']],
      body: tableData,
      startY: 20,
      theme: 'grid'
    });

    doc.save(`OVO_Journal_${format(new Date(), "yyyyMMdd")}.pdf`);
    toast({ title: "Export Success", description: "PDF Journal generated." });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <div>
              <h1 className="text-2xl font-headline font-bold tracking-tight">OVO <span className="text-[#4C2B9A]">History</span></h1>
              <p className="text-muted-foreground text-sm">Audit log lengkap transaksi akun OVO Anda.</p>
           </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportPDF} className="h-10 rounded-xl border-border bg-card shadow-sm gap-2 font-bold text-xs">
            <FileText className="w-4 h-4 text-rose-500" />
            Eksport Jurnal (PDF)
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-9 h-11 bg-card border-border rounded-xl shadow-sm text-sm" 
            placeholder="Cari berdasarkan nama merchant atau deskripsi..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          className="h-11 px-4 rounded-xl gap-2 font-bold text-xs"
          onClick={fetchMutations}
          disabled={loading || isGlobalLoading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
          Refresh
        </Button>
      </div>

      <Card className="border border-border shadow-sm rounded-3xl overflow-hidden bg-card flex-1 min-h-[500px]">
        <div className="w-full h-full overflow-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-muted/90 backdrop-blur-md z-10">
              <tr className="border-b border-border">
                <th className="px-8 py-4 font-bold uppercase text-[9px] tracking-widest text-muted-foreground whitespace-nowrap">Waktu Transaksi</th>
                <th className="px-6 py-4 font-bold uppercase text-[9px] tracking-widest text-muted-foreground whitespace-nowrap">Merchant / Detail</th>
                <th className="px-6 py-4 font-bold uppercase text-[9px] tracking-widest text-muted-foreground text-center whitespace-nowrap">Nominal</th>
                <th className="px-8 py-4 font-bold uppercase text-[9px] tracking-widest text-muted-foreground text-right whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading || isGlobalLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}><td colSpan={4} className="px-8 py-6"><Skeleton className="h-4 w-full" /></td></tr>
                ))
              ) : filteredMutations.length === 0 ? (
                <tr><td colSpan={4} className="py-32 text-center text-muted-foreground italic">Tidak ada transaksi ditemukan.</td></tr>
              ) : (
                filteredMutations.map((item, i) => {
                  const amtValue = parseNumericValue(item.transaction_amount);
                  const isTopup = String(item.transaction_type || "").includes("TOPUP") || item.emoney_topup > 0;

                  return (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4 font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                        {item.transaction_date || ""} {item.transaction_time || ""}
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex flex-col">
                            <span className="font-bold text-foreground/80">{item.merchant_name || item.desc1 || "OVO Transaction"}</span>
                            <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">{item.desc2}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-center font-bold">
                        <span className={isTopup ? 'text-emerald-600' : 'text-rose-500'}>
                          {isTopup ? '+' : '-'}Rp {Math.abs(amtValue).toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right">
                         <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-bold text-[8px] uppercase px-2 py-0.5 rounded-sm">{item.status || "SUCCESS"}</Badge>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
