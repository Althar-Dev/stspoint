
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Layout, 
  Plus, 
  Key, 
  Loader2, 
  LogOut,
  AppWindow,
  ArrowRight,
  Globe
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
      description: "Membuka dashboard aplikasi." 
    });
    router.push("/client");
  };

  const handleActivateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activationKey || !appName || !user?.uid || !db) return;

    setIsActivating(true);
    try {
      // Check if the key exists in global collection
      const keyRef = doc(db, "Application_Keys", activationKey.trim());
      const keySnap = await getDoc(keyRef);

      if (!keySnap.exists()) {
        throw new Error("Kunci Aktivasi tidak ditemukan. Harap periksa kembali.");
      }

      if (keySnap.data().status === 'used') {
        throw new Error("Kunci ini sudah pernah digunakan.");
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

      // Save to user's apps
      await setDoc(appRef, appData);
      
      // Update global key status
      await updateDoc(keyRef, {
        status: 'used',
        usedBy: user.uid,
        appId: appId,
        updatedAt: serverTimestamp()
      });

      toast({ 
        title: "Aktivasi Berhasil!", 
        description: `Instance "${appName}" telah aktif.` 
      });
      
      handleSelectApp(appId);
    } catch (err: any) {
      toast({ 
        variant: "destructive", 
        title: "Aktivasi Gagal", 
        description: err.message 
      });
    } finally {
      setIsActivating(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/session", { method: "DELETE" });
    window.location.href = "/signin";
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center p-6 md:p-12">
      <div className="w-full max-w-4xl space-y-10">
        
        {/* Simple Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Layout className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold tracking-tight">Portal Partner</h1>
            </div>
            <p className="text-xs text-muted-foreground">Pilih aplikasi yang ingin dikelola atau aktifkan lisensi baru.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="w-fit text-muted-foreground hover:text-destructive hover:bg-destructive/5 font-bold text-xs rounded-xl">
            <LogOut className="w-4 h-4 mr-2" />
            Keluar Akun
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Section: App List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Aplikasi Anda</h2>
            </div>

            <div className="space-y-3">
              {appsLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <Card key={i} className="animate-pulse h-20 border-border bg-white" />
                ))
              ) : apps.length === 0 ? (
                <Card className="border-dashed border-2 bg-transparent shadow-none">
                  <CardContent className="py-16 flex flex-col items-center justify-center text-center space-y-4">
                    <AppWindow className="w-10 h-10 text-muted-foreground/30" />
                    <p className="text-[10px] text-muted-foreground">Belum ada aplikasi terdaftar.</p>
                  </CardContent>
                </Card>
              ) : (
                apps.map((app) => (
                  <button 
                    key={app.id} 
                    onClick={() => handleSelectApp(app.id)}
                    className="w-full text-left group transition-all"
                  >
                    <Card className="border-border hover:border-primary/40 bg-white transition-all shadow-sm group-hover:shadow-md rounded-2xl overflow-hidden">
                      <CardContent className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-border group-hover:scale-105 transition-transform">
                            <Globe className="w-5 h-5" />
                          </div>
                          <div className="truncate">
                            <p className="font-bold text-sm truncate">{app.name}</p>
                            <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-tighter">{app.id}</p>
                          </div>
                        </div>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted/50 group-hover:bg-primary group-hover:text-white transition-all">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Section: Activation Form */}
          <div className="space-y-4">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">Aktivasi Baru</h2>
            
            <Card className="border-border shadow-lg rounded-2xl bg-white overflow-hidden">
              <CardHeader className="border-b border-border bg-muted/30 p-6">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary" />
                  Mulai Instance Baru
                </CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold tracking-tight">Gunakan Application Activation Key</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleActivateApp} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest ml-1 text-muted-foreground">Nama Website / Client</Label>
                    <Input 
                      placeholder="e.g. Toko Diamond Pro" 
                      value={appName} 
                      onChange={(e) => setAppName(e.target.value)}
                      className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-white focus:border-border transition-all font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest ml-1 text-muted-foreground">Activation Key</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="STS-App_..." 
                        value={activationKey} 
                        onChange={(e) => setActivationKey(e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-muted/50 border-transparent focus:bg-white focus:border-border transition-all font-mono text-xs uppercase"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isActivating || !activationKey || !appName}
                    className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10 transition-all active:scale-95"
                  >
                    {isActivating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Aktifkan Instance"}
                  </Button>

                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                    <p className="text-[9px] text-muted-foreground leading-relaxed italic">
                      Key hanya dapat digunakan sekali. Instance akan muncul di daftar aplikasi secara permanen setelah aktif.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

        </div>

        <div className="text-center pt-8 border-t border-border/50">
           <p className="text-[9px] text-muted-foreground/30 font-bold uppercase tracking-[0.5em]">STSPoint Multi-Tenant Bridge</p>
        </div>
      </div>
    </div>
  );
}
