"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Mail, Send, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/footer";

export default function ContactPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10 selection:text-primary flex flex-col">
      {/* Custom Back Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 p-6 flex items-center max-w-7xl mx-auto w-full">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="group flex items-center gap-2 hover:bg-accent transition-all rounded-xl px-4"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="font-bold text-sm">Back</span>
        </Button>
      </div>

      <main className="max-w-6xl mx-auto px-6 pt-32 pb-20 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Contact Information */}
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tighter leading-tight">
                Contact Our <span className="text-primary">Expert Team</span>.
              </h1>
              <p className="text-muted-foreground leading-relaxed text-lg">
                We're here to help answer your technical questions about API integration, business partnerships, or other technical support.
              </p>
            </div>

            <div className="space-y-8">
              {[
                { icon: Mail, label: "Support Email", value: "help@stspoint.id" },
                { icon: MessageCircle, label: "WhatsApp Support", value: "+62 889 7657 7650" },
              ].map((item, i) => (
                <div key={i} className="flex gap-6 items-center group">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.label}</p>
                    <p className="font-bold text-lg">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 rounded-xl bg-slate-50 border border-border space-y-4">
              <h4 className="font-bold">Operational Hours</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase font-bold tracking-tighter">Mon - Fri</p>
                  <p className="font-medium">09:00 - 18:00 WIB</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase font-bold tracking-tighter">Sat - Sun</p>
                  <p className="font-medium">10:00 - 15:00 WIB</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <Card className="border-border shadow-sm rounded-xl overflow-hidden bg-card">
              <CardContent className="p-8 md:p-12 space-y-8">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Send Message</h3>
                  <p className="text-sm text-muted-foreground">Our team will respond to your request within 24 hours.</p>
                </div>

                <form className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                      <Input placeholder="John Doe" className="rounded-xl h-12 bg-muted border-transparent focus:bg-background focus:border-border transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Business Email</label>
                      <Input placeholder="john@company.com" className="rounded-xl h-12 bg-muted border-transparent focus:bg-background focus:border-border transition-all" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Subject</label>
                    <Input placeholder="API Integration Inquiry" className="rounded-xl h-12 bg-muted border-transparent focus:bg-background focus:border-border transition-all" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Message</label>
                    <Textarea 
                      placeholder="How can we assist you today?" 
                      className="rounded-xl min-h-[150px] bg-muted border-transparent focus:bg-background focus:border-border transition-all resize-none" 
                    />
                  </div>

                  <Button className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-base shadow-xl shadow-primary/10 transition-all active:scale-[0.98]">
                    <Send className="w-4 h-4 mr-2" />
                    Send Now
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
