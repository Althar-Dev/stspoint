
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
  History, 
  Settings, 
  LogOut
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { ReactNode, useEffect } from "react";
import { MainHeader } from "@/components/main-header";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Icon } from "@iconify/react";

const shopeepayMenuItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/shopeepay" },
  { title: "Transaction History", icon: History, url: "/shopeepay/transactions" },
];

function ShopeepayLayoutInner({ children }: { children: ReactNode }) {
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
      } else if (profile && !!profile.partner && !profile.dev) {
        router.push("/client");
      }
    }
  }, [user, profile, authLoading, profileLoading, router]);

  const isAuthorized = profile?.role === 'merchant' || profile?.dev === true;

  if (authLoading || profileLoading || !user || !isAuthorized) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[100] h-0.5 bg-muted overflow-hidden">
        <div className="animate-loading-bar" style={{ width: '40%' }}></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background overflow-hidden">
      <Sidebar 
        collapsible="icon" 
        className="border-r border-border bg-card z-40 transition-all duration-300 ease-in-out"
        onMouseEnter={() => !isMobile && setOpen(true)}
        onMouseLeave={() => !isMobile && setOpen(false)}
      >
        <SidebarHeader className="h-16 flex pt-4 items-center justify-center border-b border-border group-data-[state=expanded]:justify-start group-data-[state=expanded]:px-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center shrink-0">
          <Link href="/shopeepay" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 bg-[#EE4D2D] rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
               <Icon icon="simple-icons:shopee" className="text-white w-5 h-5" />
            </div>
            <span className="font-headline font-bold text-lg tracking-tighter text-foreground truncate group-data-[collapsible=icon]:hidden">ShopeePay</span>
          </Link>
        </SidebarHeader>
        
        <SidebarContent className="px-2 group-data-[state=expanded]:px-3 group-data-[collapsible=icon]:px-0">
          <SidebarGroup>
            <SidebarMenu className="group-data-[collapsible=icon]:items-center">
              {shopeepayMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className={`h-10 transition-colors ${
                      pathname === item.url 
                        ? "bg-[#EE4D2D] text-white font-bold hover:bg-[#EE4D2D]/90" 
                        : "hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="text-sm group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="px-2 group-data-[state=expanded]:px-3 py-4 border-t border-border group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
           <SidebarMenuButton 
            asChild
            className="h-10 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Link href="/console">
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="text-sm group-data-[collapsible=icon]:hidden">Back to Console</span>
            </Link>
          </SidebarMenuButton>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col flex-1">
        <MainHeader showSidebarTrigger={false} />
        <main className="flex-1 p-6 md:p-8 bg-background overflow-y-auto">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}

export default function ShopeepayLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={true}
      disableTransitionOnChange
    >
      <SidebarProvider defaultOpen={false}>
        <ShopeepayLayoutInner>{children}</ShopeepayLayoutInner>
      </SidebarProvider>
    </ThemeProvider>
  );
}
