"use client";

import { Terminal, Code2, Rocket, CheckCircle2 } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    { icon: Terminal, title: "Provision API Keys", desc: "Instantly generate secure production and sandbox credentials via our console." },
    { icon: Code2, title: "Simple Integration", desc: "Connect your existing tech stack using our comprehensive REST API and SDKs." },
    { icon: Rocket, title: "Scale at Speed", desc: "Process thousands of requests per minute across our global Anycast network." },
  ];

  return (
    <section id="features" className="w-full py-12 md:py-24 scroll-mt-24">
      <div className="bg-slate-50 rounded-3xl md:rounded-[3rem] p-6 sm:p-10 md:p-20 border border-black/5 relative overflow-hidden w-full">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-primary/5 blur-[120px] -mr-32 -mt-32 md:-mr-48 md:-mt-48"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto space-y-12 md:space-y-16">
          {/* Header area */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-headline font-bold tracking-tight">
              Built for <span className="text-primary">Developers</span>
            </h2>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              We handle the complex backend orchestration so you can focus on building the features your customers love. Our infrastructure is designed for high performance and reliability.
            </p>
          </div>
          
          {/* Steps grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-4 group">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white shadow-sm border border-black/5 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-500 transform group-hover:-translate-y-1">
                  <step.icon className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-base md:text-lg">{step.title}</h4>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Capabilities badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 pt-4 border-t border-black/5">
            {['Auto-Webhooks', 'RESTful Design', 'JSON Schema', 'TLS 1.3 Encryption'].map((feat) => (
              <div key={feat} className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white border border-black/5 text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-muted-foreground shadow-sm hover:shadow-md transition-all">
                <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5 text-emerald-500" />
                {feat}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
