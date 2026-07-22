"use client";

import React, { useState, useEffect } from "react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { useParams } from "next/navigation";
import { V1Dashboard } from "./web/v1";
import { V2Dashboard } from "./web/v2";

export default function ClientDashboardPage() {
  const { id: appId } = useParams();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch specific app data to determine version/type
  const appRef = useMemoFirebase(() => {
    if (!db || !user?.uid || !appId) return null;
    return doc(db, "users", user.uid, "apps", appId as string);
  }, [db, user?.uid, appId]);

  const { data: app, loading: appLoading } = useDoc(appRef);

  // Profile and STSPay only relevant for V1
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

  const isLoading = authLoading || profileLoading || stspayLoading || appLoading || !mounted;

  // Wait for app data to decide which dashboard to show
  if (appLoading || !mounted) {
    return (
      <div className="space-y-8">
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

  // Choose dashboard based on app type
  // website_appprem uses V2 (Infrastructure focus)
  // Others use V1 (Revenue focus)
  if (app?.type === "website_appprem") {
    return <V2Dashboard profile={profile} isLoading={isLoading} />;
  }

  return <V1Dashboard profile={profile} stspaySvc={stspaySvc} isLoading={isLoading} />;
}