"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Banknote, 
  Bell, 
  ShieldCheck, 
  Save, 
  Loader2,
  Mail,
  Globe,
  Lock,
  Info,
  Store
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

export default function STSPaySettingsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);

  // States
  const [businessName, setBusinessName] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [bankName, setBankName] = useState("BCA");
  const [accountNumber, setAccountNumber] = useState("**** 1283");

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
    }
  }, [profile]);

  const handleSaveGeneral = async () => {
    if (!profileRef) return;
    setLoading(true);
    try {
      await updateDoc(profileRef, {
        name: businessName,
        merchantName: merchantName,
        updatedAt: serverTimestamp()
      });
      toast({ title: "Berhasil", description: "Profil bisnis dan merchant telah diperbarui." });
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal", description: "Gagal menyimpan perubahan." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 gap-8">
        {/* Identitas Bisnis & Merchant */}
        <Card className="border-border shadow-sm rounded-md bg-card overflow-hidden">
          <CardHeader className="px-8 py-6 border-b border-border bg-muted/30 dark:bg-[#0A0A0A]">
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
              <Building2 className="w-4 h-4 text-primary" />
              Profil Identitas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nama Bisnis (Legal)</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Contoh: PT Teknologi Digital"
                    className="rounded-md border-border h-11 pl-10 bg-muted/30 focus:bg-background transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nama Merchant (Brand)</Label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    placeholder="Contoh: STS Point Pro"
                    className="rounded-md border-border h-11 pl-10 bg-muted/30 focus:bg-background transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Operasional</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    disabled
                    value={businessEmail}
                    className="rounded-md border-border h-11 pl-10 bg-muted/50 cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Website URL</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="https://bisnis-anda.com"
                    className="rounded-md border-border h-11 pl-10 bg-muted/30 focus:bg-background transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <Button 
                onClick={handleSaveGeneral}
                disabled={loading}
                className="rounded-md h-11 px-8 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Simpan Profil
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Rekening Penarikan */}
        <Card className="border-border shadow-sm rounded-md bg-card overflow-hidden">
          <CardHeader className="px-8 py-6 border-b border-border bg-muted/30 dark:bg-[#0A0A0A]">
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
              <Banknote className="w-4 h-4 text-primary" />
              Rekening Payout
            </CardTitle>
            <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground/60">Tempat dana hasil penjualan Anda dicairkan.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-md bg-primary/5 border border-primary/10">
               <div className="w-16 h-16 rounded-full bg-white border border-border flex items-center justify-center shadow-sm shrink-0">
                  <span className="font-bold text-primary text-xs">BCA</span>
               </div>
               <div className="flex-1 space-y-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <h4 className="font-bold text-lg">{accountNumber}</h4>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[8px] uppercase font-bold h-4">Verified</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-tight">a.n {profile?.name || "---"}</p>
               </div>
               <Button variant="outline" className="rounded-md h-10 px-6 font-bold uppercase tracking-widest text-[10px] bg-card">
                 Ubah Rekening
               </Button>
            </div>
            <div className="mt-4 flex items-start gap-3 p-4 rounded-md bg-amber-500/5 border border-amber-500/10">
               <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
               <p className="text-[10px] text-amber-800 leading-relaxed font-medium uppercase">
                 Perubahan rekening memerlukan waktu verifikasi manual selama 1x24 jam untuk menjaga keamanan dana Anda.
               </p>
            </div>
          </CardContent>
        </Card>

        {/* Gateway & Security Preferences */}
        <Card className="border-border shadow-sm rounded-md bg-card overflow-hidden">
          <CardHeader className="px-8 py-6 border-b border-border bg-muted/30 dark:bg-[#0A0A0A]">
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Gateway Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border">
            {[
              { label: 'Sandbox Mode', desc: 'Gunakan lingkungan testing untuk simulasi transaksi tanpa uang sungguhan.', icon: Lock, status: false },
              { label: 'Webhook Alerts', desc: 'Kirim notifikasi otomatis ke server Anda setiap ada transaksi sukses.', icon: Bell, status: true },
              { label: 'Auto-Settlement', desc: 'Cairkan saldo secara otomatis setiap hari ke rekening utama.', icon: Banknote, status: false },
              { label: 'Double Verification', desc: 'Wajibkan verifikasi 2FA untuk setiap penarikan saldo.', icon: ShieldCheck, status: true },
            ].map((pref, i) => (
              <div key={i} className="px-8 py-5 flex items-center justify-between hover:bg-muted/10 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-md bg-muted text-muted-foreground mt-0.5">
                    <pref.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">{pref.label}</h4>
                    <p className="text-[10px] text-muted-foreground max-w-xs leading-relaxed">{pref.desc}</p>
                  </div>
                </div>
                <Switch checked={pref.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Merchant Keys Glance */}
        <Card className="border-border shadow-sm rounded-md bg-zinc-900 text-white p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-[60px] -mr-16 -mt-16"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                API Credentials
              </h3>
              <p className="text-xs text-white/50 leading-relaxed max-w-md">
                Gunakan Merchant ID dan Secret Key Anda untuk mengintegrasikan STSPay ke dalam aplikasi atau website Anda.
              </p>
            </div>
            <Button asChild className="bg-white text-black hover:bg-white/90 font-bold rounded-md px-8 h-12 uppercase tracking-widest text-[10px]">
               <a href="/console/developer/api-keys">Kelola API Keys</a>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
