
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Globe, 
  Instagram, 
  Linkedin, 
  Twitter, 
  MessageCircle, 
  Save, 
  Loader2, 
  ShieldCheck,
  Info
} from "lucide-react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

export default function PlatformSettingsPage() {
  const db = useFirestore();
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [instagramUrl, setInstagramUrl] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");

  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "settings", "global");
  }, [db]);

  const { data: settings, loading } = useDoc(settingsRef);

  useEffect(() => {
    if (settings) {
      setInstagramUrl(settings.instagramUrl || "");
      setWhatsappUrl(settings.whatsappUrl || "");
      setLinkedinUrl(settings.linkedinUrl || "");
      setTwitterUrl(settings.twitterUrl || "");
    }
  }, [settings]);

  const handleSave = async () => {
    if (!settingsRef) return;
    setIsSaving(true);
    
    const data = {
      instagramUrl,
      whatsappUrl,
      linkedinUrl,
      twitterUrl,
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(settingsRef, data, { merge: true });
      toast({ title: "Settings Saved", description: "Global platform configuration updated successfully." });
    } catch (e) {
      toast({ variant: "destructive", title: "Save Failed", description: "Insufficient permissions or network error." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-headline font-bold tracking-tight">Platform <span className="text-primary">Settings</span></h1>
        <p className="text-muted-foreground text-sm">Manage global website configuration and social links.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="border border-border shadow-sm rounded-[2rem] overflow-hidden bg-card">
          <CardHeader className="bg-muted/30 p-8 border-b border-border">
            <div className="flex items-center justify-between">
               <div className="space-y-1">
                 <CardTitle className="text-lg font-bold flex items-center gap-2">
                   <Globe className="w-5 h-5 text-primary" />
                   Social Media Links
                 </CardTitle>
                 <CardDescription className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Global Footer Navigation</CardDescription>
               </div>
               <ShieldCheck className="w-6 h-6 text-primary/20" />
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {loading ? (
              <div className="space-y-6 py-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 w-24 bg-muted animate-pulse rounded"></div>
                    <div className="h-12 w-full bg-muted animate-pulse rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Instagram URL</Label>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-500" />
                      <Input 
                        placeholder="https://instagram.com/stspoint" 
                        value={instagramUrl}
                        onChange={(e) => setInstagramUrl(e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">WhatsApp Support</Label>
                    <div className="relative">
                      <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                      <Input 
                        placeholder="https://wa.me/628123456789" 
                        value={whatsappUrl}
                        onChange={(e) => setWhatsappUrl(e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">LinkedIn URL</Label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                      <Input 
                        placeholder="https://linkedin.com/company/stspoint" 
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Twitter (X) URL</Label>
                    <div className="relative">
                      <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-500" />
                      <Input 
                        placeholder="https://twitter.com/stspoint" 
                        value={twitterUrl}
                        onChange={(e) => setTwitterUrl(e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Info className="w-3.5 h-3.5" />
                    <p className="text-[10px] font-medium uppercase tracking-tight">Changes apply instantly to the public footer.</p>
                  </div>
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="h-12 px-10 rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-primary/10 gap-2"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Platform Settings
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
