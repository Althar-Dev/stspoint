"use client";

import React from "react";
import { Braces } from "lucide-react";
import { Badge as UiBadge } from "@/components/ui/badge";
import { CodeBlock } from "./shared/code-block";

export function DocsOrderkuota() {
  return (
    <div className="space-y-16 animate-in slide-in-from-bottom-2">
      <section className="space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary">
            <Braces className="w-3 h-3" />
            Direct Bridge
          </div>
          <h1 className="text-4xl font-headline font-bold">Orderkuota</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Access your Orderkuota balance and generate dynamic QRIS strings directly through our low-latency bridge.
          </p>
          <div className="flex items-center gap-4">
            <UiBadge className="bg-emerald-500 text-white border-none uppercase font-bold text-[10px]">POST</UiBadge>
            <code className="text-sm font-bold text-primary">/orkut/create</code>
          </div>
        </div>
        <CodeBlock 
          title="Request Nominal QRIS"
          type="json"
          code={`{
  "secret_key": "STS-Key-XXXX",
  "amount": 25000,
  "description": "Payment Ref #123"
}`}
        />
      </section>
    </div>
  );
}
