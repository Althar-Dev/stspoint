"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon } from "@iconify/react";
import { 
  ChevronRight, 
  Globe,
  Server as ServerIcon,
  ShoppingCart
} from "lucide-react";
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const COUNTRIES = [
  { id: "id", name: "Indonesia", code: "ID", flag: "emojione:flag-for-indonesia" },
  { id: "us", name: "United States", code: "US", flag: "emojione:flag-for-united-states" },
  { id: "ru", name: "Russia", code: "RU", flag: "emojione:flag-for-russia" },
  { id: "uk", name: "United Kingdom", code: "GB", flag: "emojione:flag-for-united-kingdom" },
  { id: "vn", name: "Vietnam", code: "VN", flag: "emojione:flag-for-vietnam" },
];

const APPS = [
  { id: "all", name: "All", icon: "ph:squares-four-bold" },
  { id: "wa", name: "WhatsApp", icon: "logos:whatsapp-icon" },
  { id: "tg", name: "Telegram", icon: "logos:telegram" },
  { id: "fb", name: "Facebook", icon: "logos:facebook" },
  { id: "ig", name: "Instagram", icon: "skill-icons:instagram" },
  { id: "goog", name: "Google", icon: "logos:google-icon" },
  { id: "shopee", name: "Shopee", icon: "simple-icons:shopee", color: "#EE4D2D" },
  { id: "tkpd", name: "Tokopedia", icon: "simple-icons:tokopedia", color: "#42B549" },
];

const DUMMY_SERVICES = [
  { id: 1, service: "WhatsApp", operator: "Any", country: "Indonesia", flag: "emojione:flag-for-indonesia", price: "Rp 2.500", stock: 1540 },
  { id: 2, service: "WhatsApp", operator: "Telkomsel", country: "Indonesia", flag: "emojione:flag-for-indonesia", price: "Rp 3.000", stock: 420 },
  { id: 3, service: "Telegram", operator: "Any", country: "Indonesia", flag: "emojione:flag-for-indonesia", price: "Rp 1.800", stock: 890 },
  { id: 4, service: "Google", operator: "Any", country: "United States", flag: "emojione:flag-for-united-states", price: "Rp 3.500", stock: 2100 },
  { id: 5, service: "Shopee", operator: "Indosat", country: "Indonesia", flag: "emojione:flag-for-indonesia", price: "Rp 2.000", stock: 125 },
  { id: 6, service: "Facebook", operator: "Any", country: "Indonesia", flag: "emojione:flag-for-indonesia", price: "Rp 1.500", stock: 3200 },
  { id: 7, service: "Instagram", operator: "XL", country: "Indonesia", flag: "emojione:flag-for-indonesia", price: "Rp 2.200", stock: 450 },
  { id: 8, service: "OpenAI", operator: "Any", country: "United States", flag: "emojione:flag-for-united-states", price: "Rp 12.000", stock: 85 },
  { id: 9, service: "Microsoft", operator: "Any", country: "United Kingdom", flag: "emojione:flag-for-united-kingdom", price: "Rp 5.000", stock: 1200 },
  { id: 10, service: "Tokopedia", operator: "Any", country: "Indonesia", flag: "emojione:flag-for-indonesia", price: "Rp 1.900", stock: 670 },
];

export default function NokosPage() {
  const [selectedApp, setSelectedApp] = useState("all");

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
            console 
            <ChevronRight className="w-3 h-3 text-muted-foreground/30" />
            service 
            <ChevronRight className="w-3 h-3 text-muted-foreground/30" />
            <span className="text-foreground">otp center</span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-6 order-1">
          <Card className="border border-border/50 shadow-sm rounded-xl p-6 bg-card space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Server</label>
                <Select defaultValue="server1">
                  <SelectTrigger className="h-11 rounded-lg bg-muted/50 border-none shadow-none focus:ring-1 focus:ring-primary/20 transition-all">
                    <div className="flex items-center gap-2">
                      <ServerIcon className="w-3.5 h-3.5 text-primary" />
                      <SelectValue placeholder="Server" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-border">
                    <SelectItem value="server1">Server 1</SelectItem>
                    <SelectItem value="server2">Server 2</SelectItem>
                    <SelectItem value="server3">Server 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Negara</label>
                <Select defaultValue="id">
                  <SelectTrigger className="h-11 rounded-lg bg-muted/50 border-none shadow-none focus:ring-1 focus:ring-primary/20 transition-all">
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-primary" />
                      <SelectValue placeholder="Negara" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-border">
                    {COUNTRIES.map(country => (
                      <SelectItem key={country.id} value={country.id}>
                        <div className="flex items-center gap-2">
                          <Icon icon={country.flag} className="w-4 h-4" />
                          <span>{country.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border/50">
              <Tabs value={selectedApp} onValueChange={setSelectedApp} className="w-full">
                <TabsList className="bg-muted/50 p-1 rounded-xl h-auto grid grid-cols-4 gap-2">
                  {APPS.map((app) => (
                    <TabsTrigger 
                      key={app.id} 
                      value={app.id}
                      className="h-12 w-full rounded-lg border border-border bg-card text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all shadow-sm"
                    >
                      <Icon 
                        icon={app.icon} 
                        className="w-5 h-5" 
                      />
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </Card>
        </div>

        {/* Main Area - Table with fixed height and internal scroll */}
        <div className="lg:col-span-8 order-2">
          <Card className="border border-border/50 shadow-sm rounded-xl overflow-hidden bg-card flex flex-col h-[455px]">
            <CardHeader className="px-8 py-6 border-b border-border/50 bg-slate-50/50 dark:bg-[#0A0A0A] shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
                  <ShoppingCart className="w-4 h-4 text-primary" />
                  Layanan Tersedia
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <div className="w-full h-full overflow-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50 dark:bg-white/5 sticky top-0 z-10">
                    <TableRow className="hover:bg-transparent border-border/50">
                      <TableHead className="px-8 font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">Service</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">Operator</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">Country</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">Price</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest text-right whitespace-nowrap">Stock</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {DUMMY_SERVICES.map((item) => (
                      <TableRow key={item.id} className="border-border/50 group hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                        <TableCell className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                              <Icon icon={APPS.find(a => a.name === item.service)?.icon || "ph:hash-bold"} className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-xs">{item.service}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-muted text-muted-foreground border-none font-bold text-[9px] rounded-md uppercase">
                            {item.operator}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon icon={item.flag} className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-medium">{item.country}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-primary text-xs whitespace-nowrap">{item.price}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-xs">{item.stock.toLocaleString()}</span>
                            <span className="text-[8px] text-green-500 font-bold uppercase tracking-tighter">Ready</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-8">
                          <Button size="sm" className="h-8 rounded-lg font-bold text-[10px] uppercase tracking-wider">
                            Order
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
