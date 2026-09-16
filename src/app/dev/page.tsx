"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CreditCard,
  Users,
  TrendingUp,
  Wallet,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Crown,
  Sparkles
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, limit } from "firebase/firestore";
import { format } from "date-fns";

export default function DevRootPage() {
  const db = useFirestore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const usersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "users");
  }, [db]);

  const txsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "transactions"), limit(100));
  }, [db]);

  const stsTxsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "stspay_transactions"), limit(100));
  }, [db]);

  const { data: users, loading: usersLoading } = useCollection(usersQuery);
  const { data: txs, loading: txLoading } = useCollection(txsQuery);
  const { data: stsTxs, loading: stsLoading } = useCollection(stsTxsQuery);

  // Filter subscription transactions
  const subscriptionTxs = useMemo(() => {
    const all = [...stsTxs, ...txs];
    // Deduplicate by ID
    const uniqueMap = new Map();
    all.forEach(t => {
      const isSub = t.type === 'subscription' || 
                    t.itemName?.toLowerCase().includes('pro') || 
                    t.itemName?.toLowerCase().includes('premium') ||
                    t.itemName?.toLowerCase().includes('subscribe') ||
                    t.metadata?.serviceId ||
                    t.metadata?.planId;
      if (isSub && !uniqueMap.has(t.id)) {
        uniqueMap.set(t.id, t);
      }
    });

    return Array.from(uniqueMap.values()).sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [stsTxs, txs]);

  const filteredSubTxs = useMemo(() => {
    const s = search.toLowerCase().trim();
    return subscriptionTxs.filter(t => {
      const matchesSearch = !s || 
        t.id?.toLowerCase().includes(s) ||
        t.userName?.toLowerCase().includes(s) ||
        t.userEmail?.toLowerCase().includes(s) ||
        t.itemName?.toLowerCase().includes(s);

      const status = (t.status || "").toUpperCase();
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'PAID' && (status === 'PAID' || status === 'SUCCESS')) ||
        (statusFilter === 'PENDING' && status === 'PENDING') ||
        (statusFilter === 'FAILED' && (status === 'EXPIRED' || status === 'FAILED' || status === 'CANCELLED'));

      return matchesSearch && matchesStatus;
    });
  }, [subscriptionTxs, search, statusFilter]);

  const subRevenue = useMemo(() => {
    return subscriptionTxs
      .filter(t => t.status === 'PAID' || t.status === 'Success')
      .reduce((acc, t) => acc + (t.amount || t.totalAmount || 0), 0);
  }, [subscriptionTxs]);

  const paidCount = useMemo(() => {
    return subscriptionTxs.filter(t => t.status === 'PAID' || t.status === 'Success').length;
  }, [subscriptionTxs]);

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

  const getStatusBadge = (status: string) => {
    const upper = (status || "").toUpperCase();
    if (upper === 'PAID' || upper === 'SUCCESS') {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-bold text-[8px] sm:text-[9px] uppercase px-2 py-0.5 rounded-sm flex items-center gap-1 w-fit">
          <CheckCircle2 className="w-3 h-3" /> PAID
        </Badge>
      );
    }
    if (upper === 'PENDING') {
      return (
        <Badge className="bg-amber-500/10 text-amber-600 border-none font-bold text-[8px] sm:text-[9px] uppercase px-2 py-0.5 rounded-sm flex items-center gap-1 w-fit">
          <Clock className="w-3 h-3 animate-spin" /> PENDING
        </Badge>
      );
    }
    return (
      <Badge className="bg-destructive/10 text-destructive border-none font-bold text-[8px] sm:text-[9px] uppercase px-2 py-0.5 rounded-sm flex items-center gap-1 w-fit">
        <XCircle className="w-3 h-3" /> {upper || 'FAILED'}
      </Badge>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-border shadow-sm rounded-md overflow-hidden group hover:border-primary/20 transition-all bg-card">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-md bg-muted ${stat.color} group-hover:scale-105 transition-transform`}>
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <Badge variant="outline" className="text-[8px] md:text-[9px] uppercase font-bold px-1.5 py-0.5">Live</Badge>
              </div>
              <p className="text-muted-foreground text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-1 truncate">{stat.label}</p>
              <h3 className="text-base sm:text-lg font-headline font-bold truncate text-foreground">
                {stat.value}
              </h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 💳 Subscription Transactions History Section */}
      <Card className="w-full border-border rounded-md overflow-hidden shadow-sm bg-card">
        <CardHeader className="border-b border-border bg-muted/30 dark:bg-[#0A0A0A] px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-headline font-bold flex items-center gap-2">
                Subscription Purchase History
                <Badge className="bg-primary/10 text-primary border-none text-[9px] uppercase font-bold px-2 py-0.5">
                  {subscriptionTxs.length} Total
                </Badge>
              </CardTitle>
              <p className="text-xs text-muted-foreground">Historical records of merchant & partner package subscriptions.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground bg-background px-3 py-1.5 rounded-lg border border-border">
            <span>Revenue: <strong className="text-emerald-500 font-bold">Rp {subRevenue.toLocaleString('id-ID')}</strong></span>
            <span className="border-l border-border pl-3">Active: <strong className="text-primary font-bold">{paidCount} Paid</strong></span>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by User, Email, Plan, or TRX ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 bg-muted/30 border-border text-xs rounded-md"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
                className="h-9 text-[10px] uppercase font-bold rounded-md px-3"
              >
                All ({subscriptionTxs.length})
              </Button>
              <Button
                variant={statusFilter === 'PAID' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('PAID')}
                className="h-9 text-[10px] uppercase font-bold rounded-md px-3 text-emerald-500"
              >
                Paid
              </Button>
              <Button
                variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('PENDING')}
                className="h-9 text-[10px] uppercase font-bold rounded-md px-3 text-amber-500"
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === 'FAILED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('FAILED')}
                className="h-9 text-[10px] uppercase font-bold rounded-md px-3 text-destructive"
              >
                Expired
              </Button>
            </div>
          </div>

          {/* Table Container */}
          <div className="w-full overflow-x-auto border border-border rounded-md">
            <table className="w-full min-w-full text-[10px] sm:text-xs text-left">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Transaction ID</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Customer / Merchant</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Package Plan</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Amount</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap text-center">Payment</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap text-center">Date</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-widest text-muted-foreground text-right whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stsLoading || txLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground italic animate-pulse">
                      Synchronizing subscription ledger...
                    </td>
                  </tr>
                ) : filteredSubTxs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground italic">
                      No subscription transactions found.
                    </td>
                  </tr>
                ) : (
                  filteredSubTxs.map((t, idx) => {
                    const amount = t.amount || t.totalAmount || 0;
                    const dateObj = t.createdAt?.toDate ? t.createdAt.toDate() : new Date(t.createdAt || 0);
                    const formattedDate = t.createdAt ? format(dateObj, "dd MMM yyyy HH:mm") : "---";
                    const planName = t.itemName || t.metadata?.planId || "Subscription";
                    const userName = t.userName || t.userEmail || "Merchant";
                    const method = t.paymentMethod || t.payment_info?.payment_channel || "QRIS";

                    return (
                      <tr key={t.id || idx} className="hover:bg-muted/10 transition-colors group">
                        <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-primary">
                          {t.id || `SUB-${idx + 1}`}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground text-xs">{userName}</span>
                            <span className="text-[9px] text-muted-foreground font-mono truncate max-w-[180px]">
                              {t.userEmail || t.userId || "---"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <Badge variant="outline" className="border-primary/20 text-primary font-bold text-[9px] uppercase px-2 py-0.5 rounded-sm">
                            <Sparkles className="w-2.5 h-2.5 mr-1" />
                            {planName}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-foreground">
                          Rp {amount.toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                          <Badge variant="outline" className="border-border text-muted-foreground text-[8px] uppercase font-bold">
                            {method}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-center text-[9px] font-mono text-muted-foreground">
                          {formattedDate}
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex justify-end">
                            {getStatusBadge(t.status)}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}