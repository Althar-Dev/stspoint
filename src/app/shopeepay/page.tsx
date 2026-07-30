
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Wallet,
    RefreshCcw,
    Clock,
    Link as LinkIcon,
    ShieldAlert,
    PowerOff,
    Smartphone,
    ArrowUpRight,
    Loader2,
    User as UserIcon,
    QrCode,
    Save,
    Settings as SettingsIcon,
    Hash,
    AlertCircle,
    Key
} from "lucide-react";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { getShopeeMutations, type ShopeeMutationItem } from "@/lib/shopeepay/mutasi";

export default function ShopeepayDashboardPage() {
    const { user, loading: authLoading } = useUser();
    const db = useFirestore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const [innerToken, setInnerToken] = useState("");
    const [baseQrInput, setBaseQrInput] = useState("");
    const [digitSetting, setDigitSetting] = useState<string>("3");

    const [mutations, setMutations] = useState<ShopeeMutationItem[]>([]);
    const [stats, setStats] = useState({ totalNetSales: 0, totalCount: 0 });
    const [mutationsLoading, setMutationsLoading] = useState(false);
    const [isSessionExpired, setIsSessionExpired] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const shopeepayRef = useMemoFirebase(() => {
        if (!db || !user?.uid) return null;
        return doc(db, "users", user.uid, "services", "shopeepay");
    }, [db, user?.uid]);

    const { data: shopeepay, loading: serviceLoading } = useDoc(shopeepayRef);

    const isConnected = !!shopeepay?.token;

    /**
     * Helper: Parse amount & format Rupiah secara aman.
     * Mengubah string "5.170" atau float 5.17 menjadi integer murni (5170 IDR).
     */
    const parseShopeeAmount = (val: any): number => {
        if (val === null || val === undefined) return 0;
        if (typeof val === 'number') {
            if (val > 0 && val < 1000 && !Number.isInteger(val)) {
                return Math.round(val * 1000);
            }
            return Math.floor(val);
        }
        let str = String(val).trim();
        if (!str) return 0;

        if (str.includes('.')) {
            if (str.includes(',')) {
                str = str.replace(/\./g, '').replace(',', '.');
            } else {
                str = str.replace(/\./g, '');
            }
        } else if (str.includes(',')) {
            str = str.replace(',', '.');
        }

        const num = parseFloat(str);
        if (isNaN(num)) return 0;

        if (num > 0 && num < 1000 && !Number.isInteger(num)) {
            return Math.round(num * 1000);
        }

        return Math.floor(num);
    };

    useEffect(() => {
        if (shopeepay) {
            setBaseQrInput(shopeepay.baseQr || "");
            setDigitSetting(shopeepay.randomDigit?.toString() || "3");
        }
    }, [shopeepay]);

    const fetchLiveMutations = useCallback(async () => {
        if (isConnected && shopeepay?.token) {
            setMutationsLoading(true);
            try {
                const res = await getShopeeMutations({
                    token: shopeepay.token,
                    limit: 20
                });

                if (res.success) {
                    setMutations(res.data || []);
                    setStats({
                        totalNetSales: parseShopeeAmount(res.totalNetSales),
                        totalCount: res.total || 0
                    });
                    setIsSessionExpired(false);

                    if (res.data && res.data.length > 0 && shopeepayRef) {
                        const firstStoreName = res.data[0].store_name;
                        if (firstStoreName && firstStoreName !== shopeepay?.storeName) {
                            setDoc(shopeepayRef, { storeName: firstStoreName }, { merge: true });
                        }
                    }
                } else {
                    if (res.code === -1) {
                        setIsSessionExpired(true);
                    } else {
                        toast({ variant: "destructive", title: "API Error", description: res.message });
                    }
                }
            } catch (error) {
                console.error("Failed to fetch ShopeePay mutations:", error);
            } finally {
                setMutationsLoading(false);
            }
        }
    }, [isConnected, shopeepay?.token, shopeepay?.storeName, shopeepayRef]);

    useEffect(() => {
        fetchLiveMutations();
    }, [fetchLiveMutations, refreshKey]);

    const handleManualRefresh = () => {
        setRefreshKey(prev => prev + 1);
        toast({ title: "Syncing data...", description: "Menghubungkan ke server ShopeePay Merchant." });
    };

    const handleConnectAccount = async () => {
        if (!innerToken || !innerToken.startsWith("B:")) {
            toast({ variant: "destructive", title: "Invalid Token", description: "Masukkan Token ShopeePay yang valid (mulai dengan B:)." });
            return;
        }

        setIsProcessing(true);
        try {
            if (shopeepayRef) {
                await setDoc(shopeepayRef, {
                    username: "Shopee Merchant",
                    token: innerToken,
                    updatedAt: serverTimestamp()
                }, { merge: true });
            }

            setIsDialogOpen(false);
            setInnerToken("");
            setIsSessionExpired(false);
            setRefreshKey(prev => prev + 1);
            toast({ title: "Connected!", description: "Token ShopeePay berhasil disimpan." });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Gagal Menghubungkan", description: error.message });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSaveSettings = async () => {
        if (!shopeepayRef) return;
        setIsProcessing(true);
        try {
            await setDoc(shopeepayRef, {
                baseQr: baseQrInput,
                randomDigit: parseInt(digitSetting),
                updatedAt: serverTimestamp()
            }, { merge: true });
            toast({ title: "Settings Saved", description: "Konfigurasi ShopeePay diperbarui." });
            setIsSettingsOpen(false);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDisconnect = async () => {
        if (!shopeepayRef) return;
        setIsProcessing(true);
        try {
            await setDoc(shopeepayRef, {
                username: "",
                token: "",
                id: "",
                storeName: "",
                balance: 0,
                updatedAt: serverTimestamp()
            }, { merge: true });
            setMutations([]);
            setStats({ totalNetSales: 0, totalCount: 0 });
            toast({ title: "Disconnected", description: "Akun ShopeePay telah dilepas." });
        } finally {
            setIsProcessing(false);
        }
    };

    const isLoading = authLoading || serviceLoading;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 flex flex-col h-screen">
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                {isSessionExpired && (
                    <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                                <ShieldAlert className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-sm font-bold text-red-900">Sesi Kedaluwarsa</p>
                                <p className="text-xs text-red-700">Token ShopeePay Anda tidak lagi valid. Harap perbarui token.</p>
                            </div>
                        </div>
                        <Button size="sm" onClick={() => setIsDialogOpen(true)} className="bg-red-600 hover:bg-red-700 text-white font-bold h-9 px-4 rounded-lg text-xs uppercase">
                            Perbarui Token
                        </Button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 border border-border shadow-sm rounded-3xl bg-card overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#EE4D2D]/5 blur-[80px] -mr-32 -mt-32 transition-transform group-hover:scale-110"></div>
                        <CardContent className="p-6 md:p-10 relative z-10 h-full flex flex-col min-h-[220px]">
                            {isLoading ? (
                                <div className="space-y-6 h-full flex flex-col">
                                    <div className="flex justify-between items-start mb-auto">
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                        <Skeleton className="w-12 h-12 rounded-2xl" />
                                    </div>
                                    <div className="pb-4">
                                        <Skeleton className="h-10 w-48 mt-1" />
                                    </div>
                                    <div className="flex gap-3 pt-6 border-t border-border">
                                        <Skeleton className="h-12 w-32 rounded-xl" />
                                        <Skeleton className="h-12 w-32 rounded-xl" />
                                    </div>
                                </div>
                            ) : !isConnected ? (
                                <div className="flex flex-col items-center justify-center text-center py-4 space-y-4 h-full">
                                    <div className="w-16 h-16 rounded-full bg-[#EE4D2D]/5 flex items-center justify-center border border-dashed border-[#EE4D2D]/20 mb-2">
                                        <LinkIcon className="w-8 h-8 text-[#EE4D2D]/40" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-lg">ShopeePay Not Connected</h3>
                                        <p className="text-xs text-muted-foreground max-w-xs">
                                            Hubungkan akun ShopeePay Merchant Anda untuk mengaktifkan otomatisasi mutasi.
                                        </p>
                                    </div>
                                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                                        setIsDialogOpen(open);
                                        if (!open) { setInnerToken(""); }
                                    }}>
                                        <DialogTrigger asChild>
                                            <Button className="bg-[#EE4D2D] hover:bg-[#EE4D2D]/90 text-white font-bold rounded-xl px-8 h-12 shadow-xl shadow-[#EE4D2D]/10 transition-all active:scale-95">
                                                Hubungkan Sekarang
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="rounded-3xl border-border w-[94vw] md:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle className="font-headline font-bold">Connect ShopeePay</DialogTitle>
                                                <DialogDescription className="text-xs">
                                                    Masukkan Token ShopeePay yang didapatkan dari browser atau alat developer.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Shopee Token</Label>
                                                    <div className="relative">
                                                        <Key className="absolute left-3 top-4 w-4 h-4 text-muted-foreground" />
                                                        <Textarea
                                                            placeholder="B:ESn12eqh..."
                                                            value={innerToken}
                                                            onChange={(e) => setInnerToken(e.target.value)}
                                                            className="pl-10 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all min-h-[120px] font-mono text-[10px]"
                                                        />
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={handleConnectAccount}
                                                    className="w-full h-11 rounded-xl font-bold bg-[#EE4D2D] hover:bg-[#EE4D2D]/90 text-white gap-2"
                                                    disabled={isProcessing || !innerToken}
                                                >
                                                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                                                    Simpan Token
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center gap-2 mb-4">
                                        <div className="space-y-1">
                                            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Total Net Sales (Hari Ini)</p>
                                        </div>
                                        <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-[#EE4D2D]/5 flex items-center justify-center backdrop-blur-md border border-border group-hover:border-[#EE4D2D]/20 transition-colors p-2 shrink-0">
                                            <Image src="/assets/main/spm.png" alt="ShopeePay" width={40} height={40} className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                                        </div>
                                    </div>

                                    <div className="pb-4">
                                        {mutationsLoading ? (
                                            <Skeleton className="h-8 sm:h-10 w-32 sm:w-48 mt-1" />
                                        ) : (
                                            <div className="flex items-baseline gap-2">
                                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-headline font-bold tracking-tighter text-[#EE4D2D]">
                                                    Rp {stats.totalNetSales.toLocaleString('id-ID')}
                                                </h2>
                                                <Badge className="bg-green-500/10 text-green-600 border-none text-[8px] font-bold uppercase py-0 px-1.5 h-4">Live</Badge>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3 pt-4 sm:pt-6 border-t border-border">
                                        <Button
                                            className="w-full sm:w-auto bg-[#EE4D2D] text-white hover:bg-[#EE4D2D]/90 font-bold rounded-xl px-6 h-11 text-[10px] uppercase tracking-wider shadow-lg shadow-[#EE4D2D]/10 transition-all active:scale-95 gap-2"
                                            onClick={handleManualRefresh}
                                            disabled={mutationsLoading}
                                        >
                                            {mutationsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
                                            Refresh Mutasi
                                        </Button>
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="w-full sm:w-auto bg-transparent border-border hover:bg-accent font-bold rounded-xl px-6 h-11 text-[10px] uppercase tracking-wider transition-all active:scale-95"
                                        >
                                            <Link href="/shopeepay/transactions">Lihat Semua</Link>
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-1 border border-border shadow-sm rounded-3xl p-0 overflow-hidden bg-card flex flex-col">
                        <div className="p-6 flex-1 space-y-6">
                            {isLoading ? (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-6 w-16 rounded-full" />
                                    </div>
                                    <div className="space-y-4">
                                        <Skeleton className="h-14 w-full rounded-2xl" />
                                        <Skeleton className="h-10 w-full rounded-xl" />
                                    </div>
                                </div>
                            ) : !isConnected ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-6 space-y-4 opacity-30">
                                    <ShieldAlert className="w-6 h-6" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-center">ShopeePay Bridge: Offline</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Connection Info</h4>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-7 px-2 text-red-500 hover:bg-red-50 text-[10px] font-bold uppercase">
                                                    <PowerOff className="w-3 h-3 mr-1" /> Putuskan
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="rounded-3xl">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Putuskan Koneksi?</AlertDialogTitle>
                                                    <AlertDialogDescription>Token akan dihapus dari database Anda dan sinkronisasi mutasi akan berhenti.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
                                                    <AlertDialogAction onClick={handleDisconnect} className="bg-red-500 rounded-xl">Ya, Putuskan</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl border border-border">
                                            <UserIcon className="w-5 h-5 text-[#EE4D2D]" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold truncate">{shopeepay?.username || "Connected Account"}</p>
                                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                                                    {shopeepay?.storeName || "Active ShopeePay Node"}
                                                </p>
                                            </div>
                                        </div>

                                        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" className="w-full h-10 rounded-xl border-border bg-card shadow-sm gap-2 font-bold text-[10px] uppercase tracking-wider group hover:border-primary/20 transition-all">
                                                    <SettingsIcon className="w-3.5 h-3.5 text-[#EE4D2D]" />
                                                    Configuration
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="rounded-3xl border-border w-[94vw] md:max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle className="font-headline font-bold">ShopeePay Config</DialogTitle>
                                                    <DialogDescription className="text-xs">Sesuaikan payload QRIS dan kode nominal unik.</DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Base QR Payload</Label>
                                                        <Textarea
                                                            placeholder="Enter QR payload..."
                                                            value={baseQrInput}
                                                            onChange={(e) => setBaseQrInput(e.target.value)}
                                                            className="rounded-xl min-h-[120px] text-xs font-mono break-all bg-muted/30 border-transparent focus:bg-background transition-all"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Random Nominal Digit</Label>
                                                        <Select value={digitSetting} onValueChange={setDigitSetting}>
                                                            <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-transparent">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-xl">
                                                                <SelectItem value="2" className="text-xs">2 Digits (10 - 99)</SelectItem>
                                                                <SelectItem value="3" className="text-xs">3 Digits (100 - 999)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <Button onClick={handleSaveSettings} disabled={isProcessing} className="w-full h-11 rounded-xl font-bold bg-[#EE4D2D] text-white">
                                                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                                        Simpan Konfigurasi
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                <div className="w-full max-w-full grid grid-cols-1 min-w-0 overflow-hidden mt-6">
                    <Card className="border border-border shadow-sm rounded-xl overflow-hidden bg-card h-[450px] flex flex-col">
                        <CardHeader className="px-6 py-4 border-b border-border bg-slate-50/50 dark:bg-[#0A0A0A] flex flex-row items-center justify-between shrink-0">
                            <CardTitle className="text-[10px] md:text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                                <RefreshCcw className={`w-4 h-4 text-[#EE4D2D] ${mutationsLoading ? 'animate-spin' : ''}`} />
                                ShopeePay Transaction
                            </CardTitle>
                            <Badge variant="outline" className="text-[10px] font-bold border-border bg-background">
                                {mutations.length} Records
                            </Badge>
                        </CardHeader>
                        <div className="flex-1 overflow-x-auto overflow-y-auto w-full">
                            <table className="w-full min-w-[700px] text-xs text-left">
                                <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-md">
                                    <tr>
                                        <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[9px] tracking-widest whitespace-nowrap">Time</th>
                                        <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[9px] tracking-widest whitespace-nowrap">Transaction ID</th>
                                        <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[9px] tracking-widest whitespace-nowrap">Amount</th>
                                        <th className="px-6 py-4 font-bold text-muted-foreground uppercase text-[9px] tracking-widest text-right whitespace-nowrap">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {mutationsLoading ? (
                                        Array.from({ length: 8 }).map((_, i) => (
                                            <tr key={i}>
                                                <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                                                <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                                                <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                                <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
                                            </tr>
                                        ))
                                    ) : !isConnected ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-24 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center gap-2 opacity-20">
                                                    <LinkIcon className="w-10 h-10" />
                                                    <p className="text-[10px] font-bold uppercase tracking-widest">Connect account to see logs</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : mutations.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-24 text-center text-muted-foreground opacity-20">
                                                <p className="text-[10px] font-bold uppercase tracking-widest">Belum ada transaksi ditemukan</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        mutations.map((item) => (
                                            <tr key={item.transaction_id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 font-mono text-[10px] text-muted-foreground whitespace-nowrap uppercase">
                                                    {item.created_at}
                                                </td>
                                                <td className="px-6 py-4 font-mono font-bold text-[11px] whitespace-nowrap uppercase text-foreground/80">
                                                    {item.transaction_id}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-[13px] whitespace-nowrap text-[#EE4D2D]">
                                                    Rp {parseShopeeAmount(item.amount).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <Badge className={`${item.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'
                                                        } border-none font-bold text-[9px] uppercase px-2 py-0.5 rounded-sm shadow-none`}>
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
        </div>
    );
}