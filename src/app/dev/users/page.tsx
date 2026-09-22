
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, limit, doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import Link from "next/link";
import { Mail, Calendar, Key, MoreHorizontal, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export default function UserManagementPage() {
  const db = useFirestore();

  const usersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "users"), limit(100));
  }, [db]);

  const { data: users, loading } = useCollection(usersQuery);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [stspayBalances, setStspayBalances] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!db || !users || users.length === 0) return;
    let isMounted = true;

    const fetchStsPayBalances = async () => {
      const balances: Record<string, number> = {};
      await Promise.all(
        users.map(async (u) => {
          if (u.stspayBalance !== undefined) {
            balances[u.id] = u.stspayBalance;
          } else {
            try {
              const stsSnap = await getDoc(doc(db, "users", u.id, "services", "stspay"));
              if (stsSnap.exists()) {
                balances[u.id] = stsSnap.data().balance || 0;
              } else {
                balances[u.id] = 0;
              }
            } catch (e) {
              balances[u.id] = 0;
            }
          }
        })
      );
      if (isMounted) {
        setStspayBalances(balances);
      }
    };

    fetchStsPayBalances();
    return () => { isMounted = false; };
  }, [db, users]);

  const toggleDevStatus = async (userId: string, currentStatus: boolean) => {
    if (!db) return;
    setIsUpdating(userId);
    try {
      await updateDoc(doc(db, "users", userId), {
        dev: !currentStatus,
        updatedAt: serverTimestamp()
      });
      toast({ title: "Update Success", description: `Developer access ${!currentStatus ? 'enabled' : 'disabled'} for user.` });
    } catch (e) {
      toast({ variant: "destructive", title: "Update Failed", description: "Could not change user permissions." });
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-10">
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-24 text-center text-muted-foreground/30 italic">Accessing IAM registry...</div>
        ) : users.length === 0 ? (
          <div className="py-24 text-center text-muted-foreground/30 italic">No users found in system.</div>
        ) : (
          users.map((user, i) => (
            <Card key={i} className="bg-card border-border rounded-md overflow-hidden hover:border-primary/20 transition-all group shadow-sm">
              <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
                <div className="flex items-center gap-3.5">
                  <Avatar className="w-11 h-11 sm:w-12 sm:h-12 border border-muted rounded-md group-hover:scale-105 transition-transform shrink-0">
                    <AvatarImage src={user.photoURL} />
                    <AvatarFallback className="bg-primary/5 text-primary font-bold rounded-md text-sm">
                      {user.name?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground text-base">{user.name}</h3>
                      {user.dev && <Badge className="bg-primary text-primary-foreground border-none text-[8px] uppercase px-2 h-4 font-bold">DevRoot</Badge>}
                      {!!user.partner && <Badge className="bg-blue-500 text-white border-none text-[8px] uppercase px-2 h-4 font-bold">Partner</Badge>}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        Joined {user.createdAt ? format(user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt), "MMM dd, yyyy") : "N/A"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="hidden lg:flex flex-col items-end px-3 border-l border-border h-10 justify-center">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Main Balance</p>
                    <p className="text-xs font-mono text-emerald-600 font-bold">Rp {(user.balance || 0).toLocaleString('id-ID')}</p>
                  </div>
                  
                  <div className="hidden lg:flex flex-col items-end px-3 border-x border-border h-10 justify-center">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">STSPay Balance</p>
                    <p className="text-xs font-mono text-primary font-bold">Rp {(stspayBalances[user.id] ?? user.stspayBalance ?? 0).toLocaleString('id-ID')}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      asChild
                      variant="outline" 
                      size="sm" 
                      className="h-9 px-3 rounded-md font-bold text-[10px] uppercase tracking-wider gap-1 border-border"
                    >
                      <Link href={`/dev/user/${user.id}`}>
                        <Eye className="w-3.5 h-3.5 text-primary" /> Detail
                      </Link>
                    </Button>

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`h-9 px-3 rounded-md font-bold text-[10px] uppercase tracking-wider transition-all ${user.dev ? 'text-destructive hover:bg-destructive/5' : 'text-emerald-600 hover:bg-emerald-500/5'}`}
                      onClick={() => toggleDevStatus(user.id, !!user.dev)}
                      disabled={isUpdating === user.id}
                    >
                      {isUpdating === user.id ? 'Updating...' : user.dev ? 'Revoke Access' : 'Grant DevRoot'}
                    </Button>

                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="p-10 rounded-md bg-muted/30 border border-border border-dashed relative overflow-hidden">
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="w-16 h-16 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
               <Key className="w-8 h-8" />
            </div>
            <div className="space-y-2 text-center md:text-left flex-1">
               <h4 className="text-xl font-headline font-bold text-foreground">Global Registry Control</h4>
               <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
                 Developer access grants full read/write permissions to the infrastructure and raw database. 
                 Always perform security audits before granting "DevRoot" status to any account.
               </p>
            </div>
            <Button variant="outline" className="rounded-md h-12 px-8 font-bold text-xs uppercase tracking-widest bg-card shadow-sm">
               Read IAM Policy
            </Button>
         </div>
      </div>
    </div>
  );
}
