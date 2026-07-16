"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Fingerprint, 
  Calendar,
  Lock,
  Bell,
  Camera,
  ShieldCheck
} from "lucide-react";
import { useState, useEffect } from "react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const [name, setName] = useState("");

  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile, loading: profileLoading } = useDoc(profileRef);

  useEffect(() => {
    if (profile?.name) {
      setName(profile.name);
    }
  }, [profile]);

  const isLoading = authLoading || profileLoading;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-headline font-bold tracking-tight">
          Account <span className="text-primary">Settings</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage your identity and profile information.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Identity Glance */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border border-border shadow-sm rounded-[2.5rem] overflow-hidden bg-card">
            <div className="h-24 bg-gradient-to-br from-primary/10 via-background to-primary/5 border-b border-border/50 relative">
               <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                  <div className="relative group">
                    <Avatar className="w-20 h-20 border-4 border-card shadow-xl rounded-[1.8rem]">
                      <AvatarImage src={user?.photoURL || ""} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold rounded-[1.8rem]">
                        {name ? name[0].toUpperCase() : <User className="w-8 h-8" />}
                      </AvatarFallback>
                    </Avatar>
                    <button className="absolute bottom-0 right-0 p-1.5 bg-background border border-border rounded-lg shadow-lg hover:bg-muted transition-colors opacity-0 group-hover:opacity-100">
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>
               </div>
            </div>
            <CardContent className="pt-14 pb-8 px-6 text-center space-y-4">
              <div className="space-y-1">
                <div className="font-bold text-lg h-7 flex items-center justify-center">
                  {isLoading ? <Skeleton className="h-6 w-32" /> : name}
                </div>
                <div className="text-[10px] text-muted-foreground font-medium truncate max-w-[200px] mx-auto h-4 flex items-center justify-center">
                   {isLoading ? <Skeleton className="h-3 w-40 mt-1" /> : user?.email}
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <Badge variant="secondary" className="bg-primary/5 text-primary border-none font-bold text-[10px] uppercase px-2 py-0.5 rounded-md">
                    {profile?.role || "Member"}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-bold border-border/50 text-muted-foreground px-2 py-0.5 rounded-md">
                    Verified
                  </Badge>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border/50 space-y-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground flex items-center gap-2 font-medium">
                    <Calendar className="w-3 h-3" />
                    Joined Since
                  </span>
                  <span className="font-bold text-foreground">
                    {profile?.createdAt ? format(profile.createdAt.toDate ? profile.createdAt.toDate() : new Date(profile.createdAt), "MMM yyyy") : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground flex items-center gap-2 font-medium">
                    <Fingerprint className="w-3 h-3" />
                    {profile?.role === 'client' ? 'Client Key' : 'Merchant ID'}
                  </span>
                  <span className="font-mono font-bold text-primary">
                    {profile?.merchantId || profile?.clientKey || "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/50 shadow-sm rounded-3xl p-6 bg-card">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Quick Links</h4>
            <div className="space-y-1">
              {[
                { label: "Notification Settings", icon: Bell },
                { label: "Security & Privacy", icon: ShieldCheck },
                { label: "Password Management", icon: Lock },
              ].map((link) => (
                <button key={link.label} className="w-full flex items-center justify-start gap-3 rounded-xl h-10 px-3 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all text-xs font-medium">
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
