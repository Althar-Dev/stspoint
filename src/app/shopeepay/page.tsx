
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
  Save,
  Settings as SettingsIcon,
  Hash
} from "lucide-react";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";
import { format } from "date-fns";

export default function ShopeepayDashboardPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  // Form states
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [baseQrInput, setBaseQrInput] = useState("");
  const [digitSetting, setDigitSetting] = useState<string>("3");

  const shopeepayRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid, "services", "shopeepay");
  }, [db, user?.uid]);
  
  const { data: shopeepay, loading: serviceLoading } = useDoc(shopeepayRef);

  const isConnected = !!shopeepay?.token;

  useEffect(() => {
    if (shopeepay) {
      setBaseQrInput(shopeepay.baseQr || "");
      setDigitSetting(shopeepay.randomDigit?.toString() || "3");
    }
  }, [shopeepay]);

  const mutations = []; // Placeholder for live mutations
  const mutationsLoading = false;

  const handleManualRefresh = () => {
    toast({ title: "Syncing data...", description: "Fetching latest mutations from ShopeePay." });
  };

  const handleRequestOtp = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setStep(2);
      setIsProcessing(false);
      toast({ title: "OTP Sent", description: "Cek aplikasi Shopee Anda." });
    }, 1500);
  };

  const handleVerifyOtp = async () => {
    if (!shopeepayRef) return;
    setIsProcessing(true);
    setTimeout(async () => {
      await updateDoc(shopeepayRef, {
        username: phone,
        token: "SPP-SESSION-TOKEN-MOCK",
        id: `SPP-${Date.now()}`,
        updatedAt: serverTimestamp()
      });
      setIsDialogOpen(false);
      setStep(1);
      setIsProcessing(false);
      toast({ title: "Connected!", description: "Akun ShopeePay berhasil terhubung." });
    }, 1500);
  };

  const handleSaveSettings = async () => {
    if (!shopeepayRef) return;
    setIsProcessing(true);
    try {
      await updateDoc(shopeepayRef, {
        baseQr: baseQrInput,
        randomDigit: parseInt(digitSetting),
        updatedAt: serverTimestamp()
      });
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
      await updateDoc(shopeepayRef, {
        username: "",
        token: "",
        id: "",
        balance: 0,
        updatedAt: serverTimestamp()
      });
      toast({ title: "Disconnected", description: "Akun ShopeePay telah dilepas." });
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading = authLoading || serviceLoading || (!!user && !shopeepayRef);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border border-border shadow-sm rounded-3xl bg-card overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#EE4D2D]/5 blur-[80px] -mr-32 -mt-32 transition-transform group-hover:scale-110"></div>
          <CardContent className="p-6 md:p-10 relative z-10 h-full flex flex-col justify-between min-h-[220px]">
            {isLoading ? (
              <div className="space-y-6">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-64" />
                  </div>
                  <Skeleton className="w-12 h-12 rounded-2xl" />
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
                    Hubungkan akun ShopeePay untuk mulai memantau mutasi otomatis.
                  </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) setStep(1);
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#EE4D2D] hover:bg-[#EE4D2D]/90 text-white font-bold rounded-xl px-8 h-12 shadow-xl shadow-[#EE4D2D]/10 transition-all active:scale-95">
                      Hubungkan Akun
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-3xl border-border w-[94vw] md:max-w-sm">
                    <DialogHeader>
                      <DialogTitle className="font-headline font-bold">
                        {step === 1 ? "Login Shopee" : "Verifikasi OTP"}
                      </DialogTitle>
                    </DialogHeader>
                    {step === 1 ? (
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nomor WhatsApp/Shopee</Label>
                          <Input 
                            placeholder="62812xxxx" 
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value)}
                            className="rounded-xl h-12 focus:ring-[#EE4D2D]/20 border-border"
                          />
                        </div>
                        <Button 
                          onClick={handleRequestOtp} 
                          className="w-full h-11 rounded-xl font-bold bg-[#EE4D2D] text-white" 
                          disabled={isProcessing || !phone}
                        >
                          {isProcessing ? "Memproses..." : "Lanjut Verifikasi"}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4 py-4">
                        <div className="space-y-2 text-center">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Masukkan Kode OTP</Label>
                          <Input 
                            placeholder="xxxx" 
                            value={otpCode} 
                            onChange={(e) => setOtpCode(e.target.value)}
                            className="h-14 text-center text-xl font-headline font-bold tracking-[0.5em] rounded-xl"
                            maxLength={6}
                          />
                        </div>
                        <Button 
                          onClick={handleVerifyOtp} 
                          className="w-full h-11 rounded-xl font-bold bg-[#EE4D2D] text-white" 
                          disabled={isProcessing || !otpCode}
                        >
                          {isProcessing ? "Verifikasi..." : "Konfirmasi Koneksi"}
                        </Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Saldo ShopeePay</p>
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-4xl font-headline font-bold tracking-tighter">
                        Rp {(shopeepay?.balance || 0).toLocaleString('id-ID')}
                      </h2>
                      <Badge className="bg-green-500/10 text-green-600 border-none text-[8px] font-bold uppercase py-0 px-1.5 h-4">Active</Badge>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-[#EE4D2D]/5 flex items-center justify-center border border-border group-hover:border-[#EE4D2D]/20 transition-colors">
                    <Icon icon="simple-icons:shopee" className="text-[#EE4D2D] w-6 h-6" />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 pt-6 border-t border-border">
                  <Button variant="outline" className="border-border hover:bg-accent font-bold rounded-xl px-8 h-12 text-[10px] uppercase tracking-wider transition-all" onClick={handleManualRefresh}>
                    Refresh Saldo
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 border border-border shadow-sm rounded-3xl p-0 overflow-hidden bg-card flex flex-col">
          <div className="p-6 flex-1 space-y-6">
            {!isConnected ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-6 space-y-4 opacity-30">
                <ShieldAlert className="w-6 h-6" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Service Status: Offline</p>
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
                        <AlertDialogDescription>Data sesi akan dihapus dan sinkronisasi otomatis akan berhenti.</AlertDialogDescription>
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
                      <p className="text-sm font-bold truncate">{shopeepay?.username}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Active ShopeePay Node</p>
                    </div>
                  </div>
                  
                  <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full h-10 rounded-xl border-border bg-card shadow-sm gap-2 font-bold text-[10px] uppercase tracking-wider group hover:border-[#EE4D2D]/20 transition-all">
                        <SettingsIcon className="w-3.5 h-3.5 text-[#EE4D2D]" />
                        Settings
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl border-border w-[94vw] md:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="font-headline font-bold">ShopeePay Settings</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Base QR Payload</Label>
                          <Textarea 
                            placeholder="Enter QR payload..." 
                            value={baseQrInput} 
                            onChange={(e) => setBaseQrInput(e.target.value)}
                            className="rounded-xl min-h-[120px] text-xs font-mono"
                          />
                        </div>
                        <Button onClick={handleSaveSettings} className="w-full h-11 rounded-xl font-bold bg-[#EE4D2D] text-white">Simpan Konfigurasi</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="border border-border shadow-sm rounded-xl overflow-hidden bg-card h-[400px] flex flex-col">
        <CardHeader className="px-6 py-4 border-b border-border bg-slate-50/50 dark:bg-[#0A0A0A]">
           <CardTitle className="text-sm font-bold flex items-center gap-2">
              <RefreshCcw className="w-4 h-4 text-[#EE4D2D]" />
              ShopeePay Transaction Log
           </CardTitle>
        </CardHeader>
        <div className="flex-1 overflow-auto flex items-center justify-center">
           <div className="text-center opacity-20">
              <Clock className="w-12 h-12 mx-auto mb-2" />
              <p className="text-[10px] font-bold uppercase tracking-widest">No Recent Transactions</p>
           </div>
        </div>
      </Card>
    </div>
  );
}
