"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ShieldCheck, 
  Lock, 
  Eye, 
  Database, 
  Server, 
  UserCheck, 
  Globe, 
  Scale,
  Clock,
  Mail,
  Zap
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/footer";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  const sections = [
    {
      title: "1. Overview of Data Processing",
      icon: Globe,
      content: "STSPoint (\"we,\" \"us,\" or \"our\") operates a digital infrastructure bridge. Because we function as a technical intermediary between your business and third-party upstream providers (such as Xendit, GoPay, and Orderkuota), we process data necessary to facilitate API requests, transaction reconciliation, and system security. This policy outlines how we handle data within this bridge architecture."
    },
    {
      title: "2. Information We Collect",
      icon: Database,
      content: "To provide our infrastructure services, we collect three types of information:\n\n• Account Information: Name, business email, and identity verification data provided during registration.\n• Technical Data: IP addresses, User-Agent strings, API request headers, and usage timestamps required for security monitoring and rate limiting.\n• Transaction Metadata: Details of transactions processed through our bridge (e.g., amount, status, timestamps, and destination identifiers). We do not store raw payment credentials such as credit card numbers or bank PINs."
    },
    {
      title: "3. How We Use Your Data",
      icon: Zap,
      content: "Your data is utilized strictly for the following purposes:\n\n• Service Delivery: Fulfilling PPOB, OTP, and Payment Gateway requests via upstream bridges.\n• Reconciliation: Ensuring transaction statuses are correctly synchronized between our system and yours.\n• Security: Detecting fraudulent activity, unauthorized API access, and system anomalies.\n• Communication: Sending critical system alerts, maintenance notices, and security updates related to your account."
    },
    {
      title: "4. Data Sharing & Bridge Architecture",
      icon: Server,
      content: "As a bridge service, your data is inherently shared with Third-Party Providers to execute your requests. For example:\n\n• Payment data is shared with Xendit or Midtrans for processing.\n• Phone numbers are shared with Orderkuota for OTP delivery.\n• Product SKUs are sent to DigiFlazz for fulfillment.\n\nEach upstream provider has its own privacy policy. STSPoint is not responsible for the data handling practices of these independent entities."
    },
    {
      title: "5. Security of Credentials",
      icon: Lock,
      content: "We implement industry-standard encryption (TLS 1.3) for all data in transit. Your Secret Keys are your primary authentication mechanism; we hash these where possible or encrypt them at rest. \n\nSTRICT POLICY: STSPoint employees will never ask for your passwords, Secret Keys, or 'unnatural' sensitive data such as 12/24-word recovery phrases. Any such request should be treated as fraudulent."
    },
    {
      title: "6. Data Retention",
      icon: Clock,
      content: "We retain transaction logs and account data for as long as necessary to fulfill our legal obligations, resolve disputes, and maintain system integrity. Inactive accounts may be purged after a period of prolonged dormancy, subject to our internal data lifecycle policies."
    },
    {
      title: "7. User Rights & Choices",
      icon: UserCheck,
      content: "You have the right to:\n\n• Access the personal data we hold about you via your Console.\n• Request the correction of inaccurate information.\n• Request the deletion of your account (which may result in the immediate termination of API access).\n• Revoke Secret Keys at any time through the Developer settings."
    },
    {
      title: "8. Compliance & Legal",
      icon: Scale,
      content: "We may disclose your information if required to do so by law or in response to valid requests by public authorities (e.g., a court or a government agency). However, as a bridge, we do not participate in or monitor your specific business activities unless required by upstream security protocols."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10 selection:text-primary flex flex-col">
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
        <section className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary">
            Privacy & Trust
          </div>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight text-foreground">
            Privacy <span className="text-primary/40">Policy.</span>
          </h1>
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-2 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            Last Updated: July 20, 2026
          </p>
        </section>

        <Card className="border-border bg-muted/30 shadow-none rounded-[2rem] overflow-hidden">
          <CardContent className="p-8 md:p-12 space-y-4">
            <h3 className="font-bold text-lg">Your Privacy Matters</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              At STSPoint, we are committed to being a transparent and secure bridge for your digital operations. This Privacy Policy explains how we collect, use, and protect your information when you use our infrastructure platform.
            </p>
          </CardContent>
        </Card>

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

        <div className="pt-12 border-t border-border flex flex-col items-center text-center space-y-6">
           <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center text-primary">
              <Mail className="w-6 h-6" />
           </div>
           <div className="space-y-2">
              <h4 className="font-bold text-lg">Privacy Inquiries</h4>
              <p className="text-sm text-muted-foreground max-w-md">
                If you have any questions about this Privacy Policy or how we handle your data, please contact our security team.
              </p>
           </div>
           <Button variant="outline" className="rounded-xl h-12 px-8 font-bold text-xs uppercase tracking-widest gap-2">
              help@stspoint.id
           </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}