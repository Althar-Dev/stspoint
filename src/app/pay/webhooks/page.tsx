"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Webhook, 
  ShieldCheck, 
  Save, 
  Loader2,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  Key,
  Copy,
  Info,
  ChevronRight,
  Code2,
  Eye,
  EyeOff
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";

export default function STSPayWebhooksPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  // States
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);
  const [webhookSecret, setWebhookSecret] = useState("whsec_5829381kdk29384l");

  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(profileRef);

  useEffect(() => {
    if (profile) {
      setWebhookUrl(profile.webhookUrl || "");
      setIsEnabled(profile.webhookEnabled ?? true);
      if (profile.webhookSecret) {
        setWebhookSecret(profile.webhookSecret);
      }
    }
  }, [profile]);

  const handleSaveSettings = async () => {
    if (!profileRef) return;
    setLoading(true);
    try {
      await updateDoc(profileRef, {
        webhookUrl,
        webhookEnabled: isEnabled,
        updatedAt: serverTimestamp()
      });
      toast({ title: "Berhasil", description: "Pengaturan Webhook telah diperbarui." });
    } catch (e) {
      toast({ variant: "destructive", title: "Gagal", description: "Gagal menyimpan perubahan." });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} copied to clipboard.` });
  };

  const deliveryLogs = [
    { id: 'evt_921', event: 'payment.success', url: '/api/sts-callback', status: 200, time: '2 menit lalu' },
    { id: 'evt_920', event: 'payout.processed', url: '/api/sts-callback', status: 200, time: '15 menit lalu' },
    { id: 'evt_919', event: 'payment.success', url: '/api/sts-callback', status: 500, time: '1 jam lalu' },
    { id: 'evt_918', event: 'payment.failed', url: '/api/sts-callback', status: 200, time: '3 jam lalu' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">
        <Button variant="outline" size="sm" className="rounded-md font-bold text-[10px] uppercase tracking-widest gap-2">
          <Code2 className="w-3.5 h-3.5" /> Lihat Dokumentasi
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Configuration */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-border shadow-sm rounded-md bg-card overflow-hidden">
            <CardHeader className="px-8 py-6 border-b border-border bg-muted/30 dark:bg-[#0A0A0A]">
              <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                <Webhook className="w-4 h-4 text-primary" />
                Endpoint Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between p-4 rounded-md bg-primary/5 border border-primary/10 mb-2">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold">Status Webhook</h4>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Kirim notifikasi otomatis ke server</p>
                </div>
                <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Payload URL</Label>
                <div className="relative">
                  <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://your-server.com/webhooks/sts"
                    className="rounded-md border-border h-11 pl-10 bg-muted/30 focus:bg-background transition-all font-mono text-xs"
                  />
                </div>
                <p className="text-[9px] text-muted-foreground ml-1">URL ini akan menerima POST request dengan payload JSON setiap kali ada event.</p>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <Button variant="outline" className="rounded-md h-10 px-6 font-bold uppercase tracking-widest text-[10px]">
                  Simulasi Test
                </Button>
                <Button 
                  onClick={handleSaveSettings}
                  disabled={loading}
                  className="rounded-md h-10 px-8 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Simpan URL
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm rounded-md bg-card overflow-hidden">
            <CardHeader className="px-8 py-6 border-b border-border bg-muted/30 dark:bg-[#0A0A0A]">
              <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Security & Signing
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
               <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                       <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Signing Secret</Label>
                       <Button variant="ghost" size="sm" className="h-6 text-[9px] font-bold text-primary uppercase">Regenerate</Button>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md border border-border font-mono text-xs overflow-hidden">
                      <Key className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="flex-1 truncate">
                        {showSecret ? webhookSecret : "••••••••••••••••••••••••••••"}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowSecret(!showSecret)}>
                          {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(webhookSecret, "Secret")}>
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-[9px] text-muted-foreground leading-relaxed px-1">
                      Gunakan secret ini untuk memvalidasi signature Webhook pada header <code className="text-primary font-bold">X-STS-Signature</code>.
                    </p>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Event Subscriptions & Logs */}
        <div className="lg:col-span-5 space-y-6">
           <Card className="border-border shadow-sm rounded-md bg-card p-6">
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Event Subscriptions</h4>
              <div className="space-y-4">
                 {[
                   { id: 'pay_success', label: 'Payment Success', desc: 'Trigger saat pembayaran berhasil diverifikasi.' },
                   { id: 'pay_failed', label: 'Payment Failed', desc: 'Trigger saat pembayaran kedaluwarsa atau gagal.' },
                   { id: 'payout_processed', label: 'Payout Processed', desc: 'Trigger saat dana penarikan berhasil dikirim.' },
                   { id: 'balance_low', label: 'Low Balance Warning', desc: 'Trigger saat saldo gateway mencapai batas minimal.' },
                 ].map((event) => (
                   <div key={event.id} className="flex items-start justify-between gap-4">
                      <div className="space-y-0.5">
                         <p className="text-xs font-bold">{event.label}</p>
                         <p className="text-[10px] text-muted-foreground leading-tight">{event.desc}</p>
                      </div>
                      <Switch defaultChecked />
                   </div>
                 ))}
              </div>
           </Card>

           <Card className="border-border shadow-sm rounded-md bg-card overflow-hidden">
              <CardHeader className="px-6 py-4 border-b border-border bg-muted/20">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Delivery Logs</CardTitle>
              </CardHeader>
              <div className="divide-y divide-border">
                 {deliveryLogs.map((log) => (
                   <div key={log.id} className="px-6 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors group cursor-pointer">
                      <div className="flex items-center gap-3">
                         {log.status === 200 ? (
                           <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                         ) : (
                           <XCircle className="w-3.5 h-3.5 text-red-500" />
                         )}
                         <div>
                            <p className="text-[11px] font-bold leading-tight">{log.event}</p>
                            <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tight mt-0.5">{log.time} • HTTP {log.status}</p>
                         </div>
                      </div>
                      <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                   </div>
                 ))}
              </div>
              <div className="p-4 bg-muted/30 border-t border-border text-center">
                 <Button variant="ghost" className="text-[9px] font-bold uppercase h-6 hover:bg-transparent text-primary">Lihat Seluruh Log</Button>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
