"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Search, 
  LayoutGrid, 
  Smartphone, 
  Zap, 
  Gamepad2, 
  CreditCard,
  Filter
} from "lucide-react";
import React, { useState } from "react";

const PRODUCTS = [
  { code: "TSEL10", name: "Telkomsel Pulsa 10k", cat: "Pulse", price: "Rp 10.150", status: "Ready" },
  { code: "ISAT50", name: "Indosat Data 5GB", cat: "Data", price: "Rp 48.000", status: "Ready" },
  { code: "PLN100", name: "PLN Token 100k", cat: "PLN", price: "Rp 100.500", status: "Ready" },
  { code: "MLBB86", name: "MLBB 86 Diamonds", cat: "Game", price: "Rp 18.500", status: "Ready" },
  { code: "GOPAY20", name: "GoPay Top Up 20k", cat: "E-Wallet", price: "Rp 20.200", status: "Ready" },
  { code: "XL10", name: "XL Pulsa 10k", cat: "Pulse", price: "Rp 10.300", status: "Outage" },
  { code: "TRI5", name: "Tri Pulsa 5k", cat: "Pulse", price: "Rp 5.150", status: "Ready" },
  { code: "FF50", name: "Free Fire 50 Diamonds", cat: "Game", price: "Rp 7.500", status: "Ready" },
  { code: "TSEL25", name: "Telkomsel Pulsa 25k", cat: "Pulse", price: "Rp 25.100", status: "Ready" },
  { code: "ISAT100", name: "Indosat Data 10GB", cat: "Data", price: "Rp 95.000", status: "Ready" },
];

const CATEGORIES = [
  { id: "all", label: "All Products", icon: LayoutGrid },
  { id: "pulsa", label: "Regular Pulse", icon: Smartphone },
  { id: "data", label: "Data Packages", icon: Zap },
  { id: "game", label: "Game Vouchers", icon: Gamepad2 },
  { id: "ewallet", label: "E-Wallet Top Up", icon: CreditCard },
];

export default function OrkutPricesPage() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold tracking-tight">Product <span className="text-primary">Prices</span></h1>
          <p className="text-muted-foreground text-sm">Check the cheapest H2H prices for all our digital services.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6 order-1">
          <Card className="border border-border shadow-sm rounded-2xl p-6 bg-card space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <Filter className="w-3 h-3" />
                  Select Category
                </label>
                <Select value={activeTab} onValueChange={setActiveTab}>
                  <SelectTrigger className="h-12 bg-muted/50 border-none rounded-xl shadow-none font-bold text-sm">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <cat.icon className="w-4 h-4 text-primary" />
                          <span>{cat.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-6 border-t border-border/50">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-border/50">
                <h4 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-2">
                  <Zap className="w-3 h-3 text-primary" />
                  Update Info
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Product prices may change at any time following central provider policies. Last updated 2 minutes ago.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8 space-y-4 order-2">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                className="pl-11 h-12 bg-card border-border rounded-xl shadow-sm text-sm" 
                placeholder="Search SKU or Product Name..." 
              />
            </div>
          </div>

          <Card className="border border-border shadow-sm rounded-xl overflow-hidden bg-card h-[455px] flex flex-col">
             <CardHeader className="bg-slate-50/50 dark:bg-[#0A0A0A] py-5 px-8 border-b border-border shrink-0">
              <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
                <LayoutGrid className="w-4 h-4 text-primary" />
                H2H Pricelist
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <div className="w-full h-full overflow-auto">
                <table className="w-full text-xs text-left">
                  <thead className="sticky top-0 z-10 bg-muted/50">
                    <tr>
                      <th className="px-8 py-4 font-bold uppercase text-[9px] tracking-widest whitespace-nowrap">SKU Code</th>
                      <th className="px-6 py-4 font-bold uppercase text-[9px] tracking-widest whitespace-nowrap">Product Name</th>
                      <th className="px-6 py-4 font-bold uppercase text-[9px] tracking-widest whitespace-nowrap">Category</th>
                      <th className="px-6 py-4 font-bold uppercase text-[9px] tracking-widest whitespace-nowrap">H2H Price</th>
                      <th className="px-8 py-4 font-bold uppercase text-[9px] tracking-widest text-right whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {PRODUCTS.map((prod, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-8 py-5 font-mono text-[10px] text-muted-foreground whitespace-nowrap">{prod.code}</td>
                        <td className="px-6 py-5 font-bold text-sm whitespace-nowrap">{prod.name}</td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <Badge variant="outline" className="bg-muted/50 border-none text-[8px] font-bold px-2 py-0 h-5 rounded-md uppercase">
                            {prod.cat}
                          </Badge>
                        </td>
                        <td className="px-6 py-5 font-bold text-primary text-sm whitespace-nowrap">{prod.price}</td>
                        <td className="px-8 py-5 text-right whitespace-nowrap">
                          <Badge className={`${
                            prod.status === 'Ready' ? 'bg-green-500/5 text-green-600 border-green-500/20' : 'bg-red-500/5 text-red-600 border-red-500/20'
                          } font-bold text-[9px] uppercase px-2 py-0.5 rounded-md`}>
                            {prod.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
