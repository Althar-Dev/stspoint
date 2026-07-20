"use client";

import React from "react";
import { DocsGeneral } from "@/components/docs/general";

/**
 * Root Docs Page - Renders the General introduction.
 */
export default function DocsPage() {
  return (
    <div id="docs-content" className="animate-in fade-in duration-500">
      <DocsGeneral />
    </div>
  );
}