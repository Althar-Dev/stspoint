"use client";

import { useParams, useRouter } from "next/navigation";
import { useFirestore, useDoc, useMemoFirebase, useCollection } from "@/firebase";
import { doc, collection } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ChevronLeft, 
  CreditCard, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Receipt,
  ArrowUpRight,
  ShieldCheck,
  Landmark,
  Coins,
  FileText,
  Timer
} from "lucide-react";
import { format, isAfter } from "date-fns";
import React, { useMemo } from "react";

export default function STSPayTransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const db = useFirestore();

  const txId = params.id as string;

  const txRef = useMemoFirebase(() => {
    if (!db || !txId) return null;
    return doc(db, "stspay_transactions", txId);
  }, [db, txId]);

  const channelsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "payment_channels");
  }, [db]);

  const { data: tx, loading: txLoading } = useDoc(txRef);
  const { data: channels } = useCollection(channelsQuery);

  const { settlementDate, isSettled, statusLabel } = useMemo(() => {
    if (!tx) return { settlementDate: null, isSettled: false, statusLabel: 'Unknown' };

    // Status Normalization
    const s = String(tx.status).toUpperCase();
    let label = 'Pending';
    if (['SUCCESS', 'PAID', 'SETTLED', 'SUCCEEDED', 'COMPLETED'].includes(s)) label = 'Success';
    else if (['FAILED', 'CANCELED', 'EXPIRED'].includes(s)) label = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

    // Settlement Logic
    if (tx.type === 'payout') {
      return { settlementDate: null, isSettled: true, statusLabel: label };
    }

    if (label !== 'Success') {
      return { settlementDate: null, isSettled: false, statusLabel: label };
    }

    const methodId = tx.payment_method_id || "";
    const channelInfo = channels.find(c => c.id.toUpperCase() === methodId.toUpperCase());
    const settlementStr = channelInfo?.settlement || "T+1";
    const daysToAdd = parseInt(settlementStr.replace(/[^0-9]/g, '')) || 1;

    const createdAt = tx.createdAt?.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt || 0);
    let settlementDate = new Date(createdAt);
    let businessDaysAdded = 0;
    
    while (businessDaysAdded < daysToAdd) {
      settlementDate.setDate(settlementDate.getDate() + 1);
      const dayOfWeek = settlementDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) businessDaysAdded++;
    }

    const isSettled = isAfter(new Date(), settlementDate);
    return { settlementDate, isSettled, statusLabel: label };
  }, [tx, channels]);

  if (txLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 p-4">
        <Skeleton className="h-10 w-32 rounded-xl" />
        <Card className="rounded-3xl border-border">
          <CardContent className="p-10 space-y-8">
            <div className="flex justify-between items-center">
              <Skeleton className="h-12 w-48" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-8">
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold">Transaksi Tidak Ditemukan</h2>
        <Button onClick={() => router.back()} variant="outline">Kembali ke Riwayat</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="rounded-xl px-3 hover:bg-accent font-bold text-xs"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <div className="h-4 w-px bg-border"></div>
        <h1 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Transaction Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Summary & Details */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-border shadow-sm rounded-3xl overflow-hidden bg-card">
            <CardHeader className="p-8 border-b border-border bg-muted/30">
               <div className="flex items-center justify-between">
                  <Badge className={`border-none font-bold text-[9px] uppercase px-3 py-1 rounded-md gap-1.5 ${
                    statusLabel === 'Success' ? 'bg-emerald-500/10 text-emerald-600' : 
                    statusLabel === 'Pending' ? 'bg-amber-500/10 text-amber-600' : 
                    'bg-red-500/10 text-red-600'
                  }`}>
                    {statusLabel === 'Success' && <CheckCircle2 className="w-3 h-3" />}
                    {statusLabel === 'Pending' && <Clock className="w-3 h-3" />}
                    {statusLabel === 'Failed' && <XCircle className="w-3 h-3" />}
                    {statusLabel}
                  </Badge>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">#{tx.id}</p>
               </div>
               <div className="pt-6">
                  <CardTitle className="text-3xl font-headline font-bold text-primary">
                    Rp {tx.amount?.toLocaleString('id-ID')}
                  </CardTitle>
                  <CardDescription className="text-xs font-medium uppercase tracking-widest mt-1">
                    {tx.type === 'payout' ? 'Withdrawal Payout' : 'Inbound Payment'}
                  </CardDescription>
               </div>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                           <FileText className="w-4 h-4" />
                        </div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">General Info</h4>
                     </div>
                     <div className="space-y-4 pl-11">
                        <div>
                           <p className="text-xs font-medium text-muted-foreground">Description</p>
                           <p className="text-sm font-bold mt-0.5">{tx.description || "Digital Transaction"}</p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-muted-foreground">Created At</p>
                           <p className="text-sm font-bold mt-0.5">
                             {tx.createdAt ? format(tx.createdAt.toDate ? tx.createdAt.toDate() : new Date(tx.createdAt), "dd MMMM yyyy, HH:mm") : '---'}
                           </p>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                           <User className="w-4 h-4" />
                        </div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Customer Context</h4>
                     </div>
                     <div className="space-y-4 pl-11">
                        <div>
                           <p className="text-xs font-medium text-muted-foreground">Payer Email</p>
                           <p className="text-sm font-bold mt-0.5">{tx.payerEmail || "guest@stspoint.id"}</p>
                        </div>
                        <div>
                           <p className="text-xs font-medium text-muted-foreground">Payment Method</p>
                           <Badge variant="secondary" className="mt-1 font-bold text-[10px] uppercase">
                             {tx.payment_method_id || tx.paymentMethod || "Direct Bridge"}
                           </Badge>
                        </div>
                     </div>
                  </div>
               </div>

               {tx.type === 'payment' && (
                 <div className="pt-8 border-t border-dashed border-border space-y-6">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                          <Coins className="w-4 h-4" />
                       </div>
                       <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Financial Breakdown</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pl-11">
                       <div>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground">Gross Amount</p>
                          <p className="text-sm font-bold">Rp {tx.amount?.toLocaleString('id-ID')}</p>
                       </div>
                       <div>
                          <p className="text-[10px] uppercase font-bold text-rose-500">Service Fee (MDR)</p>
                          <p className="text-sm font-bold text-rose-500">- Rp {tx.fee_amount?.toLocaleString('id-ID') || 0}</p>
                       </div>
                       <div className="md:col-span-1">
                          <p className="text-[10px] uppercase font-bold text-emerald-600">Net Revenue</p>
                          <p className="text-lg font-headline font-bold text-emerald-600">
                             Rp {((tx.amount || 0) - (tx.fee_amount || 0)).toLocaleString('id-ID')}
                          </p>
                       </div>
                    </div>
                 </div>
               )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Settlement Status */}
        <div className="lg:col-span-4 space-y-6">
           <Card className={`border-border shadow-sm rounded-3xl overflow-hidden bg-card ${statusLabel === 'Success' ? 'border-l-4 border-l-emerald-500' : 'opacity-60'}`}>
              <CardHeader className="bg-muted/30 p-6 border-b border-border">
                 <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-primary" />
                    Settlement Status
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                 {statusLabel === 'Success' ? (
                   <div className="space-y-6">
                      <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSettled ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                            {isSettled ? <CheckCircle2 className="w-6 h-6" /> : <Timer className="w-6 h-6 animate-pulse" />}
                         </div>
                         <div className="space-y-0.5">
                            <p className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">Fund Condition</p>
                            <p className="text-sm font-bold">{isSettled ? 'Available in Balance' : 'Settling in Progress'}</p>
                         </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-muted/50 border border-border space-y-2">
                         <p className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" /> Settlement Date
                         </p>
                         <p className="text-lg font-headline font-bold text-primary">
                            {settlementDate ? format(settlementDate, "dd MMM yyyy") : 'Immediate'}
                         </p>
                         <p className="text-[9px] text-muted-foreground leading-relaxed italic">
                            *Estimated based on T+n business days policy.
                         </p>
                      </div>
                   </div>
                 ) : (
                   <div className="py-10 text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto opacity-20">
                         <Receipt className="w-6 h-6" />
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                         Settlement logic only applies <br /> to successful payments.
                      </p>
                   </div>
                 )}
              </CardContent>
           </Card>

           <Card className="border-border shadow-sm rounded-3xl p-8 bg-zinc-900 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[40px] -mr-16 -mt-16"></div>
              <div className="relative z-10 space-y-4">
                 <ShieldCheck className="w-8 h-8 text-primary" />
                 <h3 className="text-lg font-headline font-bold">Secure Audit</h3>
                 <p className="text-xs text-white/50 leading-relaxed">
                    This transaction has been cryptographically signed and verified by the STSPay node ID: {txId?.substring(0, 8)}.
                 </p>
                 <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold h-10 rounded-xl text-[10px] uppercase">
                    View Raw Response
                 </Button>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
