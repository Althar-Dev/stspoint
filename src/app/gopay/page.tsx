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
  Hash
} from "lucide-react";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { requestGoMerchantOtp } from "@/lib/gomerchant/connect";
import { verifyGoMerchantOtp } from "@/lib/gomerchant/verify";
import { getGoMerchantMutations, type GoMerchantMutationItem } from "@/lib/gomerchant/mutation";
import { format } from "date-fns";

export default function GopayPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  // Mutations state
  const [mutations, setMutations] = useState<GoMerchantMutationItem[]>([]);
  const [mutationsLoading, setMutationsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Form states
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [baseQrInput, setBaseQrInput] = useState("");
  const [digitSetting, setDigitSetting] = useState<string>("3");
  
  // Bridge Session states
  const [otpToken, setOtpToken] = useState("");
  const [uniqueId, setUniqueId] = useState("");

  const gomerchantRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid, "services", "gomerchant");
  }, [db, user?.uid]);
  
  const { data: gomerchant, loading: serviceLoading } = useDoc(gomerchantRef);

  const isConnected = !!gomerchant?.token;

  useEffect(() => {
    if (gomerchant) {
      setBaseQrInput(gomerchant.baseQr || "");
      setDigitSetting(gomerchant.randomDigit?.toString() || "3");
    }
  }, [gomerchant]);

  const totalRevenue = useMemo(() => {
    if (!mutations || !Array.isArray(mutations)) return 0;
    return mutations.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [mutations]);

  const fetchLiveMutations = useCallback(async () => {
    if (isConnected && gomerchant?.token && gomerchant?.id && gomerchantRef) {
      setMutationsLoading(true);
      try {
        const res = await getGoMerchantMutations({
          access_token: gomerchant.token,
          refresh_token: gomerchant.refreshToken || "",
          x_uniqueid: gomerchant.id,
          limit: 50 
        });

        if (res.status === "success" && res.data) {
          setMutations(res.data.mutations || []);
          
          if (res.data.token_refreshed && res.data.new_access_token) {
            updateDoc(gomerchantRef, {
              token: res.data.new_access_token,
              refreshToken: res.data.new_refresh_token || gomerchant.refreshToken,
              updatedAt: serverTimestamp()
            });
          }
        } else if (res.status === "error") {
          toast({ 
            variant: "destructive", 
            title: "Sync Failed", 
            description: res.message || "Ensure the GoPay account is still active." 
          });
        }
      } catch (error) {
        console.error("Failed to fetch live GoPay mutations:", error);
      } finally {
        setMutationsLoading(false);
      }
    } else {
      setMutations([]);
    }
  }, [isConnected, gomerchant?.token, gomerchant?.id, gomerchantRef, gomerchant?.refreshToken]);

  useEffect(() => {
    fetchLiveMutations();
  }, [fetchLiveMutations, refreshKey]);

  const handleManualRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast({ title: "Syncing data...", description: "Fetching latest mutations from GoBiz." });
  };

  const handleRequestOtp = async () => {
    if (!phone) {
      toast({ variant: "destructive", title: "Phone Number Required", description: "Please enter your GoBiz phone number." });
      return;
    }
    setIsProcessing(true);
    try {
      const res = await requestGoMerchantOtp({ phone_number: phone });
      if (res.status === "success" && res.data) {
        setOtpToken(res.data.otp_token);
        setUniqueId(res.data.x_uniqueid);
        setStep(2);
        toast({ title: "OTP Sent", description: "Please check SMS or WhatsApp on your number." });
      } else {
        throw new Error(res.message || "Failed to send OTP request.");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) {
      toast({ variant: "destructive", title: "OTP Required", description: "Please enter the OTP code you received." });
      return;
    }
    setIsProcessing(true);
    try {
      const res = await verifyGoMerchantOtp({
        otp_code: otpCode,
        otp_token: otpToken,
        x_uniqueid: uniqueId
      });

      if (res.status === "success" && res.data && gomerchantRef) {
        await updateDoc(gomerchantRef, {
          username: phone,
          token: res.data.access_token,
          refreshToken: res.data.refresh_token,
          id: res.data.x_uniqueid,
          balance: 0,
          updatedAt: serverTimestamp()
        });
        
        setIsDialogOpen(false);
        setStep(1);
        setPhone("");
        setOtpCode("");
        toast({ title: "Connected!", description: "Your GoMerchant account has been successfully verified." });
        setRefreshKey(prev => prev + 1);
      } else {
        throw new Error(res.message || "Invalid or expired OTP code.");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Verification Failed", description: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!gomerchantRef) return;
    setIsProcessing(true);
    try {
      await updateDoc(gomerchantRef, {
        baseQr: baseQrInput,
        randomDigit: parseInt(digitSetting),
        updatedAt: serverTimestamp()
      });
      toast({ title: "Settings Saved", description: "GoPay configuration has been updated." });
      setIsSettingsOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Save Failed", description: "Failed to update settings." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!gomerchantRef) return;
    setIsProcessing(true);
    try {
      await updateDoc(gomerchantRef, {
        username: "",
        token: "",
        refreshToken: "",
        id: "",
        balance: 0,
        updatedAt: serverTimestamp()
      });
      setMutations([]);
      toast({ title: "Disconnected", description: "Your GoPay account has been removed from the system." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: "Failed to disconnect account." });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTrxDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, "HH:mm dd/MM");
    } catch (e) {
      return dateStr;
    }
  };

  const isLoading = authLoading || serviceLoading || (!!user && !gomerchantRef);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border border-border shadow-sm rounded-3xl bg-card text-card-foreground p-0.5 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00AED6]/5 blur-[80px] -mr-32 -mt-32 transition-transform group-hover:scale-110"></div>
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
                <div className="w-16 h-16 rounded-full bg-[#00AED6]/5 flex items-center justify-center border border-dashed border-[#00AED6]/20 mb-2">
                  <LinkIcon className="w-8 h-8 text-[#00AED6]/40" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">GoPay Not Connected</h3>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Connect your GoMerchant account to start monitoring balances and automatic transactions.
                  </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) { setStep(1); setOtpCode(""); }
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#00AED6] hover:bg-[#00AED6]/90 text-white font-bold rounded-xl px-8 h-12 shadow-xl shadow-[#00AED6]/10 transition-all active:scale-95">
                      Connect Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-3xl border-border max-w-sm">
                    <DialogHeader>
                      <DialogTitle className="font-headline font-bold">
                        {step === 1 ? "Connect GoPay" : "Verify OTP"}
                      </DialogTitle>
                      <DialogDescription className="text-xs">
                        {step === 1 
                          ? "Enter the phone number registered in your GoBiz app."
                          : "Enter the OTP code sent to your number."}
                      </DialogDescription>
                    </DialogHeader>
                    
                    {step === 1 ? (
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">GoBiz Phone Number</Label>
                          <div className="relative">
                            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                              placeholder="62812xxxx" 
                              value={phone} 
                              onChange={(e) => setPhone(e.target.value)}
                              className="pl-10 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all"
                            />
                          </div>
                        </div>
                        <Button 
                          onClick={handleRequestOtp} 
                          className="w-full h-11 rounded-xl font-bold bg-[#00AED6] hover:bg-[#00AED6]/90 text-white" 
                          disabled={isProcessing || !phone}
                        >
                          {isProcessing ? "Processing..." : "Request OTP Code"}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4 py-4">
                        <div className="space-y-2 text-center">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">OTP Code</Label>
                          <Input 
                            placeholder="xxxx" 
                            value={otpCode} 
                            onChange={(e) => setOtpCode(e.target.value)}
                            className="h-14 text-center text-xl font-headline font-bold tracking-[0.5em] rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all"
                            maxLength={6}
                          />
                        </div>
                        <Button 
                          onClick={handleVerifyOtp} 
                          className="w-full h-11 rounded-xl font-bold bg-[#00AED6] hover:bg-[#00AED6]/90 text-white" 
                          disabled={isProcessing || !otpCode}
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
                    <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Total Revenue (GoPay)</p>
                    <div className="flex items-baseline gap-2">
                      {mutationsLoading ? (
                        <Skeleton className="h-10 w-48 mt-1" />
                      ) : (
                        <>
                          <h2 className="text-4xl font-headline font-bold tracking-tighter">
                            Rp {totalRevenue.toLocaleString('id-ID')}
                          </h2>
                          <Badge className="bg-green-500/10 text-green-600 border-none text-[8px] font-bold uppercase py-0 px-1.5 h-4">Live</Badge>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-[#00AED6]/5 flex items-center justify-center backdrop-blur-md border border-border group-hover:border-[#00AED6]/20 transition-colors">
                    <Wallet className="w-6 h-6 text-[#00AED6]" />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 pt-6 border-t border-border">
                  <Button asChild className="bg-[#00AED6] text-white hover:bg-[#00AED6]/90 font-bold rounded-xl px-8 h-12 text-[10px] uppercase tracking-wider shadow-xl shadow-[#00AED6]/10 transition-all active:scale-95">
                    <Link href="/gopay/qris">Generate QRIS</Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-transparent border-border hover:bg-accent font-bold rounded-xl px-8 h-12 text-[10px] uppercase tracking-wider transition-all active:scale-95"
                    onClick={handleManualRefresh}
                    disabled={mutationsLoading}
                  >
                    {mutationsLoading ? "Loading..." : "Refresh Revenue"}
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
              <div className="h-full flex flex-col items-center justify-center text-center py-6 space-y-4">
                <div className="p-4 bg-orange-500/10 text-orange-600 rounded-3xl border border-orange-500/20">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Service Status</p>
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
                    <AlertDialogContent className="rounded-3xl border-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-headline font-bold">Disconnect GoPay Account?</AlertDialogTitle>
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
                    <div className="w-10 h-10 rounded-xl bg-[#00AED6]/10 flex items-center justify-center text-[#00AED6]">
                       <UserIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{gomerchant?.username}</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Active GoBiz Account</p>
                    </div>
                  </div>
                  
                  <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full h-10 rounded-xl border-border bg-card shadow-sm gap-2 font-bold text-[10px] uppercase tracking-wider group hover:border-[#00AED6]/20 transition-all">
                        <SettingsIcon className="w-3.5 h-3.5 text-[#00AED6]" />
                        Settings
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl border-border max-sm">
                      <DialogHeader>
                        <DialogTitle className="font-headline font-bold">GoPay Settings</DialogTitle>
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
                            className="rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all min-h-[120px] text-xs font-mono break-all"
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
                          <p className="text-[9px] text-muted-foreground ml-1">Digunakan untuk menghasilkan nominal unik saat generate QRIS.</p>
                        </div>

                        <Button 
                          onClick={handleSaveSettings} 
                          className="w-full h-11 rounded-xl font-bold bg-[#00AED6] hover:bg-[#00AED6]/90 text-white gap-2 shadow-lg shadow-[#00AED6]/20" 
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

      <div className="w-full max-w-full grid grid-cols-1 min-w-0 overflow-hidden">
        <Card className="w-full max-w-full border border-border shadow-sm rounded-xl overflow-hidden bg-card h-[455px] flex flex-col">
          <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-4 border-b border-border bg-slate-50/50 dark:bg-[#0A0A0A] shrink-0">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <RefreshCcw className={`w-4 h-4 text-[#00AED6] ${mutationsLoading ? 'animate-spin' : ''}`} />
              GoPay Transaction Log
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[11px] font-bold hover:bg-accent h-8 gap-2"
                onClick={handleManualRefresh}
                disabled={mutationsLoading || !isConnected}
              >
                {mutationsLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCcw className="w-3 h-3" />}
                Refresh
              </Button>
              <Button variant="ghost" size="sm" asChild className="text-[11px] font-bold hover:bg-accent h-8 cursor-pointer">
                <Link href="/gopay/transactions">
                  View All
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
                  <th className="px-6 py-3 font-bold text-muted-foreground uppercase text-[9px] tracking-widest whitespace-nowrap">Transaction ID</th>
                  <th className="px-6 py-3 font-bold text-muted-foreground uppercase text-[9px] tracking-widest whitespace-nowrap">Customer</th>
                  <th className="px-6 py-3 font-bold text-muted-foreground uppercase text-[9px] tracking-widest whitespace-nowrap">Amount</th>
                  <th className="px-6 py-3 font-bold text-muted-foreground uppercase text-[9px] tracking-widest text-right whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mutationsLoading ? (
                   Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
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
                ) : mutations.length === 0 ? (
                   <tr>
                    <td colSpan={5} className="px-6 py-24 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2 w-full">
                        <Clock className="w-8 h-8 opacity-20" />
                        <p className="font-bold text-xs uppercase tracking-widest">No transactions found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  mutations.slice(0, 10).map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatTrxDate(item.created_at)}
                      </td>
                      <td className="px-6 py-4 font-mono text-[10px] text-muted-foreground whitespace-nowrap uppercase">
                        {item.trx_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/5 flex items-center justify-center">
                            <UserIcon className="w-3 h-3 text-muted-foreground" />
                          </div>
                          <span className="font-bold text-xs">{item.customer_name || "GoPay Customer"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-sm whitespace-nowrap">
                        Rp {item.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <Badge className={`${
                          item.status === 'paid' ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'
                        } border-none font-bold text-[9px] uppercase px-2 py-0.5 rounded-sm`}>
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
