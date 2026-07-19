"use client";

import React from "react";
import { Webhook, HelpCircle, Zap, ShieldAlert, Terminal, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CodeBlock } from "./shared/code-block";

export function DocsWebhooks() {
  return (
    <div className="space-y-16 animate-in slide-in-from-bottom-2">
       <section className="space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary">
            <Webhook className="w-3 h-3" />
            Real-time Events
          </div>
          <h1 className="text-4xl font-headline font-bold">Webhooks</h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
            Webhooks (Callbacks) allow STSPoint to push real-time data to your server as soon as an event occurs, eliminating the need for constant status polling.
          </p>
        </div>

        <div className="p-8 rounded-[2rem] bg-muted/50 border border-border space-y-8">
           <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-base">How it works</h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="space-y-3 relative z-10 text-center md:text-left">
                 <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold mx-auto md:mx-0">1</div>
                 <h4 className="font-bold text-sm">Request with URL</h4>
                 <p className="text-xs text-muted-foreground leading-relaxed">Provide your callback URL in the <code className="font-bold text-foreground">X-Callback-URL</code> header during an API request.</p>
              </div>
              <div className="space-y-3 relative z-10 text-center md:text-left">
                 <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold mx-auto md:mx-0">2</div>
                 <h4 className="font-bold text-sm">Post JSON</h4>
                 <p className="text-xs text-muted-foreground leading-relaxed">STSPoint sends a secure POST request to that specific URL when the event happens.</p>
              </div>
              <div className="space-y-3 relative z-10 text-center md:text-left">
                 <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold mx-auto md:mx-0">3</div>
                 <h4 className="font-bold text-sm">ACK & Process</h4>
                 <p className="text-xs text-muted-foreground leading-relaxed">Your server responds with 200 OK and processes the transaction internally.</p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border bg-card rounded-2xl p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
               <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm">Dynamic Endpoints</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Unlike legacy systems, we do not require a global static URL. You can specify a different callback URL for every single transaction via headers.
            </p>
          </Card>
          <Card className="border-border bg-card rounded-2xl p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
               <ShieldAlert className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm">Security Verification</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every request includes an <code className="font-bold text-foreground">X-STS-Signature</code> header. Use **HMAC-SHA256** with your **Secret Key** to verify that the payload is genuine.
            </p>
          </Card>
        </div>

        <div className="space-y-6 pt-4 scroll-mt-24" id="webhook-example">
           <h3 className="text-2xl font-bold flex items-center gap-3">
             <Terminal className="w-6 h-6 text-primary" />
             Example Payload
           </h3>
           <div className="space-y-4">
             <p className="text-sm text-muted-foreground leading-relaxed">
               Example JSON sent by STSPoint when a payment is marked as **PAID**.
             </p>
             <CodeBlock 
               title="POST Webhook Payload"
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

           <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-4">
             <div className="flex items-center gap-2">
               <Info className="w-4 h-4 text-amber-600" />
               <h4 className="text-sm font-bold uppercase tracking-tight text-amber-900">Acknowledgement</h4>
             </div>
             <p className="text-xs text-amber-800 leading-relaxed">
               Your server **must** return an <span className="font-bold">HTTP 200</span> response within 10 seconds. If our system receives a timeout or any error code (4xx/500), it will attempt to redeliver the message up to 3 times.
             </p>
           </div>
        </div>
      </section>
    </div>
  );
}
