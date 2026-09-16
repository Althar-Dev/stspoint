"use client";

import React from "react";
import { Rocket, Globe, Server, ShieldCheck, Lock, Fingerprint, Activity, CheckCircle2, X, Terminal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CodeBlock } from "./shared/code-block";

export function DocsGeneral() {
  return (
    <div className="space-y-8 sm:space-y-12 animate-in slide-in-from-bottom-2">
      <section id="intro" className="space-y-4 sm:space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary">
          <Rocket className="w-3 h-3" />
          Infrastructure API v1.2
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-headline font-bold tracking-tight">
          Get <span className="text-primary/40">Started.</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
          The STSPoint Infrastructure API provides a unified interface to programmatically manage global payments, digital product fulfillment, and automation bridges. This documentation covers authentication, standardized responses, and core integration logic.
        </p>
      </section>

      <section id="base-url" className="space-y-4 scroll-mt-24 pt-4 border-t border-border">
        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2.5">
            <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            Base URL
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
            All requests are served over <span className="font-bold text-foreground">HTTPS</span> to ensure data integrity and security. The API expects and returns data in <span className="font-bold text-foreground">JSON</span> format.
          </p>
          <div className="flex items-center gap-2 sm:gap-3 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-muted/50 border border-border max-w-full overflow-x-auto font-mono text-xs font-bold text-primary shadow-sm">
            <Server className="w-4 h-4 opacity-30 flex-shrink-0" />
            <span className="whitespace-nowrap">https://api.stspoint.id</span>
          </div>
        </div>
      </section>

      <section id="auth" className="space-y-6 sm:space-y-8 scroll-mt-24 pt-4 border-t border-border">
        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            Authentication
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
            STSPoint uses key-based authentication. You can find your unique credentials in the <span className="font-bold text-foreground">Developer &gt; API Keys</span> section of your Console.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
           <Card className="border-border shadow-none bg-muted/20 rounded-xl sm:rounded-2xl overflow-hidden group hover:border-primary/20 transition-all">
              <CardContent className="p-4 sm:p-6 space-y-3">
                 <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                 </div>
                 <div className="space-y-1">
                    <h4 className="font-bold text-xs sm:text-sm">Secret Key</h4>
                    <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">Your high-security signature used to authorize server-to-server requests. Never expose this key in client-side code.</p>
                 </div>
              </CardContent>
           </Card>
           <Card className="border-border shadow-none bg-muted/20 rounded-xl sm:rounded-2xl overflow-hidden group hover:border-primary/20 transition-all">
              <CardContent className="p-4 sm:p-6 space-y-3">
                 <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                    <Fingerprint className="w-4 h-4 sm:w-5 sm:h-5" />
                 </div>
                 <div className="space-y-1">
                    <h4 className="font-bold text-xs sm:text-sm">Merchant ID</h4>
                    <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">The unique identifier for your business account. Used for context isolation and ledger tracking.</p>
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5" />
            Auth Example (Shell):
          </p>
          <CodeBlock 
            title="cURL Authentication"
            type="curl"
            code={`curl -X POST https://api.stspoint.id/payments/create \\
  -H "Content-Type: application/json" \\
  -d '{
    "secret_key": "STS-Key-XXXXXXXX",
    "merchant_id": "STS-XXXXXXXX",
    "amount": 50000
  }'`}
          />
        </div>
      </section>

      <section id="responses" className="space-y-6 sm:space-y-8 scroll-mt-24 pt-4 border-t border-border">
        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2.5">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            Response Standards
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
            The API utilizes standard HTTP status codes and a consistent JSON wrapper to simplify client-side integration and error handling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3" /> Success (HTTP 200)
            </p>
            <CodeBlock 
              title="Success Wrapper"
              type="json"
              code={`{
  "success": true,
  "data": {
    "external_id": "PAY-12345",
    "status": "PENDING",
    "amount": 50000
  }
}`}
            />
          </div>
          <div className="space-y-2.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-rose-600 flex items-center gap-2">
              <X className="w-3 h-3" /> Error (HTTP 4xx/500)
            </p>
            <CodeBlock 
              title="Error Wrapper"
              type="json"
              code={`{
  "success": false,
  "message": "Invalid secret_key",
  "error_code": "AUTH_FAILED"
}`}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
