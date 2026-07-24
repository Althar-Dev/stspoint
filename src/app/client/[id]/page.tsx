
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from "@/firebase";
import { doc, collection, query, where, orderBy, limit } from "firebase/firestore";
import { useParams } from "next/navigation";
import { V1Dashboard } from "./web/v1";
import { V2Dashboard } from "./web/v2";
import { getMongoTransactions } from "@/service/mongodb";
import { toast } from "@/hooks/use-toast";

export default function ClientDashboardPage() {
  const { id: appId } = useParams();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);
  
  // Real Data States
  const [mongoTransactions, setMongoTransactions] = useState<any[]>([]);
  const [isMongoLoading, setIsMongoLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch specific app data
  const appRef = useMemoFirebase(() => {
    if (!db || !user?.uid || !appId) return null;
    return doc(db, "users", user.uid, "apps", appId as string);
  }, [db, user?.uid, appId]);

  const { data: app, loading: appLoading } = useDoc(appRef);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid);
  }, [db, user?.uid]);

  const { data: profile, loading: profileLoading } = useDoc(profileRef);

  const stspaySvcRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "users", user.uid, "services", "stspay");
  }, [db, user?.uid]);

  const { data: stspaySvc, loading: stspayLoading } = useDoc(stspaySvcRef);

  // Determine Data Source
  const isPremiumApp = app?.type?.includes("appprem") || app?.type === "bot_topup";

  // Firestore Transactions (for V1 / non-mongo apps)
  const firestoreTransactionsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid || isPremiumApp) return null;
    return query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(50)
    );
  }, [db, user?.uid, isPremiumApp]);

  const { data: firestoreTransactions, loading: firestoreLoading } = useCollection(firestoreTransactionsQuery);

  // Fetch MongoDB Data
  useEffect(() => {
    const fetchMongoData = async () => {
      if (!user?.uid || !appId || !isPremiumApp) return;
      setIsMongoLoading(true);
      try {
        const res = await getMongoTransactions(user.uid, appId as string);
        if (res.success) {
          setMongoTransactions(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsMongoLoading(false);
      }
    };

    if (!appLoading && isPremiumApp) {
      fetchMongoData();
    }
  }, [appLoading, isPremiumApp, user?.uid, appId]);

  // Calculate Stats
  const dashboardData = useMemo(() => {
    const rawList = isPremiumApp ? mongoTransactions : firestoreTransactions;
    
    const successList = rawList.filter(tx => 
      ['SUCCESS', 'Success', 'PAID'].includes(tx.status)
    );

    const totalVolume = successList.reduce((acc, curr) => {
      const val = curr.priceAmount || curr.amount || 0;
      return acc + val;
    }, 0);

    return {
      successCount: successList.length,
      volume: totalVolume,
      recentActivity: rawList.slice(0, 10).map(tx => ({
        item: tx.itemName || tx.description || "Digital Item",
        status: ['SUCCESS', 'Success', 'PAID'].includes(tx.status) ? 'Success' : (['PENDING', 'Pending'].includes(tx.status) ? 'Process' : 'Failed'),
        amount: `Rp ${(tx.priceAmount || tx.amount || 0).toLocaleString('id-ID')}`,
        time: tx.createdAt // Will be formatted in view components
      }))
    };
  }, [isPremiumApp, mongoTransactions, firestoreTransactions]);

  const isLoading = authLoading || profileLoading || stspayLoading || appLoading || (isPremiumApp ? isMongoLoading : firestoreLoading) || !mounted;

  if (appLoading || !mounted) {
    return (
      <div className="space-y-8 min-w-0">
        <div className="space-y-2">
           <div className="h-8 w-48 bg-muted animate-pulse rounded-md"></div>
           <div className="h-4 w-64 bg-muted animate-pulse rounded-md"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="h-48 bg-muted animate-pulse rounded-md"></div>
           <div className="h-48 bg-muted animate-pulse rounded-md"></div>
           <div className="h-48 bg-muted animate-pulse rounded-md"></div>
        </div>
      </div>
    );
  }

  if (isPremiumApp) {
    return (
      <V2Dashboard 
        profile={profile} 
        stspaySvc={stspaySvc} 
        isLoading={isLoading} 
        stats={dashboardData}
      />
    );
  }

  return (
    <V1Dashboard 
      profile={profile} 
      stspaySvc={stspaySvc} 
      isLoading={isLoading} 
      stats={dashboardData}
    />
  );
}
