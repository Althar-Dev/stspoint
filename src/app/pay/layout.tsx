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
  CreditCard, 
  Terminal, 
  Settings,
  LogOut,
  ChevronDown,
  Wallet,
  Activity,
  History,
  ShieldCheck,
  LayoutGrid,
  BookOpen
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
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

const stspayMenuItems = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    url: "/pay",
  },
  {
    title: "Transactions",
    icon: CreditCard,
    url: "/pay/transactions",
  },
  {
    title: "Balances",
    icon: Wallet,
    url: "/pay/balances",
  },
  {
    title: "Subscriptions",
    icon: ShieldCheck,
    url: "/pay/subscriptions",
  },
  {
    title: "Payment Channel",
    icon: LayoutGrid,
    url: "/pay/channels",
  },
  {
    title: "Developers",
    icon: Terminal,
    items: [
      { title: "API Keys", url: "/console/developer/api-keys" },
      { title: "Documentation", url: "/docs" },
      { title: "Payment Link", url: "/pay/payment-link" },
      { title: "Logs", url: "/pay/logs" },
    ]
  },
  {
    title: "Settings",
    icon: Settings,
    url: "/pay/settings",
  }
];

function STSPayLayoutInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpen, isMobile } = useSidebar();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();

  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile, loading: profileLoading } = useDoc(profileRef);

  useEffect(() => {
    if (!authLoading && !profileLoading) {
      if (!user) {
        router.push("/signin");
      } else if (profile && profile.role !== 'merchant' && !profile.dev) {
        router.push("/client");
      }
    }
  }, [user, profile, authLoading, profileLoading, router]);

  const renderMenuItem = (group: any) => {
    if (group.url) {
      const isActive = pathname === group.url;
      return (
        <SidebarMenuItem key={group.title}>
          <SidebarMenuButton 
            asChild
            isActive={isActive}
            tooltip={group.title}
            className={`h-9 transition-all rounded-md ${
              isActive 
                ? "bg-primary text-primary-foreground font-bold" 
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Link href={group.url}>
              <group.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
              <span className="text-xs group-data-[collapsible=icon]:hidden">{group.title}</span>
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
              className={`h-9 transition-all rounded-md hover:bg-accent hover:text-accent-foreground ${
                isGroupActive ? "bg-accent/50 font-bold" : ""
              }`}
            >
              <group.icon className={`w-4 h-4 shrink-0 ${isGroupActive ? "text-primary" : "text-muted-foreground"}`} />
              <span className="text-xs group-data-[collapsible=icon]:hidden">{group.title}</span>
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
                    className={`h-8 rounded-md transition-all duration-200 ${
                      pathname === subItem.url 
                        ? "bg-primary/5 text-primary font-bold" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Link href={subItem.url}>
                      <span className="text-[11px]">{subItem.title}</span>
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
    <div className="flex min-h-screen w-full bg-background selection:bg-primary/10 selection:text-primary">
      <Sidebar 
        collapsible="icon" 
        className="border-r border-border bg-card z-40 transition-all duration-300 ease-in-out"
        onMouseEnter={() => !isMobile && setOpen(true)}
        onMouseLeave={() => !isMobile && setOpen(false)}
      >
        <SidebarHeader className="h-16 flex pt-4 items-center justify-center border-b border-border group-data-[state=expanded]:justify-start group-data-[state=expanded]:px-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center shrink-0">
          <Link href="/pay" className="flex items-center gap-2 group shrink-0">
            <Logo className="w-8 h-8 transition-transform group-hover:scale-105 shrink-0" />
            <span className="font-headline font-bold text-lg tracking-tighter text-foreground truncate group-data-[collapsible=icon]:hidden">
              STSPay<span className="text-primary/50 text-[10px] ml-1 font-bold uppercase tracking-widest">gateway</span>
            </span>
          </Link>
        </SidebarHeader>
        
        <SidebarContent className="px-2 py-4 group-data-[state=expanded]:px-3 group-data-[collapsible=icon]:px-0">
          <SidebarGroup>
            <SidebarMenu className="group-data-[collapsible=icon]:items-center">
              {stspayMenuItems.map((group) => renderMenuItem(group))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="px-2 py-4 border-t border-border group-data-[collapsible=icon]:px-0">
          <SidebarMenu>
            <SidebarMenuItem>
               <SidebarMenuButton 
                asChild
                className="h-9 rounded-md text-muted-foreground hover:text-foreground transition-colors group-data-[collapsible=icon]:justify-center"
              >
                <Link href="/console">
                  <LogOut className="w-4 h-4 shrink-0 text-destructive" />
                  <span className="text-sm group-data-[collapsible=icon]:hidden">Back to Console</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col flex-1 bg-background">
        <MainHeader searchPlaceholder="Cari data transaksi STSPay..." showSidebarTrigger={false} />
        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}

export default function STSPayLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={true}
      disableTransitionOnChange
    >
      <SidebarProvider defaultOpen={false}>
        <STSPayLayoutInner>{children}</STSPayLayoutInner>
      </SidebarProvider>
    </ThemeProvider>
  );
}
