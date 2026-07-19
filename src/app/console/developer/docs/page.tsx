
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DocsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/docs");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" />
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
        Redirecting to Unified Docs...
      </p>
    </div>
  );
}
