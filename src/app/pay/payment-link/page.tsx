"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { createStsTransaction } from "@/services/stspay/v1/create";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { toast } from "@/hooks/use-toast";
import { 
  Link as LinkIcon, 
  Send, 
  ExternalLink, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Mail, 
  CreditCard,
  FileText,
  Clock,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";

export default function STSPayTestPage() {
  const { user } = useUser();
  const db = useFirestore();
  
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("10000");
  const [email, setEmail] = useState("");
  const [desc, setDesc] = useState("Product Payment Link");
  const [result, setResult] = useState<{ success: boolean; invoiceUrl?: string; externalId?: string; message?: string } | null>(null);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile } = useDoc(profileRef);

  const handleCreatePaymentLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !db) {
      toast({ variant: "destructive", title: "Error", description: "User session not found." });
      return;
    }

    const amtNum = parseInt(amount);
    if (isNaN(amtNum) || amtNum < 1) {
      toast({ variant: "destructive", title: "Invalid Amount", description: "Minimum amount is Rp 1." });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // 1. Panggil Server Action untuk membuat Invoice di Xendit
      const res = await createStsTransaction({
        userId: user.uid,
        amount: amtNum,
        payerEmail: email || user.email || "customer@stspoint.com",
        description: desc,
        clientName: profile?.merchantName || profile?.name || "STS Merchant"
      });

      if (res.success && res.externalId) {
        // 2. Catat ke Firestore koleksi top-level 'stspay_transactions'
        const transactionRef = doc(db, "stspay_transactions", res.externalId);
        const transactionData = {
          id: res.externalId,
          xenditInvoiceId: res.invoiceId,
          amount: res.amount,
          status: res.status,
          payerEmail: res.payerEmail,
          description: res.description,
          invoiceUrl: res.invoiceUrl,
          userId: user.uid,
          type: 'payment',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        setDoc(transactionRef, transactionData)
          .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
              path: transactionRef.path,
              operation: 'create',
              requestResourceData: transactionData,
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
          });

        setResult(res as any);
        toast({ title: "Payment Link Ready!", description: "Share the link with your customer." });
      } else {
        setResult(res as any);
        toast({ variant: "destructive", title: "Failed to Create", description: res.message });
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "System Error", description: "Failed to connect to STSPay service." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-border shadow-sm rounded-xl overflow-hidden bg-card">
          <CardHeader className="bg-muted/30 dark:bg-[#0A0A0A] py-4 px-6 border-b border-border">
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
              <LinkIcon className="w-4 h-4 text-primary" />
              Link Generator
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleCreatePaymentLink} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Amount (IDR)</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="10000"
                    className="pl-10 h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Payer Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="pl-10 h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Order Description</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Product payment for..."
                    className="pl-10 h-12 rounded-xl bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-primary/10 gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Create Payment Link
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className={`border-border shadow-sm rounded-xl overflow-hidden bg-card h-full flex flex-col ${!result ? 'opacity-50' : ''}`}>
             <CardHeader className="bg-muted/30 py-4 px-6 border-b border-border">
                <CardTitle className="text-sm font-bold uppercase tracking-wider">Payment Details</CardTitle>
             </CardHeader>
             <CardContent className="p-6 flex-1 flex flex-col items-center justify-center text-center space-y-4">
                {!result ? (
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                      <Clock className="w-6 h-6 text-muted-foreground/30" />
                    </div>
                    <p className="text-xs text-muted-foreground">Isi formulir di samping untuk mendapatkan link pembayaran aktif.</p>
                  </div>
                ) : result.success ? (
                  <div className="space-y-6 w-full animate-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                       <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-lg">Link Created!</h4>
                      <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">{result.externalId}</p>
                    </div>
                    
                    <div className="p-4 bg-muted/50 rounded-xl border border-border space-y-2 text-left">
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Share this Link</p>
                       <p className="text-[11px] text-muted-foreground leading-relaxed">
                         Tautan ini akan mengarahkan pelanggan Anda ke halaman checkout kustom STSPay dengan metode pembayaran yang lengkap.
                       </p>
                    </div>

                    <Button asChild className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold gap-2">
                       <Link href={`/checkout/${result.externalId}`}>
                         Open Payment Link
                         <ArrowUpRight className="w-4 h-4" />
                       </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 w-full animate-in slide-in-from-bottom-2">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center mx-auto">
                       <AlertCircle className="w-10 h-10" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-lg">Failed to Generate</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {result.message || "Terjadi kesalahan saat memproses link pembayaran."}
                      </p>
                    </div>
                  </div>
                )}
             </CardContent>
          </Card>

          <Card className="border-border shadow-sm rounded-xl p-6 bg-slate-50 dark:bg-white/5 border-dashed">
            <h4 className="text-[10px] font-bold uppercase tracking-widest mb-3">System Note</h4>
            <ul className="space-y-2 text-[10px] text-muted-foreground leading-relaxed">
              <li className="flex items-start gap-2">
                 <div className="w-1 h-1 rounded-full bg-primary mt-1"></div>
                 Link ini menggunakan **STSPay Custom Checkout** yang lebih modern dan multi-bahasa.
              </li>
              <li className="flex items-start gap-2">
                 <div className="w-1 h-1 rounded-full bg-primary mt-1"></div>
                 Setiap pembayaran yang sukses akan tercatat otomatis di Dashboard dan mengirim notifikasi Webhook.
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
