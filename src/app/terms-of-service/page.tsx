"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  Clock,
  Zap,
  Wallet,
  Unplug,
  Gavel,
  ShieldAlert,
  Ban,
  Lock,
  EyeOff
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
      title: "3. Disclaimer of Responsibility for Illegal Activities",
      icon: Gavel,
      content: "STSPoint does not interfere with and is NOT responsible under any circumstances if a user utilizes our services for illegal activities. You are solely responsible for all legal consequences of using this service. We are strictly released from liability if: \n\n • Your account is blocked or closed by Upstream Providers (e.g., GoPay, Orkut) due to violations. \n • You face legal action, police investigations, or court proceedings resulting from your business activity. \n • You face administrative or criminal sanctions. \n • There are financial losses due to account freezes or legal actions. \n • There are claims from third parties related to your business activities. \n\n STSPoint provides technology tools ONLY and does NOT participate in your business operations."
    },
    {
      title: "4. Strict Security Policy (No Unnatural Data Requests)",
      icon: Lock,
      content: "STSPoint prioritizes your security. While we provide API Secret Keys for your integration, WE WILL NEVER ASK for 'unnatural' sensitive data such as: \n\n • Your 12 or 24-word recovery phrases (seed phrases). \n • Mnemonic keys or external private keys. \n • Your personal bank passwords or PINs. \n\n We will never request these via email, WhatsApp, or any support channel. You are solely responsible for maintaining the confidentiality of your STS API credentials. Any loss arising from the voluntary disclosure of sensitive data to third parties is your sole responsibility."
    },
    {
      title: "5. Primary Limitation of Liability",
      icon: ShieldAlert,
      content: "Under no circumstances shall STSPoint (including owners, developers, and staff) be held liable for: \n\n • Upstream Account Status: Any bans, suspensions, or closures of your merchant accounts by third-party providers. \n • Transaction Disputes: Any claims or disputes between you and your customers regarding payments or product fulfillment. \n • Service Downtime: Temporary unavailability of third-party APIs or system maintenance. \n • Data Integrity: Loss of transaction logs or technical errors caused by external system failures. \n • Financial Impact: Any direct or indirect financial losses arising from the use or inability to use our services. \n • Legal Consequences: Any form of legal action or sanctions you face regarding your business operations."
    },
    {
      title: "6. Payments, Subscriptions & Finality",
      icon: Wallet,
      content: "All subscription fees and transaction fees paid to STSPoint are final and non-refundable. Since we provide infrastructure access, costs are incurred at the moment of provisioning. Users are responsible for ensuring their integration logic is correct before processing live transactions."
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
            Legal & Security Framework
          </div>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight text-foreground">
            Terms of <span className="text-primary/40">Service.</span>
          </h1>
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-2 font-medium">
            <Clock className="w-3.5 h-3.5" />
            Last Updated: July 20, 2026
          </p>
        </section>

        {/* Security Alert Banner */}
        <div className="p-6 rounded-[1.5rem] bg-amber-50 border border-amber-200 flex items-start gap-4 shadow-sm animate-in fade-in duration-700">
           <EyeOff className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
           <div className="space-y-1">
              <h4 className="font-bold text-amber-900 text-sm">Security Alert: Data Privacy</h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                STSPoint will **never** ask you for your recovery phrases (seed phrases) or bank passwords. If anyone claiming to be from STSPoint asks for these details, they are attempting to defraud you. Report such incidents immediately.
              </p>
           </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-16">
          {sections.map((section, i) => (
            <div key={i} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10 shadow-sm">
                   <section.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl md:text-2xl font-headline font-bold text-foreground">
                  {section.title}
                </h3>
              </div>
              <div className="text-muted-foreground leading-relaxed text-sm md:text-base pl-0 md:pl-16 whitespace-pre-line border-l-0 md:border-l border-border md:ml-6">
                {section.content}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
