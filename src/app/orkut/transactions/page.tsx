"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Filter, 
  RefreshCcw, 
  ArrowUpRight, 
  Calendar,
  ShieldAlert,
  Clock
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { getOrderkuotaMutation, type OrderkuotaMutationItem } from "@/lib/orderkuota/mutation";

export default function OrkutTransactionsPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const [mutations, setMutations] = useState<OrderkuotaMutationItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Get Orderkuota Service Configuration
  const orderkuotaRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid, "services", "orderkuota");
  }, [db, user?.uid]);
  
  const { data: orderkuota, loading: serviceLoading } = useDoc(orderkuotaRef);

  const isConnected = !!orderkuota?.token;

  // 2. Fetch mutations from API
  useEffect(() => {
    async function fetchMutations() {
      if (isConnected && orderkuota?.username && orderkuota?.token) {
        setLoading(true);
        try {
          const res = await getOrderkuotaMutation({
            username: orderkuota.username,
            token: orderkuota.token
          });
          if (res.status && res.result) {
            // Filter only status "IN" as requested
            const filtered = res.result.filter((item) => item.status === "IN");
            setMutations(filtered);
          }
        } catch (error) {
          console.error("Failed to fetch transactions:", error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchMutations();
  }, [isConnected, orderkuota?.username, orderkuota?.token]);

  const parseOrkutKredit = (val: string) => {
    const raw = String(val || "").trim();
    const clean = raw.includes('.') && !raw.includes(',') && raw.split('.').pop()?.length === 3
      ? raw.replace(/\./g, '')
      : raw;
    return parseFloat(clean) || 0;
  };

  const isGlobalLoading = authLoading || serviceLoading;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold tracking-tight">Transaction <span className="text-primary">History</span></h1>
          <p className="text-muted-foreground text-sm">Monitor all incoming transaction logs in real-time from Orderkuota.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" className="h-10 rounded-xl border-border bg-card shadow-sm gap-2 font-bold text-xs">
            <Calendar className="w-4 h-4" />
            Pick Date
          </Button>
          <Button variant="outline" className="h-10 rounded-xl border-border bg-card shadow-sm gap-2 font-bold text-xs">
            <ArrowUpRight className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-9 h-11 bg-card border-border rounded-xl shadow-sm text-sm" 
            placeholder="Search by Ref ID or Bank..." 
          />
        </div>
        <Button variant="outline" className="h-11 px-4 border-border rounded-xl bg-card shadow-sm flex items-center gap-2 font-bold shrink-0 text-xs">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Main Table Card */}
      <div className="w-full max-w-full grid grid-cols-1 min-w-0 overflow-hidden">
        <Card className="border border-border shadow-sm rounded-xl overflow-hidden bg-card h-[600px] flex flex-col">
          <CardHeader className="bg-slate-50/50 dark:bg-[#0A0A0A] py-4 px-6 border-b border-border shrink-0">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <RefreshCcw className="w-4 h-4 text-primary" />
              All Transaction Logs (Incoming)
            </CardTitle>
          </CardHeader>
          <div className="w-full flex-1 overflow-x-auto overflow-y-auto">
            <table className="w-full min-w-full text-xs text-left">
              <thead className="sticky top-0 z-10 bg-muted/50">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase text-[9px] tracking-widest whitespace-nowrap">Time</th>
                  <th className="px-6 py-4 font-bold uppercase text-[9px] tracking-widest whitespace-nowrap">Ref ID</th>
                  <th className="px-6 py-4 font-bold uppercase text-[9px] tracking-widest whitespace-nowrap">Bank</th>
                  <th className="px-6 py-4 font-bold uppercase text-[9px] tracking-widest whitespace-nowrap">Amount</th>
                  <th className="px-6 py-4 font-bold uppercase text-[9px] tracking-widest text-right whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isGlobalLoading || loading ? (
                  Array.from({ length: 12 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
                    </tr>
                  ))
                ) : !isConnected ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-24 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-4 w-full">
                        <div className="p-4 bg-muted rounded-full">
                          <ShieldAlert className="w-12 h-12 opacity-30" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-base uppercase tracking-widest text-foreground">Account Not Connected</p>
                          <p className="text-sm max-w-xs mx-auto">Please connect your Orderkuota account on the main Dashboard to view mutation history.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : mutations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-24 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-3 w-full">
                        <Clock className="w-10 h-10 opacity-20" />
                        <p className="font-bold text-sm uppercase tracking-widest">No incoming transactions found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  mutations.map((log, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-[10px] text-muted-foreground whitespace-nowrap">{log.tanggal}</td>
                      <td className="px-6 py-4 font-bold text-[11px] whitespace-nowrap uppercase">{log.id}</td>
                      <td className="px-6 py-4 text-muted-foreground font-bold whitespace-nowrap">{log.brand.name}</td>
                      <td className="px-6 py-4 font-bold text-primary text-[11px] whitespace-nowrap">
                        Rp {parseOrkutKredit(log.kredit).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <Badge variant="outline" className="bg-green-500/5 text-green-600 border-green-500/20 font-bold text-[9px] uppercase px-2 py-0.5 rounded-sm">
                          Success
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
