"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "Apa itu STSPoint API?",
    a: "STSPoint API adalah infrastruktur gerbang digital yang memungkinkan developer dan pemilik bisnis untuk mengintegrasikan layanan PPOB, SMM, dan OTP Center ke dalam aplikasi mereka sendiri secara otomatis.",
  },
  {
    q: "Apakah sistem ini mendukung webhook?",
    a: "Ya, sistem kami mendukung webhook real-time untuk setiap perubahan status transaksi, memastikan aplikasi Anda mendapatkan data yang akurat seketika.",
  },
  {
    q: "Berapa lama waktu integrasi?",
    a: "Dengan SDK dan dokumentasi API kami, rata-rata developer dapat menyelesaikan integrasi penuh dalam waktu kurang dari satu hari.",
  },
  {
    q: "Apakah ada biaya langganan API?",
    a: "Kami menyediakan paket Starter gratis untuk pengujian, dan paket Premium/Enterprise dengan kuota lebih tinggi dan dukungan prioritas.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-12 max-w-4xl mx-auto scroll-mt-24">
      <div className="text-center space-y-4 mb-16">
        <h2 className="text-3xl md:text-5xl font-headline font-bold tracking-tight">
          Pusat <span className="text-primary">pengetahuan</span>
        </h2>
        <p className="text-muted-foreground text-sm md:text-base">
          Informasi teknis mengenai penggunaan platform infrastruktur kami.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {FAQS.map((faq, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="border border-black/5 rounded-2xl px-6 bg-white shadow-sm">
            <AccordionTrigger className="hover:no-underline font-bold text-left py-6">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-sm">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
