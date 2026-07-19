
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
        <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-primary/5 blur-[120px] -mr-32 -mt-32 md:-mr-48 md:-mt-48"></div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 items-center">
          <div className="lg:col-span-5 space-y-8 md:space-y-10">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-headline font-bold tracking-tight">Built for <span className="text-primary">Developers</span></h2>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">We handle the complex backend orchestration so you can focus on building the features your customers love.</p>
            </div>
            
            <div className="space-y-4 md:space-y-6">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-4 md:gap-5 group">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-white shadow-sm border border-black/5 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <step.icon className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="space-y-0.5 md:space-y-1">
                    <h4 className="font-bold text-sm md:text-base">{step.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 md:gap-4 pt-2 md:pt-4">
              {['Auto-Webhooks', 'RESTful Design', 'JSON Schema', 'TLS 1.3 Encryption'].map((feat) => (
                <div key={feat} className="flex items-center gap-1.5 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full bg-white border border-black/5 text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-emerald-500" />
                  {feat}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="relative w-full aspect-[4/3] rounded-2xl md:rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-[#0D0D0D] p-5 sm:p-8 md:p-10 font-mono text-[9px] sm:text-[11px] md:text-xs text-zinc-300">
              <div className="flex gap-1.5 md:gap-2 mb-6 md:mb-8">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500/40"></div>
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500/40"></div>
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500/40"></div>
              </div>
              
              <div className="space-y-3 md:space-y-4">
                <p className="flex gap-2 md:gap-3">
                  <span className="text-zinc-600 select-none">1</span>
                  <span><span className="text-purple-400">const</span> client = <span className="text-purple-400">new</span> <span className="text-blue-400">STSClient</span>({'{'}</span>
                </p>
                <p className="flex gap-2 md:gap-3">
                  <span className="text-zinc-600 select-none">2</span>
                  <span className="pl-4">apiKey: <span className="text-emerald-400">'sts_live_83k9...'</span>,</span>
                </p>
                <p className="flex gap-2 md:gap-3">
                  <span className="text-zinc-600 select-none">3</span>
                  <span className="pl-4">merchantId: <span className="text-emerald-400">'STS-92182'</span></span>
                </p>
                <p className="flex gap-2 md:gap-3">
                  <span className="text-zinc-600 select-none">4</span>
                  <span>{'}'});</span>
                </p>
                <p className="flex gap-2 md:gap-3">
                  <span className="text-zinc-600 select-none">5</span>
                  <span></span>
                </p>
                <p className="flex gap-2 md:gap-3">
                  <span className="text-zinc-600 select-none">6</span>
                  <span><span className="text-zinc-500 italic">// Direct QRIS creation</span></span>
                </p>
                <p className="flex gap-2 md:gap-3">
                  <span className="text-zinc-600 select-none">7</span>
                  <span><span className="text-purple-400">const</span> res = <span className="text-purple-400">await</span> client.<span className="text-blue-400">payments</span>.<span className="text-blue-400">create</span>({'{'}</span>
                </p>
                <p className="flex gap-2 md:gap-3">
                  <span className="text-zinc-600 select-none">8</span>
                  <span className="pl-4">type: <span className="text-emerald-400">'qris'</span>,</span>
                </p>
                <p className="flex gap-2 md:gap-3">
                  <span className="text-zinc-600 select-none">9</span>
                  <span className="pl-4">amount: <span className="text-amber-400">50000</span></span>
                </p>
                <p className="flex gap-2 md:gap-3">
                  <span className="text-zinc-600 select-none">10</span>
                  <span>{'}'});</span>
                </p>
                <p className="flex gap-2 md:gap-3 mt-4 md:mt-6">
                  <span className="text-zinc-600 select-none">11</span>
                  <span className="text-white animate-pulse"><span className="text-emerald-400">✓</span> Success: <span className="text-amber-400">PAY-1730-X92</span></span>
                </p>
              </div>

              <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 opacity-20">
                 <Terminal className="w-12 h-12 md:w-16 md:h-16 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
