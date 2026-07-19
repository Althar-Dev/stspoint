"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { 
  ChevronLeft, 
  QrCode, 
  Download, 
  Loader2, 
  AlertCircle,
  Coins,
  RefreshCcw,
  ArrowRight
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { generateDynamicQrisAction } from "./actions";

export default function OrkutQrisPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  
  const [nominal, setNominal] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrisResult, setQrisResult] = useState<string | null>(null);

  const orderkuotaRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid, "services", "orderkuota");
  }, [db, user?.uid]);

  const { data: orderkuota, loading: configLoading } = useDoc(orderkuotaRef);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderkuota?.baseQr) {
      toast({ 
        variant: "destructive", 
        title: "Konfigurasi Belum Lengkap", 
        description: "Harap atur Base QRIS Anda di halaman pengaturan Orderkuota terlebih dahulu." 
      });
      return;
    }

    const amt = parseInt(nominal);
    if (isNaN(amt) || amt < 100) {
      toast({ variant: "destructive", title: "Nominal Tidak Valid", description: "Minimal nominal adalah Rp 100." });
      return;
    }

    setIsGenerating(true);
    try {
      const res = await generateDynamicQrisAction(orderkuota.baseQr, nominal);
      if (res.success && res.dataUri) {
        setQrisResult(res.dataUri);
        toast({ title: "QRIS Berhasil Dibuat", description: `QRIS dengan nominal Rp ${amt.toLocaleString()} siap dipindai.` });
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Gagal", description: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!qrisResult) return;
    const link = document.createElement("a");
    link.href = qrisResult;
    link.download = `QRIS-ORKUT-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Custom Back Navigation */}
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
        <h1 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Orderkuota QRIS Generator</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Input Form */}
        <Card className="border-border shadow-sm rounded-3xl overflow-hidden bg-card">
          <CardHeader className="px-8 py-6 border-b border-border bg-muted/30 dark:bg-[#0A0A0A]">
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
              <Coins className="w-4 h-4 text-primary" />
              Detail Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nominal Transaksi (IDR)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">Rp</span>
                  <Input 
                    type="number"
                    placeholder="Contoh: 50000"
                    value={nominal}
                    onChange={(e) => setNominal(e.target.value)}
                    className="h-14 pl-12 rounded-2xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all text-xl font-headline font-bold"
                  />
                </div>
              </div>

              {!orderkuota?.baseQr && !configLoading && (
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-800 leading-relaxed font-medium uppercase">
                    Peringatan: Base QRIS belum diatur. Harap konfigurasi Base QRIS di pengaturan dashboard Orkut.
                  </p>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isGenerating || !nominal || configLoading}
                className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-sm uppercase tracking-widest shadow-xl shadow-primary/10 transition-all active:scale-95"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <QrCode className="w-5 h-5 mr-2" />}
                Buat Kode QRIS
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* QR Result */}
        <Card className={`border-border shadow-sm rounded-3xl overflow-hidden bg-card h-full flex flex-col items-center justify-center transition-all ${!qrisResult ? 'opacity-40' : ''}`}>
           <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-6 w-full">
              {!qrisResult ? (
                <div className="py-20 space-y-4">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto opacity-30">
                    <QrCode className="w-10 h-10" />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Menunggu Input Nominal...</p>
                </div>
              ) : (
                <div className="animate-in zoom-in-95 duration-500 w-full space-y-8">
                   <div className="p-4 bg-white border border-border rounded-3xl shadow-2xl inline-block mx-auto">
                      <img 
                        src={qrisResult} 
                        alt="Dynamic QRIS" 
                        className="w-64 h-64 sm:w-72 sm:h-72 object-contain"
                      />
                   </div>
                   
                   <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Total Tagihan</p>
                        <h3 className="text-3xl font-headline font-bold text-primary">Rp {parseInt(nominal).toLocaleString('id-ID')}</h3>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleDownload}
                          variant="outline" 
                          className="flex-1 h-12 rounded-xl font-bold uppercase text-[10px] tracking-widest border-border gap-2"
                        >
                          <Download className="w-4 h-4" /> Unduh Gambar
                        </Button>
                        <Button 
                          onClick={() => setQrisResult(null)}
                          variant="ghost" 
                          className="h-12 w-12 rounded-xl hover:bg-muted"
                        >
                          <RefreshCcw className="w-4 h-4" />
                        </Button>
                      </div>
                   </div>

                   <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                     *Silakan pindai menggunakan aplikasi Dana, OVO, ShopeePay, GoPay atau Mobile Banking.
                   </p>
                </div>
              )}
           </CardContent>
        </Card>
      </div>
    </div>
  );
}