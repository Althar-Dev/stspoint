
'use client';

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="light bg-background text-foreground min-h-screen selection:bg-primary/10 selection:text-primary">
      <Navbar />
      <main className="p-5 pt-4">
        {children}
      </main>
      <Footer />
    </div>
  );
}
