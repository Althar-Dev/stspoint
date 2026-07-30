
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
    FileText,
    FileSpreadsheet,
    ShieldAlert,
    Loader2,
    ChevronLeft
} from "lucide-react";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { getShopeeMutations, type ShopeeMutationItem } from "@/lib/shopeepay/mutasi";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ShopeepayTransactionsPage() {
    const { user, loading: authLoading } = useUser();
    const db = useFirestore();
    const [mutations, setMutations] = useState<ShopeeMutationItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    const shopeepayRef = useMemoFirebase(() => {
        if (!db || !user?.uid) return null;
        return doc(db, "users", user.uid, "services", "shopeepay");
    }, [db, user?.uid]);

    const { data: shopeepay, loading: serviceLoading } = useDoc(shopeepayRef);

    const isConnected = !!shopeepay?.token;
    const isGlobalLoading = authLoading || serviceLoading;

    const fetchMutations = useCallback(async (silent = false) => {
        if (isConnected && shopeepay?.token) {
            if (!silent) setLoading(true);
            try {
                const res = await getShopeeMutations({
                    token: shopeepay.token,
                    limit: 100
                });

                if (res.success) {
                    setMutations(res.data || []);
                } else {
                    toast({ variant: "destructive", title: "Sync Failed", description: res.message });
                }
            } catch (error) {
                console.error("Fetch Shopee history error:", error);
            } finally {
                setLoading(false);
            }
        }
    }, [isConnected, shopeepay?.token]);

    useEffect(() => {
        if (isConnected) {
            fetchMutations();
        }
    }, [isConnected, fetchMutations]);

    const handleRefresh = () => {
        fetchMutations();
        toast({ title: "Syncing", description: "Mengambil data mutasi terbaru dari ShopeePay." });
    };

    const filteredMutations = useMemo(() => {
        if (!Array.isArray(mutations)) return [];
        return mutations.filter(m =>
            (m.transaction_id || "").toLowerCase().includes(search.toLowerCase())
        );
    }, [mutations, search]);

    const handleExportCSV = () => {
        if (filteredMutations.length === 0) {
            toast({ variant: "destructive", title: "Export Gagal", description: "Tidak ada data untuk diekspor." });
            return;
        }
        const headers = ["Waktu", "ID Transaksi", "Metode Pembayaran", "Nominal", "Status"];
        const rows = filteredMutations.map(m => [
            m.created_at,
            m.transaction_id,
            "ShopeePay",
            m.amount,
            m.status
        ]);
        const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `ShopeePay_History_${format(new Date(), "yyyyMMdd")}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "Export Berhasil", description: "File CSV telah diunduh." });
    };

    const handleExportPDF = () => {
        if (filteredMutations.length === 0) return;
        const doc = new jsPDF();
        doc.text("ShopeePay Transaction History Journal", 14, 15);
        const tableData = filteredMutations.map(m => [
            m.created_at,
            m.transaction_id,
            "ShopeePay",
            m.amount,
            m.status
        ]);
        autoTable(doc, {
            head: [['Waktu', 'ID Transaksi', 'Metode Pembayaran', 'Nominal (IDR)', 'Status']],
            body: tableData,
            startY: 20,
            theme: 'grid',
            headStyles: { fillColor: [238, 77, 45] }
        });
        doc.save(`ShopeePay_Journal_${format(new Date(), "yyyyMMdd")}.pdf`);
        toast({ title: "Export Berhasil", description: "Laporan PDF telah diunduh." });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-headline font-bold tracking-tight">ShopeePay <span className="text-[#EE4D2D]">History</span></h1>
                        <p className="text-muted-foreground text-sm">Monitor seluruh log mutasi masuk dari akun ShopeePay Anda.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="h-10 rounded-xl border-border bg-card shadow-sm gap-2 font-bold text-xs"
                        onClick={handleExportCSV}
                        disabled={filteredMutations.length === 0}
                    >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                        Export CSV
                    </Button>
                    <Button
                        variant="outline"
                        className="h-10 rounded-xl border-border bg-card shadow-sm gap-2 font-bold text-xs"
                        onClick={handleExportPDF}
                        disabled={filteredMutations.length === 0}
                    >
                        <FileText className="w-4 h-4 text-rose-500" />
                        Export PDF
                    </Button>
                </div>
            </div>

            <div className="flex gap-2 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        className="pl-9 h-11 bg-card border-border rounded-xl shadow-sm text-sm"
                        placeholder="Cari ID Transaksi..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button
                    variant="outline"
                    className="h-11 px-4 rounded-xl gap-2 font-bold text-xs"
                    onClick={handleRefresh}
                    disabled={loading || isGlobalLoading}
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
                            ShopeePay Transaction
                        </CardTitle>
                        <Badge variant="outline" className="text-[10px] font-bold border-border bg-background">
                            {loading ? "Counting..." : `${filteredMutations.length} Records`}
                        </Badge>
                    </CardHeader>
                    <div className="w-full flex-1 overflow-x-auto overflow-y-auto max-h-[600px]">
                        <table className="w-full min-w-[850px] text-xs text-left">
                            <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur-md">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[9px] tracking-widest whitespace-nowrap">Waktu Transaksi</th>
                                    <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[9px] tracking-widest whitespace-nowrap">ID Transaksi</th>
                                    <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[9px] tracking-widest whitespace-nowrap">Metode Pembayaran</th>
                                    <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[9px] tracking-widest text-center whitespace-nowrap">Nominal</th>
                                    <th className="px-6 py-4 font-bold uppercase text-[9px] tracking-widest text-right whitespace-nowrap">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading || isGlobalLoading ? (
                                    Array.from({ length: 12 }).map((_, i) => (
                                        <tr key={i}><td colSpan={5} className="px-8 py-6"><Skeleton className="h-4 w-full" /></td></tr>
                                    ))
                                ) : !isConnected ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-24 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center gap-4 w-full">
                                                <div className="p-4 bg-muted rounded-full">
                                                    <ShieldAlert className="w-12 h-12 opacity-30" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-bold text-base uppercase tracking-widest text-foreground">Akun Belum Terhubung</p>
                                                    <p className="text-sm max-w-xs mx-auto text-muted-foreground">Silakan hubungkan akun ShopeePay Anda di Dashboard untuk melihat riwayat mutasi.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredMutations.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-24 text-center text-muted-foreground italic">
                                            <div className="flex flex-col items-center gap-2 opacity-30">
                                                <Clock className="w-10 h-10" />
                                                <p className="font-bold uppercase tracking-widest">Tidak ada transaksi ditemukan.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMutations.map((item) => (
                                        <tr key={item.transaction_id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-mono text-[10px] text-muted-foreground whitespace-nowrap uppercase">
                                                {item.created_at}
                                            </td>
                                            <td className="px-6 py-4 font-mono font-bold text-[11px] whitespace-nowrap uppercase text-foreground/80">
                                                {item.transaction_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-[#EE4D2D]/10 flex items-center justify-center p-1">
                                                        <img src="/assets/main/spm.png" alt="ShopeePay" className="w-full h-full object-contain" />
                                                    </div>
                                                    <span className="font-bold text-xs">ShopeePay</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold text-[13px] text-[#EE4D2D]">
                                                Rp {item.amount}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Badge className={`${item.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'
                                                    } border-none font-bold text-[9px] uppercase px-2 py-0.5 rounded-sm`}>
                                                    {item.status}
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
        </div>
    );
}
