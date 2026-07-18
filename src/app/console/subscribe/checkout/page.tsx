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
  Download
} from "lucide-react";
import { useState, useMemo, Suspense } from "react";
import { useUser, useFirestore } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { requestPaymentInfo } from "@/services/stspay/v1/payment";
import { toast } from "@/hooks/use-toast";

const PLAN_DETAILS: Record<string, Record<string, any>> = {
  orderkuota: {
    pro: { name: "Orderkuota Pro", price: 49000, desc: "Akses H2H Katalog Lengkap" },
    premium: { name: "Orderkuota Premium", price: 125000, desc: "VIP Margin & Priority API" },
  },
  gomerchant: {
    pro: { name: "GoMerchant Pro", price: 25000, desc: "Rate Limit 60 RPM & 7 Hari Log" },
    premium: { name: "GoMerchant Premium", price: 50000, desc: "Rate Limit 180 RPM & Support Prioritas" },
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
        toast({ title: "QRIS Berhasil Dibuat", description: "Silakan selesaikan pembayaran Anda." });
      } else {
        throw new Error(res.message);
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Gagal", description: error.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadQR = () => {
    if (!paymentData?.qr_string) return;
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(paymentData.qr_string)}`;
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
        <p className="text-muted-foreground font-medium">Paket langganan tidak ditemukan.</p>
        <Button onClick={() => router.push("/console/subscribe")} variant="outline" className="rounded-xl font-bold">
          Kembali ke Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 px-4">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="rounded-xl px-4 hover:bg-accent font-bold text-xs"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Kembali
        </Button>
        <div className="h-4 w-px bg-border"></div>
        <h1 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Checkout Pembayaran</h1>
      </div>

      <Card className="border-border shadow-2xl rounded-[2.5rem] overflow-hidden bg-card">
        <CardHeader className="p-8 border-b border-border bg-muted/30">
           <div className="flex items-center justify-between">
              <Badge className="bg-primary text-primary-foreground border-none text-[9px] font-bold uppercase px-3 py-1 rounded-md">Upgrade Akun</Badge>
              <ShieldCheck className="w-5 h-5 text-primary" />
           </div>
           <div className="pt-6 space-y-2">
              <CardTitle className="text-2xl md:text-3xl font-headline font-bold tracking-tight">{plan.name}</CardTitle>
              <CardDescription className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{plan.desc}</CardDescription>
           </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
           {paymentData ? (
             <div className="space-y-10 w-full animate-in zoom-in-95 duration-500 flex flex-col items-center text-center">
                <div className="space-y-4">
                   <div className="p-5 bg-white border border-border rounded-[2rem] shadow-xl inline-block relative">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(paymentData.qr_string)}`} 
                        alt="QRIS Payment"
                        className="w-56 h-56 md:w-64 md:h-64 object-contain"
                      />
                      <div className="absolute inset-x-0 -bottom-3 flex justify-center">
                         <Badge className="bg-primary text-primary-foreground border-none px-4 py-1 rounded-full font-bold text-[9px] uppercase tracking-widest shadow-lg">QRIS Resmi</Badge>
                      </div>
                   </div>
                </div>

                <div className="space-y-6 w-full">
                   <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 space-y-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                         <Clock className="w-3 h-3" /> Batas Waktu Bayar
                      </p>
                      <p className="text-3xl font-headline font-bold text-primary">14:59</p>
                   </div>
                   
                   <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center text-sm border-t border-dashed border-border pt-4">
                        <span className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Total Tagihan</span>
                        <span className="font-bold text-xl text-primary">Rp {plan.price.toLocaleString('id-ID')}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleDownloadQR}
                          variant="outline" 
                          className="flex-1 h-12 rounded-xl font-bold uppercase text-[10px] tracking-widest border-border gap-2"
                        >
                          <Download className="w-4 h-4" /> Unduh QR
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="flex-1 h-12 rounded-xl font-bold text-[10px] uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors" 
                          onClick={() => setPaymentData(null)}
                        >
                          Batalkan
                        </Button>
                      </div>
                   </div>
                </div>
             </div>
           ) : (
             <div className="space-y-8">
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">Harga Paket</span>
                    <span className="font-bold">Rp {plan.price.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">Biaya Layanan</span>
                    <span className="font-bold text-primary italic">Gratis</span>
                  </div>
                  <div className="pt-6 border-t border-dashed border-border flex justify-between items-end">
                    <div className="space-y-1">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">Total Tagihan</span>
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
                 Tampilkan QRIS Pembayaran
               </Button>

               <div className="flex items-start gap-4 p-5 rounded-2xl bg-muted/50 border border-border">
                  <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shrink-0 border border-border">
                     <Info className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-tight">Informasi Penting</p>
                    <p className="text-[10px] leading-relaxed text-muted-foreground">
                      Paket akan aktif secara otomatis setelah sistem mendeteksi pembayaran sukses. Pastikan Anda membayar sesuai dengan nominal yang tertera.
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
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Menyiapkan Transaksi...</p>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}