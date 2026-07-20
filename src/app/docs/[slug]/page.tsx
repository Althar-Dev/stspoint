"use client";

import React, { use } from "react";
import { DocsStsPay } from "@/components/docs/stspay";
import { DocsPpob } from "@/components/docs/ppob";
import { DocsOrderkuota } from "@/components/docs/orderkuota";
import { DocsGoMerchant } from "@/components/docs/gomerchant";
import { DocsWebhooks } from "@/components/docs/webhooks";
import { DocsErrors } from "@/components/docs/errors";
import { DocsGeneral } from "@/components/docs/general";

interface DocsSlugPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Dynamic Documentation Page - Renders sections based on path slug.
 */
export default function DocsSlugPage({ params }: DocsSlugPageProps) {
  const { slug } = use(params);

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