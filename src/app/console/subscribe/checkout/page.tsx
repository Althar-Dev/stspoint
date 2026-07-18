"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  QrCode, 
  Loader2, 
  CheckCircle2, 
  ShieldCheck, 
  CreditCard,
  Zap,
  Info,
  ArrowRight
} from "lucide-react";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { requestPaymentInfo } from "@/services/stspay/v1/payment";
import { toast } from "@/hooks/use-toast";

const PLAN_DETAILS: Record<string, Record<string, any>> = {
  orderkuota: {
    pro: { name: "Orderkuota Pro", price: 49000, desc: "Akses H2H Katalog Lengkap" },
    premium: { name: "Orderkuota Premium", price: 125000, desc: "VIP Margin & Priority API" },
  },
  gomerchant: {
    pro: { name: "GoMerchant Pro", price: 25000, desc: "Rate Limit 60 RPM & 7 Day Logs" },
    premium: { name: "GoMerchant Premium", price: 50000, desc: "Rate Limit 180 RPM & Priority Support" },
  }
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();

  const serviceId = searchParams.get("service") || "";
  const planId = searchParams.get("plan") || "";

  const plan = useMemo(() => {
    return PLAN_DETAILS[serviceId]?.[planId] || null;
  }, [serviceId, planId]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);

  const handleGenerateQRIS = async () => {
    if (!plan || !user || !db) return;

    setIsGenerating(true);
    const externalId = `SUB-${Date.now()}-${user.uid.substring(0, 5).toUpperCase()}`;

    try {
      const res = await requestPaymentInfo('qris', {
        external_id: externalId,
        amount: plan.price,
        name: user.displayName || "STS Member",
        payer_email: user.email,
        provider: 'Xendit'
      });

      if (res.success) {
        // Record transaction in stspay_transactions for reconciliation
        const txRef = doc(db, "stspay_transactions", externalId);
        await setDoc(txRef, {
          id: externalId,
          userId: user.uid,
          amount: plan.price,
          status: 'PENDING',
          type: 'subscription',
          metadata: { serviceId, planId },
          payerEmail: user.email,
          payment_info: res,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        setPaymentData(res);
        toast({ title: "QRIS Generated", description: "Silakan scan kode QR untuk membayar." });
      } else {
        throw new Error(res.message);
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Failed", description: error.message });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-muted-foreground">Paket tidak ditemukan.</p>
        <Button onClick={() => router.push("/console/subscribe")}>Kembali</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="rounded-xl px-3 hover:bg-accent"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Kembali
        </Button>
        <div className="h-4 w-px bg-border"></div>
        <h1 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Checkout Subscription</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Plan Summary */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-border shadow-sm rounded-3xl overflow-hidden bg-card">
            <CardHeader className="p-8 border-b border-border bg-muted/30">
               <div className="flex items-center justify-between">
                  <Badge className="bg-primary text-white border-none text-[10px] font-bold uppercase px-3 py-1">Upgrade Plan</Badge>
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
               </div>
               <div className="pt-4 space-y-1">
                  <CardTitle className="text-2xl font-headline font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">{plan.desc}</CardDescription>
               </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-bold">Rp {plan.price.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Biaya Layanan</span>
                    <span className="font-bold text-emerald-500">Rp 0</span>
                  </div>
                  <div className="pt-4 border-t border-dashed border-border flex justify-between items-center">
                    <span className="text-base font-bold uppercase tracking-widest">Total Bayar</span>
                    <span className="text-2xl font-headline font-bold text-primary">Rp {plan.price.toLocaleString('id-ID')}</span>
                  </div>
               </div>

               {!paymentData && (
                 <Button 
                  onClick={handleGenerateQRIS}
                  disabled={isGenerating}
                  className="w-full h-14 rounded-2xl bg-primary text-white font-bold uppercase tracking-widest text-xs shadow-xl shadow-primary/10 gap-3"
                 >
                   {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <QrCode className="w-5 h-5" />}
                   Bayar Sekarang (QRIS)
                 </Button>
               )}

               <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-100 text-blue-900">
                  <Info className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed font-medium">
                    Aktivasi paket dilakukan secara otomatis setelah pembayaran terverifikasi oleh sistem. Pajak sudah termasuk dalam harga di atas.
                  </p>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* QRIS Display */}
        <div className="lg:col-span-5">
           <Card className={`border-border shadow-2xl rounded-3xl overflow-hidden bg-card h-full flex flex-col transition-all duration-500 ${!paymentData ? 'opacity-40 grayscale pointer-events-none' : 'scale-105'}`}>
              <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-6">
                {!paymentData ? (
                  <div className="py-24 space-y-4">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
                      <CreditCard className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Menunggu Checkout...</p>
                  </div>
                ) : (
                  <div className="space-y-8 w-full">
                    <div className="space-y-2">
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Scan QRIS Untuk Bayar</p>
                       <div className="p-4 bg-white border border-border rounded-3xl shadow-sm inline-block">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(paymentData.qr_string)}`} 
                            alt="QRIS Payment"
                            className="w-56 h-56"
                          />
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="p-4 rounded-2xl bg-muted/50 space-y-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Batas Waktu</p>
                          <p className="text-xl font-headline font-bold text-primary">14:59</p>
                       </div>
                       <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                         Dukung pembayaran: GoPay, Dana, OVO, ShopeePay, LinkAja, dan seluruh Mobile Banking.
                       </p>
                    </div>

                    <Button variant="outline" className="w-full h-11 rounded-xl font-bold gap-2 text-xs border-border" onClick={() => setPaymentData(null)}>
                      Batalkan
                    </Button>
                  </div>
                )}
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionCheckoutPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-muted-foreground animate-pulse">Memuat Checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
