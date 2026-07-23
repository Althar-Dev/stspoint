
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
  useSidebar
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  CreditCard, 
  Settings,
  LogOut,
  ArrowLeftRight,
  Package
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { ReactNode, useEffect, useState, useMemo } from "react";
import { Logo } from "@/components/logo";
import { MainHeader } from "@/components/main-header";
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from "@/firebase";
import { doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { toast } from "@/hooks/use-toast";

const adminMenuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/client",
  },
  {
    title: "Order History",
    icon: ShoppingCart,
    url: "/client/orders",
  },
  {
    title: "Products",
    icon: Package,
    url: "/client/products",
  },
  {
    title: "Finance",
    icon: CreditCard,
    url: "/client/finance",
  },
  {
    title: "Website Settings",
    icon: Settings,
    url: "/client/settings",
  }
];

function ClientLayoutInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const [appSelected, setAppSelected] = useState<string | null>(null);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile, loading: profileLoading } = useDoc(profileRef);

  // Check if we are on the "Select Application" screen or global pages like subscribe
  const isSelectAppPage = useMemo(() => {
    const cleanPath = pathname.replace(/^\/client/, "");
    const hostname = typeof window !== "undefined" ? window.location.hostname : "";
    const isPartnerSubdomain = hostname.startsWith("partner.");
    
    // If it's a global client page like subscribe, it's not a "Select App" page but it shouldn't show app sidebar
    if (pathname.includes('/subscribe')) return false;

    if (isPartnerSubdomain) {
      return pathname === "/" || pathname === "";
    }
    return cleanPath === "" || cleanPath === "/";
  }, [pathname]);

  const isGlobalPage = pathname.includes('/subscribe');

  useEffect(() => {
    if (!authLoading && !profileLoading) {
      if (!user) {
        router.push("/signin");
        return;
      } else if (profile && !profile.partner && !profile.dev) {
        router.push("/console");
        return;
      }

      // Extract ID from path to keep selection in sync
      const segments = pathname.split('/').filter(Boolean);
      const isInternalRoot = pathname.startsWith('/client');
      const idFromPath = isInternalRoot ? segments[1] : segments[0];

      // Added 'subscribe' to exclusion list so it's not treated as an App ID
      if (idFromPath && !['orders', 'finance', 'settings', 'products', 'subscribe'].includes(idFromPath)) {
        localStorage.setItem("sts_selected_app_id", idFromPath);
        setAppSelected(idFromPath);
      } else {
        const storedId = localStorage.getItem("sts_selected_app_id");
        setAppSelected(storedId);

        if (!storedId && !isSelectAppPage && !isGlobalPage) {
          router.push("/client");
        }
      }
    }
  }, [user, profile, authLoading, profileLoading, router, pathname, isSelectAppPage, isGlobalPage]);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      localStorage.removeItem("sts_selected_app_id");
      await fetch("/api/auth/session", { method: "DELETE" });
      await signOut(auth);
      toast({ title: "Logged out", description: "You have been signed out successfully." });
      
      setTimeout(() => {
        window.location.href = "/signin";
      }, 500);
    } catch (e) {
      toast({ variant: "destructive", title: "Logout Error", description: "Failed to clear session." });
    }
  };

  const dynamicMenu = useMemo(() => {
    const selectedId = appSelected || "";
    const isSubdomain = typeof window !== "undefined" && window.location.hostname.includes("partner.");
    
    return adminMenuItems.map(item => {
      let finalUrl = item.url === "/client" 
        ? `/client/${selectedId}` 
        : item.url.replace('/client/', `/client/${selectedId}/`);

      finalUrl = finalUrl.replace(/\/+/g, '/');

      if (isSubdomain) {
        finalUrl = finalUrl.replace('/client', '');
        if (finalUrl === '') finalUrl = '/';
      }

      return { ...item, url: finalUrl };
    });
  }, [appSelected]);

  const isAuthorized = !!profile?.partner || profile?.dev === true;

  if (authLoading || profileLoading || !user || !isAuthorized) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[100] h-0.5 bg-muted overflow-hidden">
        <div className="animate-loading-bar" style={{ width: '40%' }}></div>
      </div>
    );
  }

  // Global pages (like subscribe) in partner portal use the inset layout but without the app sidebar
  if (isGlobalPage) {
    return (
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <SidebarInset className="flex flex-col flex-1 bg-background min-w-0 overflow-hidden">
          <MainHeader 
            showNotifications={false}
            showProfile={false}
            showSubscription={true}
          />
          <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-4 md:p-10">
            {children}
          </main>
        </SidebarInset>
      </div>
    );
  }

  if (isSelectAppPage || !appSelected) {
    return <div className="w-full min-w-0">{children}</div>;
  }

  return (
    <div className="flex h-screen w-full bg-background selection:bg-primary/10 selection:text-primary overflow-hidden">
      <Sidebar collapsible="icon" className="border-r border-border bg-card z-40 transition-all duration-300 ease-in-out">
        <SidebarHeader className="h-16 flex pt-4 items-center justify-center border-b border-border group-data-[state=expanded]:justify-start group-data-[state=expanded]:px-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center shrink-0">
          <Link href={appSelected ? (pathname.startsWith('/client') ? `/client/${appSelected}` : `/${appSelected}`) : "/client"} className="flex items-center gap-2 group shrink-0">
            <Logo className="w-10 h-10 transition-transform group-hover:scale-105 shrink-0" />
            <span className="font-headline font-bold text-lg tracking-tighter text-foreground truncate group-data-[collapsible=icon]:hidden">
              PartnerPortal
            </span>
          </Link>
        </SidebarHeader>
        
        <SidebarContent className="px-2 group-data-[state=expanded]:px-3 group-data-[collapsible=icon]:px-0">
          <SidebarGroup>
            <SidebarMenu className="group-data-[collapsible=icon]:items-center">
              {dynamicMenu.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className={`h-11 transition-all rounded-md shadow-none ${
                      pathname === item.url 
                        ? "bg-accent text-accent-foreground font-bold" 
                        : "hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <Link href={item.url}>
                      <item.icon className={`w-4.5 h-4.5 shrink-0 ${pathname === item.url ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="text-sm group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="px-2 group-data-[state=expanded]:px-3 py-4 border-t border-border group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
          <SidebarMenu>
            <SidebarMenuItem>
               <SidebarMenuButton 
                onClick={() => {
                   localStorage.removeItem("sts_selected_app_id");
                   router.push("/client");
                }}
                className="h-11 rounded-md text-muted-foreground hover:text-primary transition-colors group-data-[collapsible=icon]:justify-center mb-1"
              >
                <ArrowLeftRight className="w-4.5 h-4.5 shrink-0" />
                <span className="text-sm group-data-[collapsible=icon]:hidden">Switch Application</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
               <SidebarMenuButton 
                onClick={handleLogout}
                className="h-11 rounded-md text-muted-foreground hover:text-foreground transition-colors group-data-[collapsible=icon]:justify-center"
              >
                <LogOut className="w-4.5 h-4.5 shrink-0 text-destructive" />
                <span className="text-sm group-data-[collapsible=icon]:hidden">Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col flex-1 bg-background min-w-0 overflow-hidden">
        <MainHeader 
          showNotifications={false}
          showProfile={false}
          showSubscription={true}
        />
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-4 md:p-10">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={true}
      disableTransitionOnChange
    >
      <SidebarProvider defaultOpen={true}>
        <ClientLayoutInner>{children}</ClientLayoutInner>
      </SidebarProvider>
    </ThemeProvider>
  );
}
