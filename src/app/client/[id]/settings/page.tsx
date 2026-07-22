"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  User as UserIcon
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

export default function ClientSettingsPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);

  // Store Settings States
  const [storeName, setStoreName] = useState("");
  const [storeDesc, setStoreDesc] = useState("");
  const [contactWa, setContactWa] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(profileRef);

  useEffect(() => {
    if (profile) {
      setStoreName(profile.storeName || profile.name || "");
      setStoreDesc(profile.storeDescription || "");
      setContactWa(profile.contactWhatsapp || "");
      setLogoUrl(profile.logoUrl || "");
    }
  }, [profile]);

  const handleSaveSettings = async () => {
    if (!profileRef) return;
    setLoading(true);
    try {
      await updateDoc(profileRef, {
        storeName,
        storeDescription: storeDesc,
        contactWhatsapp: contactWa,
        logoUrl,
        updatedAt: serverTimestamp()
      });
      toast({ title: "Berhasil!", description: "Pengaturan website Anda telah diperbarui." });
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal", description: "Gagal menyimpan pengaturan." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h1 className="text-2xl font-headline font-bold tracking-tight">Pengaturan <span className="text-primary">Website</span></h1>
        <p className="text-muted-foreground text-sm">Sesuaikan tampilan dan informasi operasional toko online Anda.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* General Store Settings */}
        <Card className="border-border shadow-sm rounded-md bg-card overflow-hidden">
          <CardHeader className="px-8 py-6 border-b border-border bg-muted/30 dark:bg-[#0A0A0A]">
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
              <Store className="w-4 h-4 text-primary" />
              Identitas Toko
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nama Website / Toko</Label>
                <Input 
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Contoh: Toko Diamond Pro"
                  className="rounded-md border-border h-11 bg-muted/30 focus:bg-background transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">WhatsApp Support</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">+62</span>
                  <Input 
                    value={contactWa}
                    onChange={(e) => setContactWa(e.target.value)}
                    placeholder="8123456789"
                    className="rounded-md border-border h-11 pl-11 bg-muted/30 focus:bg-background transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Logo URL (Icon)</Label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://link-gambar.com/logo.png"
                  className="rounded-md border-border h-11 pl-10 bg-muted/30 focus:bg-background transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Deskripsi Singkat (SEO)</Label>
              <Textarea 
                value={storeDesc}
                onChange={(e) => setStoreDesc(e.target.value)}
                placeholder="Toko top-up game termurah dan tercepat se-Indonesia..."
                className="rounded-md border-border min-h-[100px] bg-muted/30 focus:bg-background transition-all resize-none"
              />
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <Button 
                onClick={handleSaveSettings}
                disabled={loading}
                className="rounded-md h-11 px-8 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Simpan Perubahan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feature Toggles */}
        <Card className="border-border shadow-sm rounded-md bg-card overflow-hidden">
          <CardHeader className="px-8 py-6 border-b border-border bg-muted/30 dark:bg-[#0A0A0A]">
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
              <Settings className="w-4 h-4 text-primary" />
              Fitur Website
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border">
            {[
              { label: 'Mode Maintenance', desc: 'Matikan website untuk sementara saat pemeliharaan.', icon: Lock },
              { label: 'Notifikasi WhatsApp', desc: 'Kirim pesan otomatis ke pelanggan saat pesanan sukses.', icon: MessageSquare },
              { label: 'Tampilkan Saldo User', desc: 'Izinkan pelanggan memiliki sistem saldo/deposit.', icon: UserIcon },
            ].map((feature, i) => (
              <div key={i} className="px-8 py-5 flex items-center justify-between hover:bg-muted/10 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-md bg-muted text-muted-foreground mt-0.5">
                    <feature.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">{feature.label}</h4>
                    <p className="text-[10px] text-muted-foreground max-w-xs">{feature.desc}</p>
                  </div>
                </div>
                <Switch />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}