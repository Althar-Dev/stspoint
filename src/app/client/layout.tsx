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
  History,
  Globe,
  ArrowLeftRight
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { ReactNode, useEffect, useState } from "react";
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
    title: "Riwayat Pesanan",
    icon: ShoppingCart,
    url: "/client/orders",
  },
  {
    title: "Keuangan",
    icon: CreditCard,
    url: "/client/finance",
  },
  {
    title: "Pengaturan Web",
    icon: Settings,
    url: "/client/settings",
  }
];

function ClientLayoutInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpen, isMobile } = useSidebar();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const [appSelected, setAppSelected] = useState<string | null>(null);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile, loading: profileLoading } = useDoc(profileRef);

  useEffect(() => {
    if (!authLoading && !profileLoading) {
      if (!user) {
        router.push("/signin");
        return;
      } else if (profile && profile.role !== 'client' && !profile.dev) {
        router.push("/console");
        return;
      }

      // Check if an app is selected
      const selectedId = localStorage.getItem("sts_selected_app_id");
      setAppSelected(selectedId);

      if (!selectedId && pathname !== "/client/select-app") {
        router.push("/client/select-app");
      }
    }
  }, [user, profile, authLoading, profileLoading, router, pathname]);

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
  const isSelectAppPage = pathname === "/client/select-app";

  if (authLoading || profileLoading || !user || !isAuthorized) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[100] h-0.5 bg-muted overflow-hidden">
        <div className="animate-loading-bar" style={{ width: '40%' }}></div>
      </div>
    );
  }

  // Render Select App page without Sidebar
  if (isSelectAppPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen w-full bg-background selection:bg-primary/10 selection:text-primary">
      <Sidebar 
        collapsible="icon" 
        className="border-r border-border bg-card z-40 transition-all duration-300 ease-in-out"
      >
        <SidebarHeader className="h-16 flex pt-4 items-center justify-center border-b border-border group-data-[state=expanded]:justify-start group-data-[state=expanded]:px-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center shrink-0">
          <Link href="/client" className="flex items-center gap-2 group shrink-0">
            <Logo className="w-10 h-10 transition-transform group-hover:scale-105 shrink-0" />
            <span className="font-headline font-bold text-lg tracking-tighter text-foreground truncate group-data-[collapsible=icon]:hidden">
              PartnerPortal
            </span>
          </Link>
        </SidebarHeader>
        
        <SidebarContent className="px-2 group-data-[state=expanded]:px-3 group-data-[collapsible=icon]:px-0">
          <SidebarGroup>
            <SidebarMenu className="group-data-[collapsible=icon]:items-center">
              {adminMenuItems.map((item) => (
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
                   router.push("/client/select-app");
                }}
                className="h-11 rounded-md text-muted-foreground hover:text-primary transition-colors group-data-[collapsible=icon]:justify-center mb-1"
              >
                <ArrowLeftRight className="w-4.5 h-4.5 shrink-0" />
                <span className="text-sm group-data-[collapsible=icon]:hidden">Ganti Aplikasi</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
               <SidebarMenuButton 
                onClick={handleLogout}
                className="h-11 rounded-md text-muted-foreground hover:text-foreground transition-colors group-data-[collapsible=icon]:justify-center"
              >
                <LogOut className="w-4.5 h-4.5 shrink-0 text-destructive" />
                <span className="text-sm group-data-[collapsible=icon]:hidden">Keluar</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col flex-1 bg-background">
        <MainHeader searchPlaceholder="Cari data pesanan..." />
        <main className="flex-1 p-6 md:p-10">
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
