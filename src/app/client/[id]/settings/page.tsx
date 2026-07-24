"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Globe, 
  Smartphone, 
  Store, 
  Mail, 
  Save,
  Loader2,
  Image as ImageIcon,
  MessageSquare,
  Lock,
  User as UserIcon,
  Instagram,
  Twitter,
  Facebook,
  Database,
  ShieldCheck,
  Zap,
  Globe2,
  CreditCard
} from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { getMongoSettings, updateMongoSettings } from "@/service/mongodb";

export default function ClientSettingsPage() {
  const params = useParams();
  const appId = params.id as string;
  const { user } = useUser();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  const [isMongoLoading, setIsMongoLoading] = useState(false);

  // Firestore Identity States
  const [storeName, setStoreName] = useState("");
  const [storeDesc, setStoreDesc] = useState("");
  const [contactWa, setContactWa] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  // MongoDB Settings States (for App Prem)
  const [merchantId, setMerchantId] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [instaUrl, setInstaUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [fbUrl, setFbUrl] = useState("");
  const [useGomerchant, setUseGomerchant] = useState(false);
  const [useOrderkuota, setUseOrderkuota] = useState(false);
  const [useStspay, setUseStspay] = useState(false);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(profileRef);

  const appRef = useMemoFirebase(() => {
    if (!db || !user?.uid || !appId) return null;
    return doc(db, "users", user.uid, "apps", appId);
  }, [db, user?.uid, appId]);

  const { data: app, loading: appLoading } = useDoc(appRef);

  const isAppPrem = useMemo(() => app?.type?.includes("appprem"), [app]);

  useEffect(() => {
    if (profile) {
      setStoreName(profile.storeName || profile.name || "");
      setStoreDesc(profile.storeDescription || "");
      setContactWa(profile.contactWhatsapp || "");
      setLogoUrl(profile.logoUrl || "");
    }
  }, [profile]);

  useEffect(() => {
    const fetchMongo = async () => {
      if (!user?.uid || !appId || !isAppPrem) return;
      setIsMongoLoading(true);
      try {
        const res = await getMongoSettings(user.uid, appId);
        if (res.success && res.data) {
          const d = res.data;
          setMerchantId(d.merchant_id || "");
          setSecretKey(d.secret_key || "");
          setContactEmail(d.contact_email || "");
          setInstaUrl(d.instagram_url || "");
          setTwitterUrl(d.twitter_url || "");
          setFbUrl(d.facebook_url || "");
          setUseGomerchant(!!d.gomerchant);
          setUseOrderkuota(!!d.orderkuota);
          setUseStspay(!!d.stspay);
          if (d.whatsapp) setContactWa(d.whatsapp);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsMongoLoading(false);
      }
    };

    if (isAppPrem) fetchMongo();
  }, [isAppPrem, user?.uid, appId]);

  const handleSaveSettings = async () => {
    if (!profileRef) return;
    setLoading(true);
    try {
      // 1. Save Identity to Firestore
      await updateDoc(profileRef, {
        storeName,
        storeDescription: storeDesc,
        contactWhatsapp: contactWa,
        logoUrl,
        updatedAt: serverTimestamp()
      });

      // 2. If App Prem, Save detailed config to MongoDB
      if (isAppPrem && user?.uid && appId) {
        const mongoData = {
          id: "payment_config",
          merchant_id: merchantId,
          secret_key: secretKey,
          whatsapp: contactWa,
          contact_email: contactEmail,
          instagram_url: instaUrl,
          twitter_url: twitterUrl,
          facebook_url: fbUrl,
          gomerchant: useGomerchant,
          orderkuota: useOrderkuota,
          stspay: useStspay
        };
        const mongoRes = await updateMongoSettings(user.uid, appId, mongoData);
        if (!mongoRes.success) throw new Error(mongoRes.message);
      }

      toast({ title: "Berhasil!", description: "Seluruh pengaturan telah diperbarui." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Gagal", description: e.message || "Gagal menyimpan pengaturan." });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Helper: Handle Exclusive Payment Module Selection
   */
  const handlePaymentToggle = (module: 'stspay' | 'orkut' | 'gopay', value: boolean) => {
    if (module === 'stspay') {
      setUseStspay(value);
      if (value) {
        setUseOrderkuota(false);
        setUseGomerchant(false);
      }
    } else if (module === 'orkut') {
      setUseOrderkuota(value);
      if (value) {
        setUseStspay(false);
        setUseGomerchant(false);
      }
    } else if (module === 'gopay') {
      setUseGomerchant(value);
      if (value) {
        setUseStspay(false);
        setUseOrderkuota(false);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold tracking-tight text-foreground">
            Pengaturan <span className="text-primary">Website</span>
          </h1>
          <p className="text-muted-foreground text-sm">Sesuaikan tampilan, identitas, dan fungsionalitas infrastruktur website Anda.</p>
        </div>
        <div className="flex items-center gap-2">
           {isAppPrem && (
              <Badge variant="outline" className="bg-blue-500/5 text-blue-600 border-blue-500/20 font-bold text-[9px] uppercase h-6 px-2 gap-1.5">
                <Database className="w-3 h-3" /> MongoDB Connected
              </Badge>
           )}
           <Button 
              onClick={handleSaveSettings}
              disabled={loading || isMongoLoading}
              className="rounded-xl h-11 px-8 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Simpan Perubahan
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Identitas Toko (Firestore Based) */}
        <Card className="border-border shadow-sm rounded-3xl bg-card overflow-hidden">
          <CardHeader className="px-8 py-6 border-b border-border bg-muted/30 dark:bg-[#0A0A0A]">
            <CardTitle className="text-xs font-bold flex items-center gap-2 uppercase tracking-[0.2em] text-muted-foreground">
              <Store className="w-4 h-4 text-primary" />
              Identitas Visual
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nama Website</Label>
                <Input 
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Contoh: Toko Diamond Pro"
                  className="rounded-xl border-border h-12 bg-muted/20 focus:bg-background transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">WhatsApp Support</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">+</span>
                  <Input 
                    value={contactWa}
                    onChange={(e) => setContactWa(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="628123456789"
                    className="rounded-xl border-border h-12 pl-8 bg-muted/20 focus:bg-background transition-all font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Logo / Favicon URL</Label>
              <div className="relative">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://link-gambar.com/logo.png"
                  className="rounded-xl border-border h-12 pl-11 bg-muted/20 focus:bg-background transition-all font-mono text-[11px]"
                />
              </div>
              <p className="text-[9px] text-muted-foreground ml-1">Logo ini akan muncul di Sidebar Dashboard dan Halaman Checkout pelanggan Anda.</p>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Deskripsi Singkat (SEO)</Label>
              <Textarea 
                value={storeDesc}
                onChange={(e) => setStoreDesc(e.target.value)}
                placeholder="Toko top-up game termurah dan tercepat se-Indonesia..."
                className="rounded-2xl border-border min-h-[100px] bg-muted/20 focus:bg-background transition-all resize-none text-sm leading-relaxed"
              />
            </div>
          </CardContent>
        </Card>

        {/* API Credentials (MongoDB Based - App Prem Only) */}
        {isAppPrem && (
          <Card className="border-border shadow-sm rounded-3xl bg-card overflow-hidden">
            <CardHeader className="px-8 py-6 border-b border-border bg-muted/30 dark:bg-[#0A0A0A]">
              <CardTitle className="text-xs font-bold flex items-center gap-2 uppercase tracking-[0.2em] text-muted-foreground">
                <Lock className="w-4 h-4 text-primary" />
                Infrastruktur & API Bridge
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
               <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
                     Gunakan <strong>Merchant ID</strong> dan <strong>Secret Key</strong> dari Console STSPoint Anda untuk menghubungkan website premium ini dengan sistem pembayaran otomatis.
                  </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">STS Merchant ID</Label>
                    <Input 
                      value={merchantId}
                      onChange={(e) => setMerchantId(e.target.value.toUpperCase())}
                      placeholder="STS-XXXXXXXX"
                      className="rounded-xl border-border h-12 bg-muted/20 focus:bg-background transition-all font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">STS Secret Key</Label>
                    <Input 
                      type="password"
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                      placeholder="STS-Key-XXXXXXXX"
                      className="rounded-xl border-border h-12 bg-muted/20 focus:bg-background transition-all font-mono"
                    />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Contact Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="help@domain.com"
                        className="rounded-xl h-12 pl-11 bg-muted/20 focus:bg-background transition-all text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Instagram URL</Label>
                    <div className="relative">
                      <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        value={instaUrl}
                        onChange={(e) => setInstaUrl(e.target.value)}
                        placeholder="https://instagram.com/..."
                        className="rounded-xl h-12 pl-11 bg-muted/20 focus:bg-background transition-all text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Twitter URL</Label>
                    <div className="relative">
                      <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        value={twitterUrl}
                        onChange={(e) => setTwitterUrl(e.target.value)}
                        placeholder="https://x.com/..."
                        className="rounded-xl h-12 pl-11 bg-muted/20 focus:bg-background transition-all text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Facebook URL</Label>
                    <div className="relative">
                      <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        value={fbUrl}
                        onChange={(e) => setFbUrl(e.target.value)}
                        placeholder="https://facebook.com/..."
                        className="rounded-xl h-12 pl-11 bg-muted/20 focus:bg-background transition-all text-sm"
                      />
                    </div>
                  </div>
               </div>
            </CardContent>
          </Card>
        )}

        {/* Feature Toggles (Firestore & MongoDB Combined) */}
        <Card className="border-border shadow-sm rounded-3xl bg-card overflow-hidden">
          <CardHeader className="px-8 py-6 border-b border-border bg-muted/30 dark:bg-[#0A0A0A]">
            <CardTitle className="text-xs font-bold flex items-center gap-2 uppercase tracking-[0.2em] text-muted-foreground">
              {isAppPrem ? <CreditCard className="w-4 h-4 text-primary" /> : <Zap className="w-4 h-4 text-primary" />}
              {isAppPrem ? 'Metode Pembayaran Aktif' : 'Modul & Fitur Aktif'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border">
            {isAppPrem ? (
              <>
                <div className="px-8 py-6 flex items-center justify-between hover:bg-muted/10 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-[#00AED6]/10 text-[#00AED6] mt-0.5">
                      <Globe2 className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-tight">STSPay Gateway</h4>
                      <p className="text-[10px] text-muted-foreground max-w-xs leading-relaxed">Aktifkan pembayaran otomatis via QRIS & VA melalui bridge STSPay.</p>
                    </div>
                  </div>
                  <Switch 
                    checked={useStspay} 
                    onCheckedChange={(val) => handlePaymentToggle('stspay', val)} 
                  />
                </div>
                <div className="px-8 py-6 flex items-center justify-between hover:bg-muted/10 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-600 mt-0.5">
                      <Smartphone className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-tight">Orderkuota Engine</h4>
                      <p className="text-[10px] text-muted-foreground max-w-xs leading-relaxed">Gunakan saldo Orderkuota Anda untuk rekonsiliasi pembayaran.</p>
                    </div>
                  </div>
                  <Switch 
                    checked={useOrderkuota} 
                    onCheckedChange={(val) => handlePaymentToggle('orkut', val)} 
                  />
                </div>
                <div className="px-8 py-6 flex items-center justify-between hover:bg-muted/10 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 mt-0.5">
                      <ImageIcon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-tight">GoMerchant Logic</h4>
                      <p className="text-[10px] text-muted-foreground max-w-xs leading-relaxed">Otomatisasi pengecekan mutasi melalui akun GoPay Merchant.</p>
                    </div>
                  </div>
                  <Switch 
                    checked={useGomerchant} 
                    onCheckedChange={(val) => handlePaymentToggle('gopay', val)} 
                  />
                </div>
              </>
            ) : (
              [
                { label: 'Mode Maintenance', desc: 'Matikan website untuk sementara saat pemeliharaan.', icon: Lock },
                { label: 'Notifikasi WhatsApp', desc: 'Kirim pesan otomatis ke pelanggan saat pesanan sukses.', icon: MessageSquare },
                { label: 'Tampilkan Saldo User', desc: 'Izinkan pelanggan memiliki sistem saldo/deposit.', icon: UserIcon },
              ].map((feature, i) => (
                <div key={i} className="px-8 py-6 flex items-center justify-between hover:bg-muted/10 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-muted text-muted-foreground mt-0.5">
                      <feature.icon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-tight">{feature.label}</h4>
                      <p className="text-[10px] text-muted-foreground max-w-xs leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                  <Switch />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="text-center pt-8 border-t border-border opacity-20">
         <p className="text-[9px] font-bold uppercase tracking-[0.5em]">STSPoint Node Configurator v2.1</p>
      </div>
    </div>
  );
}
