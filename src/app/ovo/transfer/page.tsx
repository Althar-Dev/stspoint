
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ChevronLeft, 
  ArrowRight, 
  User, 
  Landmark, 
  Smartphone, 
  Coins, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Wallet,
  ShieldCheck,
  Send,
  Info
} from "lucide-react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { 
  checkOvoNumber, 
  transferToOvo, 
  getOvoBankList, 
  bankInquiry, 
  transferToBank 
} from "@/lib/ovo/transfer";
import { getOvoBalance } from "@/lib/ovo/data";

export default function OvoTransferPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();

  // OVO Account Context
  const ovoRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid, "services", "ovo");
  }, [db, user?.uid]);

  const { data: ovo, loading: serviceLoading } = useDoc(ovoRef);
  const isConnected = !!ovo?.token;

  // Global State
  const [balance, setBalance] = useState(0);
  const [banks, setBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form OVO State
  const [ovoTarget, setOvoTarget] = useState("");
  const [ovoAmount, setOvoTargetAmount] = useState("");
  const [ovoMessage, setOvoMessage] = useState("");
  const [ovoInquiryName, setOvoInquiryName] = useState<string | null>(null);

  // Form Bank State
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [bankAccountNo, setBankAccountNo] = useState("");
  const [bankAmount, setBankAmount] = useState("");
  const [bankMessage, setBankMessage] = useState("");
  const [bankInquiryResult, setBankInquiryResult] = useState<any>(null);

  useEffect(() => {
    if (isConnected && ovo?.token && ovo?.deviceId) {
      loadInitialData();
    }
  }, [isConnected, ovo?.token, ovo?.deviceId]);

  const loadInitialData = async () => {
    if (!ovo?.token || !ovo?.deviceId) return;
    setLoading(true);
    try {
      const [balRes, bankRes] = await Promise.all([
        getOvoBalance({ token: ovo.token, deviceId: ovo.deviceId }),
        getOvoBankList({ token: ovo.token, deviceId: ovo.deviceId })
      ]);

      if (balRes.success && balRes.data) {
        setBalance(balRes.data.cash?.card_balance || 0);
      }

      if (bankRes.success && Array.isArray(bankRes.data)) {
        setBanks(bankRes.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIKA TRANSFER OVO ---

  const handleCheckOvo = async () => {
    if (!ovoTarget || !ovoAmount || !ovo?.token) return;
    setIsProcessing(true);
    setOvoInquiryName(null);
    try {
      const res = await checkOvoNumber({
        token: ovo.token,
        deviceId: ovo.deviceId,
        phone: ovoTarget,
        amount: parseInt(ovoAmount)
      });

      if (res.success && res.data) {
        setOvoInquiryName(res.data.fullName);
        toast({ title: "Penerima Ditemukan", description: `Transfer ke ${res.data.fullName}` });
      } else {
        toast({ variant: "destructive", title: "Gagal", description: res.message || "Nomor tidak ditemukan." });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteTransferOvo = async () => {
    if (!isProcessing && ovoInquiryName && ovo?.token) {
      setIsProcessing(true);
      try {
        const res = await transferToOvo({
          token: ovo.token,
          deviceId: ovo.deviceId,
          phone: ovoTarget,
          amount: parseInt(ovoAmount),
          message: ovoMessage
        });

        if (res.success) {
          toast({ title: "Transfer Berhasil!", description: res.message });
          router.push("/ovo");
        } else {
          toast({ variant: "destructive", title: "Transfer Gagal", description: res.message });
        }
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // --- LOGIKA TRANSFER BANK ---

  const handleBankInquiry = async () => {
    if (!selectedBank || !bankAccountNo || !bankAmount || !ovo?.token) return;
    setIsProcessing(true);
    setBankInquiryResult(null);
    try {
      const res = await bankInquiry({
        token: ovo.token,
        deviceId: ovo.deviceId,
        bankCode: selectedBank.value,
        bankName: selectedBank.label,
        accountNo: bankAccountNo,
        amount: parseInt(bankAmount),
        message: bankMessage
      });

      if (res.success && res.data) {
        setBankInquiryResult(res.data);
        toast({ title: "Inquiry Sukses", description: `Pemilik Rekening: ${res.data.accountName}` });
      } else {
        toast({ variant: "destructive", title: "Inquiry Gagal", description: res.message });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteTransferBank = async () => {
    if (bankInquiryResult && ovo?.token) {
      setIsProcessing(true);
      try {
        const res = await transferToBank({
          token: ovo.token,
          deviceId: ovo.deviceId,
          accountName: bankInquiryResult.accountName,
          accountNo: bankInquiryResult.accountNo,
          accountNoDestination: bankAccountNo,
          amount: parseInt(bankAmount),
          bankCode: selectedBank.value,
          bankName: selectedBank.label,
          message: bankMessage,
          notes: bankMessage
        });

        if (res.success) {
          toast({ title: "Transfer Bank Berhasil!", description: res.message });
          router.push("/ovo");
        } else {
          toast({ variant: "destructive", title: "Transfer Gagal", description: res.message });
        }
      } finally {
        setIsProcessing(false);
      }
    }
  };

  if (serviceLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#4C2B9A]" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Menyiapkan Mesin Transfer...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 px-1">
      {/* Header & Balance Glance */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl hover:bg-accent shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-headline font-bold tracking-tight">Kirim <span className="text-[#4C2B9A]">Dana.</span></h1>
            <p className="text-muted-foreground text-xs">Pindahkan saldo OVO Anda dengan cepat dan aman.</p>
          </div>
        </div>
        <div className="bg-[#4C2B9A]/5 border border-[#4C2B9A]/10 px-5 py-3 rounded-2xl flex items-center gap-4 shadow-sm">
           <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-border shadow-sm">
              <Wallet className="w-5 h-5 text-[#4C2B9A]" />
           </div>
           <div>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Saldo Tersedia</p>
              <p className="text-lg font-headline font-bold text-[#4C2B9A]">Rp {balance.toLocaleString('id-ID')}</p>
           </div>
        </div>
      </div>

      <Tabs defaultValue="ovo" className="w-full">
        <TabsList className="bg-muted p-1 rounded-xl h-14 flex items-center border border-border shadow-sm mb-8">
          <TabsTrigger value="ovo" className="flex-1 rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-[#4C2B9A] data-[state=active]:shadow-sm h-full text-xs uppercase tracking-widest gap-2">
            <Smartphone className="w-4 h-4" />
            Sesama OVO
          </TabsTrigger>
          <TabsTrigger value="bank" className="flex-1 rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-[#4C2B9A] data-[state=active]:shadow-sm h-full text-xs uppercase tracking-widest gap-2">
            <Landmark className="w-4 h-4" />
            Rekening Bank
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ovo" className="space-y-6">
          <Card className="border-border shadow-sm rounded-[2rem] overflow-hidden bg-card">
            <CardHeader className="bg-muted/30 p-8 border-b border-border">
               <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-[#4C2B9A]" />
                  Transfer Sesama OVO
               </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nomor HP OVO Tujuan</Label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          placeholder="0812xxxx" 
                          value={ovoTarget} 
                          onChange={(e) => {
                            setOvoTarget(e.target.value);
                            setOvoInquiryName(null);
                          }}
                          className="pl-10 h-12 rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all font-bold"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nominal (Min. Rp 10.000)</Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">Rp</span>
                        <Input 
                          type="number"
                          placeholder="0" 
                          value={ovoAmount} 
                          onChange={(e) => {
                            setOvoTargetAmount(e.target.value);
                            setOvoInquiryName(null);
                          }}
                          className="pl-12 h-14 rounded-2xl bg-muted/30 border-transparent focus:bg-background transition-all text-xl font-headline font-bold"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Pesan (Opsional)</Label>
                      <Input 
                        placeholder="Catatan transfer..." 
                        value={ovoMessage} 
                        onChange={(e) => setOvoMessage(e.target.value)}
                        className="h-12 rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all"
                      />
                    </div>

                    {!ovoInquiryName ? (
                      <Button 
                        onClick={handleCheckOvo} 
                        disabled={isProcessing || !ovoTarget || !ovoAmount || parseInt(ovoAmount) < 10000}
                        className="w-full h-12 rounded-xl font-bold bg-[#4C2B9A] text-white gap-2 shadow-lg shadow-[#4C2B9A]/20"
                      >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        Cek Nomor Penerima
                      </Button>
                    ) : (
                      <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                         <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                  <CheckCircle2 className="w-5 h-5" />
                               </div>
                               <div>
                                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Nama Penerima</p>
                                  <p className="text-sm font-bold text-emerald-900">{ovoInquiryName}</p>
                               </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setOvoInquiryName(null)} className="text-[10px] font-bold text-[#4C2B9A] uppercase">Ganti</Button>
                         </div>
                         <Button 
                          onClick={handleExecuteTransferOvo} 
                          disabled={isProcessing}
                          className="w-full h-14 rounded-2xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-xl shadow-emerald-600/20"
                         >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Kirim Sekarang
                         </Button>
                      </div>
                    )}
                  </div>

                  <div className="hidden md:flex flex-col justify-center items-center p-10 border-l border-border bg-slate-50/50">
                     <div className="w-32 h-32 rounded-3xl bg-white shadow-xl flex items-center justify-center mb-6">
                        <img src="/assets/main/ovo.png" alt="OVO" className="w-20 h-20 object-contain" />
                     </div>
                     <div className="text-center space-y-2">
                        <h4 className="font-bold">Aman & Instan</h4>
                        <p className="text-[11px] text-muted-foreground leading-relaxed max-w-[200px]">
                           Transfer sesama OVO tidak dikenakan biaya admin dan dana masuk seketika.
                        </p>
                     </div>
                  </div>
               </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bank" className="space-y-6">
          <Card className="border-border shadow-sm rounded-[2rem] overflow-hidden bg-card">
            <CardHeader className="bg-muted/30 p-8 border-b border-border">
               <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-[#4C2B9A]" />
                  Transfer ke Rekening Bank
               </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Pilih Bank Tujuan</Label>
                      <Select 
                        value={selectedBank?.value} 
                        onValueChange={(val) => {
                          const bank = banks.find(b => b.value === val);
                          setSelectedBank(bank);
                          setBankInquiryResult(null);
                        }}
                      >
                        <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-transparent font-bold">
                          <SelectValue placeholder="Pilih Bank..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {banks.map((bank) => (
                            <SelectItem key={bank.value} value={bank.value} className="text-xs font-bold">{bank.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nomor Rekening</Label>
                      <Input 
                        placeholder="e.g. 1234567890" 
                        value={bankAccountNo} 
                        onChange={(e) => {
                          setBankAccountNo(e.target.value);
                          setBankInquiryResult(null);
                        }}
                        className="h-12 rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all font-mono font-bold"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nominal Transfer (Min. Rp 10.000)</Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">Rp</span>
                        <Input 
                          type="number"
                          placeholder="0" 
                          value={bankAmount} 
                          onChange={(e) => {
                            setBankAmount(e.target.value);
                            setBankInquiryResult(null);
                          }}
                          className="pl-12 h-14 rounded-2xl bg-muted/30 border-transparent focus:bg-background transition-all text-xl font-headline font-bold"
                        />
                      </div>
                      <p className="text-[9px] text-muted-foreground ml-1 italic">*Biaya admin bank Rp 2.500 dipotong dari saldo Anda.</p>
                    </div>

                    {!bankInquiryResult ? (
                      <Button 
                        onClick={handleBankInquiry} 
                        disabled={isProcessing || !selectedBank || !bankAccountNo || !bankAmount || parseInt(bankAmount) < 10000}
                        className="w-full h-12 rounded-xl font-bold bg-[#4C2B9A] text-white gap-2 shadow-lg shadow-[#4C2B9A]/20"
                      >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        Cek Rekening
                      </Button>
                    ) : (
                      <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                         <div className="p-6 rounded-2xl bg-[#4C2B9A]/5 border border-[#4C2B9A]/10 space-y-3">
                            <div className="flex justify-between items-center">
                               <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Detail Penerima</p>
                               <Badge variant="outline" className="bg-white border-border text-[8px] font-bold">VERIFIED</Badge>
                            </div>
                            <div className="space-y-0.5">
                               <h4 className="text-sm font-bold text-[#4C2B9A]">{bankInquiryResult.accountName}</h4>
                               <p className="text-[11px] font-medium text-muted-foreground">{selectedBank.label} • {bankInquiryResult.accountNo}</p>
                            </div>
                         </div>
                         <Button 
                          onClick={handleExecuteTransferBank} 
                          disabled={isProcessing}
                          className="w-full h-14 rounded-2xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-xl shadow-emerald-600/20"
                         >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                            Konfirmasi & Kirim Dana
                         </Button>
                         <Button variant="ghost" size="sm" onClick={() => setBankInquiryResult(null)} className="w-full text-xs font-bold text-muted-foreground">Batal / Ganti Rekening</Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                     <div className="p-6 rounded-3xl bg-amber-50 border border-amber-100 space-y-3">
                        <div className="flex items-center gap-2 text-amber-600">
                           <AlertCircle className="w-4 h-4" />
                           <h4 className="text-xs font-bold uppercase tracking-wider">Syarat & Ketentuan</h4>
                        </div>
                        <ul className="space-y-2 text-[10px] text-amber-800 leading-relaxed list-disc pl-4">
                           <li>Proses transfer ke bank mengikuti jam operasional sistem kliring nasional.</li>
                           <li>Dikenakan biaya admin standard sebesar Rp 2.500 per transaksi.</li>
                           <li>Pastikan nama penerima sudah sesuai sebelum menekan tombol Kirim.</li>
                        </ul>
                     </div>

                     <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 flex items-start gap-4">
                        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                           <p className="text-[11px] font-bold text-blue-900">Butuh Bantuan?</p>
                           <p className="text-[10px] text-blue-700 leading-relaxed">
                              Jika Anda mengalami kendala saat transfer, silakan hubungi Support STSPoint atau cek riwayat transaksi Anda.
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="text-center pt-8 border-t border-border opacity-20">
         <p className="text-[10px] font-bold uppercase tracking-[0.5em]">STSPay OVO Gateway v1.2</p>
      </div>
    </div>
  );
}
