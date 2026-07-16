"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  BookOpen,
  Cpu,
  Terminal,
  ShieldCheck,
  Zap,
  ArrowLeft,
  Code2
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

const docsSections = [
  {
    title: "Introduction",
    items: [
      { title: "Getting Started", icon: BookOpen, url: "#intro" },
      { title: "Capabilities", icon: Zap, url: "#capabilities" },
    ],
  },
  {
    title: "AI Models",
    items: [
      { title: "Model Library", icon: Cpu, url: "#models" },
    ],
  },
  {
    title: "API Reference",
    items: [
      { title: "Chat API REST", icon: Code2, url: "#chat-api" },
      { title: "Structured Output", icon: Terminal, url: "#json-mode" },
    ],
  },
];

export function SidebarDocs() {
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    setActiveHash(window.location.hash || "#intro");

    const sectionIds = docsSections.flatMap(s => s.items.map(i => i.url.replace('#', '')));
    
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveHash(`#${entry.target.id}`);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sectionIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    const handleHashChange = () => setActiveHash(window.location.hash);
    window.addEventListener("hashchange", handleHashChange);
    
    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id.replace('#', ''));
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, "", id);
      setActiveHash(id);
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-background">
      <SidebarHeader className="h-16 flex pt-4 items-center justify-center border-b border-border group-data-[state=expanded]:justify-start group-data-[state=expanded]:px-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center shrink-0">
        <Link href="/ai" className="flex items-center gap-2 group shrink-0">
          <img 
            src="/assets/img/ai-icon.png" 
            alt="STS AI" 
            className="w-7 h-7 shrink-0 object-contain transition-transform group-hover:scale-105"
          />
          <span className="font-headline font-bold text-lg tracking-tighter text-foreground group-data-[collapsible=icon]:hidden">
            Documentation
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-0">
        {docsSections.map((section) => (
          <SidebarGroup key={section.title} className="py-2">
            <SidebarGroupLabel className="px-6 text-[9px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={`h-8 px-6 hover:bg-muted/50 transition-all rounded-none border-l-2 ${
                        activeHash === item.url 
                        ? "border-amber-500 text-amber-500" 
                        : "border-transparent"
                      }`}
                    >
                      <button 
                        onClick={() => handleScrollTo(item.url)}
                        className="flex items-center gap-3 w-full"
                      >
                        <item.icon className={`w-3.5 h-3.5 shrink-0 ${activeHash === item.url ? "text-amber-500" : "text-muted-foreground/60"}`} />
                        <span className={`text-[11px] font-medium group-data-[collapsible=icon]:hidden ${activeHash === item.url ? "text-amber-500 font-bold" : "text-muted-foreground"}`}>
                          {item.title}
                        </span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        <SidebarMenuButton asChild className="h-9 text-muted-foreground hover:text-amber-500 font-bold hover:bg-amber-50/50 rounded-xl transition-all">
          <Link href="/ai" className="flex items-center gap-3">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="text-[11px] group-data-[collapsible=icon]:hidden">Back to Tool</span>
          </Link>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
