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
  LayoutDashboard, 
  Key, 
  CreditCard, 
  ChevronDown,
  Package,
  Settings,
  LogOut
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { ThemeProvider } from "next-themes";
import { ReactNode, useEffect } from "react";
import { Logo } from "@/components/logo";
import { MainHeader } from "@/components/main-header";
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from "@/firebase";
import { doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { toast } from "@/hooks/use-toast";

const mainMenuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/console",
  },
  {
    title: "Product",
    icon: Package,
    items: [
      { title: "PPOB", url: "/console/services/ppob" },
    ]
  },
  {
    title: "Finance",
    icon: CreditCard,
    items: [
      { title: "STSPay", url: "/pay" },
      { title: "OrderKuota", url: "/orkut" },
      { title: "GoMerchant", url: "/gopay" },
    ]
  },
  {
    title: "Developer",
    icon: Key,
    items: [
      { title: "API Keys", url: "/console/developer/api-keys" },
      { title: "Documentations", url: "/docs" },
    ]
  }
];

const footerMenuItems = [
  {
    title: "Manage Account",
    icon: Settings,
    items: [
      { title: "Profile", url: "/console/setting" },
      { title: "Subscription", url: "/console/subscribe" },
    ]
  }
];

function ConsoleLayoutInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpen, isMobile } = useSidebar();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const auth = useAuth();

  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile, loading: profileLoading } = useDoc(profileRef);

  useEffect(() => {
    if (!authLoading && !profileLoading) {
      if (!user) {
        router.push("/signin");
      } else if (profile && !!profile.partner && !profile.dev) {
        router.push("/client");
      }
    }
  }, [user, profile, authLoading, profileLoading, router]);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
      await signOut(auth);
      toast({ title: "Logged out", description: "Successfully signed out." });
      
      setTimeout(() => {
        window.location.href = "/signin";
      }, 500);
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to logout cleanly." });
    }
  };

  const renderMenuItem = (group: any) => {
    if (group.url) {
      const isActive = pathname === group.url;
      return (
        <SidebarMenuItem key={group.title}>
          <SidebarMenuButton 
            asChild
            isActive={isActive}
            tooltip={group.title}
            className={`h-10 transition-colors group-data-[collapsible=icon]:justify-center ${
              isActive 
                ? "bg-accent text-accent-foreground font-bold" 
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Link href={group.url}>
              <group.icon className="w-4 h-4 shrink-0" />
              <span className="text-sm group-data-[collapsible=icon]:hidden">{group.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    }

    const isGroupActive = group.items?.some((item: any) => item.url === pathname);
    
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
                isGroupActive ? "text-accent-foreground font-bold" : ""
              }`}
            >
              <group.icon className="w-4 h-4 shrink-0" />
              <span className="text-sm group-data-[collapsible=icon]:hidden">{group.title}</span>
              <ChevronDown className="ml-auto w-3 h-3 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
            <SidebarMenuSub>
              {group.items.map((subItem: any) => (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton 
                    asChild 
                    isActive={pathname === subItem.url}
                    className={`rounded-lg transition-all duration-200 ${
                      pathname === subItem.url 
                        ? "bg-accent text-accent-foreground font-bold" 
                        : "text-muted-foreground hover:text-accent-foreground"
                    }`}
                  >
                    <Link href={subItem.url}>
                      <span>{subItem.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  };

  const isAuthorized = profile?.role === 'merchant' || profile?.dev === true;

  if (authLoading || profileLoading || !user || !isAuthorized) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[100] h-0.5 bg-muted overflow-hidden">
        <div className="animate-loading-bar" style={{ width: '40%' }}></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar 
        collapsible="icon" 
        className="border-r border-border bg-card shadow-sm z-40 transition-all duration-300 ease-in-out"
        onMouseEnter={() => !isMobile && setOpen(true)}
        onMouseLeave={() => !isMobile && setOpen(false)}
      >
        <SidebarHeader className="h-16 flex pt-4 items-center justify-center border-b border-border group-data-[state=expanded]:justify-start group-data-[state=expanded]:px-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center shrink-0">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <Logo className="w-10 h-10 transition-transform group-hover:scale-105 shrink-0" />
            <span className="font-headline font-bold text-lg tracking-tighter text-foreground truncate group-data-[collapsible=icon]:hidden">Point</span>
          </Link>
        </SidebarHeader>
        
        <SidebarContent className="px-2 group-data-[state=expanded]:px-3 group-data-[collapsible=icon]:px-0">
          <SidebarGroup>
            <SidebarMenu className="group-data-[collapsible=icon]:items-center">
              {mainMenuItems.map((group) => renderMenuItem(group))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="px-2 group-data-[state=expanded]:px-3 py-4 border-t border-border group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
          <SidebarMenu className="group-data-[collapsible=icon]:items-center">
            {footerMenuItems.map((group) => renderMenuItem(group))}
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={handleLogout}
                className="h-10 text-destructive hover:bg-destructive/5 hover:text-destructive transition-colors group-data-[collapsible=icon]:justify-center"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span className="text-sm group-data-[collapsible=icon]:hidden">Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col flex-1 min-w-0 bg-background">
        <MainHeader showSidebarTrigger={false} />
        <main className="flex-1 min-w-0 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={true}
      disableTransitionOnChange
    >
      <SidebarProvider defaultOpen={false}>
        <ConsoleLayoutInner>{children}</ConsoleLayoutInner>
      </SidebarProvider>
    </ThemeProvider>
  );
}
