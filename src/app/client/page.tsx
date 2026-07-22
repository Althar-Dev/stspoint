
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { 
  Plus, 
  ChevronRight, 
  Loader2, 
  Globe, 
  ShieldCheck, 
  Key, 
  Building,
  LogOut,
  Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Logo } from "@/components/logo";
import { Skeleton } from "@/components/ui/skeleton";

export default function SelectAppPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  
  const [activationKey, setActivationKey] = useState("");
  const [appName, setAppName] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch registered apps
  const appsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, "users", user.uid, "apps");
  }, [db, user?.uid]);

  const { data: apps, loading: appsLoading } = useCollection(appsQuery);

  const handleSelectApp = (appId: string) => {
    localStorage.setItem("sts_selected_app_id", appId);
    router.push(`/client/${appId}`);
  };

  const handleActivateApp = async () => {
    if (!activationKey || !appName || !user?.uid || !db) {
      toast({ variant: "destructive", title: "Failed", description: "Please complete all fields." });
      return;
    }

    setIsActivating(true);
    try {
      const keyRef = doc(db, "Application_Keys", activationKey.trim());
      const keySnap = await getDoc(keyRef);

      if (!keySnap.exists()) {
        throw new Error("Invalid Activation Key.");
      }

      const keyData = keySnap.data();

      if (keyData.status === 'used') {
        throw new Error("This Activation Key has already been used.");
      }

      // Create new app instance
      const appId = `APP-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const appRef = doc(db, "users", user.uid, "apps", appId);
      
      const appData = {
        id: appId,
        name: appName,
        type: keyData.type || 'website',
        token: keyData.token || '',
        activationKey: activationKey.trim(),
        status: 'active',
        createdAt: serverTimestamp()
      };

      await setDoc(appRef, appData);

      // Mark key as used
      await updateDoc(keyRef, {
        status: 'used',
        usedBy: user.uid,
        updatedAt: serverTimestamp()
      });

      toast({ title: "Success!", description: "Your Application has been activated." });
      setIsModalOpen(false);
      setActivationKey("");
      setAppName("");
    } catch (e: any) {
      toast({ variant: "destructive", title: "Activation Failed", description: e.message });
    } finally {
      setIsActivating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
      window.location.href = "/signin";
    } catch (e) {
      window.location.reload();
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col w-full text-foreground selection:bg-primary/10">
      {/* Mini Header */}
      <header className="h-16 px-6 md:px-10 flex items-center justify-between border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Logo className="w-8 h-8" />
          <h1 className="font-headline font-bold text-lg tracking-tight">Partner <span className="text-primary/40">Hub</span></h1>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-xs font-bold gap-2 text-muted-foreground hover:text-destructive">
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </header>

      <main className="flex-1 w-full max-w-screen-2xl mx-auto p-6 md:p-12 lg:p-20 space-y-12">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-4xl font-headline font-bold tracking-tight">Select <span className="text-primary">Application</span></h2>
            <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px] font-bold rounded-md">
              {appsLoading ? "..." : apps.length} Registered
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
            Welcome to the partner management hub. Please select the Application you want to manage or activate a new license obtained from the developer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Action: Activate New App */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <button className="flex flex-col items-center justify-center gap-4 p-8 rounded-[2rem] border-2 border-dashed border-border bg-white hover:bg-muted/30 hover:border-primary/20 transition-all group min-h-[220px]">
                <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Plus className="w-7 h-7" />
                </div>
                <div className="space-y-1 text-center">
                  <p className="font-bold text-sm">Activate New Application</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Use License Key</p>
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] border-border w-[92vw] sm:max-w-md p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-2xl font-headline font-bold">Start New Application</DialogTitle>
                <DialogDescription className="text-xs">
                  Enter the license key to permanently activate your partner website or bot in this account.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Friendly Name (Client Name)</Label>
                  <Input 
                    placeholder="e.g. MyStore Panel" 
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Activation Key</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="STS-App_XXXX" 
                      value={activationKey}
                      onChange={(e) => setActivationKey(e.target.value)}
                      className="h-12 pl-10 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all font-mono"
                    />
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                   <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                   <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
                      Licenses are <strong>One-Time Use</strong>. Once activated, the type (Web or Bot) and linked tokens will be assigned automatically.
                   </p>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleActivateApp} 
                  disabled={isActivating || !activationKey || !appName}
                  className="w-full h-14 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl shadow-primary/10"
                >
                  {isActivating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                  Activate Application
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* List: Existing Apps */}
          {appsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="rounded-[2rem] border-border shadow-sm">
                <CardContent className="p-8 space-y-4">
                  <Skeleton className="h-14 w-14 rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : apps.map((app) => (
            <button 
              key={app.id} 
              onClick={() => handleSelectApp(app.id)}
              className="flex flex-col p-8 rounded-[2rem] border border-border bg-white shadow-sm hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all group text-left min-h-[220px]"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                {app.type === 'bot' ? <Bot className="w-7 h-7" /> : <Globe className="w-7 h-7" />}
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between">
                   <h3 className="font-bold text-lg truncate">{app.name}</h3>
                   <Badge variant="outline" className="border-none text-[8px] uppercase font-bold text-muted-foreground/60">{app.type || 'Web'}</Badge>
                </div>
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-tighter">ID: {app.id}</p>
              </div>
              <div className="pt-4 flex items-center justify-between">
                 <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20 text-[9px] font-bold uppercase h-6">Operational</Badge>
                 <div className="flex items-center gap-1 text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                   Manage <ChevronRight className="w-3 h-3" />
                 </div>
              </div>
            </button>
          ))}
        </div>
      </main>

      <footer className="p-8 mt-auto opacity-20 text-center">
         <p className="text-[10px] font-bold uppercase tracking-[0.5em]">STSPoint Partner Ecosystem v2.0</p>
      </footer>
    </div>
  );
}
