"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  RefreshCcw, 
  ShieldCheck, 
  Loader2, 
  Globe,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  List,
  Clock,
  ExternalLink
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

const DUMMY_SMM_PRODUCTS = [
  { id: "1024", name: "IG Followers [Refill 30D]", provider: "Provider-A", baseRate: 12000, markup: 3000, min: 100, max: 50000, time: "1-2h", status: "Active" },
  { id: "1025", name: "TikTok Likes [Real]", provider: "Provider-B", baseRate: 8500, markup: 1500, min: 50, max: 20000, time: "30m", status: "Active" },
  { id: "1026", name: "Youtube Subscribers", provider: "Provider-A", baseRate: 45000, markup: 10000, min: 20, max: 1000, time: "24-48h", status: "Active" },
  { id: "1027", name: "X (Twitter) Retweets", provider: "Provider-C", baseRate: 5000, markup: 2000, min: 50, max: 10000, time: "Instant", status: "Maintenance" },
];

export default function SMMManagementPage() {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const handleSync = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: "SMM Sync Complete", description: "External SMM provider catalog updated." });
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-headline font-bold tracking-tight">SMM <span className="text-primary">Management</span></h1>
          <p className="text-muted-foreground text-sm">Control global SMM Panel bridges and social media service providers.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-md font-bold text-[10px] uppercase tracking-widest gap-2 h-11 px-6">
            <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Scan All API
          </Button>
          <Button size="sm" className="rounded-md font-bold text-[10px] uppercase tracking-widest gap-2 h-11 px-6 bg-primary">
            <Plus className="w-3.5 h-3.5" /> Add Service
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12 space-y-6">
          {/* SMM Product Table */}
          <div className="space-y-4">
             <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <Input 
                    placeholder="Search by ID, Name or Provider..." 
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
                      <List className="w-4 h-4 text-primary" />
                      Global SMM Service Catalog
                   </CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                   <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="px-8 py-4 font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">ID</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">Service Name</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">Provider</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap text-right">Base / 1k</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap text-right">Markup</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap text-right">Sell / 1k</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap text-center">Avg Time</TableHead>
                          <TableHead className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap text-center">Status</TableHead>
                          <th className="w-[100px]"></th>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {DUMMY_SMM_PRODUCTS.map((prod) => (
                          <TableRow key={prod.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                            <TableCell className="px-8 py-4 font-mono text-[11px] text-muted-foreground whitespace-nowrap">{prod.id}</TableCell>
                            <TableCell className="font-bold text-xs whitespace-nowrap">{prod.name}</TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{prod.provider}</TableCell>
                            <TableCell className="text-right font-mono text-[11px] whitespace-nowrap">Rp {prod.baseRate.toLocaleString('id-ID')}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                               <Input 
                                defaultValue={prod.markup} 
                                className="w-20 h-7 text-right text-[11px] font-bold font-mono border-transparent bg-muted/50 focus:bg-background inline-block"
                               />
                            </TableCell>
                            <TableCell className="text-right font-mono text-[11px] font-bold text-primary whitespace-nowrap">
                               Rp {(prod.baseRate + prod.markup).toLocaleString('id-ID')}
                            </TableCell>
                            <TableCell className="text-center whitespace-nowrap">
                               <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground whitespace-nowrap">
                                  <Clock className="w-3 h-3" />
                                  {prod.time}
                               </div>
                            </TableCell>
                            <TableCell className="text-center whitespace-nowrap">
                               <Badge className={`${
                                 prod.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-orange-500/10 text-orange-600'
                               } border-none font-bold text-[9px] uppercase px-1.5 h-4 whitespace-nowrap`}>{prod.status}</Badge>
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
