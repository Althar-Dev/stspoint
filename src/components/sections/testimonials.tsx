
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Hendra Wijaya",
    role: "CTO, DigitalPulse",
    comment: "Switching to STSPoint infrastructure was a game changer. Their API latency is incredibly low, making our entire fulfillment cycle significantly more responsive.",
    avatar: "https://picsum.photos/seed/tech1/100/100",
  },
  {
    name: "Sarah Annisa",
    role: "Lead Architect, NexusPay",
    comment: "The documentation is world-class. We were able to integrate the PPOB and GoPay bridge modules into our existing application in less than 24 hours.",
    avatar: "https://picsum.photos/seed/tech2/100/100",
  },
  {
    name: "Rian Pratama",
    role: "DevOps Engineer, CloudStore",
    comment: "The SLA uptime is real. Even during massive traffic spikes on 10.10 sales, the gateway remained rock solid without a single dropped webhook.",
    avatar: "https://picsum.photos/seed/tech3/100/100",
  },
];

export function TestimonialsSection() {
  return (
    <section id="about" className="py-12 scroll-mt-24">
      <div className="text-center space-y-4 mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary">
          Partner Success
        </div>
        <h2 className="text-3xl md:text-5xl font-headline font-bold tracking-tight">
          Trusted by <span className="text-primary/40">Innovators.</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          Join the growing list of enterprises that rely on STSPoint for their digital core.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {TESTIMONIALS.map((t, i) => (
          <Card key={i} className="border border-black/5 shadow-sm rounded-[2.5rem] bg-white overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
            <CardContent className="p-10 space-y-8 relative">
              <Quote className="absolute top-8 right-8 w-10 h-10 text-primary/5" />
              
              <div className="flex gap-1 text-primary">
                {[...Array(5)].map((_, idx) => (
                  <Star key={idx} className="w-4 h-4 fill-current" />
                ))}
              </div>
              
              <p className="text-sm md:text-base font-medium leading-relaxed text-slate-700 italic">
                "{t.comment}"
              </p>
              
              <div className="flex items-center gap-4 pt-4">
                <Avatar className="w-14 h-14 border-2 border-primary/5 shadow-sm rounded-2xl">
                  <AvatarImage src={t.avatar} alt={t.name} />
                  <AvatarFallback className="bg-primary/5 font-bold">{t.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold text-sm md:text-base">{t.name}</h4>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{t.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
