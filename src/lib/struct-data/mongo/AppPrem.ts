import { z } from "zod";

/**
 * @fileOverview Structure for Web App Premium MongoDB Documents
 * Focused on full branding, rich descriptions, and account stock management.
 */

export const AppPremPackageSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  stock: z.array(z.string()).default([]),
});

export const AppPremProductSchema = z.object({
  id: z.string().optional(),
  product: z.string(),
  category: z.string(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  rating: z.union([z.string(), z.number()]).default("5.0"),
  sold: z.union([z.string(), z.number()]).default("0"),
  packages: z.array(AppPremPackageSchema).default([]),
  status: z.enum(["active", "maintenance"]).default("active"),
  updatedAt: z.string().optional(),
});

export type AppPremProduct = z.infer<typeof AppPremProductSchema>;
export type AppPremPackage = z.infer<typeof AppPremPackageSchema>;
