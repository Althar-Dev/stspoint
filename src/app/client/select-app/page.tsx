"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Layout, 
  Plus, 
  Key, 
  ChevronRight, 
  Loader2, 
  AlertCircle,
  Globe,
  Settings,
  LogOut,
  AppWindow,
  ArrowRight,
  ShieldCheck,
  Rocket
} from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

export default function SelectAppPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  
  const [activationKey, setActivationKey] = useState("");
  const [appName, setAppName] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const appsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, "users", user.uid, "apps");
  }, [db, user?.uid]);

  const { data: apps, loading: appsLoading } = useCollection(appsQuery);

  const handleSelectApp = (appId: string) => {
    localStorage.setItem("sts_selected_app_id", appId);
    toast({ 
      title: "Berhasil Terhubung", 
      description: "Mengalihkan Anda ke dashboard aplikasi yang dipilih." 
    });
    router.push("/client");
  };

  const handleActivateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activationKey || !appName || !user?.uid || !db) return;

    setIsActivating(true);
    try {
      // Periksa validitas kunci di koleksi global Application_Keys
      const keyRef = doc(db, "Application_Keys", activationKey.trim());
      const keySnap = await getDoc(keyRef);

      if (!keySnap.exists()) {
        throw new Error("Activation Key tidak ditemukan. Pastikan kode benar.");
      }

      if (keySnap.data().status === 'used') {
        throw new Error("Activation Key ini sudah pernah digunakan sebelumnya.");
      }

      const appId = `APP-${Date.now()}`;
      const appRef = doc(db, "users", user.uid, "apps", appId);
      
      const appData = {
        id: appId,
        name: appName,
        activationKey: activationKey.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active'
      };

      // Simpan aplikasi ke akun partner
      await setDoc(appRef, appData);
      
      // Update status kunci menjadi used
      await updateDoc(keyRef, {
        status: 'used',
        usedBy: user.uid,
        appId: appId,
        updatedAt: serverTimestamp()
      });

      toast({ 
        title: "Aplikasi Aktif!", 
        description: `Instance "${appName}" telah berhasil dibuat.` 
      });
      
      handleSelectApp(appId);
    } catch (err: any) {
      toast({ 
        variant: "destructive", 
        title: "Gagal Aktivasi", 
        description: err.message 
      });
      setIsActivating(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/session", { method: "DELETE" });
    window.location.href = "/signin";
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-black flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] -translate-y-1/2 rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/5 blur-[100px] translate-y-1/2 rounded-full pointer-events-none"></div>

      <div className="w-full max-w-5xl z-10 space-y-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              <ShieldCheck className="w-3 h-3" />
              Partner Access Control
            </div>
            <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter leading-[0.9]">
              Pilih <span className="text-primary/40 italic">Aplikasi.</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-md leading-relaxed">
              Selamat datang di Gerbang Infrastruktur STS. Pilih website yang ingin Anda kelola atau aktifkan lisensi aplikasi baru.
            </p>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="rounded-xl h-12 px-6 gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 font-bold text-xs"
          >
            <LogOut className="w-4 h-4" />
            Keluar Akun
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Section: My Instances */}
          <div className="lg:col-span-7 space-y-4">
             <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                   <Layout className="w-3 h-3" />
                   Instance Aktif Anda
                </h3>
                {apps.length > 0 && (
                  <Badge variant="outline" className="h-5 px-2 border-primary/20 text-primary font-bold text-[9px] uppercase">{apps.length} Aplikasi</Badge>
                )}
             </div>

             <Card className="border-border shadow-2xl shadow-primary/5 rounded-[2.5rem] overflow-hidden bg-card/50 backdrop-blur-xl min-h-[420px] flex flex-col border-white/40 dark:border-white/5">
                <CardContent className="p-8 md:p-10 flex-1 flex flex-col justify-center">
                   {appsLoading ? (
                     <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <Loader2 className="w-10 h-10 animate-spin text-primary/20" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Cloud Data...</p>
                     </div>
                   ) : apps.length === 0 ? (
                     <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                           <AppWindow className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                        <div className="space-y-1">
                           <p className="font-bold text-lg">Belum Ada Aplikasi</p>
                           <p className="text-xs text-muted-foreground max-w-[240px]">Silakan aktifkan lisensi di sebelah kanan untuk meluncurkan website pertama Anda.</p>
                        </div>
                     </div>
                   ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full content-start">
                       {apps.map((app) => (
                         <button 
                           key={app.id} 
                           onClick={() => handleSelectApp(app.id)}
                           className="group p-6 rounded-[2rem] border border-border bg-white dark:bg-white/5 hover:border-primary/40 hover:bg-primary/5 transition-all text-left flex flex-col gap-4 relative overflow-hidden"
                         >
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                               <ArrowRight className="w-4 h-4 text-primary" />
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center border border-border transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-sm">
                               <Globe className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                               <p className="font-bold text-base truncate">{app.name}</p>
                               <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter mt-0.5">{app.id}</p>
                            </div>
                            <div className="pt-2 border-t border-border/50 flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                               <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">Operational</span>
                            </div>
                         </button>
                       ))}
                     </div>
                   )}
                </CardContent>
             </Card>
          </div>

          {/* Section: Activation */}
          <div className="lg:col-span-5 space-y-4">
             <div className="flex items-center px-2">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                   <Rocket className="w-3 h-3" />
                   Aktivasi Instance Baru
                </h3>
             </div>

             <Card className="border-none shadow-2xl shadow-primary/20 rounded-[2.5rem] overflow-hidden bg-primary text-primary-foreground h-full flex flex-col relative">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
                <CardHeader className="p-8 md:p-10 border-b border-white/10 shrink-0">
                   <CardTitle className="text-xl md:text-2xl font-headline font-bold flex items-center gap-3">
                      <Plus className="w-6 h-6" />
                      Mulai Sekarang
                   </CardTitle>
                   <CardDescription className="text-primary-foreground/60 text-xs mt-1">
                      Gunakan **Application Key** unik yang Anda miliki untuk meluncurkan website baru.
                   </CardDescription>
                </CardHeader>
                <CardContent className="p-8 md:p-10 flex-1">
                   <form onSubmit={handleActivateApp} className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/50 ml-1">Nama Website / Client</Label>
                        <div className="relative">
                          <Settings className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/30" />
                          <Input 
                            placeholder="e.g. Toko Diamond Pro" 
                            value={appName} 
                            onChange={(e) => setAppName(e.target.value)}
                            className="pl-11 h-14 rounded-2xl bg-white/10 border-transparent focus:bg-white/20 focus:border-white/30 transition-all font-bold text-white placeholder:text-white/20 shadow-inner"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/50 ml-1">Application Activation Key</Label>
                        <div className="relative">
                          <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/30" />
                          <Input 
                            placeholder="STS-App_XXXXXXXXXXXX" 
                            value={activationKey} 
                            onChange={(e) => setActivationKey(e.target.value)}
                            className="pl-11 h-14 rounded-2xl bg-white/10 border-transparent focus:bg-white/20 focus:border-white/30 transition-all font-mono text-xs uppercase text-white placeholder:text-white/20 shadow-inner"
                            required
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={isActivating || !activationKey || !appName}
                        className="w-full h-14 rounded-2xl bg-white text-primary hover:bg-zinc-100 font-bold uppercase tracking-widest text-[11px] shadow-2xl shadow-black/10 gap-2 transition-all active:scale-95 group"
                      >
                        {isActivating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />}
                        Aktifkan Sekarang
                      </Button>
                   </form>

                   <div className="mt-10 p-5 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-white/40 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-white/60 leading-relaxed italic">
                        Pastikan lisensi belum pernah digunakan. Satu lisensi hanya berlaku untuk satu instance website secara permanen.
                      </p>
                   </div>
                </CardContent>
             </Card>
          </div>
        </div>

        <div className="flex justify-center pt-4 opacity-30 group hover:opacity-100 transition-opacity">
           <div className="flex items-center gap-3">
              <div className="h-px w-12 bg-muted-foreground" />
              <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-muted-foreground">STSPoint Multi-Tenant Bridge</p>
              <div className="h-px w-12 bg-muted-foreground" />
           </div>
        </div>
      </div>
    </div>
  );
}
