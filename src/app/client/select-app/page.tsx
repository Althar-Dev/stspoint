"use client";

import { useState } from "react";
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
  AppWindow
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
  const [isAdding, setIsAdding] = useState(false);

  const appsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, "users", user.uid, "apps");
  }, [db, user?.uid]);

  const { data: apps, loading: appsLoading } = useCollection(appsQuery);

  const handleSelectApp = (appId: string) => {
    localStorage.setItem("sts_selected_app_id", appId);
    toast({ title: "App Selected", description: "Switching to your application dashboard." });
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
        throw new Error("Activation Key not found.");
      }

      if (keySnap.data().status === 'used') {
        throw new Error("This Activation Key has already been used.");
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

      toast({ title: "App Activated!", description: "You can now manage your new application instance." });
      handleSelectApp(appId);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Activation Failed", description: err.message });
      setIsActivating(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary mb-4">
            Partner Access Control
          </div>
          <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">
            Select <span className="text-primary/40">Application.</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
            Pilih instance aplikasi atau website yang ingin Anda kelola, atau tambahkan instance baru dengan Application Key Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Existing Apps */}
          <Card className="border-border shadow-sm rounded-3xl overflow-hidden bg-card min-h-[400px] flex flex-col">
            <CardHeader className="p-8 border-b border-border bg-muted/20">
               <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                  <Layout className="w-4 h-4 text-primary" />
                  Your Active Instances
               </CardTitle>
            </CardHeader>
            <CardContent className="p-8 flex-1">
               {appsLoading ? (
                 <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary/20" />
                 </div>
               ) : apps.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-30">
                    <AppWindow className="w-12 h-12" />
                    <p className="text-xs font-bold uppercase tracking-widest">No Apps Found</p>
                 </div>
               ) : (
                 <div className="space-y-3">
                   {apps.map((app) => (
                     <button 
                       key={app.id} 
                       onClick={() => handleSelectApp(app.id)}
                       className="w-full p-4 rounded-2xl border border-border bg-muted/10 hover:border-primary/30 hover:bg-primary/5 transition-all text-left flex items-center justify-between group"
                     >
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center group-hover:scale-110 transition-transform">
                             <Globe className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                             <p className="font-bold text-sm">{app.name}</p>
                             <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">{app.id}</p>
                          </div>
                       </div>
                       <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                     </button>
                   ))}
                 </div>
               )}
            </CardContent>
          </Card>

          {/* Activate New App */}
          <Card className="border-border shadow-xl rounded-3xl overflow-hidden bg-card h-full">
            <CardHeader className="p-8 border-b border-border bg-primary text-primary-foreground">
               <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
                  <Plus className="w-4 h-4" />
                  Activate New Instance
               </CardTitle>
               <CardDescription className="text-primary-foreground/60 text-xs mt-1">Gunakan kode aktivasi untuk meluncurkan website baru.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
               <form onSubmit={handleActivateApp} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">App / Website Name</Label>
                    <div className="relative">
                      <Settings className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="e.g. DiamondStore ID" 
                        value={appName} 
                        onChange={(e) => setAppName(e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Activation Key</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="STS-App_XXXXXXXX" 
                        value={activationKey} 
                        onChange={(e) => setActivationKey(e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all font-mono text-xs uppercase"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isActivating || !activationKey || !appName}
                    className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[11px] shadow-xl shadow-primary/10 gap-2 transition-all active:scale-95"
                  >
                    {isActivating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Activate Instance
                  </Button>
               </form>

               <div className="mt-8 p-4 rounded-2xl bg-muted/50 border border-border flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Setiap kunci aktivasi hanya berlaku satu kali. Hubungi tim Developer STS untuk mendapatkan kunci tambahan jika diperlukan.
                  </p>
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center pt-8">
           <Button variant="ghost" onClick={() => router.push("/signin")} className="gap-2 text-muted-foreground hover:text-foreground">
             <LogOut className="w-4 h-4" />
             <span className="text-xs font-bold uppercase tracking-widest">Logout Session</span>
           </Button>
        </div>
      </div>

      <div className="fixed bottom-8 text-center w-full opacity-20">
         <p className="text-[9px] font-bold uppercase tracking-[0.5em]">STSPoint Multi-Tenant Bridge Engine</p>
      </div>
    </div>
  );
}
