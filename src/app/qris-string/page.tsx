
"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  QrCode, 
  Upload, 
  Copy, 
  RefreshCcw, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Terminal,
  Eraser
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import jsQR from "jsqr";

export default function QrisStringPage() {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", title: "Format Error", description: "Harap unggah file gambar (PNG/JPG)." });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImage(dataUrl);
      decodeQR(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const decodeQR = (dataUrl: string) => {
    setIsDecoding(true);
    setError(null);
    setResult(null);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code) {
        setResult(code.data);
        toast({ title: "Berhasil!", description: "String QRIS berhasil diekstrak." });
      } else {
        setError("Gagal mendeteksi kode QR. Pastikan gambar jelas dan merupakan kode QRIS valid.");
        toast({ variant: "destructive", title: "Decoding Gagal", description: "Kode QR tidak ditemukan di gambar ini." });
      }
      setIsDecoding(false);
    };
    img.onerror = () => {
      setError("Gagal memuat gambar.");
      setIsDecoding(false);
    };
    img.src = dataUrl;
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    toast({ title: "Copied!", description: "String QRIS telah disalin ke clipboard." });
  };

  const resetTool = () => {
    setImage(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-5xl mx-auto px-4 space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-5xl font-headline font-bold tracking-tight">
          Convert QRIS <span className="text-primary">Image to String.</span>
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
          Ekstrak payload teks asli dari gambar QRIS Anda secara aman dan instan langsung di browser.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Upload Area */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border shadow-sm rounded-[2rem] overflow-hidden bg-card">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary" />
                Upload QRIS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative aspect-square rounded-[1.5rem] border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-muted/30 hover:border-primary/20 ${image ? 'p-2' : 'p-10'}`}
              >
                {image ? (
                  <img src={image} alt="QRIS Preview" className="w-full h-full object-contain rounded-2xl" />
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto">
                      <ImageIcon className="w-8 h-8 text-primary/40" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-widest">Pilih Gambar QRIS</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-medium">PNG, JPG, JPEG Max 5MB</p>
                    </div>
                  </div>
                )}
                <Input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>

              <div className="pt-6 flex gap-3">
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10"
                >
                  Ganti Gambar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={resetTool}
                  className="w-12 h-12 rounded-xl p-0"
                >
                  <Eraser className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm rounded-[2rem] bg-slate-50 dark:bg-white/5 border-dashed p-8">
             <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center shrink-0">
                   <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="space-y-1">
                   <h4 className="text-xs font-bold uppercase tracking-widest">Client-Side Only</h4>
                   <p className="text-[10px] text-muted-foreground leading-relaxed">
                     Semua proses decoding terjadi secara lokal di perangkat Anda. Gambar tidak pernah dikirim ke server kami, menjaga keamanan payload QRIS Anda.
                   </p>
                </div>
             </div>
          </Card>
        </div>

        {/* Result Area */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-border shadow-sm rounded-[2.5rem] overflow-hidden bg-card min-h-[400px] flex flex-col">
            <CardHeader className="p-8 pb-4 border-b border-border bg-muted/20">
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-primary" />
                      QRIS Raw String
                    </CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground">Payload Data Output</CardDescription>
                  </div>
                  {isDecoding && (
                    <Badge variant="outline" className="h-6 px-2 gap-2 border-primary/20 text-primary">
                      <RefreshCcw className="w-3 h-3 animate-spin" />
                      Decoding...
                    </Badge>
                  )}
               </div>
            </CardHeader>
            <CardContent className="p-8 flex-1 flex flex-col justify-center">
               {!image ? (
                 <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center opacity-20">
                    <QrCode className="w-16 h-16" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Menunggu Gambar</p>
                 </div>
               ) : error ? (
                 <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/20 text-center space-y-4">
                    <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
                    <div className="space-y-1">
                       <p className="text-sm font-bold text-destructive">Gagal Membaca QRIS</p>
                       <p className="text-xs text-muted-foreground leading-relaxed">{error}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => decodeQR(image!)} className="rounded-lg h-8 px-4 font-bold text-[10px] uppercase">
                       Coba Lagi
                    </Button>
                 </div>
               ) : (
                 <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                    <div className="p-6 rounded-3xl bg-muted/30 border border-border font-mono text-[11px] leading-relaxed break-all relative group">
                       <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Badge variant="outline" className="bg-background text-[8px] uppercase tracking-tighter">Payload Detect</Badge>
                       </div>
                       {result || "Decoding..."}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                       <Button 
                        disabled={!result}
                        onClick={copyToClipboard}
                        className="flex-1 h-14 rounded-2xl bg-primary font-bold uppercase tracking-widest text-[11px] gap-2 shadow-xl shadow-primary/10"
                       >
                          <Copy className="w-4 h-4" /> Salin String
                       </Button>
                       <div className="p-4 bg-muted/50 rounded-2xl flex items-center justify-center gap-4 flex-1">
                          <div className="text-center">
                             <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Panjang Karakter</p>
                             <p className="font-headline font-bold text-xl">{result?.length || 0}</p>
                          </div>
                          <div className="w-px h-8 bg-border" />
                          <div className="text-center">
                             <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Versi QRIS</p>
                             <p className="font-headline font-bold text-xl">{result?.substring(0, 2) === '00' ? '1.0' : '?'}</p>
                          </div>
                       </div>
                    </div>
                 </div>
               )}
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm rounded-[2rem] overflow-hidden bg-zinc-900 text-white p-8 relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] -mr-16 -mt-16 opacity-40"></div>
             <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                   <h3 className="text-lg font-headline font-bold flex items-center gap-2">
                     <FileText className="w-5 h-5 text-primary" />
                     Gunakan Base QRIS Anda
                   </h3>
                   <p className="text-[11px] text-white/50 leading-relaxed max-w-sm">
                     Tempelkan string hasil decode ini ke halaman pengaturan **Orderkuota** atau **GoMerchant** untuk mengaktifkan fitur pembayaran otomatis.
                   </p>
                </div>
                <Button asChild variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-xl h-10 px-6 font-bold text-[10px] uppercase tracking-widest">
                   <a href="/console">Buka Console</a>
                </Button>
             </div>
          </Card>
        </div>
      </div>

      <div className="text-center pt-10 border-t border-border/50 max-w-3xl mx-auto">
         <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.5em] opacity-30">
           STSPoint Secure Decoder Engine • No Data Uploaded
         </p>
      </div>
    </div>
  );
}
