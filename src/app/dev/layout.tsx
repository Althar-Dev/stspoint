
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
  LogOut,
  Layers,
  ChevronDown,
  Layout,
  Package,
  Handshake,
  Key,
  Lock
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { ThemeProvider } from "next-themes";
import { ReactNode, useEffect, Suspense, useState, useMemo } from "react";
import { Logo } from "@/components/logo";
import { MainHeader } from "@/components/main-header";
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from "@/firebase";
import { doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { toast } from "@/hooks/use-toast";

const devMenuItems = [
  { title: "Root Console", icon: Terminal, url: "/dev" },
  {
    title: "Key Management",
    icon: Key,
    items: [
      { title: "Client Keys", url: "/dev/key?view=client", view: "client" },
      { title: "Application Keys", url: "/dev/key?view=application", view: "application" },
    ]
  },
  { 
    title: "System Management", 
    icon: Layers, 
    items: [
      { title: "Infrastructure", url: "/dev/database?view=gateway", view: "gateway" },
      { title: "Clients Registry", url: "/dev/database?view=clients", view: "clients" },
      { title: "Merchants Registry", url: "/dev/database?view=merchants", view: "merchants" },
      { title: "Transactions Log", url: "/dev/database?view=transactions", view: "transactions" },
      { title: "Payment Channels", url: "/dev/database?view=channels", view: "channels" },
      { title: "Website Settings", url: "/dev/settings" },
    ]
  },
  {
    title: "Requester",
    icon: Handshake,
    items: [
      { title: "Rekening Bank", url: "/dev/database?view=bank-accounts", view: "bank-accounts" },
      { title: "Withdrawals", url: "/dev/database?view=withdrawals", view: "withdrawals" },
    ]
  },
  { 
    title: "Service Management", 
    icon: Package, 
    items: [
      { title: "Orderkuota Bridge", url: "/dev/services/orderkuota" },
      { title: "PPOB Engine", url: "/dev/services/ppob" },
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
  const auth = useAuth();
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

  useEffect(() => {
    if (isAuthPage) return;

    if (!authLoading && !profileLoading && mounted) {
      if (!user) {
        router.push("/dev/auth");
      }
    }
  }, [user, profile, authLoading, profileLoading, router, mounted, isAuthPage]);

  const handleGlobalLogout = async () => {
    if (!auth) return;
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
      await signOut(auth);
      toast({ title: "Root Session Terminated" });
      router.push("/dev/auth");
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to sign out." });
    }
  };

  const isUrlActive = (itemUrl: string) => {
    const cleanItemUrl = itemUrl.split('?')[0];
    return pathname === cleanItemUrl || pathname === cleanItemUrl.replace('/dev', '');
  };

  const renderMenuItem = (group: any) => {
    if (group.url) {
      const isActive = isUrlActive(group.url);
      return (
        <SidebarMenuItem key={group.title}>
          <SidebarMenuButton 
            asChild
            isActive={isActive}
            tooltip={group.title}
            className={`h-10 transition-all rounded-md ${
              isActive 
                ? "bg-accent text-accent-foreground font-bold" 
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <Link href={group.url}>
              <group.icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? "text-accent-foreground" : "text-muted-foreground"}`} />
              <span className="text-sm group-data-[collapsible=icon]:hidden">{group.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    }

    const isGroupActive = group.items?.some((item: any) => isUrlActive(item.url));
    
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
                isGroupActive ? "text-foreground font-bold" : "text-muted-foreground"
              }`}
            >
              <group.icon className="w-4 h-4 shrink-0" />
              <span className="text-sm group-data-[collapsible=icon]:hidden">{group.title}</span>
              <ChevronDown className="ml-auto w-3 h-3 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
            <SidebarMenuSub className="border-border">
              {group.items.map((subItem: any) => {
                const currentView = searchParams.get('view') || 'gateway';
                const isActive = isUrlActive(subItem.url) && (subItem.view ? currentView === subItem.view : true);
                
                return (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton 
                      asChild 
                      isActive={isActive}
                      className={`rounded-lg transition-all duration-200 ${
                        isActive 
                          ? "bg-accent/50 text-foreground font-bold" 
                          : "text-muted-foreground hover:text-foreground"
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

  if (isAuthPage) {
    return <div className="w-full min-h-screen bg-background">{children}</div>;
  }

  if (authLoading || profileLoading || !mounted) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
        <div className="relative w-48 h-0.5 bg-muted rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-primary animate-loading-bar" style={{ width: '40%' }}></div>
        </div>
        <div className="mt-8 flex flex-col items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground animate-pulse">Initializing Terminal</span>
        </div>
      </div>
    );
  }

  if (user && profile && !profile.dev) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-8">
        <div className="w-20 h-20 rounded-3xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
           <Lock className="w-10 h-10" />
        </div>
        <div className="space-y-2">
           <h1 className="text-foreground text-2xl font-headline font-bold">Unauthorized Access</h1>
           <p className="text-muted-foreground text-sm max-w-sm mx-auto">
             Your account (UID: <code className="text-foreground">{user.uid.substring(0, 8)}...</code>) does not have developer privileges.
           </p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
           <Button asChild className="h-12 rounded-xl bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[10px]">
             <Link href="/console">Go to Merchant Console</Link>
           </Button>
           <Button variant="ghost" onClick={handleGlobalLogout} className="text-muted-foreground hover:text-foreground hover:bg-accent font-bold uppercase tracking-widest text-[10px]">
             Switch Account
           </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background selection:bg-primary/10 selection:text-primary overflow-hidden">
      <Sidebar 
        collapsible="icon" 
        className="border-r border-border bg-card z-40 transition-all duration-300 ease-in-out"
        onMouseEnter={() => !isMobile && setOpen(true)}
        onMouseLeave={() => !isMobile && setOpen(false)}
      >
        <SidebarHeader className="h-16 flex pt-4 items-center border-b border-border px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center shrink-0">
          <Link href="/dev" className="flex items-center gap-2 group shrink-0 overflow-hidden">
            <Logo className="w-8 h-8 transition-transform group-hover:scale-105 shrink-0" />
            <span className="font-headline font-bold text-lg tracking-tighter text-foreground truncate group-data-[collapsible=icon]:hidden">
              Dev<span className="text-primary/40">Root</span>
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

        <SidebarFooter className="px-2 py-4 border-t border-border group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
          <SidebarMenu className="group-data-[collapsible=icon]:items-center">
            <SidebarMenuItem className="w-full">
              <SidebarMenuButton 
                onClick={handleGlobalLogout}
                tooltip="Sign Out from Platform"
                className="h-10 text-destructive hover:bg-destructive/10 group-data-[collapsible=icon]:justify-center"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span className="text-sm group-data-[collapsible=icon]:hidden">Logout Terminal</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col flex-1 bg-transparent min-w-0 overflow-hidden">
        <MainHeader showSidebarTrigger={false} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
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
