import { z } from "zod";

/**
 * @fileOverview Structure for Automation Bot (Topup) MongoDB Documents
 * Optimized for high-speed SKU lookups and bot response messages.
 */

export const BotTopupProductSchema = z.object({
  sku: z.string(),
  name: z.string(),
  price: z.number(),
  category: z.string(),
  brand: z.string(),
  cmd_trigger: z.string().optional(), // Command to trigger this product
  is_active: z.boolean().default(true),
  note: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type BotTopupProduct = z.infer<typeof BotTopupProductSchema>;
