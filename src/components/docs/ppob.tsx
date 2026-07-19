"use client";

import React from "react";
import { Smartphone, Badge } from "lucide-react";
import { Badge as UiBadge } from "@/components/ui/badge";
import { CodeBlock } from "./shared/code-block";

export function DocsPpob() {
  return (
    <div className="space-y-16 animate-in slide-in-from-bottom-2">
      <section className="space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/10 text-[10px] font-bold uppercase tracking-widest text-blue-500">
            <Smartphone className="w-3 h-3" />
            Digital Distribution
          </div>
          <h1 className="text-4xl font-headline font-bold">PPOB</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Connect to our H2H bridge to fulfill digital orders like mobile data, phone credit, and utility tokens automatically.
          </p>
          <div className="flex items-center gap-4">
            <UiBadge className="bg-emerald-500 text-white border-none uppercase font-bold text-[10px]">POST</Badge>
            <code className="text-sm font-bold text-primary">/ppob/order</code>
          </div>
        </div>
        <CodeBlock 
          title="PPOB Order Body"
          type="json"
          code={`{
  "secret_key": "STS-Key-XXXX",
  "sku": "TSEL10",
  "target": "081234567890",
  "ref_id": "MY-ORDER-001"
}`}
        />
        <div className="p-6 rounded-2xl bg-muted/50 border border-border">
           <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Dynamic Webhook Header</p>
           <p className="text-xs text-muted-foreground leading-relaxed">
              Similar to STSPay, you can include the <code className="font-bold text-foreground">X-Callback-URL</code> header in your PPOB requests to receive real-time order status updates at a specific URL.
           </p>
        </div>
      </section>
    </div>
  );
}
