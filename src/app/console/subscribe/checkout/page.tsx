"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  QrCode, 
  Loader2, 
  ShieldCheck, 
  Info,
  Clock,
  Download,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Home,
  ArrowLeft
} from "lucide-react";
import { useState, useMemo, Suspense, useEffect } from "react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { requestPaymentInfo } from "@/services/stspay/v1/payment";
import { manualCheckPaymentStatus } from "@/services/stspay/v1/check-status";
import { toast } from "@/hooks/use-toast";
import { addMinutes, isAfter, differenceInSeconds, addDays } from "date-fns";
import dynamic from "next/dynamic";
import Link from "next/link";

const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((mod) => mod.Player),
  { ssr: false }
);

const PLAN_DETAILS: Record<string, Record<string, any>> = {
  gomerchant: {
    pro: { name: "GoMerchant Pro", price: 25000, desc: "Rate Limit 60 RPM & 7-Day History" },
    premium: { name: "GoMerchant Premium", price: 50000, desc: "Rate Limit 180 RPM & Priority Support" },
  },
  orderkuota: {
    pro: { name: "Orderkuota Pro", price: 25000, desc: "Standard API Speed & 7-Day History" },
    premium: { name: "Orderkuota Premium", price: 50000, desc: "High Speed API & Priority Support" },
  }
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();

  const serviceId = searchParams.get("service") || "";
  const planId = searchParams.get("plan") || "";
  const refId = searchParams.get("ref") || "";

  // Get profile to check for dev status
  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);
  const { data: profile } = useDoc(profileRef);
  const isDev = profile?.dev === true;

  const plan = useMemo(() => {
    const basePlan = PLAN_DETAILS[serviceId]?.[planId];
    if (!basePlan) return null;
    
    return {
      ...basePlan,
      price: isDev ? 1 : basePlan.price
    };
  }, [serviceId, planId, isDev]);

  // Firestore Sync
  const transactionRef = useMemoFirebase(() => {
    if (!db || !refId) return null;
    return doc(db, "stspay_transactions", refId);
  }, [db, refId]);

  const { data: transaction, loading: txLoading } = useDoc(transactionRef);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("15:00");

  // Countdown Logic
  useEffect(() => {
    if (!transaction || transaction.status !== 'PENDING' || !transaction.createdAt) return;

    const createdAtDate = transaction.createdAt.toDate ? transaction.createdAt.toDate() : new Date(transaction.createdAt);
    const expiryDate = addMinutes(createdAtDate, 15);

    const timer = setInterval(() => {
      const now = new Date();
      if (isAfter(now, expiryDate)) {
        clearInterval(timer);
        if (transactionRef) updateDoc(transactionRef, { status: 'EXPIRED', updatedAt: serverTimestamp() });
        setTimeLeft("EXPIRED");
        return;
      }
      
      const diff = differenceInSeconds(expiryDate, now);
      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [transaction, transactionRef]);

  // Status Polling Logic
  useEffect(() => {
    if (!transaction || transaction.status !== 'PENDING' || !db || !user?.uid) return;
    
    const pollInterval = setInterval(async () => {
      const prId = transaction.payment_info?.pr_id;
      if (!prId) return;

      try {
        const res = await manualCheckPaymentStatus(prId, 'Xendit');
        if (res.success && res.isPaid && transactionRef) {
          // 1. Update Transaction Status
          await updateDoc(transactionRef, { status: 'PAID', updatedAt: serverTimestamp() });
          
          // 2. Update User Service Plan
          const metadata = transaction.metadata || {};
          if (metadata.serviceId && metadata.planId) {
            const svcRef = doc(db, "users", user.uid, "services", metadata.serviceId);
            await updateDoc(svcRef, {
              plan: metadata.planId,
              planExpiry: addDays(new Date(), 30), // Subscription lasts 30 days
              updatedAt: serverTimestamp()
            });
          }

          toast({ title: "Payment Successful", description: "Your subscription has been activated." });
        }
      } catch (e) {
        console.error("Polling error:", e);
      }
    }, 15000);

    return () => clearInterval(pollInterval);
  }, [transaction, transactionRef, db, user?.uid]);

  const handleGenerateQRIS = async () => {
    if (!plan || !user || !db || !refId) return;

    setIsGenerating(true);

    try {
      const res = await requestPaymentInfo('qris', {
        external_id: refId,
        amount: plan.price,
        name: user.displayName || "STS Member",
        payer_email: user.email,
        provider: 'Xendit'
      });

      if (res.success) {
        const txData = {
          id: refId,
          userId: user.uid,
          amount: plan.price,
          status: 'PENDING',
          type: 'subscription',
          metadata: { serviceId, planId, isDevDiscount: isDev },
          payerEmail: user.email,
          payment_info: res,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        if (transactionRef) {
          await setDoc(transactionRef, txData);
        }
        toast({ title: "QRIS Generated", description: "Please complete your payment using the QR code below." });
      } else {
        throw new Error(res.message);
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCancelPayment = async () => {
    if (!transactionRef) return;
    setIsCanceling(true);
    try {
      await updateDoc(transactionRef, {
        status: 'CANCELED',
        updatedAt: serverTimestamp()
      });
      toast({ title: "Transaction Canceled", description: "Your payment request has been voided." });
      router.push("/console/subscribe");
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to cancel transaction." });
      setIsCanceling(false);
    }
  };

  const handleDownloadQR = () => {
    if (!transaction?.payment_info?.qr_string) return;
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(transaction.payment_info.qr_string)}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = `QRIS-SUB-${plan?.name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-muted-foreground font-medium">Subscription plan not found.</p>
        <Button onClick={() => router.push("/console/subscribe")} variant="outline" className="rounded-xl font-bold">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  // --- Render Paid State ---
  if (transaction?.status === 'PAID') {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 duration-500 py-10 px-4 text-center">
        <div className="w-48 h-48 mx-auto">
          <Player autoplay loop src="/assets/lottie/success.json" />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-headline font-bold text-emerald-600">Payment Successful!</h2>
          <p className="text-muted-foreground">Thank you for your purchase. Your account has been upgraded to <strong>{plan.name}</strong>.</p>
          <div className="pt-6">
            <Button asChild className="h-12 px-10 rounded-xl font-bold bg-primary text-white shadow-xl shadow-primary/10">
              <Link href="/console">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- Render Expired / Canceled State ---
  if (transaction?.status === 'EXPIRED' || transaction?.status === 'CANCELED') {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 py-10 px-4 text-center">
        <div className="w-24 h-24 mx-auto flex items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
          <XCircle className="w-16 h-16" />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-headline font-bold">Transaction {transaction.status === 'EXPIRED' ? 'Expired' : 'Canceled'}</h2>
          <p className="text-muted-foreground">This session is no longer active. If you still wish to upgrade, please start a new request from the subscription menu.</p>
          <div className="pt-6">
            <Button asChild variant="outline" className="h-12 px-10 rounded-xl font-bold gap-2">
              <Link href="/console/subscribe">
                <ArrowLeft className="w-4 h-4" /> Return to Subscriptions
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const paymentData = transaction?.payment_info;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 px-4">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push("/console/subscribe")}
          className="rounded-xl px-3 hover:bg-accent font-bold text-xs"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <div className="h-4 w-px bg-border"></div>
        <h1 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Payment Checkout</h1>
      </div>

      <Card className="border-border shadow-2xl rounded-[2.5rem] overflow-hidden bg-card">
        <CardHeader className="p-8 border-b border-border bg-muted/30">
           <div className="flex items-center justify-between">
              <Badge className="bg-primary text-primary-foreground border-none text-[9px] font-bold uppercase px-3 py-1 rounded-md">Account Upgrade</Badge>
              <ShieldCheck className="w-5 h-5 text-primary" />
           </div>
           <div className="pt-6 space-y-2 text-center">
              <CardTitle className="text-2xl md:text-3xl font-headline font-bold tracking-tight">{plan.name}</CardTitle>
              <CardDescription className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{plan.desc}</CardDescription>
           </div>
        </CardHeader>
        <CardContent className="p-8">
           {txLoading ? (
             <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary/20" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Syncing Transaction...</p>
             </div>
           ) : paymentData ? (
             <div className="space-y-10 w-full animate-in zoom-in-95 duration-500 flex flex-col items-center text-center">
                <div className="space-y-4">
                   <div className="p-5 bg-white border border-border rounded-[2rem] shadow-xl inline-block relative">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(paymentData.qr_string)}`} 
                        alt="QRIS Payment"
                        className="w-56 h-56 md:w-64 md:h-64 object-contain"
                      />
                      <div className="absolute inset-x-0 -bottom-3 flex justify-center">
                         <Badge className="bg-primary text-primary-foreground border-none px-4 py-1 rounded-full font-bold text-[9px] uppercase tracking-widest shadow-lg">Official QRIS</Badge>
                      </div>
                   </div>
                </div>

                <div className="space-y-6 w-full">
                   <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 space-y-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                         <Clock className="w-3 h-3" /> Payment Deadline
                      </p>
                      <p className="text-3xl font-headline font-bold text-primary">{timeLeft}</p>
                   </div>
                   
                   <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center text-sm border-t border-dashed border-border pt-4">
                        <span className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Total Bill</span>
                        <span className="font-bold text-xl text-primary">Rp {plan.price.toLocaleString('id-ID')}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleDownloadQR}
                          variant="outline" 
                          className="flex-1 h-12 rounded-xl font-bold uppercase text-[10px] tracking-widest border-border gap-2"
                        >
                          <Download className="w-4 h-4" /> Download QR
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="flex-1 h-12 rounded-xl font-bold text-[10px] uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors" 
                          onClick={handleCancelPayment}
                          disabled={isCanceling}
                        >
                          {isCanceling ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                          Cancel Payment
                        </Button>
                      </div>
                   </div>
                </div>
             </div>
           ) : (
             <div className="space-y-8">
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">Plan Price</span>
                    <span className={isDev ? "text-muted-foreground line-through" : "font-bold"}>
                      Rp {PLAN_DETAILS[serviceId]?.[planId]?.price.toLocaleString('id-ID')}
                    </span>
                  </div>
                  {isDev && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-emerald-600 font-bold text-[10px] uppercase tracking-widest">Developer Pricing</span>
                      <span className="font-bold text-emerald-600">Rp 1</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">Service Fee</span>
                    <span className="font-bold text-primary italic">Free</span>
                  </div>
                  <div className="pt-6 border-t border-dashed border-border flex justify-between items-end">
                    <div className="space-y-1">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">Total Bill</span>
                       <span className="text-3xl font-headline font-bold text-primary">Rp {plan.price.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
               </div>

               <Button 
                onClick={handleGenerateQRIS}
                disabled={isGenerating}
                className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[11px] shadow-xl shadow-primary/10 gap-3 transition-all active:scale-95"
               >
                 {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <QrCode className="w-5 h-5" />}
                 Generate QRIS Payment
               </Button>

               <div className="flex items-start gap-4 p-5 rounded-2xl bg-muted/50 border border-border">
                  <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shrink-0 border border-border">
                     <Info className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-tight">Important Information</p>
                    <p className="text-[10px] leading-relaxed text-muted-foreground">
                      The plan will activate automatically after the system detects a successful payment. Please ensure you pay the exact amount shown.
                    </p>
                  </div>
               </div>
             </div>
           )}
        </CardContent>
      </Card>
      
      <div className="text-center pt-8">
         <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.4em] opacity-30">STSPay Secure Checkout Engine v1.0.2</p>
      </div>
    </div>
  );
}

export default function SubscriptionCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Preparing Transaction...</p>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
