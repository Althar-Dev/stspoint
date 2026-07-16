"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Settings2, 
  AlertCircle,
  Save,
  Clock,
  Coins,
  RefreshCw,
  Wallet,
  ArrowUpRight,
  Loader2,
  CheckCircle2,
  ShieldCheck
} from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { toast } from "@/hooks/use-toast";
import { orderkuotaWithdraw } from "@/lib/orderkuota/withdraw";
import { getOrderkuotaProfile } from "@/lib/orderkuota/profile";

export default function AutoWithdrawPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const [isProcessingSettings, setIsProcessingSettings] = useState(false);
  const [isProcessingManual, setIsProcessingManual] = useState(false);
  const [liveQrisBalance, setLiveQrisBalance] = useState<number | null>(null);

  // Form states - Auto
  const [enabled, setEnabled] = useState(false);
  const [minAmount, setMinAmount] = useState("1000");
  const [interval, setInterval] = useState("5");

  // Form states - Manual
  const [manualAmount, setManualAmount] = useState("");

  const orderkuotaRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid, "services", "orderkuota");
  }, [db, user?.uid]);
  
  const { data: orderkuota, loading: serviceLoading } = useDoc(orderkuotaRef);

  // Fetch live profile to get actual QRIS balance
  const fetchLiveProfile = async () => {
    if (orderkuota?.username && orderkuota?.token) {
      try {
        const res = await getOrderkuotaProfile({
          username: orderkuota.username,
          token: orderkuota.token
        });
        if (res.status && res.result.success) {
          setLiveQrisBalance(res.result.account.results.qris_balance);
        }
      } catch (error) {
        console.error("Failed to fetch live profile:", error);
      }
    }
  };

  useEffect(() => {
    fetchLiveProfile();
  }, [orderkuota?.username, orderkuota?.token]);

  // Sync settings when data loaded
  useEffect(() => {
    if (orderkuota) {
      setEnabled(orderkuota.autoWithdrawEnabled || false);
      setMinAmount(orderkuota.minWithdrawAmount?.toString() || "1000");
      setInterval(orderkuota.withdrawInterval?.toString() || "5");
    }
  }, [orderkuota]);

  // System Preview Logic: Checks if current live balance meets auto-withdraw criteria
  const systemStatus = useMemo(() => {
    if (liveQrisBalance === null) return "loading";
    const threshold = parseInt(minAmount) || 1000;
    if (!enabled) return "disabled";
    return liveQrisBalance >= threshold ? "ready" : "waiting";
  }, [liveQrisBalance, minAmount, enabled]);

  const handleSaveSettings = () => {
    if (!orderkuotaRef) return;
    
    const amountNum = parseInt(minAmount);
    const intervalNum = parseInt(interval);

    if (isNaN(amountNum) || amountNum < 1000 || amountNum % 1000 !== 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Min. withdrawal is Rp 1.000 and must be a multiple of 1.000.",
      });
      return;
    }

    if (isNaN(intervalNum) || intervalNum < 1) {
      toast({
        variant: "destructive",
        title: "Invalid Interval",
        description: "Interval must be at least 1 minute.",
      });
      return;
    }

    setIsProcessingSettings(true);
    const dataToUpdate = {
      autoWithdrawEnabled: enabled,
      minWithdrawAmount: amountNum,
      withdrawInterval: intervalNum,
      updatedAt: serverTimestamp()
    };

    updateDoc(orderkuotaRef, dataToUpdate)
      .then(() => {
        toast({
          title: "Settings Saved",
          description: "Auto-withdrawal configuration updated successfully.",
        });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: orderkuotaRef.path,
          operation: 'update',
          requestResourceData: dataToUpdate,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsProcessingSettings(false);
      });
  };

  const handleManualWithdraw = async () => {
    if (!orderkuotaRef || !orderkuota?.username || !orderkuota?.token) {
      toast({ variant: "destructive", title: "Error", description: "Account not connected." });
      return;
    }

    const amount = parseInt(manualAmount);
    if (isNaN(amount) || amount < 1000 || amount % 1000 !== 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Amount must be at least 1.000 and a multiple of 1.000.",
      });
      return;
    }

    if (liveQrisBalance !== null && amount > liveQrisBalance) {
      toast({ variant: "destructive", title: "Insufficient QR Balance", description: "You don't have enough QRIS balance for this withdrawal." });
      return;
    }

    setIsProcessingManual(true);
    try {
      const res = await orderkuotaWithdraw({
        username: orderkuota.username,
        token: orderkuota.token,
        amount: amount
      });

      if (res.status && res.result.qris_withdraw.success) {
        const newMainBalance = res.result.account.results.balance;
        const newQrisBalance = res.result.account.results.qris_balance;
        
        await updateDoc(orderkuotaRef, {
          balance: newMainBalance,
          updatedAt: serverTimestamp()
        });

        setLiveQrisBalance(newQrisBalance);
        setManualAmount("");

        toast({
          title: "Withdrawal Success",
          description: res.result.qris_withdraw.message,
        });
      } else {
        throw new Error(res.result.qris_withdraw.message || "Withdrawal failed.");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Withdrawal Failed",
        description: error.message || "An error occurred while processing withdrawal.",
      });
    } finally {
      setIsProcessingManual(false);
    }
  };

  const isLoading = authLoading || serviceLoading;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold tracking-tight">Withdrawal <span className="text-primary">Center</span></h1>
          <p className="text-muted-foreground text-sm">Transfer your QRIS balance to your main transaction balance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Manual Withdraw Section */}
        <Card className="border border-border shadow-sm rounded-2xl bg-card overflow-hidden">
          <CardHeader className="bg-slate-50/50 dark:bg-white/5 py-4 px-6 border-b border-border">
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
              <Wallet className="w-4 h-4 text-primary" />
              Manual QRIS Withdrawal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ) : !orderkuota?.token ? (
              <div className="py-12 text-center space-y-4">
                 <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto opacity-20">
                    <AlertCircle className="w-6 h-6" />
                 </div>
                 <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                   Please connect your <br /> Orderkuota account first.
                 </p>
              </div>
            ) : (
              <>
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Available QRIS Balance</p>
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-headline font-bold tracking-tight">
                      {liveQrisBalance !== null ? `Rp ${liveQrisBalance.toLocaleString('id-ID')}` : "Loading..."}
                    </h3>
                    <RefreshCw 
                      className={`w-3.5 h-3.5 text-muted-foreground cursor-pointer hover:text-primary transition-colors ${liveQrisBalance === null ? 'animate-spin' : ''}`} 
                      onClick={() => { setLiveQrisBalance(null); fetchLiveProfile(); }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5" />
                    Withdraw Amount
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">Rp</span>
                    <Input 
                      type="number"
                      placeholder="Enter amount"
                      value={manualAmount} 
                      onChange={(e) => setManualAmount(e.target.value)}
                      className="h-12 pl-10 rounded-xl bg-muted border-transparent focus:bg-background transition-all font-bold text-lg" 
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[10000, 50000, 100000].map((amt) => (
                      <button 
                        key={amt}
                        onClick={() => setManualAmount(amt.toString())}
                        className="text-[9px] font-bold px-2 py-1 rounded bg-muted hover:bg-primary/10 transition-colors uppercase"
                      >
                        +{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleManualWithdraw}
                  disabled={isProcessingManual || !manualAmount}
                  className="w-full h-12 rounded-xl bg-primary font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/10 group"
                >
                  {isProcessingManual ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowUpRight className="w-4 h-4 mr-2" />}
                  Confirm Withdrawal
                </Button>
                <p className="text-[10px] text-center text-muted-foreground">
                  Funds will be moved to your main transaction balance.
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Auto Withdraw Settings Section */}
        <Card className="border border-border shadow-sm rounded-2xl bg-card overflow-hidden">
           <CardHeader className="bg-slate-50/50 dark:bg-white/5 py-4 px-6 border-b border-border">
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
              <Settings2 className="w-4 h-4 text-primary" />
              Auto-System Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ) : (
              <>
                <div className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${enabled ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-border'}`}>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold">Auto-Withdraw Status</h4>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Automatic QRIS processing</p>
                  </div>
                  <Switch checked={enabled} onCheckedChange={setEnabled} />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5" />
                      Min. QRIS Threshold
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">Rp</span>
                      <Input 
                        type="number"
                        value={minAmount} 
                        onChange={(e) => setMinAmount(e.target.value)}
                        className="h-11 pl-9 rounded-xl bg-muted border-transparent focus:bg-background transition-all font-bold" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Check Interval
                    </Label>
                    <div className="relative flex-1">
                      <Input 
                        type="number"
                        value={interval} 
                        onChange={(e) => setInterval(e.target.value)}
                        className="h-11 rounded-xl bg-muted border-transparent focus:bg-background transition-all font-bold" 
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground uppercase">Min</span>
                    </div>
                  </div>
                </div>

                {/* System Alur Preview */}
                <div className="p-4 rounded-xl border border-dashed border-border bg-slate-50/50 dark:bg-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">System Preview</h5>
                    {systemStatus === "ready" && <Badge className="bg-green-500 text-white border-none text-[8px]">READY</Badge>}
                    {systemStatus === "waiting" && <Badge className="bg-orange-500 text-white border-none text-[8px]">WAITING</Badge>}
                    {systemStatus === "disabled" && <Badge className="bg-muted text-muted-foreground border-none text-[8px]">INACTIVE</Badge>}
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${systemStatus === 'ready' ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                      {systemStatus === 'ready' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] leading-tight font-medium">
                        {systemStatus === 'ready' 
                          ? `Live balance (Rp ${liveQrisBalance?.toLocaleString()}) has reached your threshold. The system will process this automatically on the next interval.`
                          : systemStatus === 'waiting'
                          ? `System is monitoring. Current balance needs Rp ${(parseInt(minAmount) - (liveQrisBalance || 0)).toLocaleString()} more to reach threshold.`
                          : "Automatic system is currently disabled."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button 
                    onClick={handleSaveSettings}
                    disabled={isProcessingSettings}
                    className="w-full h-12 rounded-xl bg-primary font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/10 group"
                  >
                    {isProcessingSettings ? "Saving..." : "Save Configuration"}
                    <Save className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
