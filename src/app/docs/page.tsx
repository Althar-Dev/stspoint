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
import { Skeleton } from "@/components/ui/skeleton";

function DocsSkeleton() {
  return (
    <div className="space-y-16 animate-in fade-in duration-500">
      {/* Intro Skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-6 w-32 rounded-full" />
        <Skeleton className="h-10 md:h-12 w-3/4 max-w-md rounded-xl" />
        <div className="space-y-3">
          <Skeleton className="h-5 w-full max-w-3xl rounded-lg" />
          <Skeleton className="h-5 w-5/6 max-w-2xl rounded-lg" />
          <Skeleton className="h-5 w-4/6 max-w-xl rounded-lg" />
        </div>
      </div>

      {/* Content Section Skeleton */}
      <div className="space-y-8 pt-8 border-t border-border">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-8 w-56 rounded-lg" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-11/12 rounded-md" />
          <Skeleton className="h-4 w-4/5 rounded-md" />
        </div>
        
        {/* Code Block Skeleton */}
        <div className="space-y-3">
           <Skeleton className="h-3 w-24 rounded ml-1" />
           <Skeleton className="h-[250px] w-full rounded-2xl" />
        </div>
      </div>

      {/* Secondary Section Skeleton */}
      <div className="space-y-8 pt-8 border-t border-border">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-8 w-40 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

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
    <Suspense fallback={<DocsSkeleton />}>
      <DocsContent />
    </Suspense>
  );
}
