"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Clock, Construction } from "lucide-react";

export default function OrkutPricesComingSoonPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-10 animate-in fade-in duration-700 max-w-4xl mx-auto px-4 text-center">
      
      {/* Icon Stack */}
      <div className="relative">
        <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center text-primary animate-pulse">
          <Zap className="w-10 h-10" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* Text Content */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-headline font-bold tracking-tight">
            H2H Price <span className="text-primary/40">Catalog.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium uppercase tracking-[0.2em]">Coming Soon</p>
        </div>
        
        <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto text-sm md:text-base">
          Kami sedang mensinkronkan ribuan produk PPOB dan Game dari infrastruktur Orderkuota. 
          Fitur ini akan segera memungkinkan Anda memantau harga modal H2H secara real-time untuk optimalisasi profit bisnis Anda.
        </p>
      </div>

      {/* Info Card */}
      <Card className="border-border bg-muted/30 shadow-none rounded-2xl overflow-hidden max-w-md w-full">
        <CardContent className="p-6 flex items-start gap-4 text-left">
          <div className="p-2 rounded-lg bg-background border border-border">
            <Construction className="w-4 h-4 text-primary" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider">Status Integrasi</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Engine sinkronisasi sedang dalam tahap audit keamanan dan optimalisasi latensi. 
              Estimasi rilis: Q4 2024.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="pt-8 border-t border-border/50 w-full max-w-xs">
        <p className="text-[10px] text-muted-foreground font-bold tracking-[0.4em] uppercase opacity-30">
          Orderkuota Edge Bridge
        </p>
      </div>
    </div>
  );
}
