"use client";

import { LandingLayout } from "@/components/layouts/landing-layout";
import { HeroSection } from "@/components/sections/hero";
import { ServicesSection } from "@/components/sections/services";
import { HowItWorksSection } from "@/components/sections/how-it-works";
import { TestimonialsSection } from "@/components/sections/testimonials";
import { FAQSection } from "@/components/sections/faq";
import { CTASection } from "@/components/sections/cta";
import { Zap, ShieldCheck, Cpu, Globe } from "lucide-react";
import Script from "next/script";

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "STSPoint",
    "operatingSystem": "Web",
    "applicationCategory": "BusinessApplication",
    "author": {
      "@type": "Person",
      "name": "Alhadi Adriano",
      "alternateName": "AltharDev",
      "url": "https://github.com/althardev"
    },
    "publisher": {
      "@type": "Organization",
      "name": "StarVale Technology Solution",
      "logo": "https://stspoint.id/assets/img/icon.png"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "IDR"
    },
    "description": "Integrated digital infrastructure platform for modern business by StarVale Technology Solution. Expertly engineered by Alhadi Adriano (AltharDev) to support API payments, AI, and digital goods distribution.",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "1240"
    }
  };

  const personData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Alhadi Adriano",
    "alternateName": "AltharDev",
    "jobTitle": "Lead Engineer & Founder",
    "worksFor": {
      "@type": "Organization",
      "name": "StarVale Technology Solution"
    },
    "url": "https://github.com/althardev",
    "sameAs": [
      "https://www.linkedin.com/in/starvaleid",
      "https://instagram.com/althardev"
    ]
  };

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "StarVale Technology Solution",
    "alternateName": "STSPoint",
    "url": "https://stspoint.id",
    "logo": "https://stspoint.id/assets/img/icon.png",
    "founder": {
      "@type": "Person",
      "name": "Alhadi Adriano"
    },
    "sameAs": [
      "https://instagram.com/starvale.id",
      "https://x.com/StarValeID",
      "https://www.linkedin.com/in/starvaleid"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+62 889 7657 7650",
      "contactType": "customer service",
      "areaServed": "ID",
      "availableLanguage": ["Indonesian", "English"]
    }
  };

  return (
    <LandingLayout>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Script
        id="person-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personData) }}
      />
      <Script
        id="org-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      
      <div className="space-y-24 pb-20">
        <HeroSection />

        {/* Global Performance Metrics */}
        <section className="bg-white py-16 border-y border-black/5">
          <div className="w-full max-w-screen-2xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-20">
              {[
                { icon: Zap, label: "64ms", sub: "Avg. API Latency" },
                { icon: ShieldCheck, label: "Certified", sub: "Enterprise Grade" },
                { icon: Cpu, label: "99.99%", sub: "Service Uptime" },
                { icon: Globe, label: "Anycast", sub: "Global Edge Nodes" },
              ].map((stat, i) => (
                <div key={i} className="text-center space-y-4 group">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-2 text-gray-900 shadow-sm border border-gray-100 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    <stat.icon className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-headline font-bold text-2xl md:text-3xl tracking-tighter">{stat.label}</h4>
                    <p className="text-[10px] md:text-[11px] text-muted-foreground uppercase tracking-[0.2em] font-bold">{stat.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-screen-2xl mx-auto px-6 space-y-32">
          <ServicesSection />
          <HowItWorksSection />
          <TestimonialsSection />
          <FAQSection />
          <CTASection />
        </div>
      </div>
    </LandingLayout>
  );
}
