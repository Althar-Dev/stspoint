import { z } from "zod";

/**
 * @fileOverview Structure for Web Topup MongoDB Documents
 * Focused on PPOB price lists and provider mapping.
 */

export const AppTopupProductSchema = z.object({
  id: z.string().optional(),
  sku: z.string(),
  name: z.string(),
  category: z.string(), // e.g. "Pulsa", "Data"
  brand: z.string(),    // e.g. "TELKOMSEL"
  basePrice: z.number(),
  sellPrice: z.number(),
  provider: z.string().default("Orderkuota"),
  type: z.enum(["Prepaid", "Pasca"]).default("Prepaid"),
  status: z.boolean().default(true),
  updatedAt: z.string().optional(),
});

export type AppTopupProduct = z.infer<typeof AppTopupProductSchema>;
