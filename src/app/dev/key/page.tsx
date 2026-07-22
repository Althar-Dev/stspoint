"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ClientKeyManagement } from "@/components/partner/clientkey";
import { 
  Key, 
  ChevronRight, 
  ShieldCheck, 
  Info 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

function KeyManagementContent() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") || "client";

  const getHeaderInfo = () => {
    switch(view) {
      case 'client':
        return {
          title: "Partner Licenses",
          description: "Manage one-time registration keys for business partners.",
          icon: Key,
          color: "text-primary"
        };
      default:
        return {
          title: "Key Management",
          description: "Select a key type to manage from the sidebar.",
          icon: ShieldCheck,
          color: "text-muted-foreground"
        };
    }
  };

  const header = getHeaderInfo();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
            console 
            <ChevronRight className="w-3 h-3 text-muted-foreground/30" />
            security
            <ChevronRight className="w-3 h-3 text-muted-foreground/30" />
            <span className="text-foreground">key management</span>
          </h1>
          <h2 className="text-2xl font-headline font-bold tracking-tight flex items-center gap-3">
             <header.icon className={`w-6 h-6 ${header.color}`} />
             {header.title}
          </h2>
          <p className="text-muted-foreground text-sm">{header.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {view === 'client' ? (
          <ClientKeyManagement />
        ) : (
          <Card className="border border-dashed border-border bg-muted/20">
             <CardContent className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                   <Info className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Select a category from the navigation to begin.</p>
             </CardContent>
          </Card>
        )}
      </div>

      <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-4">
         <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
         <div className="space-y-1">
            <h4 className="text-sm font-bold uppercase tracking-tight">Security Protocol</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
               License keys are sensitive assets. Generating a new key will create a unique, one-time entry in the STS Global Registry. revoking or deleting keys might disrupt active registration flows.
            </p>
         </div>
      </div>
    </div>
  );
}

export default function KeyManagementPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-muted-foreground italic">Accessing Key Vault...</div>}>
      <KeyManagementContent />
    </Suspense>
  );
}
