"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  User as UserIcon,
  Save,
  Loader2,
  Activity,
  Copy,
  Hash,
  Settings as SettingsIcon,
  Globe,
  Key
} from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { requestOrderkuotaOtp, getOrderkuotaToken } from "@/lib/orderkuota/connect";

export default function OrderkuotaBridgePage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  // Connection Info
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpInfo, setOtpInfo] = useState("");
  
  // Settings Info
  const [baseQrInput, setBaseQrInput] = useState("");
  const [digitSetting, setDigitSetting] = useState<string>("3");
  
  // H2H Credentials
  const [h2hMemberId, setH2hMemberId] = useState("");
  const [h2hPin, setH2hPin] = useState("");
  const [h2hPassword, setH2hPassword] = useState("");

  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "settings", "orderkuota");
  }, [db]);
  
  const { data: config, loading: configLoading } = useDoc(settingsRef);

  const isConnected = !!config?.token;

  useEffect(() => {
    if (config) {
      setBaseQrInput(config.baseQr || "");
      setDigitSetting(config.randomDigit?.toString() || "3");
      setH2hMemberId(config.h2hMemberId || "");
      setH2hPin(config.h2hPin || "");
      setH2hPassword(config.h2hPassword || "");
    }
  }, [config]);

  const handleRequestOtp = async () => {
    if (!username || !password) {
      toast({ variant: "destructive", title: "Missing Info", description: "Username and password are required." });
      return;
    }
    setIsProcessing(true);
    try {
      const res = await requestOrderkuotaOtp({ username, password });
      if (res.status && res.result) {
        setOtpInfo(res.result.otp_value);
        setStep(2);
        toast({ title: "OTP Sent", description: `Check ${res.result.otp}: ${res.result.otp_value}` });
      } else {
        throw new Error(res.message || "Failed to get OTP from bridge.");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "OTP Error", description: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast({ variant: "destructive", title: "Missing OTP", description: "Please enter the code." });
      return;
    }
    setIsProcessing(true);
    try {
      const res = await getOrderkuotaToken({ username, otp });
      if (res.status && res.result && settingsRef) {
        const data = {
          id: res.result.id,
          username: res.result.username,
          token: res.result.token,
          balance: parseFloat(res.result.balance),
          updatedAt: serverTimestamp()
        };
        
        await setDoc(settingsRef, data, { merge: true });
        
        setIsDialogOpen(false);
        setStep(1);
        setOtp("");
        toast({ title: "Bridge Connected!", description: `Master account ${res.result.name} is now active.` });
      } else {
        throw new Error(res.message || "Token exchange failed.");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Auth Failed", description: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settingsRef) return;
    setIsProcessing(true);
    try {
      await updateDoc(settingsRef, {
        baseQr: baseQrInput,
        randomDigit: parseInt(digitSetting),
        h2hMemberId: h2hMemberId.trim(),
        h2hPin: h2hPin.trim(),
        h2hPassword: h2hPassword.trim(),
        updatedAt: serverTimestamp()
      });
      toast({ title: "Settings Updated", description: "Platform bridge and H2H configuration saved." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Save Failed", description: "Could not update global settings." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDisconnect = async () => {
    if (!settingsRef) return;
    setIsProcessing(true);
    try {
      await updateDoc(settingsRef, {
        token: "",
        username: "",
        updatedAt: serverTimestamp()
      });
      toast({ title: "Bridge Terminated", description: "Master account disconnected." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: "Disconnect failed." });
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading = authLoading || configLoading;

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-headline font-bold tracking-tight">Orderkuota <span className="text-primary">Master Bridge</span></h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Manage the platform's primary connection to Orderkuota distribution network.</p>
        </div>
        {isConnected && (
           <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-bold text-[9px] uppercase h-6 px-2.5 rounded-full flex items-center gap-1.5 self-start sm:self-auto">
             <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
             Bridge Operational
           </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
        {/* Connection Card */}
        <Card className="md:col-span-5 border border-border shadow-sm rounded-xl sm:rounded-2xl overflow-hidden bg-card">
           <CardHeader className="bg-muted/30 p-4 sm:p-6 border-b border-border">
              <div className="flex items-center justify-between mb-1">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                   <Globe className="w-4 h-4 text-primary" />
                   Upstream Authentication
                </CardTitle>
              </div>
              <CardDescription className="text-xs">Secure the master node connection for top-ups and bridge operations.</CardDescription>
           </CardHeader>
           <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              ) : !isConnected ? (
                <div className="text-center space-y-6 py-6">
                   <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto border border-dashed border-primary/20">
                      <LinkIcon className="w-8 h-8 text-primary/30" />
                   </div>
                   <Dialog open={isDialogOpen} onOpenChange={(o) => { setIsDialogOpen(o); if(!o) setStep(1); }}>
                      <DialogTrigger asChild>
                        <Button className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/10">
                           Connect Master Account
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-[2.5rem] border-border max-w-sm">
                         <DialogHeader>
                            <DialogTitle className="font-headline font-bold">{step === 1 ? 'Master Login' : 'Verify Bridge'}</DialogTitle>
                            <DialogDescription className="text-xs">Provide credentials for the platform's primary distributor account.</DialogDescription>
                         </DialogHeader>
                         {step === 1 ? (
                           <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                 <Label className="text-[10px] font-bold uppercase ml-1">Username</Label>
                                 <Input value={username} onChange={(e) => setUsername(e.target.value)} className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-all" />
                              </div>
                              <div className="space-y-2">
                                 <Label className="text-[10px] font-bold uppercase ml-1">Password</Label>
                                 <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-all" />
                              </div>
                              <Button onClick={handleRequestOtp} disabled={isProcessing} className="w-full h-12 rounded-xl font-bold">Request Master OTP</Button>
                           </div>
                         ) : (
                           <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                 <Label className="text-[10px] font-bold uppercase text-center block mb-2">OTP for {otpInfo}</Label>
                                 <Input value={otp} onChange={(e) => setOtp(e.target.value)} className="h-14 text-center text-2xl font-headline font-bold tracking-[0.5em] rounded-xl bg-muted/50 border-transparent focus:bg-background transition-all" maxLength={6} />
                              </div>
                              <Button onClick={handleVerifyOtp} disabled={isProcessing} className="w-full h-12 rounded-xl font-bold">Verify & Activate Bridge</Button>
                              <Button variant="ghost" onClick={() => setStep(1)} className="w-full text-xs">Back</Button>
                           </div>
                         )}
                      </DialogContent>
                   </Dialog>
                </div>
              ) : (
                <div className="space-y-6">
                   <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-2xl border border-border">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                         <UserIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-sm font-bold truncate">{config.username}</p>
                         <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Active Master Node</p>
                      </div>
                      <AlertDialog>
                         <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10"><PowerOff className="w-4 h-4" /></Button>
                         </AlertDialogTrigger>
                         <AlertDialogContent className="rounded-xl">
                            <AlertDialogHeader><AlertDialogTitle>Disconnect Bridge?</AlertDialogTitle><AlertDialogDescription>This will break the Top-Up functionality and PPOB fulfillment for all users.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter>
                               <AlertDialogCancel>Cancel</AlertDialogCancel>
                               <AlertDialogAction onClick={handleDisconnect} className="bg-red-500">Confirm Disconnect</AlertDialogAction>
                            </AlertDialogFooter>
                         </AlertDialogContent>
                      </AlertDialog>
                   </div>
                   
                   <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase ml-1">Current Balance</Label>
                      <div className="h-12 flex items-center px-4 rounded-xl bg-muted/30 border border-border">
                         <p className="text-lg font-headline font-bold">Rp {(config.balance || 0).toLocaleString('id-ID')}</p>
                      </div>
                   </div>
                </div>
              )}
           </CardContent>
        </Card>

        {/* Global Settings Card */}
        <div className="md:col-span-7 space-y-4 sm:space-y-6">
          <Card className="border border-border shadow-sm rounded-xl sm:rounded-2xl overflow-hidden bg-card">
            <CardHeader className="bg-muted/30 p-4 sm:p-6 border-b border-border">
                <CardTitle className="text-xs sm:text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <SettingsIcon className="w-4 h-4 text-primary" />
                  Global Distribution Settings
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Platform Base QRIS</Label>
                  <Textarea 
                    value={baseQrInput} 
                    onChange={(e) => setBaseQrInput(e.target.value)}
                    placeholder="Paste the master QRIS string here..."
                    className="min-h-[100px] rounded-2xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all font-mono text-[10px] break-all leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Random Digit</Label>
                    <Select value={digitSetting} onValueChange={setDigitSetting}>
                      <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-transparent">
                          <SelectValue placeholder="Select digits" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border">
                          <SelectItem value="2" className="text-xs">2 Digits (10-99)</SelectItem>
                          <SelectItem value="3" className="text-xs">3 Digits (100-999)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-sm rounded-xl sm:rounded-2xl overflow-hidden bg-card">
            <CardHeader className="bg-muted/30 p-4 sm:p-6 border-b border-border">
                <CardTitle className="text-xs sm:text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Key className="w-4 h-4 text-primary" />
                  H2H OkeConnect Credentials
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Member ID (OKxxxxx)</Label>
                    <Input 
                      placeholder="e.g. OK12345" 
                      value={h2hMemberId}
                      onChange={(e) => setH2hMemberId(e.target.value)}
                      className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-all font-bold uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">H2H PIN</Label>
                    <Input 
                      type="password"
                      placeholder="6 Digit PIN" 
                      value={h2hPin}
                      onChange={(e) => setH2hPin(e.target.value)}
                      className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">H2H IP Password</Label>
                    <Input 
                      type="password"
                      placeholder="H2H Password" 
                      value={h2hPassword}
                      onChange={(e) => setH2hPassword(e.target.value)}
                      className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-end">
                  <Button onClick={handleSaveSettings} disabled={isProcessing || !isConnected} className="h-12 px-10 rounded-xl font-bold uppercase tracking-widest text-[11px] gap-2 shadow-lg shadow-primary/10">
                      {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Bridge Config
                  </Button>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="p-8 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
         <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
         <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-900 uppercase tracking-tight">Security Protocol</h4>
            <p className="text-xs text-amber-800 leading-relaxed">
               Updating the Master Bridge settings will affect all automatic payment reconciliation logic for the entire STSPoint infrastructure. Ensure the Base QRIS and H2H credentials provided are valid to prevent "User Not Found" errors.
            </p>
         </div>
      </div>
    </div>
  );
}
