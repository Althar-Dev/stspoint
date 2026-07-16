"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Globe, 
  ShieldAlert, 
  Zap, 
  Users, 
  Smartphone, 
  Laptop, 
  MousePointer2, 
  Cpu, 
  Clock,
  ArrowUpRight,
  Monitor
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  YAxis, 
  XAxis,
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from "recharts";

const COLORS = ['#22c55e', '#f59e0b', '#8b5cf6', '#ef4444', '#3b82f6', '#ec4899'];
const STATUS_COLORS: Record<string, string> = {
  '200': '#10b981',
  '400': '#f59e0b',
  '401': '#6366f1',
  '403': '#f97316',
  '404': '#94a3b8',
  '429': '#ec4899',
  '500': '#ef4444',
};

export default function TrafficPage() {
  const [mounted, setMounted] = useState(false);
  const [rps, setRps] = useState(0);
  const [chartData, setChartData] = useState<{ time: string, success: number, failed: number }[]>([]);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      // Simulate real-time RPS fluctuation
      setRps(Math.floor(Math.random() * 45) + 12);
      
      setChartData(prev => {
        const last = prev.slice(-19);
        return [...last, { 
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
          success: Math.floor(Math.random() * 80) + 20,
          failed: Math.random() > 0.9 ? Math.floor(Math.random() * 10) : 0
        }];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: "Requests (Today)", value: "142,430", icon: Activity, color: "text-blue-500" },
    { label: "Requests (Month)", value: "4.2M", icon: Globe, color: "text-primary" },
    { label: "Current RPS", value: rps, icon: Zap, color: "text-amber-500", animate: true },
    { label: "Success Rate", value: "99.4%", icon: ShieldAlert, color: "text-emerald-500" },
    { label: "Avg Latency", value: "64ms", icon: Clock, color: "text-purple-500" },
    { label: "Peak Traffic", value: "184 RPS", icon: Cpu, color: "text-rose-500" },
  ];

  const statusData = [
    { name: '200', value: 94 },
    { name: '400', value: 2 },
    { name: '429', value: 3 },
    { name: '500', value: 1 },
  ];

  const serviceData = [
    { name: 'PPOB', req: 12430 },
    { name: 'QRIS', req: 8230 },
    { name: 'OTP', req: 5421 },
    { name: 'SMM', req: 2987 },
  ];

  if (!mounted) return null;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      {/* 📊 Overview Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-card border-border rounded-md overflow-hidden group shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-md bg-muted ${stat.color}`}>
                  <stat.icon className={`w-4 h-4 md:w-5 md:h-5 ${stat.animate ? 'animate-pulse' : ''}`} />
                </div>
                <Badge variant="outline" className="text-[8px] md:text-[9px] uppercase font-bold">Live</Badge>
              </div>
              <p className="text-muted-foreground text-[8px] md:text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-sm md:text-lg font-headline font-bold text-foreground truncate">{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 📈 Traffic Trend Graph */}
      <Card className="bg-card border-border rounded-md overflow-hidden shadow-sm">
        <CardHeader className="bg-muted/30 px-6 py-4 border-b border-border flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Traffic Flow Trend
          </CardTitle>
          <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[8px] animate-pulse font-bold">Active Engine</Badge>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[250px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="success" stroke="#10b981" fillOpacity={1} fill="url(#colorSuccess)" strokeWidth={2} />
                <Area type="monotone" dataKey="failed" stroke="#ef4444" fillOpacity={1} fill="url(#colorFailed)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ⚡ Status Code Distribution */}
        <Card className="lg:col-span-4 bg-card border-border rounded-md overflow-hidden flex flex-col shadow-sm">
          <CardHeader className="bg-muted/30 px-6 py-4 border-b border-border">
            <CardTitle className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">HTTP Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center p-6 min-h-[300px]">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-8 w-full max-w-[240px]">
              {statusData.map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.name] }}></div>
                  <span className="text-[10px] font-bold text-foreground/70">{s.name} <span className="text-muted-foreground/40 font-normal">({s.value}%)</span></span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 🔥 Top Services */}
        <Card className="lg:col-span-8 bg-card border-border rounded-md overflow-hidden shadow-sm">
          <CardHeader className="bg-muted/30 px-6 py-4 border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">Internal API Utilization</CardTitle>
          </CardHeader>
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-full text-left font-mono text-[10px] md:text-xs">
              <thead className="bg-muted/20 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-muted-foreground uppercase tracking-widest whitespace-nowrap">Service Endpoint</th>
                  <th className="px-6 py-4 text-muted-foreground uppercase tracking-widest whitespace-nowrap">Today Request</th>
                  <th className="px-6 py-4 text-muted-foreground uppercase tracking-widest whitespace-nowrap">Load Balance</th>
                  <th className="px-6 py-4 text-muted-foreground uppercase tracking-widest text-right whitespace-nowrap">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {serviceData.map((s, i) => (
                  <tr key={i} className="hover:bg-muted/10 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <Activity className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-foreground/80">{s.name} API</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-foreground">{s.req.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 w-24 h-1 bg-muted rounded-full overflow-hidden hidden sm:block">
                           <div className="h-full bg-primary" style={{ width: `${(s.req / 30000) * 100}%` }}></div>
                        </div>
                        <span className="text-muted-foreground text-[10px]">{Math.floor((s.req / 29068) * 100)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap font-bold text-primary">{(40 + i * 15)}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="text-center py-6">
         <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-[0.4em]">
           STS Point Analytics Engine • Data Synchronized Every 2 Seconds
         </p>
      </div>
    </div>
  );
}