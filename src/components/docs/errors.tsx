"use client";

import React from "react";
import { X } from "lucide-react";

export function DocsErrors() {
  return (
    <div className="space-y-16 animate-in slide-in-from-bottom-2">
      <section className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-headline font-bold flex items-center gap-3">
            <X className="w-8 h-8 text-rose-500" />
            Error Codes
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Standardized error codes returned by the STSPoint API.
          </p>
        </div>
        
        <div className="rounded-2xl border border-border overflow-hidden bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">HTTP</th>
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Message</th>
                <th className="px-6 py-4 font-bold uppercase text-[10px] tracking-widest">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-6 py-4 font-mono font-bold text-amber-600">401</td>
                <td className="px-6 py-4 font-medium">Invalid secret_key</td>
                <td className="px-6 py-4 text-muted-foreground text-xs">Authentication key is incorrect or revoked.</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-mono font-bold text-amber-600">403</td>
                <td className="px-6 py-4 font-medium">Service not initialized</td>
                <td className="px-6 py-4 text-muted-foreground text-xs">The requested service is not configured for your account.</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-mono font-bold text-amber-600">429</td>
                <td className="px-6 py-4 font-medium">Rate limit exceeded</td>
                <td className="px-6 py-4 text-muted-foreground text-xs">Account has exceeded its allocated RPM (Requests Per Minute).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
