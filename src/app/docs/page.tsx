
"use client";

import React, { useEffect } from "react";
import { DocsGeneral } from "@/components/docs/general";

/**
 * Root Docs Page - Renders the General introduction and handles subdomain redirects.
 */
export default function DocsPage() {
  useEffect(() => {
    // Check if we are in production to use the subdomain
    const hostname = window.location.hostname;
    const isDev = 
      hostname.includes("localhost") || 
      hostname.includes("cloudworkstations.dev") || 
      hostname.includes("firebaseapp.com");

    if (!isDev && (hostname === "stspoint.id" || hostname === "www.stspoint.id")) {
      window.location.href = "https://docs.stspoint.id/";
    }
  }, []);

  return (
    <div id="docs-content" className="animate-in fade-in duration-500">
      <DocsGeneral />
    </div>
  );
}
