"use client";

import React from "react";
import { Webhook, HelpCircle, Zap, ShieldAlert, Terminal, Info, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CodeBlock } from "./shared/code-block";
import { Badge as UiBadge } from "@/components/ui/badge";

export function DocsWebhooks() {
  return (
    <div className="space-y-8 sm:space-y-12 animate-in slide-in-from-bottom-2 w-full max-w-full overflow-hidden">
       <section className="space-y-6 sm:space-y-8">
        <div className="space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary">
            <Webhook className="w-3 h-3" />
            Real-time Event Notifications
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-headline font-bold text-foreground">Webhooks Integration</h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
            Webhooks (Callbacks) allow STSPoint to push asynchronous notifications to your server the moment a transaction status changes. This eliminates the need for constant status polling and ensures your application reacts instantly to user payments and product fulfillment.
          </p>
        </div>

        <div className="p-4 sm:p-6 rounded-xl sm:rounded-[2rem] bg-muted/50 border border-border space-y-6 sm:space-y-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -mr-32 -mt-32"></div>
           <div className="flex items-center gap-2.5 relative z-10">
              <HelpCircle className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-sm sm:text-base">How it works</h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative z-10">
              <div className="space-y-2.5 text-center md:text-left">
                 <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mx-auto md:mx-0 shadow-lg shadow-primary/20 text-xs sm:text-sm">1</div>
                 <h4 className="font-bold text-xs sm:text-sm">Register Endpoint</h4>
                 <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">Provide your URL in the <code className="bg-primary/10 text-primary px-1.5 rounded font-bold text-[10px]">X-Callback-URL</code> header or the Dashboard Settings.</p>
              </div>
              <div className="space-y-3 text-center md:text-left">
                 <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mx-auto md:mx-0 shadow-lg shadow-primary/20">2</div>
                 <h4 className="font-bold text-sm">Automated POST</h4>
                 <p className="text-xs text-muted-foreground leading-relaxed">STSPoint sends a secure JSON POST request to your endpoint as soon as an event (e.g., Payment Success) is triggered.</p>
              </div>
              <div className="space-y-3 text-center md:text-left">
                 <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mx-auto md:mx-0 shadow-lg shadow-primary/20">3</div>
                 <h4 className="font-bold text-sm">ACK & Process</h4>
                 <p className="text-xs text-muted-foreground leading-relaxed">Your server verifies the signature, responds with <code className="text-emerald-600 font-bold">200 OK</code>, and processes the order internally.</p>
              </div>
           </div>
        </div>

        {/* Security Section */}
        <div className="space-y-8 pt-4 border-t border-border">
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-foreground">
              <ShieldAlert className="w-6 h-6 text-primary" />
              Signature Verification
            </h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              To ensure the webhook data originates from official STSPoint infrastructure, every request includes an <code className="font-bold text-primary">X-STS-Signature</code> header.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
             <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Verification Process:</h4>
             <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                   <div className="w-5 h-5 rounded-full bg-primary/5 text-primary flex items-center justify-center shrink-0 mt-0.5"><Lock className="w-3 h-3" /></div>
                   <p className="text-muted-foreground leading-tight"><span className="font-bold text-foreground">Method:</span> Generate an HMAC SHA256 hash of the raw JSON body.</p>
                </li>
                <li className="flex items-start gap-3">
                   <div className="w-5 h-5 rounded-full bg-primary/5 text-primary flex items-center justify-center shrink-0 mt-0.5"><Lock className="w-3 h-3" /></div>
                   <p className="text-muted-foreground leading-tight"><span className="font-bold text-foreground">Secret:</span> Use your <code className="text-primary font-bold">Webhook Secret</code> (fallback: Secret Key) found in Console.</p>
                </li>
                <li className="flex items-start gap-3">
                   <div className="w-5 h-5 rounded-full bg-primary/5 text-primary flex items-center justify-center shrink-0 mt-0.5"><Lock className="w-3 h-3" /></div>
                   <p className="text-muted-foreground leading-tight"><span className="font-bold text-foreground">Compare:</span> Match your generated hash with the one in the header.</p>
                </li>
             </ul>
          </div>
        </div>

        {/* Event Payloads */}
        <div className="space-y-12 pt-4 border-t border-border w-full">
           <div className="space-y-4">
              <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-foreground">
                <Terminal className="w-6 h-6 text-primary" />
                Event Payloads
              </h2>
              <p className="text-sm md:text-base text-muted-foreground">The structure of the JSON payload varies depending on the service module.</p>
           </div>

           {/* STSPay Payload */}
           <div className="space-y-4">
              <div className="flex items-center gap-2">
                 <UiBadge className="bg-primary text-white border-none uppercase font-bold text-[9px] px-2 h-5">MODULE</UiBadge>
                 <span className="font-bold text-sm">STSPay (Gateway)</span>
              </div>
              <CodeBlock 
                title="Webhook Payload: payment.paid"
                type="json"
                code={`{
  "event": "payment.paid",
  "data": {
    "external_id": "PAY-1730-XXXX",
    "status": "PAID",
    "amount": 50000,
    "payer_email": "customer@email.com",
    "timestamp": "2024-10-24T08:42:11Z"
  }
}`}
              />
           </div>

           {/* PPOB Payload */}
           <div className="space-y-4">
              <div className="flex items-center gap-2">
                 <UiBadge className="bg-blue-500 text-white border-none uppercase font-bold text-[9px] px-2 h-5">MODULE</UiBadge>
                 <span className="font-bold text-sm">PPOB Service</span>
              </div>
              <CodeBlock 
                title="Webhook Payload: ppob.status_update"
                type="json"
                code={`{
  "event": "ppob.status_update",
  "data": {
    "ref_id": "ORDER-9921",
    "sku": "TSEL10",
    "target": "081234567890",
    "status": "Success",
    "sn": "83294829384923",
    "message": "Transaction successful",
    "timestamp": "2024-10-24T08:42:11Z"
  }
}`}
              />
           </div>
        </div>

        {/* Best Practices */}
        <div className="space-y-6 pt-4 border-t border-border w-full">
           <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-4">
             <div className="flex items-center gap-2">
               <Info className="w-4 h-4 text-amber-600" />
               <h4 className="text-sm font-bold uppercase tracking-tight text-amber-900">Important Implementation Notes</h4>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed text-amber-800">
                <div className="space-y-2">
                   <p className="font-bold text-amber-900">Acknowledgement</p>
                   <p>Your server must return an <span className="font-bold">HTTP 200</span> status code within 10 seconds. Any other code (or timeout) will be considered a failure.</p>
                </div>
                <div className="space-y-2">
                   <p className="font-bold text-amber-900">Retry Policy</p>
                   <p>If delivery fails, our system will attempt to redeliver the webhook up to <span className="font-bold text-amber-900">3 times</span> with an exponential backoff strategy.</p>
                </div>
             </div>
           </div>
        </div>

        <div className="text-center pt-8">
           <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.4em] opacity-30">Webhook Dispatcher v1.2 • Secure Transmission</p>
        </div>
      </section>
    </div>
  );
}
