"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  CreditCard,
  Users,
  ShieldCheck,
  Lock,
  ChevronRight,
  TrendingUp,
  Wallet,
  Zap,
  Server,
  Globe
} from "lucide-react";
import React, { useMemo, useState, useEffect } from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

interface ApiRequestPoint {
  time: string;
  ppob: number;
  stspay: number;
  otp: number;
  smm: number;
  total: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover/95 backdrop-blur-md border border-border p-3 rounded-lg shadow-xl text-xs font-mono space-y-1">
        <p className="text-[10px] text-muted-foreground font-bold border-b border-border pb-1 mb-1">{label} — API Throughput</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              {entry.name}:
            </span>
            <span className="font-bold text-foreground">{entry.value} req/s</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DevRootPage() {
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);
  const [currentRps, setCurrentRps] = useState(48);
  const [avgLatency, setAvgLatency] = useState(38);
  const [chartData, setChartData] = useState<ApiRequestPoint[]>([]);

  useEffect(() => {
    setMounted(true);

    // Initial mock timeline (past 12 points)
    const initialPoints: ApiRequestPoint[] = [];
    const now = new Date();
    for (let i = 12; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 3000);
      const timeStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const ppob = Math.floor(Math.random() * 25) + 15;
      const stspay = Math.floor(Math.random() * 20) + 10;
      const otp = Math.floor(Math.random() * 12) + 5;
      const smm = Math.floor(Math.random() * 8) + 2;
      initialPoints.push({
        time: timeStr,
        ppob,
        stspay,
        otp,
        smm,
        total: ppob + stspay + otp + smm
      });
    }
    setChartData(initialPoints);

    // Live update interval
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      const ppob = Math.floor(Math.random() * 28) + 12;
      const stspay = Math.floor(Math.random() * 22) + 8;
      const otp = Math.floor(Math.random() * 15) + 4;
      const smm = Math.floor(Math.random() * 10) + 2;
      const total = ppob + stspay + otp + smm;

      setCurrentRps(total);
      setAvgLatency(Math.floor(Math.random() * 15) + 32);

      setChartData(prev => {
        const next = prev.slice(1);
        return [...next, { time: timeStr, ppob, stspay, otp, smm, total }];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

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

      <div className="w-full">
        {/* 📈 Realtime API Request Chart Card */}
        <Card className="w-full border-border rounded-md overflow-hidden shadow-sm bg-card flex flex-col">
          <CardHeader className="border-b border-border bg-muted/30 dark:bg-[#0A0A0A] px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
              <div>
                <CardTitle className="text-xs sm:text-sm font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                  Realtime API Requests
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-mono text-[9px] uppercase px-1.5 py-0.5">LIVE</Badge>
                </CardTitle>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <strong className="text-foreground">{currentRps}</strong> RPS
              </span>
              <span className="border-l border-border pl-3">
                Avg Latency: <strong className="text-primary">{avgLatency}ms</strong>
              </span>
              <span className="border-l border-border pl-3 hidden sm:inline text-emerald-500 font-bold">
                99.9% OK
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
            {/* Legend & Indicators */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider">
              <div className="flex flex-wrap items-center gap-3 sm:gap-5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-muted-foreground">PPOB (DigiFlazz)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                  <span className="text-muted-foreground">STSPay Gateway</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <span className="text-muted-foreground">OTP & Auth</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                  <span className="text-muted-foreground">SMM Panel</span>
                </div>
              </div>
            </div>

            {/* Area Chart Container */}
            <div className="w-full h-[260px] sm:h-[300px]">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradientPpob" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradientStspay" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradientOtp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradientSmm" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="time" tick={{ fontSize: 9, fill: '#888888' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#888888' }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="ppob" name="PPOB DigiFlazz" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#gradientPpob)" />
                    <Area type="monotone" dataKey="stspay" name="STSPay Gateway" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#gradientStspay)" />
                    <Area type="monotone" dataKey="otp" name="OTP & Auth" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#gradientOtp)" />
                    <Area type="monotone" dataKey="smm" name="SMM Panel" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#gradientSmm)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs italic animate-pulse">
                  Initializing Live Traffic Stream...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}