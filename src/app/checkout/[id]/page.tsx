
"use client";

import { useParams, useRouter } from "next/navigation";
import { useFirestore, useDoc, useMemoFirebase, useCollection } from "@/firebase";
import { doc, updateDoc, serverTimestamp, collection } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronDown,
  Copy,
  ArrowLeft,
  Loader2,
  Globe,
  RefreshCcw,
  Landmark,
  Store,
  Wallet,
  QrCode,
  HelpCircle,
  Smartphone,
  XCircle,
  Timer,
  Download,
  CreditCard,
  ArrowRight
} from "lucide-react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/logo";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect, useMemo } from "react";
import { requestPaymentInfo } from "@/services/stspay/v1/payment";
import { manualCheckPaymentStatus } from "@/services/stspay/v1/check-status";
import { cancelStsTransaction } from "@/services/stspay/v1/cancel";
import { addMinutes, isAfter } from "date-fns";
import dynamic from "next/dynamic";

const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((mod) => mod.Player),
  { ssr: false }
);

// Template UI for groups
const GROUPS_UI = [
  { id: "va", name: "Bank Transfer", icon: Landmark, dbKeys: ['va', 'virtual_account'] },
  { id: "retail", name: "Retail Outlet", icon: Store, dbKeys: ['retail', 'over_the_counter', 'cstore'] },
  { id: "ewallet", name: "E-Wallet", icon: Wallet, dbKeys: ['ewallet', 'e-wallet'] },
  { id: "qris", name: "QR Payments", icon: QrCode, dbKeys: ['qris', 'qr', 'qr_code'] },
  { id: "paylater", name: "Paylater", icon: CreditCard, dbKeys: ['paylater', 'akulaku', 'kredivo'] },
];

export default function CustomCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const db = useFirestore();
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [lang, setLang] = useState<"EN" | "ID">("EN");
  
  const [isOvoModalOpen, setIsOvoPromptOpen] = useState(false);
  const [ovoPhone, setOvoPhone] = useState("");

  const T = {
    EN: {
      totalPayment: "TOTAL PAYMENT",
      paidTitle: "Payment Successful",
      paidDesc: "Thank you. Your transaction has been received and will be processed immediately.",
      finish: "Done",
      expiredTitle: "Invoice Expired",
      expiredDesc: "The payment deadline for this order has passed. Please create a new order.",
      backHome: "Back to Home",
      canceledTitle: "Order Canceled",
      canceledDesc: "You have canceled this transaction. If this was a mistake, you can re-order.",
      backStore: "Back to Store",
      change: "Change",
      scanQr: "Scan the QR code using your bank or digital wallet app to pay.",
      downloadQris: "Download QRIS",
      vaNumber: "Virtual Account Number",
      paymentCode: "Payment Code",
      copySuccess: "Copied!",
      copyDesc: (label: string) => `${label} has been copied.`,
      howToPay: "Payment Instructions",
      checkOvo: "Check Your OVO App",
      ovoDesc: "A payment notification has been sent to your phone. Please confirm the payment in the OVO app.",
      redirectApp: "Click the button below to be redirected to your payment app automatically.",
      payNow: "Pay Now",
      manualCheck: "Manual Status Check",
      checking: "Checking...",
      syncSuccess: "Payment Successful!",
      syncSuccessDesc: "Your order status has been updated.",
      syncFail: "Not Detected",
      syncFailDesc: "We haven't received your payment yet. Please try again later.",
      selectMethod: "Select Payment Method",
      orderSummary: "Order Summary",
      invoice: "Invoice #",
      payBefore: "Pay before",
      totalBill: "Total Bill",
      cancelOrder: "Cancel Order",
      cancelConfirm: "Cancel Order?",
      cancelWarning: "Are you sure you want to cancel this transaction? This action cannot be undone.",
      keepOrder: "Back",
      confirmCancel: "Yes, Cancel",
      canceling: "Canceling...",
      ovoPhoneTitle: "OVO Phone Number",
      ovoPhoneDesc: "Please enter the phone number registered in your OVO app to receive the payment notification.",
      mobileLabel: "Phone Number (OVO)",
      continuePay: "Continue Payment",
      generating: "Generating...",
      back: "Back",
      group_va: "Bank Transfer",
      group_retail: "Retail Outlet",
      group_ewallet: "E-Wallet",
      group_qris: "QR Payments",
      group_paylater: "Paylater",
      minAmountError: "Minimum Amount Not Met",
      minAmountDesc: (name: string) => `Minimum payment for ${name} is IDR 10,000. Please choose another method.`,
      minPay: "Min Pay",
      va_steps: [
        "Open your mobile banking app.",
        (bank: string) => `Select Transfer > Virtual Account ${bank}.`,
        "Enter the VA number above.",
        "Confirm the amount and complete the payment."
      ],
      retail_steps: [
        (bank: string) => `Go to the nearest ${bank} outlet.`,
        "Inform the cashier to pay for Xendit.",
        (code: string) => `Show payment code: ${code}`,
        "Pay the exact amount and keep your receipt."
      ]
    },
    ID: {
      totalPayment: "TOTAL PEMBAYARAN",
      paidTitle: "Pembayaran Berhasil",
      paidDesc: "Terima kasih. Transaksi Anda telah kami terima dan akan segera diproses.",
      finish: "Selesai",
      expiredTitle: "Tagihan Kedaluwarsa",
      expiredDesc: "Batas waktu pembayaran untuk pesanan ini telah habis. Silakan buat pesanan baru.",
      backHome: "Kembali ke Beranda",
      canceledTitle: "Pesanan Dibatalkan",
      canceledDesc: "Anda telah membatalkan transaksi ini. Jika ini adalah kesalahan, Anda bisa melakukan pemesanan ulang.",
      backStore: "Kembali ke Toko",
      change: "Ganti",
      scanQr: "Pindai kode QR menggunakan aplikasi bank atau dompet digital Anda untuk membayar.",
      downloadQris: "Unduh QRIS",
      vaNumber: "Nomor Virtual Account",
      paymentCode: "Kode Pembayaran",
      copySuccess: "Berhasil disalin!",
      copyDesc: (label: string) => `${label} telah disalin.`,
      howToPay: "Cara Pembayaran",
      checkOvo: "Cek Aplikasi OVO Anda",
      ovoDesc: "Notifikasi pembayaran telah dikirim ke ponsel Anda. Harap segera konfirmasi pembayaran di aplikasi OVO.",
      redirectApp: "Klik tombol di bawah untuk diarahkan ke aplikasi pembayaran Anda secara otomatis.",
      payNow: "Bayar Sekarang",
      manualCheck: "Cek Status Manual",
      checking: "Mengecek...",
      syncSuccess: "Pembayaran Berhasil!",
      syncSuccessDesc: "Status pesanan Anda telah diperbarui.",
      syncFail: "Belum Terdeteksi",
      syncFailDesc: "Pembayaran Anda belum kami terima. Silakan coba lagi nanti.",
      selectMethod: "Pilih Metode Pembayaran",
      orderSummary: "Ringkasan Pesanan",
      invoice: "Ringkasan #",
      payBefore: "Pay before",
      totalBill: "Total Tagihan",
      cancelOrder: "Batalkan Pesanan",
      cancelConfirm: "Batalkan Pesanan?",
      cancelWarning: "Apakah Anda yakin ingin membatalkan transaksi ini? Tindakan ini tidak dapat dibatalkan.",
      keepOrder: "Batal",
      confirmCancel: "Ya, Batalkan",
      canceling: "Membatalkan...",
      ovoPhoneTitle: "Nomor HP OVO",
      ovoPhoneDesc: "Harap masukkan nomor ponsel yang terdaftar pada aplikasi OVO Anda untuk menerima notifikasi pembayaran.",
      mobileLabel: "Nomor Ponsel (OVO)",
      continuePay: "Lanjutkan Pembayaran",
      generating: "Memproses...",
      back: "Kembali",
      group_va: "Bank Transfer",
      group_retail: "Gerai Retail",
      group_ewallet: "E-Wallet",
      group_qris: "Pembayaran QR",
      group_paylater: "Paylater",
      minAmountError: "Minimal Nominal Tidak Terpenuhi",
      minAmountDesc: (name: string) => `Minimal pembayaran untuk ${name} adalah Rp 10.000. Silakan pilih metode lain.`,
      minPay: "Min Bayar",
      va_steps: [
        "Buka aplikasi mobile banking Anda.",
        (bank: string) => `Pilih Transfer > Virtual Account ${bank}.`,
        "Masukkan nomor VA di atas.",
        "Konfirmasi nominal dan selesaikan pembayaran."
      ],
      retail_steps: [
        "Datang ke gerai terdekat.",
        "Informasikan kepada kasir untuk membayar tagihan Xendit.",
        (code: string) => `Tunjukkan kode bayar: ${code}`,
        "Bayar sesuai nominal dan simpan struk pembayaran Anda."
      ]
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const transactionRef = useMemoFirebase(() => {
    if (!db || !params.id) return null;
    return doc(db, "stspay_transactions", params.id as string);
  }, [db, params.id]);

  const channelsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "payment_channels");
  }, [db]);

  const { data: transaction, loading, error } = useDoc(transactionRef);
  const { data: channelsData } = useCollection(channelsQuery);

  const activePaymentGroups = useMemo(() => {
    if (!channelsData) return [];

    const activeChannels = channelsData.filter(c => c.status === 'active');
    
    return GROUPS_UI.map(group => {
      const methodsInGroup = activeChannels
        .filter(c => {
          const dbGroup = (c.group || '').toLowerCase().replace(/[\s-]/g, '');
          const uiGroup = group.id.toLowerCase();
          const matchesKey = group.dbKeys.some(k => (c.group || '').toLowerCase().includes(k)) || (c.id || '').toLowerCase().includes(uiGroup);
          return dbGroup === uiGroup || matchesKey || (uiGroup === 'qris' && c.id.toUpperCase() === 'QRIS');
        })
        .map(c => ({
          id: c.id,
          name: c.name,
          type: group.id,
          min: c.min || (group.id === 'va' || group.id === 'retail' ? 10000 : 1000),
          provider: c.provider || 'Xendit',
          logo: c.logo ? (c.logo.startsWith('http') ? c.logo : `/assets/bank/${c.logo}`) : `/assets/bank/${c.id.toLowerCase()}.png`
        }));

      return {
        ...group,
        methods: methodsInGroup
      };
    }).filter(g => g.methods.length > 0);
  }, [channelsData]);

  useEffect(() => {
    if (!transaction || transaction.status !== 'PENDING' || !transaction.createdAt) return;

    const createdAtDate = transaction.createdAt.toDate ? transaction.createdAt.toDate() : new Date(transaction.createdAt);
    const expiryDate = addMinutes(createdAtDate, 15);

    const timer = setInterval(() => {
      const now = new Date();
      if (isAfter(now, expiryDate)) {
        clearInterval(timer);
        if (transactionRef) updateDoc(transactionRef, { status: 'EXPIRED', updatedAt: serverTimestamp() });
        return;
      }
      const diff = expiryDate.getTime() - now.getTime();
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [transaction, transactionRef]);

  useEffect(() => {
    if (!transaction || transaction.status !== 'PENDING') return;
    const interval = setInterval(() => handleStatusSync(true), 15000);
    return () => clearInterval(interval);
  }, [transaction]);

  const handleStatusSync = async (silent = false) => {
    if (!transaction || !transactionRef || transaction.status !== 'PENDING') return;
    const prId = transaction.payment_info?.pr_id || transaction.payment_info?.charge_id || transaction.payment_info?.qr_id || transaction.payment_info?.va_id || transaction.payment_info?.fpc_id;
    if (!prId) return;
    if (!silent) setIsChecking(true);
    try {
      const res = await manualCheckPaymentStatus(prId, transaction.provider || 'Xendit');
      if (res.success && res.isPaid) {
        await updateDoc(transactionRef, { status: 'PAID', updatedAt: serverTimestamp() });
        if (!silent) toast({ title: T[lang].syncSuccess, description: T[lang].syncSuccessDesc });
      } else if (!silent) {
        toast({ title: T[lang].syncFail, description: T[lang].syncFailDesc });
      }
    } catch (err: any) {
      if (!silent) toast({ variant: "destructive", title: "Error", description: "Sync failed." });
    } finally {
      if (!silent) setIsChecking(false);
    }
  };

  const handleCancel = async () => {
    if (!transactionRef || !transaction) return;
    setIsCanceling(true);
    try {
      const prId = transaction.payment_info?.pr_id || transaction.payment_info?.charge_id || transaction.payment_info?.qr_id || transaction.payment_info?.va_id || transaction.payment_info?.fpc_id;
      if (prId) await cancelStsTransaction(prId, transaction.provider || 'Xendit');
      await updateDoc(transactionRef, { status: 'CANCELED', updatedAt: serverTimestamp() });
    } finally {
      setIsCanceling(false);
    }
  };

  const handleGoBack = async () => {
    if (!transactionRef || !transaction) return;
    setIsCanceling(true);
    try {
      const prId = transaction.payment_info?.pr_id || transaction.payment_info?.charge_id || transaction.payment_info?.qr_id || transaction.payment_info?.va_id || transaction.payment_info?.fpc_id;
      if (prId) {
        await cancelStsTransaction(prId, transaction.provider || 'Xendit');
      }
      await updateDoc(transactionRef, {
        payment_info: null,
        payment_method_id: null,
        updatedAt: serverTimestamp()
      });
      setSelectedMethod(null);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: "Gagal membatalkan tagihan sebelumnya." });
    } finally {
      setIsCanceling(false);
    }
  };

  const handleSelectMethod = async (method: any, mobileNumber?: string) => {
    const minPay = Number(method.min);
    if ((transaction?.amount || 0) < minPay) {
      return; 
    }
    
    const methodId = (method.id || '').toUpperCase();
    const isOvo = methodId.includes('OVO');
    
    if (isOvo && !mobileNumber && method.provider !== 'Midtrans') {
      setSelectedMethod(method);
      setIsOvoPromptOpen(true);
      return;
    }
    
    setSelectedMethod(method);
    setIsGenerating(true);
    setIsOvoPromptOpen(false);
    try {
      const res = await requestPaymentInfo(method.type, {
        external_id: transaction?.id, 
        amount: transaction?.amount,
        bank_code: method.id,
        name: transaction?.payerEmail || "STS Customer",
        mobile_number: mobileNumber,
        provider: method.provider,
        payer_email: transaction?.payerEmail
      });

      if (res.success && transactionRef) {
        await updateDoc(transactionRef, {
          payment_info: res,
          payment_method_id: method.id,
          provider: method.provider,
          updatedAt: serverTimestamp()
        });
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed", description: err.message });
      setSelectedMethod(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadQR = async () => {
    if (!transaction?.payment_info?.qr_string) return;
    const qrString = transaction.payment_info.qr_string;
    const url = qrString.startsWith('http') 
      ? qrString 
      : `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(qrString)}`;
    
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `QRIS-${transaction.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      window.open(url, '_blank');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({ title: T[lang].copySuccess, description: T[lang].copyDesc(label) });
  };

  if (loading || !mounted) {
    return (
      <div className="light min-h-screen bg-[#F9FAFB] flex flex-col">
        {/* Header Skeleton */}
        <header className="w-full h-16 md:h-20 bg-white border-b border-slate-300 flex items-center justify-between px-4 md:px-12 sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-md" />
            <Skeleton className="w-20 h-6 rounded-md" />
          </div>
          <Skeleton className="w-24 h-8 rounded-md" />
        </header>

        <main className="max-w-7xl mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 w-full">
          <div className="lg:col-span-8 p-4 md:p-12 lg:p-16 space-y-12">
            {/* Amount Section Skeleton */}
            <div className="text-center space-y-4">
              <Skeleton className="w-32 h-32 mx-auto rounded-full" />
              <div className="space-y-2">
                <Skeleton className="w-24 h-3 mx-auto" />
                <Skeleton className="w-64 h-12 mx-auto" />
              </div>
            </div>

            {/* Method Detail Skeleton */}
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <Skeleton className="w-32 h-6" />
                <Skeleton className="w-16 h-8" />
              </div>
              <Skeleton className="w-full h-[400px] rounded-2xl" />
              <Skeleton className="w-full h-12 rounded-xl" />
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <aside className="lg:col-span-4 p-4 lg:p-12 lg:border-l border-slate-200">
             <div className="space-y-8">
                <div className="bg-white p-8 space-y-8 rounded-2xl border border-slate-200">
                  <Skeleton className="w-40 h-8" />
                  <div className="space-y-4">
                    <Skeleton className="w-full h-12" />
                    <Skeleton className="w-full h-12" />
                  </div>
                  <div className="border-t border-dashed pt-8 border-slate-200">
                    <div className="flex justify-between">
                      <Skeleton className="w-24 h-4" />
                      <Skeleton className="w-32 h-8" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <Skeleton className="w-32 h-8 rounded-md" />
                </div>
             </div>
          </aside>
        </main>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="light min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-6">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <h2 className="text-xl font-bold">Bill Not Found</h2>
        <Button onClick={() => router.push("/")} variant="outline">Back</Button>
      </div>
    );
  }

  const isPaid = transaction.status === "PAID" || transaction.status === "SETTLED" || transaction.status === "SUCCEEDED";
  const isExpired = transaction.status === "EXPIRED";
  const isCanceled = transaction.status === "CANCELED";
  const currentPaymentData = transaction.payment_info;
  const currentMethod = activePaymentGroups.flatMap(g => g.methods).find(m => m.id === transaction.payment_method_id) || selectedMethod;

  return (
    <div className="light min-h-screen bg-[#F9FAFB] text-slate-900 font-sans selection:bg-indigo-100 flex flex-col">
      <header className="w-full h-16 md:h-20 bg-white border-b border-slate-300 flex items-center justify-between px-4 md:px-12 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Logo className="w-7 h-7 md:w-8 md:h-8" />
          <span className="font-bold text-lg md:text-xl tracking-tight text-slate-800">STSPay</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs font-medium text-slate-500 gap-1 rounded-md">
              <Globe className="w-3.5 h-3.5" /> <span>{lang === 'EN' ? 'English' : 'Indonesia'}</span> <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl p-1">
            <DropdownMenuItem onClick={() => setLang("EN")} className="rounded-lg text-xs font-bold">English</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLang("ID")} className="rounded-lg text-xs font-bold">Indonesia</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <main className="max-w-7xl mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 w-full">
        <div className="lg:col-span-8 p-4 md:p-12 lg:p-16 space-y-6 md:space-y-12">
          <div className="text-center space-y-2">
            {(!isPaid && !isExpired && !isCanceled && !!currentPaymentData) && (
              <div className="w-32 h-32 mx-auto">
                <Player autoplay loop src="/assets/lottie/pending.json" />
              </div>
            )}
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{T[lang].totalPayment}</p>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-indigo-600 tracking-tight">
              IDR {transaction.amount.toLocaleString('id-ID')}
            </h1>
          </div>

          {isPaid ? (
            <div className="max-w-md mx-auto py-10 text-center space-y-6 animate-in zoom-in-95">
              <div className="w-32 h-32 mx-auto"><Player autoplay loop src="/assets/lottie/success.json" /></div>
              <h2 className="text-xl md:text-2xl font-bold">{T[lang].paidTitle}</h2>
              <p className="text-sm text-slate-500">{T[lang].paidDesc}</p>
              <Button onClick={() => router.push("/")} className="bg-indigo-600 hover:bg-indigo-700 h-12 px-10">{T[lang].finish}</Button>
            </div>
          ) : isExpired ? (
            <div className="max-w-md mx-auto py-10 text-center space-y-6 animate-in zoom-in-95">
              <div className="w-32 h-32 mx-auto"><Player autoplay loop src="/assets/lottie/expired.json" /></div>
              <h2 className="text-xl md:text-2xl font-bold">{T[lang].expiredTitle}</h2>
              <p className="text-sm text-slate-500">{T[lang].expiredDesc}</p>
              <Button onClick={() => router.push("/")} variant="outline" className="h-12 px-10">{T[lang].backHome}</Button>
            </div>
          ) : isCanceled ? (
            <div className="max-w-md mx-auto py-10 text-center space-y-6 animate-in zoom-in-95">
              <div className="w-32 h-32 mx-auto"><Player autoplay loop src="/assets/lottie/failed.json" /></div>
              <h2 className="text-xl md:text-2xl font-bold">{T[lang].canceledTitle}</h2>
              <p className="text-sm text-slate-500">{T[lang].canceledDesc}</p>
              <Button onClick={() => router.push("/")} variant="outline" className="h-12 px-10">{T[lang].backStore}</Button>
            </div>
          ) : currentPaymentData ? (
            <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={handleGoBack} disabled={isCanceling}>
                  {isCanceling ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowLeft className="w-5 h-5" />}
                </Button>
                <h3 className="font-bold">{T[lang].change}</h3>
                {currentMethod?.logo && <img src={currentMethod.logo} alt={currentMethod.name} className="h-12 ml-auto object-contain" />}
              </div>

              <Card className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-none">
                <CardContent className="p-6 md:p-12">
                  {currentPaymentData.qr_string ? (
                    <div className="flex flex-col items-center space-y-8">
                      <div className="p-4 bg-white border border-slate-200 rounded-md shadow-sm">
                        <img 
                          src={currentPaymentData.qr_string.startsWith('http') ? currentPaymentData.qr_string : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(currentPaymentData.qr_string)}`} 
                          alt="QRIS" 
                          className="w-48 h-48 sm:w-60 sm:h-60" 
                        />
                      </div>
                      <div className="flex flex-col items-center gap-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleDownloadQR}
                          className="rounded-full px-6 font-bold gap-2 text-xs border-indigo-100 text-indigo-600 hover:bg-indigo-50"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {T[lang].downloadQris}
                        </Button>
                        <p className="text-xs text-center text-slate-500 max-w-sm">{T[lang].scanQr}</p>
                      </div>
                    </div>
                  ) : currentMethod?.type === 'va' || currentMethod?.type === 'retail' ? (
                    <div className="space-y-8">
                      <div className="text-center space-y-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentMethod?.type === 'va' ? T[lang].vaNumber : T[lang].paymentCode}</p>
                        <div className="relative flex items-center justify-center p-4 md:p-8 lg:p-10 bg-slate-50 border border-slate-200 rounded-2xl">
                          <span className="text-xl sm:text-2xl md:text-3xl font-bold tracking-wider text-indigo-600 text-center px-10">
                            {currentMethod?.type === 'va' ? currentPaymentData.account_number?.replace(/(.{4})/g, '$1 ').trim() : currentPaymentData.payment_code}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute right-2 md:right-6 h-10 w-10 hover:bg-white hover:shadow-sm shrink-0"
                            onClick={() => copyToClipboard(currentMethod?.type === 'va' ? currentPaymentData.account_number : currentPaymentData.payment_code, "Number")}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-4 pt-8 border-t border-slate-100">
                        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><HelpCircle className="w-3.5 h-3.5" /> {T[lang].howToPay}</h5>
                        <div className="grid gap-2">
                          {currentMethod?.type === 'va' ? T[lang].va_steps.map((step: any, i: number) => (
                            <div key={i} className="flex gap-4 p-4 rounded-md bg-slate-50/50 border border-slate-100 text-sm">
                              <span className="w-6 h-6 rounded bg-white border text-[10px] font-bold flex items-center justify-center shrink-0">{i+1}</span>
                              <p className="text-slate-600">{typeof step === 'function' ? step(currentPaymentData.bank_code || currentMethod.id) : step}</p>
                            </div>
                          )) : T[lang].retail_steps.map((step: any, i: number) => (
                            <div key={i} className="flex gap-4 p-4 rounded-md bg-slate-50/50 border border-slate-100 text-sm">
                              <span className="w-6 h-6 rounded bg-white border text-[10px] font-bold flex items-center justify-center shrink-0">{i+1}</span>
                              <p className="text-slate-600">{typeof step === 'function' ? (i === 0 ? step(currentMethod.name) : i === 2 ? step(currentPaymentData.payment_code) : step) : step}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-10 text-center space-y-8">
                      <div className="w-20 h-20 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                         <Smartphone className="w-10 h-10" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-xl">
                          {currentPaymentData.is_push_payment ? T[lang].checkOvo : `Open ${currentMethod?.name || "App"}`}
                        </h4>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                          {currentPaymentData.is_push_payment ? T[lang].ovoDesc : T[lang].redirectApp}
                        </p>
                      </div>
                      {currentPaymentData.checkout_url && (
                        <div className="px-4">
                          <Button asChild className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl shadow-lg shadow-indigo-600/20 group transition-all">
                            <a href={currentPaymentData.checkout_url} target="_blank" rel="noopener noreferrer">
                              {T[lang].payNow}
                              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button onClick={() => handleStatusSync()} disabled={isChecking} variant="outline" className="w-full h-12 rounded-md font-bold gap-2 text-slate-500">
                {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />} {isChecking ? T[lang].checking : T[lang].manualCheck}
              </Button>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-8">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">{T[lang].selectMethod}</h3>
              <Card className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-none">
                <CardContent className="p-0">
                  <Accordion type="single" collapsible defaultValue="va" className="w-full">
                    {activePaymentGroups.map((group) => (
                      <AccordionItem key={group.id} value={group.id} className="border-b border-slate-100 last:border-0">
                        <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-slate-50/50">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-3 text-left">
                              <group.icon className="w-5 h-5 text-indigo-500" />
                              <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-600">{lang === 'EN' ? group.name : T[lang][`group_${group.id}` as keyof typeof T.ID]}</h4>
                            </div>
                            <div className="flex items-center gap-2 ml-auto">
                              {group.methods.slice(0, 3).map((m: any) => <img key={m.id} src={m.logo} alt={m.name} className="h-5 object-contain" />)}
                              {group.methods.length > 3 && <span className="text-[10px] font-bold text-slate-400">+{group.methods.length - 3}</span>}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-8 pb-8 pt-2">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {group.methods.map((method: any) => {
                              const isTooLow = (transaction?.amount || 0) < Number(method.min);
                              return (
                                <button
                                  key={method.id}
                                  disabled={isGenerating || isCanceling || isTooLow}
                                  onClick={() => handleSelectMethod(method)}
                                  className={cn(
                                    "relative aspect-[16/9] rounded-md transition-all flex flex-col items-center justify-center p-0 group overflow-hidden border border-transparent",
                                    isTooLow ? "cursor-not-allowed opacity-40 grayscale" : "hover:border-slate-200"
                                  )}
                                >
                                  <img 
                                    src={method.logo} 
                                    alt={method.name} 
                                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                                  />
                                  {isTooLow && (
                                    <div className="absolute bottom-0 left-0 right-0 py-0.5 z-10 bg-red-600">
                                       <p className="text-[8px] font-bold uppercase tracking-tighter text-white">
                                         {T[lang].minPay} Rp {Number(method.min).toLocaleString('id-ID')}
                                       </p>
                                    </div>
                                  )}
                                  {isGenerating && selectedMethod?.id === method.id && (
                                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20"><Loader2 className="w-5 h-5 animate-spin text-indigo-500" /></div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Mobile Attribution */}
          <div className="lg:hidden pt-10 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 border rounded-md">
              <span className="text-[9px] font-bold tracking-widest">Powered by</span>
              <Logo className="w-5 h-5" />
              <span className="text-[10px] font-black italic">STSPay</span>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4 flex flex-col h-full">
          <div className="lg:sticky lg:top-[5rem] space-y-6">
            <Card className="border-slate-300 shadow-sm bg-white rounded-t-2xl lg:rounded-t-none lg:rounded-b-2xl overflow-hidden mx-4 lg:mx-0">
              <div className="p-8 lg:p-10 space-y-8">
                <h2 className="text-xl font-bold text-slate-800">{T[lang].orderSummary}</h2>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{T[lang].invoice}</p>
                  <p className="text-xs font-mono break-all">{transaction.id}</p>
                </div>
                <div className={`flex items-center gap-3 p-4 rounded-md border ${isPaid || isExpired || isCanceled ? 'bg-slate-50 text-slate-400' : 'bg-indigo-50/50 border-indigo-200 text-indigo-600'}`}>
                  {isPaid ? <CheckCircle2 className="w-5 h-5" /> : <Timer className={`w-5 h-5 ${!isExpired && !isCanceled && 'animate-pulse'}`} />}
                  <p className="text-sm font-medium">
                    {isPaid ? T[lang].paidTitle : isExpired ? T[lang].expiredTitle : isCanceled ? T[lang].canceledTitle : (
                      <>{T[lang].payBefore} <strong>{timeLeft || '15:00'}</strong></>
                    )}
                  </p>
                </div>
                <div className="border-t-2 border-dashed border-slate-400 my-8" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">{T[lang].totalBill}</span>
                  <span className="text-xl font-bold text-slate-800">IDR {transaction.amount.toLocaleString('id-ID')}</span>
                </div>
                {(!isPaid && !isExpired && !isCanceled) && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" className="w-full text-xs text-red-500 font-bold hover:bg-red-50">
                        {T[lang].cancelOrder}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-headline font-bold">{T[lang].cancelConfirm}</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm">{T[lang].cancelWarning}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-md">Back</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancel} disabled={isCanceling} className="bg-red-500 rounded-md">
                          {isCanceling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : T[lang].confirmCancel}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </Card>

            {/* Desktop Attribution: Positioned under sticky summary */}
            <div className="hidden lg:flex flex-col items-center gap-4 py-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 border rounded-md">
                <span className="text-[10px] font-bold tracking-widest">Powered by</span>
                <Logo className="w-5 h-5" />
                <span className="text-[10px] font-black italic">STSPay</span>
              </div>
            </div>
          </div>
        </aside>
      </main>

      <Dialog disabled={isGenerating} open={isOvoModalOpen} onOpenChange={setIsOvoPromptOpen}>
        <DialogContent className="rounded-xl max-w-sm">
          <DialogHeader>
            <DialogTitle>{T[lang].ovoPhoneTitle}</DialogTitle>
            <DialogDescription className="text-xs">{T[lang].ovoPhoneDesc}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label className="text-[10px] font-bold uppercase text-slate-500">{T[lang].mobileLabel}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">+62</span>
              <Input
                placeholder="81234567890"
                className="pl-12 h-12 font-bold rounded-xl"
                value={ovoPhone}
                onChange={(e) => setOvoPhone(e.target.value.replace(/[^0-9]/g, ""))}
              />
            </div>
            <Button className="w-full h-12 bg-indigo-600 font-bold rounded-xl" disabled={!ovoPhone || isGenerating} onClick={() => handleSelectMethod(selectedMethod, ovoPhone)}>
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : T[lang].continuePay}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
