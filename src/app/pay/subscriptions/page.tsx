"use client";

import React from "react";

export default function SubscriptionComingSoonPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-12 animate-in fade-in duration-700 max-w-4xl mx-auto px-4 text-center">
      
      {/* Text Content */}
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-lg md:text-xl text-muted-foreground font-medium uppercase tracking-[0.2em]">Coming Soon</p>
        </div>
        
        <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto md:text-lg">
          Bangun sistem penagihan otomatis (Recurring Billing) untuk pelanggan Anda. Fitur ini memungkinkan pelanggan berlangganan layanan Anda dengan pembayaran otomatis setiap bulan atau tahun tanpa ribet.
        </p>
      </div>

      <div className="pt-8 border-t border-border/50 w-full">
        <p className="text-[10px] text-muted-foreground font-bold tracking-[0.4em]">
          STSPoint 2026
        </p>
      </div>
    </div>
  );
}
