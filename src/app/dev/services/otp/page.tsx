"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Zap, 
  RefreshCcw, 
  ShieldCheck, 
  Loader2, 
  QrCode,
  Smartphone,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Globe,
  MessageSquare,
  Lock,
  SmartphoneNfc
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import React, { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Icon } from "@iconify/react";

const DUMMY_OTP_SERVICES = [
  { id: "WA-ID", app: "WhatsApp", country: "Indonesia", basePrice: 2200, markup: 800, stock: 1540, status: "Ready" },
  { id: "TG-ID", app: "Telegram", country: "Indonesia", basePrice: 1500, markup: 500, stock: 890, status: "Ready" },
  { id: "GOOG-US", app: "Google", country: "USA", basePrice: 3200, markup: 1300, stock: 2100, status: "Ready" },
  { id: "WA-US", app: "WhatsApp", country: "USA", basePrice: 4500, markup: 1500, stock: 420, status: "Maintenance" },
  { id: "TG-RU", app: "Telegram", country: "Russia", basePrice: 1200, markup: 400, stock: 3200, status: "Ready" },
];

export default function OTPManagementPage() {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const handleSync = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: "OTP Gateway Sync", description: "Orderkuota nodes are fully operational." });
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-headline font-bold tracking-tight">OTP & QRIS <span className="text-primary">Management</span></h1>
          <p className="text-muted-foreground text-sm">Infrastructure control for virtual numbers and QRIS mutation bridges.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-md font-bold text-[10px] uppercase tracking-widest gap-2 h-11 px-6">
            <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Node Status
          </Button>
          <Button size="sm" className="rounded-md font-bold text-[10px] uppercase tracking-widest gap-2 h-11 px-6 bg-primary">
            <Plus className="w-3.5 h-3.5" /> New Service
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12 space-y-6">
          {/* OTP Service Table */}
          <div className="space-y-4">
             <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <Input 
                    placeholder="Search by App or Country..." 
                    className="pl-10 h-12 bg-card border-border rounded-xl"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                   />
                </div>
                <Button variant="outline" className="h-12 px-6 rounded-xl gap-2 font-bold text-xs">
                   <Filter className="w-4 h-4" /> Filter
                </Button>
             </div>

             <Card className="border-border shadow-sm rounded-2xl overflow-hidden bg-card">
                <CardHeader className="px-8 py-5 border-b border-border bg-slate-50/50 dark:bg-[#0A0A0A]">
                   <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                      <SmartphoneNfc className="w-4 h-4 text-primary" />
                      Virtual Number Catalog
                   </CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                   <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">Service ID</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">Application</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">Country</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap text-right">Base Price</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap text-right">Markup</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap text-right">Sell Price</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap text-center">Stock</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap text-center">Status</TableHead>
                          <th className="w-[100px]"></th>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {DUMMY_OTP_SERVICES.map((otp) => (
                          <TableRow key={otp.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                            <TableCell className="px-8 py-4 font-mono text-[11px] text-muted-foreground whitespace-nowrap">{otp.id}</TableCell>
                            <TableCell className="whitespace-nowrap">
                               <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center">
                                     <Icon icon={otp.app === 'WhatsApp' ? 'logos:whatsapp-icon' : otp.app === 'Telegram' ? 'logos:telegram' : 'logos:google-icon'} className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="font-bold text-xs">{otp.app}</span>
                               </div>
                            </TableCell>
                            <TableCell className="text-xs font-medium whitespace-nowrap">{otp.country}</TableCell>
                            <TableCell className="text-right font-mono text-[11px] whitespace-nowrap">Rp {otp.basePrice.toLocaleString('id-ID')}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                               <Input 
                                defaultValue={otp.markup} 
                                className="w-20 h-7 text-right text-[11px] font-bold font-mono border-transparent bg-muted/50 focus:bg-background inline-block"
                               />
                            </TableCell>
                            <TableCell className="text-right font-mono text-[11px] font-bold text-primary whitespace-nowrap">
                               Rp {(otp.basePrice + otp.markup).toLocaleString('id-ID')}
                            </TableCell>
                            <TableCell className="text-center font-bold text-xs whitespace-nowrap">{otp.stock.toLocaleString()}</TableCell>
                            <TableCell className="text-center whitespace-nowrap">
                               <Badge className={`${
                                 otp.status === 'Ready' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-orange-500/10 text-orange-600'
                               } border-none font-bold text-[9px] uppercase px-1.5 h-4 whitespace-nowrap`}>{otp.status}</Badge>
                            </TableCell>
                            <TableCell className="px-8 whitespace-nowrap">
                               <div className="flex items-center justify-end gap-2">
                                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/5 hover:text-primary"><Edit2 className="w-3.5 h-3.5" /></Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/5 hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                               </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                   </Table>
                </div>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
