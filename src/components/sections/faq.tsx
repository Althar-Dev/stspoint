"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "What is an Infrastructure Bridge and how does it work?",
    a: "STSPoint acts as a technical intermediary between your system and high-level upstream distribution networks. We provide a single, unified API that simplifies complex backend orchestration for payments, digital products, and communication services, allowing you to scale without managing multiple individual provider integrations.",
  },
  {
    q: "How secure are my Merchant credentials and API keys?",
    a: "Security is our highest priority. All data in transit is protected via TLS 1.3, and sensitive credentials are encrypted at rest. Furthermore, we maintain a strict security policy: STSPoint will never ask for your recovery phrases, bank passwords, or PINs. Your Secret Key is the only authentication needed for your API requests.",
  },
  {
    q: "Do you provide real-time transaction webhooks?",
    a: "Yes. Our platform features a robust Webhook engine that delivers instant POST notifications to your server for every status update, such as successful payments or product fulfillment. You can configure global webhook URLs in your dashboard or provide dynamic callback URLs per-request via API headers.",
  },
  {
    q: "Can I integrate STSPoint with any programming language?",
    a: "Absolutely. STSPoint provides a standardized RESTful JSON API that is compatible with any language capable of making HTTP requests. We offer detailed documentation and implementation examples for Node.js, Python, PHP, and cURL to help you go live in minutes.",
  },
  {
    q: "What is your uptime guarantee (SLA)?",
    a: "We guarantee a 99.9% uptime SLA for our core API services. Our distributed infrastructure ensures that even during peak traffic periods, your business stays online with minimal latency and high reliability across all our service modules.",
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
