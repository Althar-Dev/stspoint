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
  Clock
} from "lucide-react";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

export default function OvoDashboardPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [baseQrInput, setBaseQrInput] = useState("");

  const ovoRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid, "services", "ovo");
  }, [db, user?.uid]);
  
  const { data: ovo, loading: serviceLoading } = useDoc(ovoRef);

  const isConnected = !!ovo?.token;

  useEffect(() => {
    if (ovo) {
      setBaseQrInput(ovo.baseQr || "");
    }
  }, [ovo]);

  const handleRequestOtp = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setStep(2);
      setIsProcessing(false);
      toast({ title: "OTP Dikirim", description: "Silakan cek SMS pada nomor OVO Anda." });
    }, 1500);
  };

  const handleVerifyOtp = async () => {
    if (!ovoRef) return;
    setIsProcessing(true);
    setTimeout(async () => {
      await setDoc(ovoRef, {
        username: phone,
        token: "OVO-MOCK-SESSION-TOKEN",
        id: `OVO-${Date.now()}`,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setIsDialogOpen(false);
      setStep(1);
      setIsProcessing(false);
      toast({ title: "Connected!", description: "Akun OVO berhasil terhubung sebagai Bridge." });
    }, 1500);
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
        id: "",
        balance: 0,
        updatedAt: serverTimestamp()
      }, { merge: true });
      toast({ title: "Disconnected", description: "Akun OVO telah dilepas dari sistem." });
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading = authLoading || serviceLoading || (!!user && !ovoRef);

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
                  <h3 className="font-bold text-lg">OVO Not Connected</h3>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Hubungkan akun OVO Merchant untuk otomatisasi mutasi QRIS.
                  </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) setStep(1);
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#4C2B9A] hover:bg-[#4C2B9A]/90 text-white font-bold rounded-xl px-8 h-12 shadow-xl shadow-[#4C2B9A]/10 transition-all active:scale-95">
                      Hubungkan Akun
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-3xl border-border w-[94vw] md:max-w-sm">
                    <DialogHeader>
                      <DialogTitle className="font-headline font-bold">
                        {step === 1 ? "Login OVO Merchant" : "Verifikasi OTP"}
                      </DialogTitle>
                    </DialogHeader>
                    {step === 1 ? (
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nomor OVO</Label>
                          <Input 
                            placeholder="0812xxxx" 
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value)}
                            className="rounded-xl h-12 border-border"
                          />
                        </div>
                        <Button 
                          onClick={handleRequestOtp} 
                          className="w-full h-11 rounded-xl font-bold bg-[#4C2B9A] text-white" 
                          disabled={isProcessing || !phone}
                        >
                          {isProcessing ? "Memproses..." : "Kirim OTP"}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4 py-4">
                        <div className="space-y-2 text-center">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Kode OTP</Label>
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
                          className="w-full h-11 rounded-xl font-bold bg-[#4C2B9A] text-white" 
                          disabled={isProcessing || !otpCode}
                        >
                          {isProcessing ? "Verifikasi..." : "Konfirmasi"}
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
                    <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Saldo OVO Cash</p>
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-4xl font-headline font-bold tracking-tighter">
                        Rp {(ovo?.balance || 0).toLocaleString('id-ID')}
                      </h2>
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[8px] font-bold uppercase py-0 px-1.5 h-4">Connected</Badge>
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-[#4C2B9A]/5 flex items-center justify-center border border-border p-1.5">
                    <Image src="/assets/main/ovo.png" alt="OVO" width={48} height={48} className="w-12 h-12 object-contain" />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 pt-6 border-t border-border">
                  <Button variant="outline" className="border-border hover:bg-accent font-bold rounded-xl px-8 h-12 text-[10px] uppercase tracking-wider" onClick={() => toast({ title: "Syncing..." })}>
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
                <p className="text-[10px] font-bold uppercase tracking-widest">OVO Service: Inactive</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Node Info</h4>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-red-500 hover:bg-red-50 text-[10px] font-bold uppercase">
                        <PowerOff className="w-3 h-3 mr-1" /> Putuskan
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-3xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Putuskan Koneksi?</AlertDialogTitle>
                        <AlertDialogDescription>Sesi OVO akan dihapus dan sinkronisasi akan berhenti.</AlertDialogDescription>
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
                    <UserIcon className="w-5 h-5 text-[#4C2B9A]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{ovo?.username}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Active OVO Bridge Node</p>
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
                        <DialogTitle className="font-headline font-bold">OVO Bridge Settings</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Master QR Payload</Label>
                          <Textarea 
                            placeholder="Enter QRIS string..." 
                            value={baseQrInput} 
                            onChange={(e) => setBaseQrInput(e.target.value)}
                            className="rounded-xl min-h-[120px] text-xs font-mono"
                          />
                        </div>
                        <Button onClick={handleSaveSettings} className="w-full h-11 rounded-xl font-bold bg-[#4C2B9A] text-white">Simpan Perubahan</Button>
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
              <RefreshCcw className="w-4 h-4 text-[#4C2B9A]" />
              OVO Mutation Log
           </CardTitle>
        </CardHeader>
        <div className="flex-1 overflow-auto flex items-center justify-center">
           <div className="text-center opacity-20">
              <Clock className="w-12 h-12 mx-auto mb-2" />
              <p className="text-[10px] font-bold uppercase tracking-widest">No Recent Mutations Found</p>
           </div>
        </div>
      </Card>
    </div>
  );
}
