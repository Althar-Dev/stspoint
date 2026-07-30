"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Logo } from "@/components/logo";

export function QrisStringLayoutClient({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-foreground selection:bg-primary/10 selection:text-primary">
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-border z-50 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="rounded-xl h-9 gap-1 font-bold text-xs"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="h-4 w-px bg-border"></div>
          <div className="flex items-center gap-2">
            <Logo className="w-6 h-6" />
            <span className="font-headline font-bold text-sm tracking-tight">QRIS Decoder</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">STSPoint Tools v1.0</span>
        </div>
      </header>
      <main className="pt-24 pb-20">
        {children}
      </main>
    </div>
  );
}
