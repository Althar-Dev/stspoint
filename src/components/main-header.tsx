"use client";

import { 
  SidebarTrigger 
} from "@/components/ui/sidebar";
import { 
  Bell,
  Search,
  User,
  CreditCard,
  SunMoon,
  Sun,
  Moon,
  Monitor,
  LogOut,
  Info,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth, useCollection } from "@/firebase";
import { doc, collection, query, orderBy, limit, serverTimestamp, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import React, { useMemo } from "react";

interface MainHeaderProps {
  searchPlaceholder?: string;
  showSidebarTrigger?: boolean;
}

export function MainHeader({ 
  searchPlaceholder = "Search features...",
  showSidebarTrigger = true 
}: MainHeaderProps) {
  const { setTheme } = useTheme();
  const { user } = useUser();
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);
  
  const { data: profile } = useDoc(profileRef);

  // Fetch Notifications
  const notificationsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return query(
      collection(db, "users", user.uid, "notifications"),
      orderBy("createdAt", "desc"),
      limit(5)
    );
  }, [db, user?.uid]);

  const { data: notifications, loading: notifLoading } = useCollection(notificationsQuery);

  const hasUnread = useMemo(() => {
    return notifications.some(n => !n.isRead);
  }, [notifications]);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
      await signOut(auth);
      toast({ 
        title: "Logged Out", 
        description: "Your session has been terminated safely." 
      });
      setTimeout(() => {
        window.location.href = "/signin";
      }, 500);
    } catch (e) {
      toast({ variant: "destructive", title: "Logout Error", description: "Failed to clear session cleanly." });
    }
  };

  const getNotifIcon = (type: string) => {
    switch(type) {
      case 'success': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'warning': return <AlertCircle className="w-3.5 h-3.5 text-amber-500" />;
      default: return <Info className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-background sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="text-muted-foreground hover:text-primary" />
          {showSidebarTrigger && <div className="h-4 w-[1px] bg-border hidden md:block"></div>}
        </div>

        <div className="relative group max-w-xs w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder={searchPlaceholder} 
            className="h-9 text-xs pl-9 bg-muted border-transparent focus:bg-background focus:border-border rounded-xl transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent relative">
              <Bell className="w-4 h-4 text-muted-foreground" />
              {hasUnread && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-[320px] rounded-2xl p-2 border-border"
          >
            <DropdownMenuLabel className="font-headline font-bold text-xs uppercase tracking-widest text-muted-foreground px-3 py-2 flex items-center justify-between">
              Notifications
              {hasUnread && <Badge variant="secondary" className="bg-red-50 text-red-600 border-none text-[8px] px-1.5 h-4">New</Badge>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto">
              {notifLoading ? (
                <div className="py-8 text-center text-xs text-muted-foreground animate-pulse">Synchronizing...</div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                    <Bell className="w-4 h-4 text-muted-foreground/30" />
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No notifications found.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className={`p-3 rounded-xl mb-1 flex items-start gap-3 transition-colors ${n.isRead ? 'opacity-60' : 'bg-muted/30'}`}>
                    <div className="mt-0.5 shrink-0">
                      {getNotifIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold leading-tight">{n.title}</p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2 mt-0.5">{n.message}</p>
                      <p className="text-[8px] text-muted-foreground/40 font-bold uppercase mt-1">
                        {n.createdAt ? format(n.createdAt.toDate ? n.createdAt.toDate() : new Date(n.createdAt), "dd MMM HH:mm") : '...'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {notifications.length > 0 && (
               <>
                <DropdownMenuSeparator />
                <Button variant="ghost" className="w-full h-8 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5">
                  View All Activity
                </Button>
               </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-10 px-2 rounded-xl hover:bg-accent">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-border overflow-hidden">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <div className="text-left hidden sm:block max-w-[150px]">
                <p className="text-[10px] font-bold leading-none truncate">
                  {profile?.name || user?.displayName || "User"}
                </p>
                <p className="text-[8px] text-muted-foreground leading-tight truncate">
                  {user?.email || "Manage Account"}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-border">
            <DropdownMenuLabel className="px-2 py-1.5">
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-bold truncate">{profile?.name || user?.displayName || "User"}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/console/setting" className="cursor-pointer gap-2 py-2.5 rounded-xl">
                <User className="w-4 h-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/console/subscribe" className="cursor-pointer gap-2 py-2.5 rounded-xl">
                <CreditCard className="w-4 h-4" /> Subscription
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer gap-2 py-2.5 rounded-xl">
                <SunMoon className="w-4 h-4" /> Appearance
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="rounded-xl p-2 border-border">
                  <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer gap-2 py-2 rounded-lg">
                    <Sun className="w-4 h-4" /> Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer gap-2 py-2 rounded-lg">
                    <Moon className="w-4 h-4" /> Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer gap-2 py-2 rounded-lg">
                    <Monitor className="w-4 h-4" /> System
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="text-red-500 hover:text-red-600 focus:text-red-600 focus:bg-red-500/10 cursor-pointer gap-2 py-2.5 rounded-xl"
            >
              <LogOut className="w-4 h-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}