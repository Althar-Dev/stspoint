"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Building2, 
  Banknote, 
  ShieldCheck, 
  Save, 
  Loader2,
  Mail,
  Globe,
  Lock,
  Info,
  Store,
  Image as ImageIcon,
  Landmark,
  User as UserIcon,
  Clock,
  CheckCircle2
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

export default function STSPaySettingsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  const [isSavingPayout, setIsSavingPayout] = useState(false);

  // Identitas States
  const [businessName, setBusinessName] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  // Payout Account States
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");

  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(profileRef);

  useEffect(() => {
    if (profile) {
      setBusinessName(profile.name || "");
      setMerchantName(profile.merchantName || "");
      setBusinessEmail(profile.email || "");
      setLogoUrl(profile.logoUrl || "");
      
      setBankName(profile.payoutBankName || "");
      setBankAccountNumber(profile.payoutAccountNumber || "");
      setBankAccountName(profile.payoutAccountName || "");
    }
  }, [profile]);

  const handleSaveGeneral = async () => {
    if (!profileRef) return;
    setLoading(true);
    try {
      await updateDoc(profileRef, {
        name: businessName,
        merchantName: merchantName,
        logoUrl: logoUrl,
        updatedAt: serverTimestamp()
      });
      toast({ title: "Berhasil", description: "Profil bisnis dan merchant telah diperbarui." });
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal", description: "Gagal menyimpan perubahan." });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePayout = async () => {
    if (!profileRef) return;
    setIsSavingPayout(true);
    try {
      await updateDoc(profileRef, {
        payoutBankName: bankName,
        payoutAccountNumber: bankAccountNumber,
        payoutAccountName: bankAccountName,
        payoutAccountStatus: 'PENDING',
        updatedAt: serverTimestamp()
      });
      toast({ title: "Berhasil", description: "Rekening Bank telah diajukan untuk verifikasi." });
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal", description: "Gagal menyimpan rekening." });
    } finally {
      setIsSavingPayout(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto px-1 md:px-0">
      <div className="grid grid-cols-1 gap-6 md:gap-8">
        {/* Identitas Bisnis & Merchant */}
        <Card className="border-border shadow-sm rounded-2xl md:rounded-[2rem] bg-card overflow-hidden">
          <CardHeader className="px-6 md:px-8 py-5 md:py-6 border-b border-border bg-muted/30 dark:bg-[#0A0A0A]">
            <CardTitle className="text-[11px] md:text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
              <Building2 className="w-4 h-4 text-primary" />
              Profil Identitas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div className="space-y-1.5">
                <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Nama Bisnis (Legal)</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Contoh: PT Teknologi Digital"
                    className="rounded-xl border-border h-11 md:h-12 pl-10 bg-muted/30 focus:bg-background transition-all font-bold text-xs md:text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Nama Merchant (Brand)</Label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    placeholder="Contoh: STS Point Pro"
                    className="rounded-xl border-border h-11 md:h-12 pl-10 bg-muted/30 focus:bg-background transition-all font-bold text-xs md:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Logo URL (Icon)</Label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://link-gambar.com/logo.png"
                  className="rounded-xl border-border h-11 md:h-12 pl-10 bg-muted/30 focus:bg-background transition-all font-mono text-[10px] md:text-xs"
                />
              </div>
              <p className="text-[9px] md:text-[10px] text-muted-foreground ml-1">Logo ini akan muncul di Sidebar Dashboard dan Halaman Checkout pelanggan Anda.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div className="space-y-1.5">
                <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Operasional</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    disabled
                    value={businessEmail}
                    className="rounded-xl border-border h-11 md:h-12 pl-10 bg-muted/50 cursor-not-allowed text-xs md:text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Website URL</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="https://bisnis-anda.com"
                    className="rounded-xl border-border h-11 md:h-12 pl-10 bg-muted/30 focus:bg-background transition-all text-xs md:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex flex-col sm:flex-row justify-end">
              <Button 
                onClick={handleSaveGeneral}
                disabled={loading}
                className="w-full sm:w-auto rounded-xl h-11 md:h-12 px-10 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Simpan Profil
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Rekening Penarikan */}
        <Card className="border-border shadow-sm rounded-2xl md:rounded-[2rem] bg-card overflow-hidden">
          <CardHeader className="px-6 md:px-8 py-5 md:py-6 border-b border-border bg-muted/30 dark:bg-[#0A0A0A]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-[11px] md:text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                  <Banknote className="w-4 h-4 text-primary" />
                  Rekening Bank
                </CardTitle>
                <CardDescription className="text-[9px] md:text-[10px] uppercase font-bold text-muted-foreground/60">Tempat dana hasil penjualan Anda dicairkan.</CardDescription>
              </div>
              {profile?.payoutAccountStatus && (
                <Badge className={`border-none text-[8px] md:text-[9px] font-bold uppercase rounded-md gap-1.5 px-3 py-1 w-fit ${
                  profile.payoutAccountStatus === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                }`}>
                  {profile.payoutAccountStatus === 'VERIFIED' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                  {profile.payoutAccountStatus === 'VERIFIED' ? 'Verified' : 'Pending Verification'}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-5 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
              <div className="space-y-1.5">
                <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Nama Bank</Label>
                <Select value={bankName} onValueChange={setBankName}>
                  <SelectTrigger className="h-11 md:h-12 rounded-xl border-border bg-muted/30 focus:bg-background transition-all pl-10 relative text-xs md:text-sm font-bold">
                    <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <SelectValue placeholder="Pilih Bank / E-Wallet" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border">
                    <SelectItem value="Bank BCA" className="rounded-lg text-xs md:text-sm">Bank BCA</SelectItem>
                    <SelectItem value="Bank BNI" className="rounded-lg text-xs md:text-sm">Bank BNI</SelectItem>
                    <SelectItem value="Bank BRI" className="rounded-lg text-xs md:text-sm">Bank BRI</SelectItem>
                    <SelectItem value="Bank BSI" className="rounded-lg text-xs md:text-sm">Bank BSI</SelectItem>
                    <SelectItem value="Bank Jago" className="rounded-lg text-xs md:text-sm">Bank Jago</SelectItem>
                    <SelectItem value="Bank Mandiri" className="rounded-lg text-xs md:text-sm">Bank Mandiri</SelectItem>
                    <SelectItem value="Dana" className="rounded-lg text-xs md:text-sm">Dana</SelectItem>
                    <SelectItem value="Gopay" className="rounded-lg text-xs md:text-sm">Gopay</SelectItem>
                    <SelectItem value="Ovo" className="rounded-lg text-xs md:text-sm">Ovo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Nomor Rekening</Label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    placeholder="e.g. 1234567890"
                    className="rounded-xl border-border h-11 md:h-12 pl-10 bg-muted/30 focus:bg-background transition-all font-mono font-bold text-xs md:text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Nama Pemilik Rekening</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={bankAccountName}
                    onChange={(e) => setBankAccountName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="rounded-xl border-border h-11 md:h-12 pl-10 bg-muted/30 focus:bg-background transition-all font-bold text-xs md:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 w-full md:flex-1">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[9px] md:text-[11px] text-amber-800 leading-relaxed font-medium uppercase">
                  Pastikan data rekening benar. Perubahan rekening memerlukan verifikasi manual 1x24 jam.
                </p>
              </div>
              <Button 
                onClick={handleSavePayout}
                disabled={isSavingPayout}
                className="w-full md:w-auto rounded-xl h-11 md:h-12 px-8 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10 shrink-0"
              >
                {isSavingPayout ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Ajukan Verifikasi
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Merchant Keys Glance */}
        <Card className="border-border shadow-sm rounded-2xl md:rounded-[2rem] bg-zinc-900 text-white p-6 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-[60px] -mr-16 -mt-16 opacity-30"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <h3 className="font-bold text-base md:text-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                API Credentials
              </h3>
              <p className="text-[10px] md:text-xs text-white/50 leading-relaxed max-w-md">
                Gunakan Merchant ID dan Secret Key Anda untuk mengintegrasikan STSPay ke dalam aplikasi atau website Anda.
              </p>
            </div>
            <Button asChild className="bg-white text-black hover:bg-white/90 font-bold rounded-xl px-8 h-11 md:h-12 uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-lg shadow-white/5">
               <a href="/console/developer/api-keys">Kelola API Keys</a>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
