"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ClientKeyManagement } from "@/components/partner/clientkey";
import { AppKeyManagement } from "@/components/partner/appkey";
import { 
  ShieldCheck, 
  Info
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

function KeyManagementContent() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") || "client";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      <div className="grid grid-cols-1 gap-8">
        {view === 'client' ? (
          <ClientKeyManagement />
        ) : view === 'application' ? (
          <AppKeyManagement />
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
