"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Key, Copy, Eye, EyeOff, ShieldAlert, Fingerprint, RefreshCw, Loader2 } from "lucide-react";
import { useState } from "react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ApiKeysPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const [showKey, setShowKey] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile, loading: profileLoading } = useDoc(profileRef);

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
    });
  };

  const generateSecretKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `STS-Key-${result}`;
  };

  const handleRegenerateKey = async () => {
    if (!profileRef) return;
    setIsRegenerating(true);
    const newKey = generateSecretKey();

    try {
      await updateDoc(profileRef, {
        secretKey: newKey,
        updatedAt: serverTimestamp()
      });
      toast({
        title: "Success!",
        description: "Your secret key has been regenerated.",
      });
      setShowKey(true);
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to regenerate secret key.",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const isLoading = authLoading || profileLoading;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-headline font-bold tracking-tight">
          Access <span className="text-primary">Credentials</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          Securely manage your Merchant ID and Secret Keys.
        </p>
      </div>

      {/* Security Warning */}
      <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-start gap-4">
        <div className="p-2 bg-destructive rounded-lg text-destructive-foreground mt-0.5 shrink-0">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-destructive uppercase tracking-tight">Security Warning</h4>
          <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
            Never share your Secret Keys in public repositories or client-side code. Use server-side environment variables to keep your integration safe and secure.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <Skeleton className="h-[280px] w-full rounded-3xl" />
        ) : (
          <Card className="border border-border shadow-sm rounded-3xl overflow-hidden group bg-card">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
                {/* Left Side: Merchant ID / Client Key */}
                <div className="p-6 md:p-10 space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Fingerprint className="w-5 h-5 text-primary" />
                      {profile?.role === 'client' ? 'Client Key' : 'Merchant ID'}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Unique identifier for your account in the STSPoint ecosystem. Use this for identifying your account in API requests.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 p-4 bg-muted rounded-xl border border-border font-mono text-sm w-full">
                    <span className="flex-1 truncate font-bold text-primary">
                      {profile?.merchantId || profile?.clientKey || "N/A"}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-lg hover:bg-background transition-colors shrink-0"
                      onClick={() => copyToClipboard(profile?.merchantId || profile?.clientKey || "", "ID")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Right Side: Secret Key */}
                <div className="p-6 md:p-10 space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <Key className="w-5 h-5 text-primary" />
                        Secret Key
                      </h3>
                      <div className="flex items-center gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-primary/5 hover:text-primary transition-all"
                              disabled={isRegenerating}
                            >
                              {isRegenerating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                              Regenerate
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-3xl border-border">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-headline font-bold">Regenerate Secret Key?</AlertDialogTitle>
                              <AlertDialogDescription className="text-sm">
                                Any existing API integration using the current key will stop working immediately. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="gap-2">
                              <AlertDialogCancel className="rounded-xl border-border">Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={handleRegenerateKey}
                                className="bg-primary hover:bg-primary/90 rounded-xl"
                              >
                                Confirm Regenerate
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <Badge className="bg-green-500/10 text-green-600 border-none font-bold text-[10px] uppercase px-2 py-0.5 rounded-md">
                          Live
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      High-security key for authenticating your requests. Never share this and rotate regularly if you suspect a compromise.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 p-4 bg-muted rounded-xl border border-border font-mono text-sm w-full">
                    <span className="flex-1 truncate">
                      {showKey ? (profile?.secretKey || "N/A") : "••••••••••••••••••••••••••••••••"}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-lg hover:bg-background transition-colors" 
                        onClick={() => setShowKey(!showKey)}
                      >
                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-lg hover:bg-background transition-colors"
                        onClick={() => copyToClipboard(profile?.secretKey || "", "Secret Key")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
