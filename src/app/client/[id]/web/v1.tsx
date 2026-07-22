"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Wallet, 
  ShoppingCart, 
  History,
  ChevronRight,
  Users,
  ArrowUpRight
} from "lucide-react";
import React from "react";
import Link from "next/link";

interface V1DashboardProps {
  profile: any;
  stspaySvc: any;
  isLoading: boolean;
}

export function V1Dashboard({ profile, stspaySvc, isLoading }: V1DashboardProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold tracking-tight">
            Store <span className="text-primary">Overview</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Welcome back, {profile?.name || "Admin"}. Monitor your store performance today.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-none shadow-xl shadow-amber-500/20 bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 text-white rounded-md overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
          <CardContent className="p-8 space-y-6 relative z-10 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <div className="space-y-1">
                 <p className="text-white/80 text-[10px] font-bold uppercase tracking-[0.2em]">Store Revenue (STSPay)</p>
                 {isLoading ? <Skeleton className="h-10 w-32 bg-white/20" /> : (
                   <h2 className="text-3xl font-headline font-bold">
                     Rp {(stspaySvc?.balance || 0).toLocaleString('id-ID')}
                   </h2>
                 )}
               </div>
               <div className="w-12 h-12 rounded-md bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                 <Wallet className="w-6 h-6 text-white" />
               </div>
            </div>
            <div className="flex gap-2">
              <Button asChild className="flex-1 bg-white text-amber-600 hover:bg-white/90 font-bold rounded-md h-11 text-xs uppercase tracking-wider border-none">
                <Link href="/client/finance">Withdraw</Link>
              </Button>
              <Button variant="outline" className="flex-1 border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold rounded-md h-11 text-xs uppercase tracking-wider">
                Reports
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
           <Card className="border-border shadow-sm rounded-md bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                 <div className="p-2 rounded-md bg-primary/5 text-primary">
                    <ShoppingCart className="w-5 h-5" />
                 </div>
                 <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-md">+5.2%</span>
              </div>
              <h4 className="text-2xl font-headline font-bold">428</h4>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Successful Orders</p>
           </Card>
           <Card className="border-border shadow-sm rounded-md bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                 <div className="p-2 rounded-md bg-primary/5 text-primary">
                    <Users className="w-5 h-5" />
                 </div>
                 <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">Today</span>
              </div>
              <h4 className="text-2xl font-headline font-bold">1,024</h4>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Web Visitors</p>
           </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-border shadow-sm rounded-md overflow-hidden bg-card">
            <CardHeader className="px-8 py-6 border-b border-border bg-muted/30 dark:bg-[#0A0A0A]">
               <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
                    <History className="w-4 h-4 text-primary" />
                    Recent Orders
                  </CardTitle>
                  <Button asChild variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest hover:text-primary cursor-pointer">
                    <Link href="/client/orders">
                      All Orders <ChevronRight className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
               </div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-border">
                  {[
                    { item: 'Diamond MLBB', status: 'Success', time: '2 mins ago', amount: 'Rp 15.000' },
                    { item: 'Pulsa Telkomsel', status: 'Success', time: '12 mins ago', amount: 'Rp 10.250' },
                    { item: 'PLN Token', status: 'Process', time: '25 mins ago', amount: 'Rp 50.000' },
                    { item: 'Diamond Free Fire', status: 'Success', time: '1 hour ago', amount: 'Rp 20.000' },
                  ].map((log, i) => (
                    <div key={i} className="px-8 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                       <div className="flex items-center gap-4">
                          <div className={`w-2 h-2 rounded-full ${log.status === 'Success' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                          <div>
                             <p className="text-xs font-bold">{log.item}</p>
                             <p className="text-[10px] text-muted-foreground">{log.time}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-xs font-bold text-primary">{log.amount}</p>
                          <Badge variant="outline" className="border-none text-[8px] font-bold uppercase text-muted-foreground/60 p-0 h-auto">
                            {log.status}
                          </Badge>
                       </div>
                    </div>
                  ))}
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border shadow-sm rounded-md bg-card p-8">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6">Support & Quick Links</h4>
            <div className="space-y-4">
               {[
                 { label: 'Merchant Documentation', icon: ArrowUpRight },
                 { label: 'Technical Support', icon: ArrowUpRight },
               ].map((item, i) => (
                 <button key={i} className="w-full flex items-center justify-between p-4 rounded-md bg-muted/50 border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all group text-left">
                    <div className="flex items-center gap-3">
                       <item.icon className="w-4 h-4 text-primary" />
                       <span className="text-xs font-bold text-foreground/80">{item.label}</span>
                    </div>
                 </button>
               ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}