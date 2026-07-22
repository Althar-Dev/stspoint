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

  const isSelectAppPage = pathname === "/client";

  useEffect(() => {
    if (!authLoading && !profileLoading) {
      if (!user) {
        router.push("/signin");
        return;
      } else if (profile && profile.role !== 'client' && !profile.dev) {
        router.push("/console");
        return;
      }

      const pathSegments = pathname.split('/');
      const idFromPath = pathSegments.length > 2 ? pathSegments[2] : null;

      if (idFromPath && !['orders', 'finance', 'settings', 'products'].includes(idFromPath)) {
        localStorage.setItem("sts_selected_app_id", idFromPath);
        setAppSelected(idFromPath);
      } else {
        const storedId = localStorage.getItem("sts_selected_app_id");
        setAppSelected(storedId);

        if (!storedId && !isSelectAppPage) {
          router.push("/client");
        }
      }
    }
  }, [user, profile, authLoading, profileLoading, router, pathname, isSelectAppPage]);

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

  const isAuthorized = profile?.role === 'client' || profile?.dev === true;

  const dynamicMenu = useMemo(() => {
    const selectedId = appSelected || "";
    return adminMenuItems.map(item => ({
      ...item,
      url: item.url === "/client" ? `/client/${selectedId}` : item.url.replace('/client/', `/client/${selectedId}/`)
    }));
  }, [appSelected]);

  if (authLoading || profileLoading || !user || !isAuthorized) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[100] h-0.5 bg-muted overflow-hidden">
        <div className="animate-loading-bar" style={{ width: '40%' }}></div>
      </div>
    );
  }

  if (isSelectAppPage) {
    return <div className="w-full min-w-0">{children}</div>;
  }

  return (
    <div className="flex min-h-screen w-full bg-background selection:bg-primary/10 selection:text-primary overflow-hidden">
      <Sidebar collapsible="icon" className="border-r border-border bg-card z-40 transition-all duration-300 ease-in-out">
        <SidebarHeader className="h-16 flex pt-4 items-center justify-center border-b border-border group-data-[state=expanded]:justify-start group-data-[state=expanded]:px-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center shrink-0">
          <Link href={appSelected ? `/client/${appSelected}` : "/client"} className="flex items-center gap-2 group shrink-0">
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

      <SidebarInset className="flex flex-col flex-1 bg-background min-w-0">
        <MainHeader searchPlaceholder="Search portal..." />
        <main className="flex-1 p-4 md:p-10 min-w-0 overflow-x-hidden">
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
