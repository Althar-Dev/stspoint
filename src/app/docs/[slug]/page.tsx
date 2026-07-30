"use client";

import React, { use, useEffect } from "react";
import { DocsStsPay } from "@/components/docs/stspay";
import { DocsPpob } from "@/components/docs/ppob";
import { DocsOrderkuota } from "@/components/docs/orderkuota";
import { DocsGoMerchant } from "@/components/docs/gomerchant";
import { DocsWebhooks } from "@/components/docs/webhooks";
import { DocsErrors } from "@/components/docs/errors";
import { DocsGeneral } from "@/components/docs/general";
import { DocsOvo } from "@/components/docs/ovo";

interface DocsSlugPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Dynamic Documentation Page - Renders sections based on path slug.
 */
export default function DocsSlugPage({ params }: DocsSlugPageProps) {
  const { slug } = use(params);

  useEffect(() => {
    // Check if we are in production to use the subdomain
    const hostname = window.location.hostname;
    const isDev = 
      hostname.includes("localhost") || 
      hostname.includes("cloudworkstations.dev") || 
      hostname.includes("firebaseapp.com");

    if (!isDev && hostname !== "docs.stspoint.id") {
      window.location.href = `https://docs.stspoint.id/${slug}`;
    }
  }, [slug]);

  const renderSection = () => {
    switch (slug) {
      case "stspay":
        return <DocsStsPay />;
      case "ppob":
        return <DocsPpob />;
      case "orderkuota":
        return <DocsOrderkuota />;
      case "gopay":
        return <DocsGoMerchant />;
      case "ovo":
        return <DocsOvo />;
      case "webhooks":
        return <DocsWebhooks />;
      case "errors":
        return <DocsErrors />;
      default:
        return <DocsGeneral />;
    }
  };

  return (
    <div id="docs-content" className="animate-in fade-in duration-500">
      {renderSection()}
    </div>
  );
}
