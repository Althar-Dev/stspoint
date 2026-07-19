"use client";

import React from "react";
import { X, AlertCircle, Info, ShieldAlert, Zap, Search, Activity, Braces } from "lucide-react";
import { CodeBlock } from "./shared/code-block";

export function DocsErrors() {
  return (
    <div className="space-y-16 animate-in slide-in-from-bottom-2 w-full max-w-full overflow-hidden">
      {/* Intro Section */}
      <section className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/5 border border-rose-500/10 text-[10px] font-bold uppercase tracking-widest text-rose-600">
          <X className="w-3 h-3" />
          Reliability & Stability
        </div>
        <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight text-foreground">Error Codes</h1>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl">
          The STSPoint API uses standard HTTP response codes to indicate the success or failure of an API request. In general, codes in the <code className="text-primary font-bold">2xx</code> range indicate success, codes in the <code className="text-primary font-bold">4xx</code> range indicate an error from the client-side, and codes in the <code className="text-primary font-bold">5xx</code> range indicate an error with our servers.
        </p>
      </section>

      {/* Error Table */}
      <section id="common-errors" className="space-y-8 scroll-mt-24 pt-4 border-t border-border w-full">
        <div className="space-y-4">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-foreground">
            <Activity className="w-6 h-6 text-rose-500" />
            Common Status Codes
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Below is a summary of the most common error codes you might encounter while integrating with our infrastructure.
          </p>
        </div>
        
        <div className="rounded-2xl border border-border overflow-x-auto bg-card shadow-sm w-full block">
          <table className="w-full text-left text-xs border-collapse min-w-[650px]">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap">Status</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap">Title</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap">Message / Reason</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-6 py-4 font-mono font-bold text-amber-600 whitespace-nowrap">400</td>
                <td className="px-6 py-4 font-bold whitespace-nowrap">Bad Request</td>
                <td className="px-6 py-4 text-muted-foreground whitespace-nowrap italic">"Missing required fields"</td>
                <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">The request body is malformed or missing parameters.</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-mono font-bold text-amber-600 whitespace-nowrap">401</td>
                <td className="px-6 py-4 font-bold whitespace-nowrap">Unauthorized</td>
                <td className="px-6 py-4 text-muted-foreground whitespace-nowrap italic">"Authentication failed"</td>
                <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Invalid <code className="bg-muted px-1 rounded">secret_key</code> or <code className="bg-muted px-1 rounded">merchant_id</code>.</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-mono font-bold text-amber-600 whitespace-nowrap">403</td>
                <td className="px-6 py-4 font-bold whitespace-nowrap">Forbidden</td>
                <td className="px-6 py-4 text-muted-foreground whitespace-nowrap italic">"Service not initialized"</td>
                <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">The service or subscription is not active for your account.</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-mono font-bold text-amber-600 whitespace-nowrap">404</td>
                <td className="px-6 py-4 font-bold whitespace-nowrap">Not Found</td>
                <td className="px-6 py-4 text-muted-foreground whitespace-nowrap italic">"Transaction not found"</td>
                <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">The requested resource (transaction/product) does not exist.</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-mono font-bold text-amber-600 whitespace-nowrap">429</td>
                <td className="px-6 py-4 font-bold whitespace-nowrap">Too Many Requests</td>
                <td className="px-6 py-4 text-muted-foreground whitespace-nowrap italic">"Rate limit exceeded"</td>
                <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">You have exceeded your allocated RPM (Requests Per Minute).</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-mono font-bold text-rose-600 whitespace-nowrap">500</td>
                <td className="px-6 py-4 font-bold whitespace-nowrap">Server Error</td>
                <td className="px-6 py-4 text-muted-foreground whitespace-nowrap italic">"Internal Server Error"</td>
                <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">Something went wrong on STSPoint's end.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* JSON Example */}
      <section id="json-example" className="space-y-8 scroll-mt-24 pt-4 border-t border-border w-full">
        <div className="space-y-4">
           <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-foreground">
            <Braces className="w-6 h-6 text-rose-500" />
            Error Payload Structure
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            When an error occurs, the API returns a JSON object containing a <code className="text-primary font-bold">success: false</code> flag and a descriptive message.
          </p>
        </div>

        <CodeBlock 
          title="Error Response Example"
          type="json"
          code={`{
  "success": false,
  "message": "Authentication failed: Invalid secret_key provided.",
  "error_code": "AUTH_INVALID_KEY",
  "request_id": "req_8329482938"
}`}
        />
      </section>

      {/* Best Practices */}
      <section id="best-practices" className="space-y-6 scroll-mt-24 pt-4 border-t border-border w-full">
         <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex items-start gap-4">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
               <p className="text-sm font-bold text-rose-900 uppercase tracking-tight">Error Handling Tips</p>
               <ul className="space-y-2 text-xs text-rose-800 leading-relaxed mt-2 list-disc pl-4">
                  <li><strong>Wait for Retries:</strong> For <code className="font-bold">429</code> errors, implement an exponential backoff strategy.</li>
                  <li><strong>Log Request IDs:</strong> Always include the <code className="font-bold">request_id</code> when contacting support for faster resolution.</li>
                  <li><strong>Sanitize Logs:</strong> Ensure your application logs do not store raw <code className="font-bold">secret_key</code> values when errors occur.</li>
               </ul>
            </div>
         </div>
      </section>

      <div className="text-center pt-8 border-t border-border">
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.4em] opacity-30">STSPoint Global API • Error Reference v1.2</p>
      </div>
    </div>
  );
}
