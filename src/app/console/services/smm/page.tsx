"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Icon } from "@iconify/react";
import { 
  ChevronRight, 
  Search, 
  Filter,
  List
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = [
  { id: "all", icon: "ph:squares-four-bold" },
  { id: "instagram", icon: "skill-icons:instagram" },
  { id: "tiktok", icon: "logos:tiktok-icon" },
  { id: "youtube", icon: "logos:youtube-icon" },
  { id: "twitter", icon: "skill-icons:twitter" },
  { id: "facebook", icon: "logos:facebook" },
  { id: "threads", icon: "ri:threads-line" },
  { id: "linkedin", icon: "skill-icons:linkedin" },
  { id: "whatsapp", icon: "logos:whatsapp-icon" },
  { id: "telegram", icon: "logos:telegram" },
  { id: "spotify", icon: "logos:spotify-icon" },
  { id: "shopee", icon: "simple-icons:shopee", color: "#EE4D2D" },
];

const DUMMY_SMM_SERVICES = [
  { id: "1024", service: "Instagram Followers [High Quality]", rate: "Rp 15.000", min: "100", max: "10.000", time: "1-2 Hours" },
  { id: "1025", service: "TikTok Like [Real]", rate: "Rp 8.000", min: "50", max: "5.000", time: "30 Mins" },
  { id: "1026", service: "YouTube Subscribers [Refill]", rate: "Rp 45.000", min: "10", max: "1.000", time: "12-24 Hours" },
  { id: "1027", service: "Twitter Retweet [Instant]", rate: "Rp 12.000", min: "20", max: "2.000", time: "Instant" },
  { id: "1028", service: "Facebook Page Likes", rate: "Rp 25.000", min: "100", max: "20.000", time: "2-4 Hours" },
  { id: "1029", service: "Spotify Plays [Premium]", rate: "Rp 5.500", min: "1.000", max: "500.000", time: "24 Hours" },
  { id: "1030", service: "Telegram Member [Group/Channel]", rate: "Rp 18.000", min: "100", max: "50.000", time: "1-3 Hours" },
];

export default function SMMPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Breadcrumb Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
            console 
            <ChevronRight className="w-3 h-3 text-muted-foreground/30" />
            service 
            <ChevronRight className="w-3 h-3 text-muted-foreground/30" />
            <span className="text-foreground">smm panel</span>
          </h1>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar - Categories */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border border-border/50 shadow-sm rounded-xl bg-card p-6">
              <TabsList className="bg-transparent p-0 grid grid-cols-4 gap-3 h-auto w-full">
                {CATEGORIES.map((cat) => (
                  <TabsTrigger 
                    key={cat.id} 
                    value={cat.id}
                    className="h-12 w-full rounded-xl border border-border bg-card text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all shadow-sm hover:border-primary/50 flex items-center justify-center p-0"
                  >
                    <Icon 
                      icon={cat.icon} 
                      className="w-5 h-5" 
                      style={cat.color ? { color: cat.color } : undefined}
                    />
                  </TabsTrigger>
                ))}
              </TabsList>
            </Card>
          </div>

          {/* Right Area - Search & Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Search & Filter Bar */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  className="pl-9 h-10 md:h-11 bg-card border-border rounded-xl shadow-sm text-sm" 
                  placeholder="Cari layanan sosial media..." 
                />
              </div>
              <Button variant="outline" className="h-10 md:h-11 px-4 border-border rounded-xl bg-card shadow-sm flex items-center gap-2 font-bold shrink-0 text-xs">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>

            <TabsContent value="all" className="mt-0">
               <Card className="border border-border/50 shadow-sm rounded-xl overflow-hidden bg-card h-[455px] flex flex-col">
                  <CardHeader className="px-8 py-6 border-b border-border/50 bg-slate-50/50 dark:bg-[#0A0A0A] shrink-0">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
                      <List className="w-4 h-4 text-primary" />
                      Daftar Layanan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 flex-1 overflow-hidden">
                    <div className="w-full h-full overflow-auto">
                      <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-white/5 sticky top-0 z-10">
                          <TableRow className="hover:bg-transparent border-border/50">
                            <TableHead className="px-8 font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">ID</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">Service</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">Rate/1000</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">Min</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">Max</TableHead>
                            <TableHead className="font-bold text-[10px] uppercase tracking-widest text-right whitespace-nowrap">Avg Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {DUMMY_SMM_SERVICES.map((item) => (
                            <TableRow key={item.id} className="border-border/50 group hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                              <TableCell className="px-8 py-4 font-mono text-[10px] text-muted-foreground">
                                {item.id}
                              </TableCell>
                              <TableCell>
                                <span className="font-bold text-xs">{item.service}</span>
                              </TableCell>
                              <TableCell>
                                <span className="font-bold text-primary text-xs whitespace-nowrap">{item.rate}</span>
                              </TableCell>
                              <TableCell>
                                <span className="text-[11px] font-medium">{item.min}</span>
                              </TableCell>
                              <TableCell>
                                <span className="text-[11px] font-medium">{item.max}</span>
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge variant="secondary" className="bg-muted text-muted-foreground border-none font-bold text-[9px] rounded-md uppercase whitespace-nowrap">
                                  {item.time}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
               </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
