
"use client";

import { Button } from "@/components/ui/button";
import { Zap, ShieldCheck, Phone, ArrowRight, Trophy, Sparkles, CreditCard } from "lucide-react";
import Link from "next/link";

const HERO_FEATURES = [
  { icon: Zap, label: "Instant", sub: "Proses < 60 Detik", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { icon: ShieldCheck, label: "Verified", sub: "Official Partner", color: "text-indigo-400", bg: "bg-indigo-500/10" },
  { icon: Trophy, label: "Best Price", sub: "Harga Termurah", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  { icon: Sparkles, label: "Smart AI", sub: "24/7 Support", color: "text-purple-400", bg: "bg-purple-500/10" },
  { icon: CreditCard, label: "Secure", sub: "Payment Aman", color: "text-rose-400", bg: "bg-rose-500/10" },
];

export function HeroSection() {
  return (
    <section className="bg-white w-full">
      <div className="w-full">
        <div className="relative bg-[#222222] hero-folder-shape h-[750px] lg:h-[calc(100vh-40px)] w-full flex flex-col justify-center shadow-2xl overflow-hidden text-white transition-all duration-500">
          
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-rose-500/5 opacity-30"></div>
          
          <div className="w-full px-6 md:px-12 lg:px-20 relative z-10 flex items-center py-10 md:py-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
              
              {/* Left Side: Main Content */}
              <div className="lg:col-span-6 space-y-4 md:space-y-8 text-left">
                <div className="space-y-2 md:space-y-6">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-headline font-bold leading-[1] tracking-tighter text-white mt-2 sm:-mt-8">
                    The Digital <br />
                    Infrastructure <span className="text-white/30">Platform</span>
                  </h1>
                  
                  <p className="text-gray-400 text-sm sm:text-base md:text-lg lg:text-xl max-w-xl font-medium leading-relaxed">
                    Integrated Digital Infrastructure for Modern Business. Supports APIs, payments, AI, and cloud services through a single Platform.
                  </p>
                </div>
              </div>

              {/* Right Side: Infinite Marquee Carousel with Fade Effect */}
              <div className="lg:col-span-6 relative flex flex-col gap-6 overflow-hidden mt-0 lg:mt-0 py-4">
                {/* Gradient Overlays for Fade Effect */}
                <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#222222] to-transparent z-20 pointer-events-none"></div>
                <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#222222] to-transparent z-20 pointer-events-none"></div>

                {/* Row 1: Moves Left */}
                <div className="flex animate-marquee gap-6">
                  {HERO_FEATURES.map((feature, i) => (
                    <div key={`row1-${i}`} className="w-56 sm:w-64 shrink-0 p-6 rounded-[2rem] bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4 transition-all hover:bg-white/10 group">
                      <div className={`w-12 h-12 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <feature.icon className="w-6 h-6 fill-current" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg sm:text-xl text-white tracking-tight">{feature.label}</h4>
                        <p className="text-[10px] sm:text-xs text-slate-300 mt-1 leading-relaxed font-medium">
                          {feature.sub}
                        </p>
                      </div>
                    </div>
                  ))}
                  {/* Duplicated for seamless loop */}
                  {HERO_FEATURES.map((feature, i) => (
                    <div key={`row1-dup-${i}`} className="w-56 sm:w-64 shrink-0 p-6 rounded-[2rem] bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4 transition-all hover:bg-white/10 group">
                      <div className={`w-12 h-12 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <feature.icon className="w-6 h-6 fill-current" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg sm:text-xl text-white tracking-tight">{feature.label}</h4>
                        <p className="text-[10px] sm:text-xs text-slate-300 mt-1 leading-relaxed font-medium">
                          {feature.sub}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Row 2: Moves Right (Reverse) */}
                <div className="flex animate-marquee-reverse gap-6 opacity-60">
                   {[...HERO_FEATURES].reverse().map((feature, i) => (
                    <div key={`row2-${i}`} className="w-56 sm:w-64 shrink-0 p-6 rounded-[2rem] bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4 transition-all hover:bg-white/10 group">
                      <div className={`w-12 h-12 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <feature.icon className="w-6 h-6 fill-current" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg sm:text-xl text-white tracking-tight">{feature.label}</h4>
                        <p className="text-[10px] sm:text-xs text-slate-300 mt-1 leading-relaxed font-medium">
                          {feature.sub}
                        </p>
                      </div>
                    </div>
                  ))}
                  {/* Duplicated for seamless loop */}
                   {[...HERO_FEATURES].reverse().map((feature, i) => (
                    <div key={`row2-dup-${i}`} className="w-56 sm:w-64 shrink-0 p-6 rounded-[2rem] bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4 transition-all hover:bg-white/10 group">
                      <div className={`w-12 h-12 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <feature.icon className="w-6 h-6 fill-current" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg sm:text-xl text-white tracking-tight">{feature.label}</h4>
                        <p className="text-[10px] sm:text-xs text-slate-300 mt-1 leading-relaxed font-medium">
                          {feature.sub}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
          
          {/* Action Buttons inside the "tab" area at the bottom */}
          <div className="absolute bottom-4 sm:bottom-6 left-6 md:left-12 lg:left-20 z-20 flex items-center gap-4">
            <Link href="/signup">
              <Button className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white h-10 md:h-14 px-6 md:px-10 font-bold text-[10px] md:text-sm uppercase tracking-widest shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" className="hidden lg:flex rounded-full bg-white/5 border-white/10 text-white hover:bg-white/10 h-12 md:h-14 px-8 md:px-10 font-bold text-xs md:text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95">
              <Phone className="w-4 h-4 mr-2" />
              Contact
            </Button>
          </div>

          <div className="absolute bottom-0 left-0 w-full h-16 md:h-28 pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
}
