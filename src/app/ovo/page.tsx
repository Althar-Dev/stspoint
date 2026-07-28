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
  Wallet, 
  RefreshCcw, 
  Link as LinkIcon, 
  ShieldAlert, 
  PowerOff, 
  Smartphone, 
  Loader2, 
  User as UserIcon,
  Save,
  Settings as SettingsIcon,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

// OVO Library Imports
import { requestOvoLogin, verifyOvoOtp, verifyOvoPin } from "@/lib/ovo/auth";
import { getOvoBalance, getOvoMutations } from "@/lib/ovo/data";

export default function OvoDashboardPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  
  // Connection Flow States
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Auth Context
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [refId, setRefId] = useState("");

  // Live Data States
  const [balances, setBalances] = useState({ cash: 0, points: 0 });
  const [mutations, setMutations] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Settings
  const [baseQrInput, setBaseQrInput] = useState("");

  const ovoRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid, "services", "ovo");
  }, [db, user?.uid]);
  
  const { data: ovo, loading: serviceLoading } = useDoc(ovoRef);

  const isConnected = !!ovo?.token;
  const isLoading = authLoading || serviceLoading;

  // Helper to extract numeric values safely from various OVO API formats
  const parseNumericValue = (val: any): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') return parseFloat(val.replace(/[^0-9.-]+/g, "")) || 0;
    if (typeof val === 'object') {
      return parseNumericValue(val.card_balance || val.amount || val.value || 0);
    }
    return 0;
  };

  // Data Fetching Logic
  const fetchLiveData = useCallback(async () => {
    if (isConnected && ovo?.token && ovo?.deviceId) {
      setDataLoading(true);
      try {
        const [balanceRes, mutationRes] = await Promise.all([
          getOvoBalance({ token: ovo.token, deviceId: ovo.deviceId }),
          getOvoMutations({ token: ovo.token, deviceId: ovo.deviceId, limit: 15 })
        ]);

        if (balanceRes.success && balanceRes.data) {
          setBalances({
            cash: parseNumericValue(balanceRes.data.cash),
            points: parseNumericValue(balanceRes.data.point)
          });
        }

        // Robust array detection for mutations
        if (mutationRes.success && mutationRes.data) {
          const rawData = mutationRes.data;
          const orders = rawData.orders || (Array.isArray(rawData) ? rawData : []);
          setMutations(orders);
        } else {
          setMutations([]);
        }
      } catch (error) {
        console.error("OVO Data Sync Error:", error);
        setMutations([]);
      } finally {
        setDataLoading(false);
      }
    }
  }, [isConnected, ovo?.token, ovo?.deviceId]);

  useEffect(() => {
    if (isConnected) {
      fetchLiveData();
    }
  }, [fetchLiveData, refreshKey]);

  const handleManualRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast({ title: "Syncing...", description: "Memperbarui saldo dan log mutasi dari OVO Bridge." });
  };

  const handleRequestOtp = async () => {
    if (!phone) return;
    setIsProcessing(true);
    try {
      const res = await requestOvoLogin({ phone, channel: 'WHATSAPP' });
      if (res.success && res.data) {
        // Support multiple refId keys
        setRefId(res.data.otp_refId || res.data.refId);
        setStep(2);
        toast({ title: "OTP Sent", description: res.message || "Silakan cek WhatsApp Anda." });
      } else {
        throw new Error(res.message || "Gagal meminta OTP.");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || !refId) return;
    setIsProcessing(true);
    try {
      const res = await verifyOvoOtp({ refId, otp: otpCode });
      if (res.success) {
        setStep(3);
        toast({ title: "OTP Verified", description: res.message || "Silakan masukkan PIN OVO Anda." });
      } else {
        throw new Error(res.message || "Kode OTP tidak valid.");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyPin = async () => {
    if (!pinCode || !refId) return;
    setIsProcessing(true);
    try {
      const res = await verifyOvoPin({ refId, pin: pinCode });
      if (res.success && res.data && ovoRef) {
        await setDoc(ovoRef, {
          username: phone || ovo?.username || "OVO User",
          token: res.data.token,
          refreshToken: res.data.refreshToken,
          deviceId: res.data.deviceId,
          updatedAt: serverTimestamp()
        }, { merge: true });
        
        setIsDialogOpen(false);
        setStep(1);
        setPhone("");
        setOtpCode("");
        setPinCode("");
        toast({ title: "Connected!", description: "Akun OVO berhasil terhubung." });
        setRefreshKey(prev => prev + 1);
      } else {
        throw new Error(res.message || "PIN salah atau sesi kedaluwarsa.");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!ovoRef) return;
    setIsProcessing(true);
    try {
      await setDoc(ovoRef, {
        baseQr: baseQrInput,
        updatedAt: serverTimestamp()
      }, { merge: true });
      toast({ title: "Settings Saved", description: "Konfigurasi OVO diperbarui." });
      setIsSettingsOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!ovoRef) return;
    setIsProcessing(true);
    try {
      await setDoc(ovoRef, {
        username: "",
        token: "",
        refreshToken: "",
        balance: 0,
        deviceId: "",
        updatedAt: serverTimestamp()
      }, { merge: true });
      setMutations([]);
      setBalances({ cash: 0, points: 0 });
      toast({ title: "Disconnected", description: "Akun OVO telah dilepas." });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border border-border shadow-sm rounded-3xl bg-card overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#4C2B9A]/5 blur-[80px] -mr-32 -mt-32 transition-transform group-hover:scale-110"></div>
          <CardContent className="p-6 md:p-10 relative z-10 h-full flex flex-col justify-between min-h-[220px]">
            {isLoading ? (
              <div className="space-y-6">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-64" />
                  </div>
                </div>
              </div>
            ) : !isConnected ? (
              <div className="flex flex-col items-center justify-center text-center py-4 space-y-4 h-full">
                <div className="w-16 h-16 rounded-full bg-[#4C2B9A]/5 flex items-center justify-center border border-dashed border-[#4C2B9A]/20 mb-2">
                  <LinkIcon className="w-8 h-8 text-[#4C2B9A]/40" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">OVO Bridge Inactive</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">Hubungkan akun OVO untuk monitoring saldo dan mutasi otomatis.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) { setStep(1); setOtpCode(""); setPinCode(""); }
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#4C2B9A] hover:bg-[#4C2B9A]/90 text-white font-bold rounded-xl px-8 h-12 shadow-xl shadow-[#4C2B9A]/10">
                      Hubungkan Sekarang
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-[2rem] border-border w-[94vw] md:max-w-sm p-8">
                    <DialogHeader className="space-y-3">
                      <DialogTitle className="font-headline font-bold text-2xl text-center">
                        {step === 1 ? "Login OVO" : step === 2 ? "Verify OTP" : "Enter PIN"}
                      </DialogTitle>
                      <DialogDescription className="text-xs text-center">
                        {step === 1 ? "Masukkan nomor OVO untuk menerima kode OTP." : 
                         step === 2 ? "Masukkan kode yang dikirim ke nomor WhatsApp Anda." :
                         "Langkah terakhir, masukkan 6 digit PIN OVO Anda."}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4">
                      {step === 1 && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nomor Handphone</Label>
                            <div className="relative">
                              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input 
                                placeholder="0812xxxx" 
                                value={phone} 
                                onChange={(e) => setPhone(e.target.value)}
                                className="pl-10 rounded-xl h-12 bg-muted/50 border-transparent focus:bg-background transition-all font-bold"
                              />
                            </div>
                          </div>
                          <Button onClick={handleRequestOtp} className="w-full h-12 rounded-xl font-bold bg-[#4C2B9A] text-white shadow-lg shadow-[#4C2B9A]/20" disabled={isProcessing || !phone}>
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Request OTP"}
                          </Button>
                        </div>
                      )}

                      {step === 2 && (
                        <div className="space-y-4">
                          <div className="space-y-2 text-center">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">OTP Code</Label>
                            <Input 
                              placeholder="xxxx" 
                              value={otpCode} 
                              onChange={(e) => setOtpCode(e.target.value)}
                              className="h-14 text-center text-2xl font-headline font-bold tracking-[0.5em] rounded-xl bg-muted/50 border-transparent focus:bg-background transition-all"
                              maxLength={6}
                            />
                          </div>
                          <Button onClick={handleVerifyOtp} className="w-full h-12 rounded-xl font-bold bg-[#4C2B9A] text-white shadow-lg shadow-[#4C2B9A]/20" disabled={isProcessing || !otpCode || !refId}>
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Verifikasi OTP"}
                          </Button>
                        </div>
                      )}

                      {step === 3 && (
                        <div className="space-y-4">
                          <div className="space-y-2 text-center">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Security PIN</Label>
                            <Input 
                              type="password"
                              placeholder="••••••" 
                              value={pinCode} 
                              onChange={(e) => setPinCode(e.target.value)}
                              className="h-14 text-center text-xl font-headline font-bold tracking-[0.8em] rounded-xl bg-muted/50 border-transparent focus:bg-background transition-all"
                              maxLength={6}
                            />
                          </div>
                          <Button onClick={handleVerifyPin} className="w-full h-12 rounded-xl font-bold bg-[#4C2B9A] text-white shadow-lg shadow-[#4C2B9A]/20" disabled={isProcessing || !pinCode || !refId}>
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Verify PIN & Connect"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Available OVO Cash</p>
                      <div className="flex items-baseline gap-2">
                        {dataLoading ? <Skeleton className="h-10 w-48 mt-1" /> : (
                          <h2 className="text-4xl font-headline font-bold tracking-tighter text-[#4C2B9A]">
                            Rp {balances.cash.toLocaleString('id-ID')}
                          </h2>
                        )}
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[8px] font-bold uppercase h-4 px-1.5 rounded-sm">Connected</Badge>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                       <p className="text-muted-foreground text-[9px] font-bold uppercase tracking-tighter">OVO Points</p>
                       <p className="text-lg font-bold text-foreground/80">
                          {dataLoading ? "---" : `Rp ${balances.points.toLocaleString('id-ID')}`}
                       </p>
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-[#4C2B9A]/5 flex items-center justify-center border border-border group-hover:border-[#4C2B9A]/20 transition-colors">
                    <img src="/assets/main/ovo.png" alt="OVO" className="w-12 h-12 object-contain" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 pt-6 border-t border-border">
                  <Button 
                    variant="outline" 
                    className="bg-transparent border-border hover:bg-accent font-bold rounded-xl px-8 h-12 text-[10px] uppercase tracking-wider gap-2 shadow-sm" 
                    onClick={handleManualRefresh}
                    disabled={dataLoading}
                  >
                    {dataLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
                    Refresh Data
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 border border-border shadow-sm rounded-3xl p-0 overflow-hidden bg-card flex flex-col">
          <div className="p-6 flex-1 space-y-6">
            {!isConnected && !isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-6 space-y-4 opacity-30">
                <ShieldAlert className="w-6 h-6" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-center">System Offline</p>
              </div>
            ) : isConnected ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Bridge Node</h4>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-red-500 hover:bg-red-50 text-[10px] font-bold uppercase">
                        <PowerOff className="w-3 h-3 mr-1" /> Putuskan
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-3xl border-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-headline font-bold">Putuskan Sesi OVO?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm">Anda harus melakukan login ulang untuk mengaktifkan kembali.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDisconnect} className="bg-red-600 text-white rounded-xl">Ya, Putuskan</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl border border-border">
                    <UserIcon className="w-5 h-5 text-[#4C2B9A]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{ovo?.username || "OVO User"}</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Active Connection</p>
                    </div>
                  </div>
                  <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full h-10 rounded-xl border-border bg-card shadow-sm gap-2 font-bold text-[10px] uppercase tracking-wider group hover:border-[#4C2B9A]/20 transition-all">
                        <SettingsIcon className="w-3.5 h-3.5 text-[#4C2B9A]" />
                        Configuration
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl border-border w-[94vw] md:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="font-headline font-bold">OVO Configuration</DialogTitle>
                        <DialogDescription className="text-xs">Ubah master payload untuk generate QRIS otomatis.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Master QR Payload</Label>
                          <Textarea 
                            placeholder="Enter QRIS string..." 
                            value={baseQrInput} 
                            onChange={(e) => setBaseQrInput(e.target.value)}
                            className="rounded-xl min-h-[120px] text-xs font-mono bg-muted/30 border-transparent focus:bg-background transition-all"
                          />
                        </div>
                        <Button onClick={handleSaveSettings} disabled={isProcessing} className="w-full h-11 rounded-xl font-bold bg-[#4C2B9A] text-white">
                           {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                           Simpan Pengaturan
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ) : null}
          </div>
        </Card>
      </div>

      <Card className="border border-border shadow-sm rounded-3xl overflow-hidden bg-card h-[450px] flex flex-col">
        <CardHeader className="px-8 py-5 border-b border-border bg-slate-50/50 dark:bg-[#0A0A0A] flex flex-row items-center justify-between shrink-0">
           <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
              <RefreshCcw className={`w-4 h-4 text-[#4C2B9A] ${dataLoading ? 'animate-spin' : ''}`} />
              OVO Transaction Journal
           </CardTitle>
           <Badge variant="outline" className="border-border text-[9px] font-bold h-6 uppercase">{Array.isArray(mutations) ? mutations.length : 0} Recent Records</Badge>
        </CardHeader>
        <div className="flex-1 overflow-auto w-full">
           <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-muted/80 backdrop-blur-md z-10">
                 <tr className="border-b border-border">
                    <th className="px-8 py-3 font-bold text-muted-foreground uppercase text-[9px] tracking-widest">Merchant / Desc</th>
                    <th className="px-6 py-3 font-bold text-muted-foreground uppercase text-[9px] tracking-widest text-center">Amount</th>
                    <th className="px-6 py-3 font-bold text-muted-foreground uppercase text-[9px] tracking-widest text-center">Status</th>
                    <th className="px-8 py-3 font-bold text-muted-foreground uppercase text-[9px] tracking-widest text-right">Time</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dataLoading ? (
                   Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={4} className="px-8 py-6"><Skeleton className="h-4 w-full" /></td></tr>
                   ))
                ) : (!Array.isArray(mutations) || mutations.length === 0) ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-24 text-center text-muted-foreground">
                       <div className="flex flex-col items-center gap-3 opacity-20">
                          <Clock className="w-10 h-10" />
                          <p className="text-[10px] font-bold uppercase tracking-widest">No mutations found</p>
                       </div>
                    </td>
                  </tr>
                ) : mutations.map((item, i) => {
                  const amtValue = parseNumericValue(item.transaction_amount || item.amount);
                  const isTopup = String(item.transaction_type || "").toUpperCase().includes("TOPUP") || amtValue > 0;
                  
                  return (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4 whitespace-nowrap font-bold text-foreground/80">
                        {item.merchant_name || item.desc1 || "OVO Transaction"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`font-bold ${isTopup ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {isTopup ? '+' : '-'}Rp {Math.abs(amtValue).toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-bold text-[8px] uppercase px-2 py-0.5 rounded-sm">{item.status || "SUCCESS"}</Badge>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-right text-muted-foreground font-medium text-[10px]">
                         {item.transaction_date || ""} {item.transaction_time || ""}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
           </table>
        </div>
      </Card>
      <div className="text-center pt-4 pb-8 opacity-20">
         <p className="text-[9px] font-bold uppercase tracking-[0.5em]">STSPoint OVO Node ID: Node-04-JKT</p>
      </div>
    </div>
  );
}
