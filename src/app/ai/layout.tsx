
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
  MessageSquare, 
  Image as ImageIcon, 
  LogOut,
  Bot,
  BookOpen
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { ReactNode, useEffect } from "react";
import { MainHeader } from "@/components/main-header";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { SidebarDocs } from "@/components/sidebar-docs";

const aiMenuItems = [
  {
    title: "AI Overview",
    icon: LayoutDashboard,
    url: "/ai",
  },
  {
    title: "Intelligent Chat",
    icon: MessageSquare,
    url: "/ai/chat",
  },
  {
    title: "Image Studio",
    icon: ImageIcon,
    url: "/ai/images",
  },
  {
    title: "Support Guide",
    icon: Bot,
    url: "/ai/support",
  },
  {
    title: "Documentation",
    icon: BookOpen,
    url: "/ai/docs",
  }
];

function AiLayoutInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const { setOpen, isMobile } = useSidebar();
  const db = useFirestore();

  const isDocsPage = pathname === "/ai/docs";

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
    <div className="flex h-screen w-full bg-background selection:bg-primary/10 selection:text-primary overflow-hidden">
      {isDocsPage ? (
        <SidebarDocs />
      ) : (
        <Sidebar 
          collapsible="icon" 
          className="border-r border-border bg-card z-40 transition-all duration-300 ease-in-out"
          onMouseEnter={() => !isMobile && setOpen(true)}
          onMouseLeave={() => !isMobile && setOpen(false)}
        >
          <SidebarHeader className="h-16 flex pt-4 items-center justify-center border-b border-border group-data-[state=expanded]:justify-start group-data-[state=expanded]:px-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center shrink-0">
            <Link href="/ai" className="flex items-center gap-2 group shrink-0">
              <img 
                src="/assets/img/ai-icon.png" 
                alt="STS AI Logo" 
                className="w-7 h-7 transition-transform group-hover:scale-105 shrink-0 object-contain"
              />
              <span className="font-headline font-bold text-lg tracking-tighter text-foreground truncate group-data-[collapsible=icon]:hidden">
                STS<span className="text-primary">GenKit</span>
              </span>
            </Link>
          </SidebarHeader>
          
          <SidebarContent className="px-0 group-data-[state=expanded]:px-0 group-data-[collapsible=icon]:px-0">
            <SidebarGroup>
              <SidebarMenu className="group-data-[collapsible=icon]:items-center">
                {aiMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      isActive={pathname === item.url}
                      tooltip={item.title}
                      className={`h-11 transition-all rounded-md shadow-none ${
                        pathname === item.url 
                          ? "text-amber-500 font-bold" 
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <Link href={item.url}>
                        <item.icon className={`w-4.5 h-4.5 shrink-0 ${pathname === item.url ? "text-amber-500" : "text-muted-foreground"}`} />
                        <span className="text-sm group-data-[collapsible=icon]:hidden">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="px-2 py-4 border-t border-border group-data-[collapsible=icon]:px-0">
            <SidebarMenu>
              <SidebarMenuItem>
                 <SidebarMenuButton 
                  asChild
                  className="h-11 rounded-md text-muted-foreground hover:text-foreground transition-colors group-data-[collapsible=icon]:justify-center"
                >
                  <Link href="/console">
                    <LogOut className="w-4.5 h-4.5 shrink-0 text-destructive" />
                    <span className="text-sm group-data-[collapsible=icon]:hidden">Back to Console</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
      )}

      <SidebarInset className="flex flex-col flex-1 bg-background overflow-hidden">
        <MainHeader 
          showNotifications={true}
          showProfile={true}
          showSubscription={true}
          showSidebarTrigger={false} 
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}

export default function AiLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={true}
      disableTransitionOnChange
    >
      <SidebarProvider defaultOpen={false}>
        <AiLayoutInner>{children}</AiLayoutInner>
      </SidebarProvider>
    </ThemeProvider>
  );
}
