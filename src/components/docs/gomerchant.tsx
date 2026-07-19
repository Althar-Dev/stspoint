"use client";

import React from "react";
import { Globe, Badge } from "lucide-react";
import { Badge as UiBadge } from "@/components/ui/badge";
import { CodeBlock } from "./shared/code-block";

export function DocsGoMerchant() {
  return (
    <div className="space-y-16 animate-in slide-in-from-bottom-2">
      <section className="space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary">
            <Globe className="w-3 h-3" />
            GoBiz Bridge
          </div>
          <h1 className="text-4xl font-headline font-bold">GoMerchant</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Seamlessly integrate GoPay payments using our GoBiz merchant automation bridge.
          </p>
          <div className="flex items-center gap-4">
            <UiBadge className="bg-emerald-500 text-white border-none uppercase font-bold text-[10px]">POST</Badge>
            <code className="text-sm font-bold text-primary">/gopay/create</code>
          </div>
        </div>
        <CodeBlock 
          title="GoPay Nominal Request"
          type="json"
          code={`{
  "secret_key": "STS-Key-XXXX",
  "amount": 10500,
  "description": "Custom Order #99"
}`}
        />
      </section>
    </div>
  );
}
