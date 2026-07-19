
"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "How secure is the STSPoint Infrastructure?",
    a: "We utilize enterprise-grade security protocols including AES-256 data encryption at rest and TLS 1.3 for all data in transit. Our internal bridges undergo regular security audits to ensure your business data and secret keys remain protected.",
  },
  {
    q: "Do you provide real-time transaction webhooks?",
    a: "Yes. Our platform features a robust Webhook engine that delivers instant POST notifications to your server for every status update (Paid, Expired, Fulfilled). You can even use per-transaction dynamic callback URLs via our API headers.",
  },
  {
    q: "What programming languages do you support?",
    a: "STSPoint provides a RESTful JSON API that is compatible with any language capable of HTTP requests. We offer specialized SDK support and documentation examples for Node.js, Python, PHP, and cURL.",
  },
  {
    q: "Is there a sandbox environment for testing?",
    a: "Absolutely. All merchant accounts have access to a sandbox mode where you can simulate successful and failed payments without any real financial impact. This allows you to test your integration logic before going live.",
  },
  {
    q: "What is your uptime guarantee (SLA)?",
    a: "We guarantee a 99.9% uptime SLA for all our core API services. Our globally distributed infrastructure ensures that even during peak traffic, latency remains consistently low across all service modules.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-12 md:py-24 max-w-4xl mx-auto scroll-mt-24 px-4">
      <div className="text-center space-y-4 mb-12 md:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary">
          Knowledge Base
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-headline font-bold tracking-tight">
          Common <span className="text-primary/40">Inquiries.</span>
        </h2>
        <p className="text-muted-foreground text-xs md:text-base max-w-xl mx-auto leading-relaxed">
          Technical and operational answers to help you understand our infrastructure capabilities.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-3 md:space-y-4">
        {FAQS.map((faq, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="border border-black/5 rounded-2xl md:rounded-3xl px-5 md:px-10 bg-white shadow-sm hover:shadow-md transition-all">
            <AccordionTrigger className="hover:no-underline font-bold text-left py-6 md:py-8 text-sm md:text-lg">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed pb-6 md:pb-8 text-xs md:text-base">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
