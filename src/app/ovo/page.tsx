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
  const isLoading = authLoading || serviceLoading || (!!user && !ovoRef);

  /**
   * Helper: Parse numeric values safely from OVO formats
   */
  const parseNumericValue = (val: any): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') return parseFloat(val.replace(/[^0-9.-]+/g, "")) || 0;
    return 0;
  };

  /**
   * Data Fetching Logic - Aligned with AltharDev OVO Bridge API Docs
   */
  const fetchLiveData = useCallback(async () => {
    if (isConnected && ovo?.token && ovo?.deviceId) {
      setDataLoading(true);
      try {
        const [balanceRes, mutationRes] = await Promise.all([
          getOvoBalance({ token: ovo.token, deviceId: ovo.deviceId }),
          getOvoMutations({ token: ovo.token, deviceId: ovo.deviceId, limit: 15 })
        ]);

        if (balanceRes.success && balanceRes.data) {
          // Extract specific numerical values from docs: data.cash.card_balance
          setBalances({
            cash: parseNumericValue(balanceRes.data.cash?.card_balance || 0),
            points: parseNumericValue(balanceRes.data.point?.card_balance || 0)
          });
        }

        if (mutationRes.success && mutationRes.data && Array.isArray(mutationRes.data.orders)) {
          // Extract array from docs: data.orders
          setMutations(mutationRes.data.orders);
        } else {
          setMutations([]);
        }
      } catch (error) {
        console.error("OVO Sync Error:", error);
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
    toast({ title: "Syncing...", description: "Fetching latest data from OVO Bridge." });
  };

  // --- Auth Handlers ---

  const handleRequestOtp = async () => {
    if (!phone) return;
    setIsProcessing(true);
    try {
      const res = await requestOvoLogin({ phone, channel: 'WHATSAPP' });
      if (res.success && res.data) {
        setRefId(res.data.otp_refId); // Docs: otp_refId
        toast({ title: "OTP Sent", description: res.message });
        setStep(2);
      } else {
        throw new Error(res.message || "Failed to send OTP.");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login Error", description: error.message });
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
        toast({ title: "OTP Verified", description: "Please enter your OVO PIN." });
        setStep(3);
      } else {
        throw new Error(res.message || "Invalid OTP code.");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Verification Error", description: error.message });
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
        // Save token and deviceId from docs success response
        await setDoc(ovoRef, {
          username: phone || "OVO User",
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
        toast({ title: "Welcome!", description: "Account successfully connected." });
        setRefreshKey(prev => prev + 1);
      } else {
        throw new Error(res.message || "Invalid PIN or session expired.");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Access Denied", description: error.message });
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
      toast({ title: "Settings Saved", description: "OVO configuration updated." });
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
        deviceId: "",
        balance: 0,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setMutations([]);
      setBalances({ cash: 0, points: 0 });
      toast({ title: "Disconnected", description: "Your OVO account has been unlinked." });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Card */}
        <Card className="lg:col-span-2 border border-border shadow-sm rounded-3xl bg-card overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#4C2B9A]/5 blur-[80px] -mr-32 -mt-32 transition-transform group-hover:scale-110"></div>
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
                </div>
              </div>
            ) : !isConnected ? (
              <div className="flex flex-col items-center justify-center text-center py-4 space-y-4 h-full">
                <div className="w-16 h-16 rounded-full bg-[#4C2B9A]/5 flex items-center justify-center border border-dashed border-[#4C2B9A]/20 mb-2">
                  <LinkIcon className="w-8 h-8 text-[#4C2B9A]/40" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">OVO Inactive</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">Connect your OVO account to automate mutations and balance checks.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) { setStep(1); setOtpCode(""); setPinCode(""); }
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#4C2B9A] hover:bg-[#4C2B9A]/90 text-white font-bold rounded-xl px-8 h-12 shadow-xl shadow-[#4C2B9A]/10 transition-all active:scale-95">
                      Connect Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-[2.5rem] border-border w-[94vw] md:max-w-sm p-8">
                    <DialogHeader className="space-y-2">
                      <DialogTitle className="font-headline font-bold text-2xl text-center">
                        {step === 1 ? "OVO Login" : step === 2 ? "OTP Code" : "OVO PIN"}
                      </DialogTitle>
                      <DialogDescription className="text-xs text-center">
                        {step === 1 ? "Enter your phone number to receive a WhatsApp OTP." : 
                         step === 2 ? "Enter the 6-digit code received on WhatsApp." :
                         "Enter your 6-digit OVO security PIN."}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4">
                      {step === 1 && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Phone Number</Label>
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
                              className="h-14 text-center text-2xl font-headline font-bold tracking-[0.5em] rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all"
                              maxLength={6}
                            />
                          </div>
                          <Button onClick={handleVerifyOtp} className="w-full h-12 rounded-xl font-bold bg-[#4C2B9A] text-white shadow-lg shadow-[#4C2B9A]/20" disabled={isProcessing || !otpCode}>
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Verify OTP"}
                          </Button>
                        </div>
                      )}

                      {step === 3 && (
                        <div className="space-y-4">
                          <div className="space-y-2 text-center">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">PIN Code</Label>
                            <Input 
                              type="password"
                              placeholder="••••••" 
                              value={pinCode} 
                              onChange={(e) => setPinCode(e.target.value)}
                              className="h-14 text-center text-xl font-headline font-bold tracking-[0.8em] rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all"
                              maxLength={6}
                            />
                          </div>
                          <Button onClick={handleVerifyPin} className="w-full h-12 rounded-xl font-bold bg-[#4C2B9A] text-white shadow-lg shadow-[#4C2B9A]/20" disabled={isProcessing || !pinCode}>
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Authorize & Connect"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-auto">
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Available OVO Cash</p>
                    </div>
                    <div className="space-y-0.5">
                       <p className="text-muted-foreground text-[9px] font-bold uppercase tracking-tighter">OVO Points</p>
                       <p className="text-lg font-bold text-foreground/80">
                          {dataLoading ? "---" : `Rp ${balances.points.toLocaleString('id-ID')}`}
                       </p>
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-[#4C2B9A]/5 flex items-center justify-center border border-border group-hover:border-[#4C2B9A]/20 transition-colors">
                    <img src="/assets/main/ovo.png" alt="OVO" className="w-12 h-12 object-contain" />
                  </div>
                </div>

                <div className="pb-4">
                  {dataLoading ? (
                    <Skeleton className="h-10 w-48 mt-1" />
                  ) : (
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-xl md:text-4xl font-headline font-bold tracking-tighter text-[#4C2B9A]">
                        Rp {balances.cash.toLocaleString('id-ID')}
                      </h2>
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[8px] font-bold uppercase h-4 px-1.5 rounded-sm">Sync Active</Badge>
                    </div>
                  )}
                </div>

                <div className="flex wrap gap-3 pt-6 border-t border-border">
                  <Button 
                    variant="outline" 
                    className="bg-transparent border-border hover:bg-accent font-bold rounded-xl px-8 h-12 text-[10px] uppercase tracking-wider gap-2" 
                    onClick={handleManualRefresh}
                    disabled={dataLoading}
                  >
                    {dataLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
                    Refresh
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Info Column */}
        <Card className="lg:col-span-1 border border-border shadow-sm rounded-3xl p-0 overflow-hidden bg-card flex flex-col">
          <div className="p-6 flex-1 space-y-6">
            {!isConnected && !isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-6 space-y-4 opacity-30">
                <ShieldAlert className="w-6 h-6" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Node Offline</p>
              </div>
            ) : isConnected ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Active Node</h4>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-red-500 hover:bg-red-50 text-[10px] font-bold uppercase">
                        <PowerOff className="w-3 h-3 mr-1" /> Disconnect
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-3xl border-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-headline font-bold">Disconnect Account?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm">This will clear your OVO session token and stop automation.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDisconnect} className="bg-red-600 text-white rounded-xl">Confirm</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl border border-border">
                    <UserIcon className="w-5 h-5 text-[#4C2B9A]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{ovo?.username || "OVO Merchant"}</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Standard Channel</p>
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
                        <DialogTitle className="font-headline font-bold">OVO Config</DialogTitle>
                        <DialogDescription className="text-xs">Manage static QR payloads for dynamic generation.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Master QR Payload</Label>
                          <Textarea 
                            placeholder="Paste your OVO static QR string here..." 
                            value={baseQrInput} 
                            onChange={(e) => setBaseQrInput(e.target.value)}
                            className="rounded-xl min-h-[120px] text-xs font-mono bg-muted/30 border-transparent focus:bg-background transition-all break-all"
                          />
                        </div>
                        <Button onClick={handleSaveSettings} disabled={isProcessing} className="w-full h-11 rounded-xl font-bold bg-[#4C2B9A] text-white">
                           {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                           Save Settings
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

      {/* Mutations Table */}
      <div className="w-full max-w-full grid grid-cols-1 min-w-0 overflow-hidden">
        <Card className="border border-border shadow-sm rounded-3xl overflow-hidden bg-card h-[450px] flex flex-col">
          <CardHeader className="px-8 py-5 border-b border-border bg-slate-50/50 dark:bg-[#0A0A0A] flex flex-row items-center justify-between shrink-0">
             <CardTitle className="text-[12px] md:text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                <RefreshCcw className={`w-4 h-4 text-[#4C2B9A] ${dataLoading ? 'animate-spin' : ''}`} />
                OVO Transactions
             </CardTitle>
             <Badge variant="outline" className="border-border text-[9px] font-bold h-6 uppercase">{Array.isArray(mutations) ? mutations.length : 0} Records</Badge>
          </CardHeader>
          <div className="flex-1 overflow-x-auto overflow-y-auto w-full">
             <table className="w-full min-w-[700px] text-left text-xs">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur-md z-10">
                   <tr className="border-b border-border">
                      <th className="px-8 py-3 font-bold text-muted-foreground uppercase text-[9px] tracking-widest whitespace-nowrap">Source / Description</th>
                      <th className="px-6 py-3 font-bold text-muted-foreground uppercase text-[9px] tracking-widest text-center whitespace-nowrap">Amount</th>
                      <th className="px-6 py-3 font-bold text-muted-foreground uppercase text-[9px] tracking-widest text-center whitespace-nowrap">Type</th>
                      <th className="px-8 py-3 font-bold text-muted-foreground uppercase text-[9px] tracking-widest text-right whitespace-nowrap">Waktu</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {dataLoading ? (
                     Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}><td colSpan={4} className="px-8 py-6"><Skeleton className="h-4 w-full" /></td></tr>
                     ))
                  ) : !Array.isArray(mutations) || mutations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-24 text-center text-muted-foreground">
                         <div className="flex flex-col items-center gap-3 opacity-20">
                            <Clock className="w-10 h-10" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">No mutations found</p>
                         </div>
                      </td>
                    </tr>
                  ) : mutations.map((item, i) => {
                    const amtValue = parseNumericValue(item.transaction_amount);
                    const isTopup = String(item.transaction_type || "").includes("TOPUP") || (item.emoney_topup && item.emoney_topup > 0);
                    
                    return (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-4 whitespace-nowrap">
                           <div className="flex flex-col">
                              <span className="font-bold text-foreground/80">{item.merchant_name || item.desc1 || "OVO Transaction"}</span>
                              <span className="text-[10px] text-muted-foreground italic truncate max-w-[200px]">{item.desc2}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`font-bold ${isTopup ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {isTopup ? '+' : '-'}Rp {Math.abs(amtValue).toLocaleString('id-ID')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Badge variant="outline" className="border-border text-[8px] uppercase font-bold px-1.5 h-4">
                            {item.transaction_type || "FINANCIAL"}
                          </Badge>
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap text-right text-muted-foreground font-medium text-[10px]">
                           {item.transaction_date} {item.transaction_time}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
             </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
