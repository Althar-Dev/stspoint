
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
  ShieldAlert,
  Clock,
  User as UserIcon,
  Download,
  Loader2,
  FileText,
  FileSpreadsheet
} from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getGoMerchantMutations, type GoMerchantMutationItem } from "@/lib/gomerchant/mutation";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function GopayTransactionsPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const [mutations, setMutations] = useState<GoMerchantMutationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const gomerchantRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid, "services", "gomerchant");
  }, [db, user?.uid]);
  
  const { data: gomerchant, loading: serviceLoading } = useDoc(gomerchantRef);

  const isConnected = !!gomerchant?.token;

  const fetchMutations = useCallback(async (silent = false) => {
    if (isConnected && gomerchant?.token && gomerchant?.id) {
      if (!silent) setLoading(true);
      try {
        const res = await getGoMerchantMutations({
          access_token: gomerchant.token,
          refresh_token: gomerchant.refreshToken || "",
          x_uniqueid: gomerchant.id,
          limit: 100 
        });

        if (res.status === "success" && res.data) {
          setMutations(res.data.mutations || []);
          
          if (res.data.token_refreshed && res.data.new_access_token && gomerchantRef) {
            updateDoc(gomerchantRef, {
              token: res.data.new_access_token,
              refreshToken: res.data.new_refresh_token || gomerchant.refreshToken,
              updatedAt: serverTimestamp()
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setLoading(false);
      }
    }
  }, [isConnected, gomerchant?.token, gomerchant?.id, gomerchantRef, gomerchant?.refreshToken]);

  useEffect(() => {
    fetchMutations();
  }, [fetchMutations]);

  const handleRefresh = () => {
    fetchMutations();
    toast({ title: "Syncing", description: "Fetching latest mutation data from GoPay Merchant." });
  };

  const filteredMutations = mutations.filter(m => 
    m.trx_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (m.customer_name?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const formatTrxDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, "HH:mm dd/MM/yyyy");
    } catch (e) {
      return dateStr;
    }
  };

  // --- Export Logic ---

  const handleExportCSV = () => {
    if (filteredMutations.length === 0) {
      toast({ variant: "destructive", title: "Export Failed", description: "No data available to export." });
      return;
    }

    const headers = ["Time", "Transaction ID", "Customer", "Amount", "Status"];
    const rows = filteredMutations.map(m => [
      formatTrxDate(m.created_at),
      m.trx_id,
      m.customer_name || "GoPay Customer",
      m.amount,
      m.status
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `GoPay_Transactions_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "Export Success", description: "CSV file has been generated." });
  };

  const handleExportPDF = () => {
    if (filteredMutations.length === 0) {
      toast({ variant: "destructive", title: "Export Failed", description: "No data available to export." });
      return;
    }

    const doc = new jsPDF();
    const merchantName = gomerchant?.merchant_name || "STS Merchant";
    const timestamp = format(new Date(), "dd MMMM yyyy, HH:mm");

    // PDF Header
    doc.setFontSize(18);
    doc.text("GoPay Transaction Report", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Merchant: ${merchantName}`, 14, 28);
    doc.text(`Generated on: ${timestamp}`, 14, 33);
    doc.setDrawColor(200);
    doc.line(14, 38, 196, 38);

    const tableColumn = ["Time", "Transaction ID", "Customer", "Amount (IDR)", "Status"];
    const tableRows = filteredMutations.map(m => [
      formatTrxDate(m.created_at),
      m.trx_id.toUpperCase(),
      m.customer_name || "GoPay Customer",
      m.amount.toLocaleString('id-ID'),
      m.status.toUpperCase()
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [0, 174, 214], textColor: 255, fontSize: 9, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 45 },
    });

    const pageCount = (doc as any).internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount} - Powered by STSPay`, 196, 285, { align: 'right' });
    }

    doc.save(`GoPay_Report_${format(new Date(), "yyyyMMdd_HHmm")}.pdf`);
    toast({ title: "Export Success", description: "PDF document has been downloaded." });
  };

  const isGlobalLoading = authLoading || serviceLoading;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold tracking-tight">Transaction <span className="text-[#00AED6]">History</span></h1>
          <p className="text-muted-foreground text-sm">Real-time mutation logs from all connected outlets.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" className="h-10 rounded-xl border-border bg-card shadow-sm gap-2 font-bold text-xs">
            <Calendar className="w-4 h-4" />
            Pick Date
          </Button>
          <Button 
            variant="outline" 
            className="h-10 rounded-xl border-border bg-card shadow-sm gap-2 font-bold text-xs hover:border-[#00AED6]/20 transition-all"
            onClick={handleExportCSV}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            Export CSV
          </Button>
          <Button 
            variant="outline" 
            className="h-10 rounded-xl border-border bg-card shadow-sm gap-2 font-bold text-xs hover:border-[#00AED6]/20 transition-all"
            onClick={handleExportPDF}
          >
            <FileText className="w-4 h-4 text-rose-500" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-9 h-11 bg-card border-border rounded-xl shadow-sm text-sm" 
            placeholder="Search by Transaction ID or Customer Name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          className="h-11 px-4 border-border rounded-xl bg-card shadow-sm flex items-center gap-2 font-bold shrink-0 text-xs"
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
          Refresh
        </Button>
      </div>

      <div className="w-full max-w-full grid grid-cols-1 min-w-0 overflow-hidden">
        <Card className="border border-border shadow-sm rounded-xl overflow-hidden bg-card flex flex-col">
          <CardHeader className="bg-slate-50/50 dark:bg-[#0A0A0A] py-4 px-6 border-b border-border shrink-0 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#00AED6]" />
              GoPay Transaction Logs
            </CardTitle>
            <Badge variant="outline" className="text-[10px] text-muted-foreground border-border">
              {loading ? "Counting..." : `${filteredMutations.length} Transactions Found`}
            </Badge>
          </CardHeader>
          <div className="w-full flex-1 overflow-x-auto overflow-y-auto max-h-[600px]">
            <table className="w-full min-w-full text-xs text-left">
              <thead className="sticky top-0 z-10 bg-muted/50">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase text-[9px] tracking-widest whitespace-nowrap">Time</th>
                  <th className="px-6 py-4 font-bold uppercase text-[9px] tracking-widest whitespace-nowrap">Transaction ID</th>
                  <th className="px-6 py-4 font-bold uppercase text-[9px] tracking-widest whitespace-nowrap">Customer</th>
                  <th className="px-6 py-4 font-bold uppercase text-[9px] tracking-widest whitespace-nowrap">Amount</th>
                  <th className="px-6 py-4 font-bold uppercase text-[9px] tracking-widest text-right whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isGlobalLoading || loading ? (
                  Array.from({ length: 12 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
                    </tr>
                  ))
                ) : !isConnected ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-24 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-4 w-full">
                        <div className="p-4 bg-muted rounded-full">
                          <ShieldAlert className="w-12 h-12 opacity-30" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-base uppercase tracking-widest text-foreground">Account Not Connected</p>
                          <p className="text-sm max-w-xs mx-auto">Please connect your GoPay Merchant account on the main Dashboard to view mutation history.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : filteredMutations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-24 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-3 w-full">
                        <Clock className="w-10 h-10 opacity-20" />
                        <p className="font-bold text-sm uppercase tracking-widest">No transactions found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMutations.map((log, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatTrxDate(log.created_at)}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-[11px] whitespace-nowrap uppercase">
                        {log.trx_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/5 flex items-center justify-center">
                            <UserIcon className="w-3 h-3 text-muted-foreground" />
                          </div>
                          <span className="font-bold text-xs">{log.customer_name || "GoPay Customer"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-[#00AED6] text-[13px] whitespace-nowrap">
                        Rp {log.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <Badge className={`${
                          log.status === 'paid' ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'
                        } border-none font-bold text-[9px] uppercase px-2 py-0.5 rounded-sm`}>
                          {log.status === 'paid' ? 'Success' : log.status}
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

      <div className="text-center py-6">
         <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-[0.4em]">
           STS Point Analytics Engine • Data Export Tool
         </p>
      </div>
    </div>
  );
}
