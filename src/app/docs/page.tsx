"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DocsGeneral } from "@/components/docs/general";
import { DocsStsPay } from "@/components/docs/stspay";
import { DocsPpob } from "@/components/docs/ppob";
import { DocsOrderkuota } from "@/components/docs/orderkuota";
import { DocsGoMerchant } from "@/components/docs/gomerchant";
import { DocsWebhooks } from "@/components/docs/webhooks";
import { DocsErrors } from "@/components/docs/errors";

function DocsContent() {
  const searchParams = useSearchParams();
  const activeType = searchParams.get("v") || "general";

  const renderSection = () => {
    switch (activeType) {
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
    <div id="docs-content">
      {renderSection()}
    </div>
  );
}

export default function DocsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center italic text-muted-foreground">Loading documentation...</div>}>
      <DocsContent />
    </Suspense>
  );
}
