
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

      await setDoc(appRef, appData);
      
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center p-4 md:p-12 lg:p-20">
      <div className="w-full max-w-7xl space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-border pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/5 rounded-lg border border-primary/10">
                <Layout className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl font-headline font-bold tracking-tight">Portal Partner</h1>
            </div>
            <p className="text-sm text-muted-foreground">Pilih aplikasi yang ingin dikelola atau aktifkan lisensi instance baru.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="w-fit text-muted-foreground hover:text-destructive hover:bg-destructive/5 font-bold text-xs rounded-xl px-6 h-10">
            <LogOut className="w-4 h-4 mr-2" />
            Keluar Akun
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Section: App List */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                <Globe className="w-3 h-3" />
                Aplikasi Anda
              </h2>
              <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px] font-bold rounded-md">
                {appsLoading ? "..." : apps.length} Terdaftar
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="animate-pulse h-28 border-border bg-white" />
                ))
              ) : apps.length === 0 ? (
                <Card className="col-span-full border-dashed border-2 bg-transparent shadow-none">
                  <CardContent className="py-24 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                      <AppWindow className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-muted-foreground">Belum Ada Aplikasi</p>
                      <p className="text-xs text-muted-foreground/60">Gunakan form di samping untuk mengaktifkan instance pertama Anda.</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                apps.map((app) => (
                  <button 
                    key={app.id} 
                    onClick={() => handleSelectApp(app.id)}
                    className="w-full text-left group transition-all"
                  >
                    <Card className="border-border hover:border-primary/40 bg-white transition-all shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 rounded-[1.5rem] overflow-hidden">
                      <CardContent className="p-6 flex flex-col justify-between h-full space-y-6">
                        <div className="flex items-start justify-between">
                          <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                            <Globe className="w-6 h-6" />
                          </div>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted/50 group-hover:bg-primary group-hover:text-white transition-all">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-base truncate">{app.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter opacity-50">ID: {app.id}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Section: Activation Form */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground px-1 flex items-center gap-2">
              <Plus className="w-3 h-3" />
              Aktivasi Baru
            </h2>
            
            <Card className="border-border shadow-2xl rounded-[2rem] bg-white overflow-hidden border-t-4 border-t-primary">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  Mulai Instance Baru
                </CardTitle>
                <CardDescription className="text-xs font-medium text-muted-foreground">Masukkan kunci lisensi untuk mengaktifkan website partner.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                <form onSubmit={handleActivateApp} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest ml-1 text-muted-foreground">Nama Website / Client</Label>
                    <Input 
                      placeholder="e.g. Toko Diamond Pro" 
                      value={appName} 
                      onChange={(e) => setAppName(e.target.value)}
                      className="h-12 rounded-xl bg-muted/30 border-transparent focus:bg-white focus:border-border transition-all font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest ml-1 text-muted-foreground">Activation Key</Label>
                    <div className="relative group">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        placeholder="STS-App_XXXXXXXXXXXX" 
                        value={activationKey} 
                        onChange={(e) => setActivationKey(e.target.value)}
                        className="pl-12 h-12 rounded-xl bg-muted/30 border-transparent focus:bg-white focus:border-border transition-all font-mono text-xs uppercase"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isActivating || !activationKey || !appName}
                    className="w-full h-14 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    {isActivating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Aktifkan Instance"}
                    {!isActivating && <ArrowRight className="w-4 h-4" />}
                  </Button>

                  <div className="p-5 rounded-2xl bg-muted/50 border border-border flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary/40 mt-1.5 shrink-0 animate-pulse"></div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Lisensi bersifat **Sekali Pakai**. Setelah berhasil diaktivasi, instance akan muncul di daftar aplikasi secara permanen.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

        </div>

        <div className="text-center pt-12 border-t border-border/50">
           <p className="text-[10px] text-muted-foreground/30 font-bold uppercase tracking-[1em] ml-[1em]">STSPoint Bridge Engine</p>
        </div>
      </div>
    </div>
  );
}
