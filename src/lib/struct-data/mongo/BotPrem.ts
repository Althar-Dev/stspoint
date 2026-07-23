import { z } from "zod";

/**
 * @fileOverview Structure for Automation Bot (App Prem) MongoDB Documents
 * Combines account-based delivery with bot-specific metadata.
 */

export const BotPremPackageSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  stock: z.array(z.string()).default([]), // Standardized to 'stock'
});

export const BotPremProductSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  category: z.string(),
  description: z.string().optional(),
  packages: z.array(BotPremPackageSchema).default([]),
  bot_reply_template: z.string().optional(), // Custom reply after purchase
  status: z.enum(["active", "closed"]).default("active"),
  updatedAt: z.string().optional(),
});

export type BotPremProduct = z.infer<typeof BotPremProductSchema>;
