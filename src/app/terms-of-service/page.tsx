"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ShieldCheck, 
  Scale, 
  AlertCircle, 
  Clock,
  Zap,
  Code2,
  Wallet,
  Unplug,
  Gavel,
  ShieldAlert,
  Ban
} from "lucide-react";
import { Footer } from "@/components/footer";

export default function TermsOfServicePage() {
  const router = useRouter();

  const sections = [
    {
      title: "1. Scope of Infrastructure Services",
      icon: Zap,
      content: "STSPoint provides a unified digital infrastructure platform. Our services include technical bridges for: (a) Payment Processing (STSPay); (b) Digital Goods Distribution (PPOB & Game); (c) Virtual Number Provisioning (OTP Center); and (d) Social Media Engine Bridges (SMM Panel). All services are provided 'AS IS' and 'AS AVAILABLE'."
    },
    {
      title: "2. The 'API Bridge' Nature",
      icon: Unplug,
      content: "You explicitly acknowledge that STSPoint acts solely as a technical intermediary (Bridge) between your system and Third-Party Upstream Providers (e.g., GoPay Merchant, Orderkuota, DigiFlazz). We do not hold, manage, or take custody of your funds or products. Any successful transaction is entirely dependent on the stability and policies of the respective Upstream Provider."
    },
    {
      title: "3. Illegal Activity & Legal Disclaimer",
      icon: Gavel,
      content: "STSPoint does not interfere with and is NOT responsible under any circumstances if a user utilizes our services for illegal activities. You are solely responsible for: (a) Compliance with local laws; (b) Any police investigations or court proceedings resulting from your business activity; (c) Any administrative or criminal sanctions; (d) Financial losses due to account freezes or legal actions. STSPoint provides technology tools ONLY and does not participate in your business operations."
    },
    {
      title: "4. User Obligations & Account Security",
      icon: Code2,
      content: "Users must: (a) Maintain absolute confidentiality of API Keys and Secrets; (b) Use the service only for lawful purposes; (c) Not attempt to reverse engineer or 'stress test' the infrastructure. You agree to indemnify and hold harmless STSPoint and its staff from any third-party claims arising from your use of the platform."
    },
    {
      title: "5. Comprehensive Limitation of Liability",
      icon: ShieldAlert,
      content: "STSPoint (including owners, developers, and staff) is strictly released from all liability regarding: \n\n • Upstream Account Status: Any bans, suspensions, or closures of your merchant accounts (e.g., GoPay, Orderkuota) by the providers. \n • Transaction Disputes: Any claims or disputes between you and your customers regarding payments or product fulfillment. \n • Upstream Downtime: Unavailability of third-party APIs or maintenance periods. \n • Data Integrity: Loss of transaction logs or technical errors caused by external system failures. \n • Financial Impact: Any direct or indirect financial losses arising from service interruptions."
    },
    {
      title: "6. Payments, Subscriptions & Finality",
      icon: Wallet,
      content: "All subscription fees and transaction fees paid to STSPoint are final and non-refundable. Since we provide infrastructure access, costs are incurred at the moment of provisioning. Users are responsible for ensuring their integration logic is correct before processing live high-value transactions."
    },
    {
      title: "7. Termination of Access",
      icon: Ban,
      content: "We reserve the right to terminate or suspend access to our infrastructure immediately, without prior notice or liability, for any reason, including but not limited to a breach of these Terms or suspected fraudulent activity that could jeopardize the integrity of our bridge network."
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
            Legal Framework
          </div>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight text-foreground">
            Terms of <span className="text-primary/40">Service.</span>
          </h1>
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            Last Updated: October 2024
          </p>
        </section>

        {/* Content Sections */}
        <div className="space-y-12">
          {sections.map((section, i) => (
            <div key={i} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
              <h3 className="text-xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10">
                   <section.icon className="w-5 h-5" />
                </div>
                {section.title}
              </h3>
              <div className="text-muted-foreground leading-relaxed text-sm md:text-base pl-0 md:pl-13 whitespace-pre-line">
                {section.content}
              </div>
            </div>
          ))}
        </div>

        {/* Support Note */}
        <div className="p-8 rounded-[2rem] bg-slate-50 border border-border flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
           <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-white border border-border mt-1">
                 <Scale className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-1">
                 <h4 className="font-bold">Legal Clarification</h4>
                 <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                   By using STSPoint, you agree that you are fully responsible for all legal and financial outcomes of your business. For compliance inquiries, contact <span className="font-bold text-foreground">legal@stspoint.id</span>.
                 </p>
              </div>
           </div>
           <Button asChild className="rounded-xl font-bold h-11 px-8 uppercase text-[10px] tracking-widest shadow-md">
              <a href="/support">Consult Support</a>
           </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
