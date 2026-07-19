"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, FileText, ShieldCheck, Scale, AlertCircle, Clock } from "lucide-react";
import { Footer } from "@/components/footer";

export default function TermsOfServicePage() {
  const router = useRouter();

  const sections = [
    {
      title: "1. Acceptance of Terms",
      icon: CheckCircle,
      content: "By accessing and using the STSPoint Infrastructure Platform (the \"Service\"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you must immediately cease all use of our infrastructure, APIs, and dashboard services."
    },
    {
      title: "2. Description of Service",
      icon: Zap,
      content: "STSPoint provides a suite of digital infrastructure tools, including but not limited to: Payment Gateways (STSPay), PPOB Distribution APIs, OTP Verification Bridges, and AI-powered automation. We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time."
    },
    {
      title: "3. Account Responsibilities",
      icon: ShieldCheck,
      content: "You are responsible for maintaining the confidentiality of your account credentials, including Secret Keys and API tokens. Any action performed through your account is deemed your responsibility. You must notify STSPoint immediately of any unauthorized access."
    },
    {
      title: "4. API Usage & Restrictions",
      icon: Code2,
      content: "Users are granted a limited, non-exclusive right to access our APIs. You agree not to: (a) Reverse engineer any part of the infrastructure; (b) Use the service for fraudulent activities; (c) Circumvent rate limits; (d) Resell the API access without explicit written permission."
    },
    {
      title: "5. Payments & Financial Transactions",
      icon: Wallet,
      content: "All transactions processed through our gateway are final. STSPoint acts as an infrastructure layer and is not responsible for disputes between you and your end-customers. Fees for subscriptions or processing are non-refundable unless specified otherwise."
    },
    {
      title: "6. Limitation of Liability",
      icon: Scale,
      content: "In no event shall STSPoint be liable for any indirect, incidental, or consequential damages resulting from service downtime, data loss, or technical upstream provider failures. Our total liability is limited to the amount paid for the service in the last 30 days."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10 selection:text-primary flex flex-col">
      {/* Navigation */}
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

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20 flex-1 space-y-16 w-full">
        {/* Header */}
        <section className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary">
            Legal Documentation
          </div>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight">Terms of <span className="text-primary">Service.</span></h1>
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            Last Updated: January 2026
          </p>
        </section>

        {/* Content Sections */}
        <div className="space-y-12">
          {sections.map((section, i) => (
            <div key={i} className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0">
                   <FileText className="w-4 h-4" />
                </div>
                {section.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base pl-11">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Support Note */}
        <div className="p-8 rounded-2xl bg-slate-50 border border-border flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-white border border-border mt-1">
                 <AlertCircle className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-1">
                 <h4 className="font-bold">Need legal clarification?</h4>
                 <p className="text-xs text-muted-foreground leading-relaxed">
                   If you have questions regarding these terms, please contact our legal department at <span className="font-bold text-foreground">legal@stspoint.com</span>.
                 </p>
              </div>
           </div>
           <Button asChild className="rounded-xl font-bold h-11 px-8 uppercase text-[10px] tracking-widest">
              <a href="/support">Contact Support</a>
           </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Helper icons specifically for this page layout
function CheckCircle(props: any) {
  return <ShieldCheck {...props} />
}

function Zap(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 14.71V2h10l-1 7.29L20 9.29V22h-10l1-7.29L4 14.71z" />
    </svg>
  )
}

function Code2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m18 16 4-4-4-4" />
      <path d="m6 8-4 4 4 4" />
      <path d="m14.5 4-5 16" />
    </svg>
  )
}

function Wallet(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </svg>
  )
}
