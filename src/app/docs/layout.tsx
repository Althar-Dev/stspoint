"use client";

import { ReactNode, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  ChevronRight,
  Menu,
  ArrowLeft,
  Smartphone,
  Globe,
  Zap,
  Webhook,
  Code2,
  Rocket,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/logo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const DOCS_NAV = [
  {
    title: "Core",
    items: [
      { id: "general", title: "Get Started", icon: Rocket, href: "/docs?v=general" },
    ],
  },
  {
    title: "Payments",
    items: [
      { id: "stspay", title: "STSPay Gateway", icon: Zap, href: "/docs?v=stspay" },
    ],
  },
  {
    title: "Services",
    items: [
      { id: "ppob", title: "PPOB", icon: Smartphone, href: "/docs?v=ppob" },
      { id: "orderkuota", title: "Orderkuota", icon: Code2, href: "/docs?v=orderkuota" },
      { id: "gopay", title: "GoMerchant", icon: Globe, href: "/docs?v=gopay" },
    ],
  },
  {
    title: "Integration",
    items: [
      { id: "webhooks", title: "Webhooks", icon: Webhook, href: "/docs?v=general#webhooks" },
      { id: "errors", title: "Error Codes", icon: X, href: "/docs?v=general#errors" },
    ],
  },
];

function SidebarContent({ activeType, onItemClick }: { activeType: string, onItemClick?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/console" className="flex items-center gap-2 group">
          <Logo className="w-8 h-8 transition-transform group-hover:scale-105" />
          <span className="font-headline font-bold text-lg tracking-tighter">Docs</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="space-y-8">
          {DOCS_NAV.map((section) => (
            <div key={section.title} className="space-y-2">
              <h4 className="px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                {section.title}
              </h4>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = activeType === item.id;
                  return (
                    <Link 
                      key={item.id} 
                      href={item.href}
                      onClick={onItemClick}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                        isActive 
                          ? "bg-primary/5 text-primary" 
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <item.icon className={cn(
                        "w-4 h-4 transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground/60 group-hover:text-primary"
                      )} />
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-border">
        <Button asChild variant="ghost" className="w-full justify-start gap-2 text-xs font-bold rounded-xl">
          <Link href="/console">
            <ArrowLeft className="w-4 h-4" />
            Back to Console
          </Link>
        </Button>
      </div>
    </div>
  );
}

function DocsLayoutInner({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchParams = useSearchParams();
  const activeType = searchParams.get("v") || "general";

  return (
    <div className="flex min-h-screen bg-background selection:bg-primary/10 selection:text-primary">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 border-r border-border bg-card/50 backdrop-blur-xl z-40">
        <SidebarContent activeType={activeType} />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col">
        {/* Header - Mobile & Shared */}
        <header className="h-16 lg:h-20 flex items-center justify-between px-6 lg:px-12 sticky top-0 bg-background/80 backdrop-blur-md z-30 border-b border-border">
          <div className="flex items-center gap-4 lg:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </Button>
            <Logo className="w-8 h-8" />
          </div>
          
          <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <span>Documentation</span>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <span className="text-foreground capitalize">{activeType === 'general' ? 'Get Started' : `${activeType}`}</span>
          </div>

          <div className="flex items-center gap-3">
             <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20 font-bold text-[9px] uppercase h-6">v1.2.0 Stable</Badge>
          </div>
        </header>

        <main className="flex-1">
          <div className="max-w-4xl mx-auto px-6 lg:px-12 py-10 lg:py-16">
            {children}
          </div>
        </main>

        <footer className="px-6 lg:px-12 py-10 border-t border-border bg-muted/20">
           <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-muted-foreground">© 2024 STSPoint Infrastructure. Built for speed.</p>
              <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                <a href="#" className="hover:text-primary transition-colors">Github</a>
                <a href="#" className="hover:text-primary transition-colors">Postman</a>
                <a href="#" className="hover:text-primary transition-colors">Support</a>
              </div>
           </div>
        </footer>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
           <div className="absolute inset-0 bg-black/80" onClick={() => setIsMobileMenuOpen(false)}></div>
           <aside className="absolute inset-y-0 left-0 w-72 bg-background border-r border-border animate-in slide-in-from-left duration-300">
              <SidebarContent activeType={activeType} onItemClick={() => setIsMobileMenuOpen(false)} />
           </aside>
        </div>
      )}
    </div>
  );
}

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <DocsLayoutInner>{children}</DocsLayoutInner>
    </Suspense>
  );
}
