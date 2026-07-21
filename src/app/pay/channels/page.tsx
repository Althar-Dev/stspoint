"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Settings2,
  CreditCard,
  Clock
} from "lucide-react";
import React, { useMemo } from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Initial preset of channels (we'll merge this with DB)
const CHANNEL_PRESETS = [
  { id: 'QRIS', name: 'QRIS', provider: 'Xendit', fee: '0.7%', type: 'QR', settlement: 'T+2' },
  { id: 'BRI', name: 'BRI Virtual Account', provider: 'Xendit', fee: 'Rp 4.000', type: 'VA', settlement: 'T+1' },
  { id: 'BNI', name: 'BNI Virtual Account', provider: 'Xendit', fee: 'Rp 4.000', type: 'VA', settlement: 'T+1' },
  { id: 'MANDIRI', name: 'Mandiri Virtual Account', provider: 'Xendit', fee: 'Rp 4.000', type: 'VA', settlement: 'T+1' },
  { id: 'PERMATA', name: 'Permata Virtual Account', provider: 'Xendit', fee: 'Rp 4.000', type: 'VA', settlement: 'T+1' },
  { id: 'BSI', name: 'BSI Virtual Account', provider: 'Xendit', fee: 'Rp 4.000', type: 'VA', settlement: 'T+1' },
  { id: 'BJB', name: 'BJB Virtual Account', provider: 'Xendit', fee: 'Rp 4.000', type: 'VA', settlement: 'T+1' },
  { id: 'CIMB', name: 'CIMB Virtual Account', provider: 'Xendit', fee: 'Rp 4.000', type: 'VA', settlement: 'T+1' },
  { id: 'SAHABAT_SAMPOERNA', name: 'Sahabat Sampoerna VA', provider: 'Xendit', fee: 'Rp 3.000', type: 'VA', settlement: 'T+1' },
  { id: 'OVO', name: 'OVO', provider: 'Xendit', fee: '2.0%', type: 'E-WALLET', settlement: 'T+1' },
  { id: 'ALFAMART', name: 'Alfamart', provider: 'Xendit', fee: 'Rp 5.000', type: 'RETAIL', settlement: 'T+1' },
  { id: 'INDOMARET', name: 'Indomaret', provider: 'Xendit', fee: 'Rp 5.000', type: 'RETAIL', settlement: 'T+1' },
];

export default function PaymentChannelsPage() {
  const db = useFirestore();

  const channelsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "payment_channels");
  }, [db]);

  const { data: channelsData, loading } = useCollection(channelsQuery);

  const displayChannels = useMemo(() => {
    const dbChannels = channelsData || [];
    
    // Combine presets with DB entries, favoring DB
    const processedPresets = CHANNEL_PRESETS.map(p => {
      const dbMatch = dbChannels.find(dbc => dbc.id.toUpperCase() === p.id.toUpperCase());
      return dbMatch ? { ...p, ...dbMatch } : p;
    });

    // Add any custom channels from DB that aren't in presets
    const customChannels = dbChannels
      .filter(dbc => !CHANNEL_PRESETS.find(p => p.id.toUpperCase() === dbc.id.toUpperCase()))
      .map(dbc => ({
        id: dbc.id,
        name: dbc.name,
        provider: dbc.provider || 'Xendit',
        fee: dbc.fee,
        logo: dbc.logo,
        type: dbc.group || 'OTHER',
        status: dbc.status === 'active' ? 'Active' : 'Inactive',
        settlement: dbc.settlement || 'T+1'
      }));

    return [...processedPresets, ...customChannels].map(c => {
      // Format fee for display
      let feeDisplay = c.fee;
      if (typeof feeDisplay === 'string' && feeDisplay && !feeDisplay.includes('%') && !feeDisplay.includes('Rp')) {
        feeDisplay = `Rp ${parseInt(feeDisplay).toLocaleString('id-ID')}`;
      }

      const currentStatus = c.status === 'active' || c.status === 'Active' ? 'Active' : 'Inactive';

      return {
        ...c,
        fee: feeDisplay,
        status: currentStatus,
        provider: c.provider || 'Xendit'
      };
    });
  }, [channelsData]);

  // Helper to get logo path
  const getLogoSource = (channel: any) => {
    if (channel.logo) {
      const isFullUrl = channel.logo.startsWith('http') || channel.logo.startsWith('data:');
      return isFullUrl ? channel.logo : `/assets/bank/${channel.logo}`;
    }

    const upperId = channel.id.toUpperCase();
    if (upperId === 'BSI') return '/assets/bank/bsi-logo.svg';
    if (upperId === 'SAHABAT_SAMPOERNA') return '/assets/bank/bss-logo.svg';
    
    const commonLogos = ['BRI', 'BNI', 'MANDIRI', 'PERMATA', 'BJB', 'CIMB', 'OVO', 'ALFAMART', 'INDOMARET', 'QRIS'];
    if (commonLogos.includes(upperId)) {
      return `/assets/bank/${upperId.toLowerCase()}.png`;
    }
    
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-headline font-bold tracking-tight">Kanal <span className="text-primary">Pembayaran</span></h1>
          <p className="text-muted-foreground text-sm">Informasi biaya MDR dan waktu pencairan dana dari provider.</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-md font-bold text-[10px] uppercase tracking-widest gap-2">
          <Settings2 className="w-3.5 h-3.5" /> Konfigurasi Global
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="border-border shadow-sm rounded-md bg-card overflow-hidden">
              <CardHeader className="p-5 pb-0 flex flex-row items-start justify-between">
                <Skeleton className="h-10 w-24 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-sm" />
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {displayChannels.map((channel) => {
            const logoSrc = getLogoSource(channel);
            return (
              <Card key={channel.id} className={cn(
                "border-border shadow-sm rounded-md bg-card overflow-hidden hover:border-primary/20 transition-all group"
              )}>
                <CardHeader className="p-5 pb-0">
                   <div className="flex flex-row items-start justify-between">
                      <div className="relative aspect-video w-20 overflow-hidden flex items-center justify-center">
                        {logoSrc ? (
                          <img 
                            src={logoSrc} 
                            alt={channel.name}
                            className="object-contain w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center rounded-md">
                            <CreditCard className="w-6 h-6 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                      <Badge className={cn(
                        "border-none text-[8px] font-bold uppercase rounded-sm shrink-0",
                        channel.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-orange-500/10 text-orange-600'
                      )}>
                        {channel.status}
                      </Badge>
                   </div>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                   <div className="space-y-1">
                      <h3 className="font-bold text-sm md:text-base truncate">{channel.name}</h3>
                      <div className="flex items-center gap-2">
                         <Badge variant="outline" className="text-[8px] font-bold uppercase h-4 px-1 rounded-sm">{channel.type}</Badge>
                         <p className="text-[10px] text-muted-foreground font-medium truncate">{channel.provider}</p>
                      </div>
                   </div>
                   
                   <div className="pt-4 border-t border-border flex items-center justify-between">
                      <div className="space-y-0.5">
                         <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Biaya / MDR</p>
                         <p className="text-xs font-bold text-foreground">{channel.fee || 'Free'}</p>
                      </div>
                      <div className="space-y-0.5 text-right">
                         <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Settlement</p>
                         <div className="flex items-center gap-1 justify-end">
                            <Clock className="w-3 h-3 text-primary" />
                            <p className="text-xs font-bold text-primary">{channel.settlement || 'T+1'}</p>
                         </div>
                      </div>
                   </div>
                   
                   <div className="pt-2 flex items-center justify-end opacity-20">
                      <div className="text-[8px] font-mono font-bold uppercase">
                        ID: {channel.id}
                      </div>
                   </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
