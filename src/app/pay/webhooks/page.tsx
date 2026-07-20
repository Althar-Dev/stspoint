"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Redirecting legacy webhooks page to the main dashboard.
 */
export default function WebhooksRedirectPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/pay");
  }, [router]);

  return null;
}
