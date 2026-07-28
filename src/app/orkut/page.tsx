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
  RefreshCcw,
  Clock,
  Link as LinkIcon,
  ShieldAlert,
  Lock,
  PowerOff,
  ArrowUpRight,
  User as UserIcon,
  QrCode,
  Save,
  Loader2,
  Activity,
  Copy,
  Settings as SettingsIcon,
  Hash
} from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { requestOrderkuotaOtp, getOrderkuotaToken } from "@/lib/orderkuota/connect";
import { getOrderkuotaMutation, type OrderkuotaMutationItem } from "@/lib/orderkuota/mutation";
import { getOrderkuotaProfile } from "@/lib/orderkuota/profile";

export default function OrkutPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  // Service Health & Balance Loading
  const [serviceStatus, setServiceStatus] = useState<"Operational" | "Unstable" | "Maintenance">("Operational");
  const [isSyncingBalance, setIsSyncingBalance] = useState(false);

  // Mutations state
  const [mutations, setMutations] = useState<OrderkuotaMutationItem[]>([]);
  const [mutationsLoading, setMutationsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpInfo, setOtpInfo] = useState("");
  const [baseQrInput, setBaseQrInput] = useState("");
  const [digitSetting, setDigitSetting] = useState<string>("3");

  const orderkuotaRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid, "services", "orderkuota");
  }, [db, user?.uid]);
  
  const { data: orderkuota, loading: serviceLoading } = useDoc(orderkuotaRef);

  const isConnected = !!orderkuota?.token;

  useEffect(() => {
    if (orderkuota) {
      setBaseQrInput(orderkuota.baseQr || "");
      setDigitSetting(orderkuota.randomDigit?.toString() || "3");
    }
  }, [orderkuota]);

  // Fetch real-time balance from API and update Firestore
  const fetchLiveBalance = useCallback(async () => {
    if (isConnected && orderkuota?.username && orderkuota?.token && orderkuotaRef) {
      setIsSyncingBalance(true);
      try {
        const res = await getOrderkuotaProfile({
          username: orderkuota.username,
          token: orderkuota.token
        });
        
        if (res.status && res.result?.success) {
          const apiBalance = res.result.account.results.balance;
          // Update Firestore if local balance differs or just to stay fresh
          await updateDoc(orderkuotaRef, {
            balance: apiBalance,
            updatedAt: serverTimestamp()
          });
        }
      } catch (error) {
        console.error("Failed to sync real-time balance:", error);
      } finally {
        setIsSyncingBalance(false);
      }
    }
  }, [isConnected, orderkuota?.username, orderkuota?.token, orderkuotaRef]);

  // Fetch real-time mutations from API
  const fetchLiveMutations = useCallback(async () => {
    if (isConnected && orderkuota?.username && orderkuota?.token) {
      setMutationsLoading(true);
      try {
        const res = await getOrderkuotaMutation({
          username: orderkuota.username,
          token: orderkuota.token
        });
        if (res.status && res.result) {
          const filtered = res.result.filter((item: OrderkuotaMutationItem) => item.status === "IN");
          setMutations(filtered);
          setServiceStatus("Operational");
        } else {
          setServiceStatus("Unstable");
        }
      } catch (error: any) {
        console.error("Failed to fetch live mutations:", error);
        setServiceStatus("Maintenance");
      } finally {
        setMutationsLoading(false);
      }
    } else {
      setMutations([]);
    }
  }, [isConnected, orderkuota?.username, orderkuota?.token]);

  useEffect(() => {
    if (isConnected) {
      fetchLiveBalance();
      fetchLiveMutations();
    }
  }, [isConnected, fetchLiveBalance, fetchLiveMutations, refreshKey]);

  const handleManualRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast({ title: "Syncing...", description: "Memperbarui saldo dan log mutasi dari Orderkuota." });
  };

  const handleRequestOtp = async () => {
    if (!username || !password) {
      toast({ variant: "destructive", title: "Missing Info", description: "Please fill username and password." });
      return;
    }
    setIsProcessing(true);
    try {
      const res = await requestOrderkuotaOtp({ username, password });
      if (res.status && res.result) {
        setOtpInfo(res.result.otp_value);
        setStep(2);
        toast({ title: "OTP Sent", description: `Check your ${res.result.otp}: ${res.result.otp_value}` });
      } else {
        throw new Error(res.message || "Failed to get OTP");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "OTP Error", description: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast({ variant: "destructive", title: "Missing OTP", description: "Please enter the OTP code." });
      return;
    }
    setIsProcessing(true);
    try {
      const res = await getOrderkuotaToken({ username, otp });
      if (res.status && res.result && orderkuotaRef) {
        await updateDoc(orderkuotaRef, {
          id: res.result.id,
          username: res.result.username,
          token: res.result.token,
          balance: parseFloat(res.result.balance),
          updatedAt: serverTimestamp()
        });
        
        setIsDialogOpen(false);
        setStep(1);
        setOtp("");
        toast({ title: "Connected!", description: `Successfully linked account: ${res.result.name}` });
        setRefreshKey(prev => prev + 1);
      } else {
        throw new Error(res.message || "Invalid OTP or Token expired");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Verification Failed", description: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!orderkuotaRef) return;
    setIsProcessing(true);
    try {
      await updateDoc(orderkuotaRef, {
        baseQr: baseQrInput,
        randomDigit: parseInt(digitSetting),
        updatedAt: serverTimestamp()
      });
      toast({ title: "Settings Saved", description: "Orderkuota configuration has been updated." });
      setIsSettingsOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Save Failed", description: "Failed to update settings." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!orderkuotaRef) return;
    setIsProcessing(true);
    try {
      await updateDoc(orderkuotaRef, {
        id: "",
        username: "",
        token: "",
        balance: 0,
        updatedAt: serverTimestamp()
      });
      setMutations([]);
      toast({ title: "Disconnected", description: "Your Orkut account has been unlinked." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: "Failed to disconnect account." });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
    });
  };

  const isLoading = authLoading || serviceLoading || (!!user && !orderkuotaRef);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border border-border shadow-sm rounded-3xl bg-card text-card-foreground p-0.5 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -mr-32 -mt-32 transition-transform group-hover:scale-110"></div>
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
                <div className="flex gap-3 pt-6 border-t border-border">
                  <Skeleton className="h-12 w-32 rounded-xl" />
                  <Skeleton className="h-12 w-32 rounded-xl" />
                </div>
              </div>
            ) : !isConnected ? (
              <div className="flex flex-col items-center justify-center text-center py-4 space-y-4 h-full">
                <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center border border-dashed border-primary/20 mb-2">
                  <LinkIcon className="w-8 h-8 text-primary/40" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">Orderkuota Not Connected</h3>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Connect your Orderkuota Account first to access real-time features.
                  </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) { setStep(1); setOtp(""); }
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary text-primary-foreground font-bold rounded-xl px-8 h-12 shadow-xl shadow-primary/10 transition-all active:scale-95">
                      Connect Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-3xl border-border w-[94vw] md:max-w-sm">
                    <DialogHeader>
                      <DialogTitle className="font-headline font-bold">
                        {step === 1 ? "Connect Orderkuota" : "Verify OTP"}
                      </DialogTitle>
                      <DialogDescription className="text-xs">
                        {step === 1 
                          ? "Enter your Orkut username and password to receive an OTP."
                          : `Enter the code sent to ${otpInfo}`}
                      </DialogDescription>
                    </DialogHeader>
                    
                    {step === 1 ? (
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Username</Label>
                          <Input 
                            placeholder="Your Orkut Username" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)}
                            className="rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            <Input 
                              type="password"
                              placeholder="Orkut Password" 
                              value={password} 
                              onChange={(e) => setPassword(e.target.value)}
                              className="pl-10 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all"
                            />
                          </div>
                        </div>
                        <Button 
                          onClick={handleRequestOtp} 
                          className="w-full h-11 rounded-xl font-bold" 
                          disabled={isProcessing || !username || !password}
                        >
                          {isProcessing ? "Processing..." : "Get OTP Code"}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4 py-4">
                        <div className="space-y-2 text-center">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">OTP Code</Label>
                          <Input 
                            placeholder="Enter Code" 
                            value={otp} 
                            onChange={(e) => setOtp(e.target.value)}
                            className="h-14 text-center text-xl font-headline font-bold tracking-[0.5em] rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all"
                            maxLength={6}
                          />
                        </div>
                        <Button 
                          onClick={handleVerifyOtp} 
                          className="w-full h-11 rounded-xl font-bold" 
                          disabled={isProcessing || !otp}
                        >
                          {isProcessing ? "Verifying..." : "Verify & Connect"}
                        </Button>
                        <Button 
                          variant="ghost" 
                          onClick={() => setStep(1)} 
                          className="w-full text-xs font-bold"
                          disabled={isProcessing}
                        >
                          Back
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
                    <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Available Balance (Orderkuota)</p>
                    <div className="flex items-baseline gap-2">
                      {isSyncingBalance ? (
                         <Skeleton className="h-10 w-48 mt-1" />
                      ) : (
                        <h2 className="text-4xl font-headline font-bold tracking-tighter">
                          Rp {(orderkuota?.balance || 0).toLocaleString('id-ID')}
                        </h2>
                      )}
                      <Badge variant="outline" className="bg-green-500/5 text-green-600 border-green-500/20 text-[8px] font-bold uppercase py-0 px-1.5 h-4">Verified</Badge>
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center backdrop-blur-md border border-border group-hover:border-primary/20 transition-colors p-1.5">
                    <Image src="/assets/img/orkut.png" alt="Orderkuota" width={48} height={48} className="w-12 h-12 object-contain" />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 pt-6 border-t border-border">
                  <Button 
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl px-8 h-12 text-[10px] uppercase tracking-wider shadow-xl shadow-primary/10 transition-all active:scale-95"
                    onClick={handleManualRefresh}
                    disabled={isSyncingBalance || mutationsLoading}
                  >
                    {isSyncingBalance ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Refresh Balance
                  </Button>
                  <Button 
                    asChild
                    variant="outline" 
                    className="bg-transparent border-border hover:bg-accent font-bold rounded-xl px-8 h-12 text-[10px] uppercase tracking-wider transition-all active:scale-95"
                  >
                    <Link href="/orkut/qris">Generate QRIS</Link>
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
                <p className="text-[10px] font-bold uppercase tracking-widest">Service Status</p>
                <p className="text-sm font-bold text-orange-600">DISCONNECTED</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Connection Info</h4>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
                      >
                        <PowerOff className="w-3 h-3 mr-1" />
                        Disconnect
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-3xl border-border w-[94vw] md:max-w-md">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-headline font-bold">Disconnect Orderkuota Account?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm">
                          Your access credentials will be permanently removed from our system.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="rounded-xl border-border">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDisconnect}
                          className="bg-red-500 hover:bg-red-600 rounded-xl"
                          disabled={isProcessing}
                        >
                          Disconnect Now
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl border border-border">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                       <UserIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{orderkuota?.username}</p>
                      <div className="flex items-center gap-2 mt-1 w-full">
                        <div className={`shrink-0 w-1.5 h-1.5 rounded-full ${
                          isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-50'
                        }`} />
                        <div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-hidden">
                          <p className="text-[10px] text-muted-foreground font-mono font-medium truncate">
                            {orderkuota?.token || "No Token"}
                          </p>
                          {orderkuota?.token && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-5 w-5 rounded-md hover:bg-background shrink-0"
                              onClick={() => copyToClipboard(orderkuota.token, "Token")}
                            >
                              <Copy className="w-2.5 h-2.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full h-10 rounded-xl border-border bg-card shadow-sm gap-2 font-bold text-[10px] uppercase tracking-wider group hover:border-primary/20 transition-all">
                        <SettingsIcon className="w-3.5 h-3.5 text-primary" />
                        Settings
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl border-border w-[94vw] md:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="font-headline font-bold">Orderkuota Settings</DialogTitle>
                        <DialogDescription className="text-xs">
                          Configure your BaseQr string and random nominal settings.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">QR String Payload</Label>
                          <Textarea 
                            placeholder="Enter your QR string payload here..." 
                            value={baseQrInput} 
                            onChange={(e) => setBaseQrInput(e.target.value)}
                            className="rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all min-h-[150px] text-xs font-mono break-all"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                            <Hash className="w-3 h-3" />
                            Random Nominal Digit
                          </Label>
                          <Select value={digitSetting} onValueChange={setDigitSetting}>
                            <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all font-bold text-xs">
                              <SelectValue placeholder="Select digit" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border">
                              <SelectItem value="2" className="text-xs">2 Digits (10 - 99)</SelectItem>
                              <SelectItem value="3" className="text-xs">3 Digits (100 - 999)</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-[9px] text-muted-foreground ml-1">Digunakan untuk menghasilkan nominal unik saat sinkronisasi.</p>
                        </div>

                        <Button 
                          onClick={handleSaveSettings} 
                          className="w-full h-11 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-lg shadow-primary/10" 
                          disabled={isProcessing}
                        >
                          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Save Configuration
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

      {/* Responsive Table Wrapper */}
      <div className="w-full max-w-full grid grid-cols-1 min-w-0 overflow-hidden">
        <Card className="w-full max-w-full border border-border shadow-sm rounded-xl overflow-hidden bg-card h-[455px] flex flex-col">
          <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-4 border-b border-border bg-slate-50/50 dark:bg-[#0A0A0A] shrink-0">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <RefreshCcw className={`w-4 h-4 text-primary ${mutationsLoading ? 'animate-spin' : ''}`} />
              Orderkuota Logs
            </CardTitle>
            <div className="flex items-center gap-2">
               <Badge variant="outline" className={`${
                 serviceStatus === 'Operational' ? 'border-green-500/20 text-green-600 bg-green-500/5' : 
                 serviceStatus === 'Unstable' ? 'border-orange-500/20 text-orange-600 bg-orange-500/5' :
                 'border-red-500/20 text-red-600 bg-red-500/5'
               } font-bold text-[9px] uppercase h-6 px-2 rounded-md hidden md:flex items-center gap-1.5`}>
                 <Activity className="w-3 h-3" />
                 {serviceStatus === 'Unstable' ? 'unstable' : serviceStatus}
               </Badge>
               <Button 
                variant="ghost" 
                size="sm" 
                className="text-[11px] font-bold hover:bg-accent h-8"
                onClick={handleManualRefresh}
                disabled={mutationsLoading || !isConnected}
              >
                {mutationsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-3 h-3" />}
                Refresh Logs
              </Button>
               <Button variant="ghost" size="sm" asChild className="text-[11px] font-bold hover:bg-accent h-8">
                <Link href="/orkut/transactions">
                  View All Logs
                  <ArrowUpRight className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <div className="w-full flex-1 overflow-x-auto overflow-y-auto">
            <table className="w-full min-w-full text-xs text-left">
              <thead className="sticky top-0 z-10 bg-muted/50">
                <tr>
                  <th className="px-6 py-3 font-bold text-muted-foreground uppercase text-[9px] tracking-widest whitespace-nowrap">Time</th>
                  <th className="px-6 py-3 font-bold text-muted-foreground uppercase text-[9px] tracking-widest whitespace-nowrap">Ref ID</th>
                  <th className="px-6 py-3 font-bold text-muted-foreground uppercase text-[9px] tracking-widest whitespace-nowrap">Amount</th>
                  <th className="px-6 py-3 font-bold text-muted-foreground uppercase text-[9px] tracking-widest whitespace-nowrap">Bank</th>
                  <th className="px-6 py-3 font-bold text-muted-foreground uppercase text-[9px] tracking-widest text-right whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mutationsLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
                    </tr>
                  ))
                ) : !isConnected ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-24 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2 w-full">
                        <ShieldAlert className="w-8 h-8 opacity-20" />
                        <p className="font-bold text-xs uppercase tracking-widest">Connect account to see logs</p>
                      </div>
                    </td>
                  </tr>
                ) : serviceStatus === "Maintenance" ? (
                   <tr>
                    <td colSpan={5} className="px-6 py-24 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-3 w-full">
                        <ShieldAlert className="w-8 h-8 text-red-500 opacity-40" />
                        <div className="space-y-1">
                          <p className="font-bold text-xs uppercase tracking-widest text-foreground">Endpoint Connection Failed</p>
                          <p className="text-[10px] max-w-xs mx-auto">The bridge server is currently unreachable or under maintenance. Please try again later.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : mutations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-24 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2 w-full">
                        <Clock className="w-8 h-8 opacity-20" />
                        <p className="font-bold text-xs uppercase tracking-widest">No incoming transactions found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  mutations.map((log, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                        {log.tanggal}
                      </td>
                      <td className="px-6 py-4 font-bold text-[11px] whitespace-nowrap uppercase">{log.id}</td>
                      <td className="px-6 py-4 font-bold text-primary text-[11px] whitespace-nowrap">
                        Rp {parseInt(log.kredit).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-[11px] whitespace-nowrap font-bold">
                        {log.brand.name}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <Badge variant="outline" className="bg-green-500/5 text-green-600 border-green-500/20 font-bold text-[9px] uppercase px-1.5 py-0 rounded-sm">
                          Success
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
