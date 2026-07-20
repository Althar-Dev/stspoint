"use client";

import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarHeader, 
  SidebarFooter, 
  SidebarInset, 
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar
} from "@/components/ui/sidebar";
import { 
  Terminal, 
  Activity, 
  ShieldAlert,
  LogOut,
  Layers,
  Users,
  ChevronDown,
  LayoutGrid,
  Package,
  Settings,
  Zap,
  Lock,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { ThemeProvider } from "next-themes";
import { ReactNode, useEffect, Suspense, useState } from "react";
import { Logo } from "@/components/logo";
import { MainHeader } from "@/components/main-header";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";

const devMenuItems = [
  { title: "Root Console", icon: Terminal, url: "/dev" },
  { 
    title: "System Management", 
    icon: Layers, 
    items: [
      { title: "Infrastructure", url: "/dev/database?view=gateway", view: "gateway" },
      { title: "Clients Registry", url: "/dev/database?view=clients", view: "clients" },
      { title: "Merchants Registry", url: "/dev/database?view=merchants", view: "merchants" },
      { title: "Transactions Log", url: "/dev/database?view=transactions", view: "transactions" },
      { title: "License Keys", url: "/dev/database?view=licenses", view: "licenses" },
      { title: "Payment Channels", url: "/dev/database?view=channels", view: "channels" },
      { title: "Website Settings", url: "/dev/settings" },
    ]
  },
  { 
    title: "Service Management", 
    icon: Package, 
    items: [
      { title: "Orderkuota Bridge", url: "/dev/services/orderkuota" },
      { title: "PPOB Engine", url: "/dev/services/ppob" },
      { title: "SMM Bridge", url: "/dev/services/smm" },
      { title: "OTP Gateway", url: "/dev/services/otp" },
    ]
  },
  { title: "Live Traffic", icon: Activity, url: "/dev/traffic" },
];

function DevLayoutInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setOpen, isMobile } = useSidebar();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { 
    setMounted(true); 
  }, []);

  const isAuthPage = pathname === "/dev/auth" || pathname === "/auth";

  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile, loading: profileLoading } = useDoc(profileRef);

  // Handle Redirection logic in useEffect to obey Rules of Hooks
  useEffect(() => {
    if (isAuthPage) return; // Don't redirect if we are already on auth page

    if (!authLoading && !profileLoading && mounted) {
      if (!user) {
        router.push("/dev/auth");
      }
    }
  }, [user, profile, authLoading, profileLoading, router, mounted, isAuthPage]);

  // Early returns MUST come after ALL hook declarations
  if (isAuthPage) {
    return <div className="w-full min-h-screen bg-black">{children}</div>;
  }

  // Loading State
  if (authLoading || profileLoading || !mounted) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black">
        <div className="relative w-48 h-0.5 bg-zinc-800 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-white animate-loading-bar" style={{ width: '40%' }}></div>
        </div>
        <div className="mt-8 flex flex-col items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500 animate-pulse">Initializing Terminal</span>
        </div>
      </div>
    );
  }

  // Not a Developer state
  if (user && profile && !profile.dev) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center space-y-8">
        <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
           <Lock className="w-10 h-10" />
        </div>
        <div className="space-y-2">
           <h1 className="text-white text-2xl font-headline font-bold">Unauthorized Access</h1>
           <p className="text-zinc-500 text-sm max-w-sm mx-auto">
             Your account (UID: <code className="text-zinc-300">{user.uid.substring(0, 8)}...</code>) does not have developer privileges.
           </p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
           <Button asChild className="h-12 rounded-xl bg-white text-black font-bold uppercase tracking-widest text-[10px]">
             <Link href="/console">Go to Merchant Console</Link>
           </Button>
           <Button variant="ghost" onClick={() => router.push("/dev/auth")} className="text-zinc-500 hover:text-white hover:bg-white/5 font-bold uppercase tracking-widest text-[10px]">
             Switch Account
           </Button>
        </div>
      </div>
    );
  }

  const renderMenuItem = (group: any) => {
    if (group.url) {
      const isActive = pathname === group.url;
      return (
        <SidebarMenuItem key={group.title}>
          <SidebarMenuButton 
            asChild
            isActive={isActive}
            tooltip={group.title}
            className={`h-10 transition-all rounded-md ${
              isActive 
                ? "bg-white text-black font-bold" 
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Link href={group.url}>
              <group.icon className={`w-4.5 h-4.5 shrink-0 ${pathname === group.url ? "text-black" : "text-zinc-500"}`} />
              <span className="text-sm group-data-[collapsible=icon]:hidden">{group.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    }

    const isGroupActive = group.items?.some((item: any) => pathname === item.url.split('?')[0]);
    
    return (
      <Collapsible 
        key={group.title} 
        asChild 
        defaultOpen={isGroupActive}
        className="group/collapsible"
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton 
              tooltip={group.title}
              isActive={isGroupActive}
              className={`h-10 transition-colors group-data-[collapsible=icon]:justify-center ${
                isGroupActive ? "text-white font-bold" : "text-zinc-400"
              }`}
            >
              <group.icon className="w-4 h-4 shrink-0" />
              <span className="text-sm group-data-[collapsible=icon]:hidden">{group.title}</span>
              <ChevronDown className="ml-auto w-3 h-3 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
            <SidebarMenuSub className="border-zinc-800">
              {group.items.map((subItem: any) => {
                const currentView = searchParams.get('view') || 'gateway';
                const isActive = pathname === subItem.url.split('?')[0] && (subItem.view ? currentView === subItem.view : true);
                
                return (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton 
                      asChild 
                      isActive={isActive}
                      className={`rounded-lg transition-all duration-200 ${
                        isActive 
                          ? "bg-white/10 text-white font-bold" 
                          : "text-zinc-500 hover:text-zinc-200"
                      }`}
                    >
                      <Link href={subItem.url}>
                        <span>{subItem.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                );
              })}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  };

  return (
    <div className="flex min-h-screen w-full bg-black selection:bg-white/10 selection:text-white">
      <Sidebar 
        collapsible="icon" 
        className="border-r border-zinc-800 bg-zinc-950 z-40 transition-all duration-300 ease-in-out"
        onMouseEnter={() => !isMobile && setOpen(true)}
        onMouseLeave={() => !isMobile && setOpen(false)}
      >
        <SidebarHeader className="h-16 flex pt-4 items-center border-b border-zinc-800 px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center shrink-0">
          <Link href="/dev" className="flex items-center gap-2 group shrink-0 overflow-hidden">
            <Logo className="w-8 h-8 transition-transform group-hover:scale-105 shrink-0 invert" />
            <span className="font-headline font-bold text-lg tracking-tighter text-white truncate group-data-[collapsible=icon]:hidden">
              Dev<span className="text-zinc-500">Root</span>
            </span>
          </Link>
        </SidebarHeader>
        
        <SidebarContent className="px-2 py-4 group-data-[collapsible=icon]:px-0">
          <SidebarGroup>
            <SidebarMenu className="group-data-[collapsible=icon]:items-center">
              {devMenuItems.map((item) => renderMenuItem(item))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="px-2 py-4 border-t border-zinc-800 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
          <SidebarMenu className="group-data-[collapsible=icon]:items-center">
            <SidebarMenuItem className="w-full">
              <SidebarMenuButton 
                asChild
                tooltip="Exit to Console"
                className="h-10 text-red-500 hover:bg-red-50/10 group-data-[collapsible=icon]:justify-center"
              >
                <Link href="/console">
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span className="text-sm group-data-[collapsible=icon]:hidden">Exit Root</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col flex-1 bg-transparent min-w-0">
        <MainHeader searchPlaceholder="Search Root Console..." showSidebarTrigger={false} />
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden dark">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}

export default function DevLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <SidebarProvider defaultOpen={false}>
        <Suspense fallback={null}>
          <DevLayoutInner>{children}</DevLayoutInner>
        </Suspense>
      </SidebarProvider>
    </ThemeProvider>
  );
}
