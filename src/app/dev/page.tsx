"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Terminal, 
  CreditCard, 
  Users, 
  ShieldCheck, 
  Lock,
  ChevronRight,
  TrendingUp,
  Wallet
} from "lucide-react";
import React, { useMemo } from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";

export default function DevRootPage() {
  const db = useFirestore();

  const usersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "users");
  }, [db]);

  const txsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "transactions");
  }, [db]);

  const { data: users, loading: usersLoading } = useCollection(usersQuery);
  const { data: txs, loading: txLoading } = useCollection(txsQuery);

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const totalTxs = txs.length;
    const liability = users.reduce((acc, u) => acc + (u.balance || 0), 0);
    const successTxs = txs.filter(t => t.status === 'Success').length;
    const successRate = totalTxs > 0 ? ((successTxs / totalTxs) * 100).toFixed(1) : "100";

    return [
      { label: "Active Merchants", value: usersLoading ? "..." : totalUsers, icon: Users, color: "text-blue-500" },
      { label: "System Liability", value: usersLoading ? "..." : `Rp ${liability.toLocaleString('id-ID')}`, icon: Wallet, color: "text-rose-500" },
      { label: "Total Orders", value: txLoading ? "..." : totalTxs, icon: CreditCard, color: "text-amber-500" },
      { label: "Success Rate", value: txLoading ? "..." : `${successRate}%`, icon: TrendingUp, color: "text-emerald-500" },
    ];
  }, [users, txs, usersLoading, txLoading]);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-border shadow-sm rounded-md overflow-hidden group hover:border-primary/20 transition-all bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-md bg-muted ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <Badge variant="outline" className="text-[8px] md:text-[9px] uppercase font-bold">Live</Badge>
              </div>
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-xl font-headline font-bold truncate text-foreground">
                {stat.value}
              </h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-border rounded-md overflow-hidden shadow-sm bg-card">
          <CardHeader className="border-b border-border bg-muted/30 dark:bg-[#0A0A0A] px-6 py-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-primary" />
              <CardTitle className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Runtime Logs
              </CardTitle>
            </div>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-destructive/40"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/40"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40"></div>
            </div>
          </CardHeader>
          <CardContent className="p-6 font-mono text-[10px] md:text-[11px] space-y-2 leading-relaxed h-[250px] overflow-y-auto no-scrollbar bg-muted/10">
            <p className="text-muted-foreground/60">[08:42:11] <span className="text-emerald-500 font-bold">SUCCESS:</span> Webhook received from DigiFlazz (Order: #TX-91283).</p>
            <p className="text-muted-foreground/60">[08:42:15] <span className="text-blue-500 font-bold">INFO:</span> New merchant registration detected.</p>
            <p className="text-muted-foreground/60">[09:12:01] <span className="text-emerald-500 font-bold">SUCCESS:</span> Balance withdrawal processed via GoMerchant Gateway.</p>
            <p className="text-muted-foreground/60">[10:05:44] <span className="text-amber-500 font-bold">WARN:</span> Upstream latency spike detected in Orderkuota API (+250ms).</p>
            <p className="text-muted-foreground/60">[11:30:22] <span className="text-blue-500 font-bold">INFO:</span> Scheduled balance snapshot completed for {users.length} accounts.</p>
            <p className="text-foreground animate-pulse">_</p>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20 rounded-md overflow-hidden shadow-sm relative border-dashed">
          <CardContent className="p-8 space-y-6 relative z-10">
            <div className="w-14 h-14 rounded-md bg-primary/10 flex items-center justify-center text-primary mb-2">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-headline font-bold">Privileged Console</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Management of high-level digital infrastructure. Unauthorized changes may cause financial discrepancies.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              {[
                { label: "Security Audit", icon: Lock },
                { label: "System Backup", icon: ShieldCheck },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-muted p-2 rounded-md transition-all">
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-primary" />
                    <span className="text-[10px] md:text-xs font-bold text-foreground/80">{item.label}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}