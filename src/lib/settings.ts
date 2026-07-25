import { DB_ENABLED } from "@/lib/demo";

export interface ShippingSettings {
  shippingFee: number;
  /** null = free shipping is disabled; every order pays shippingFee. */
  freeShippingAbove: number | null;
}

/** Used in demo mode and as the seeded starting point in the database. */
export const DEFAULT_SHIPPING: ShippingSettings = {
  shippingFee: 79,
  freeShippingAbove: 999,
};

/**
 * Store-wide delivery pricing. Reads the single `Settings` row when a
 * database is configured; falls back to the hardcoded default in demo mode
 * so checkout math stays consistent either way.
 */
export async function getShippingSettings(): Promise<ShippingSettings> {
  if (!DB_ENABLED) return DEFAULT_SHIPPING;

  const { prisma } = await import("@/lib/db");
  const row = await prisma.settings.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main", ...DEFAULT_SHIPPING },
  });
  return { shippingFee: row.shippingFee, freeShippingAbove: row.freeShippingAbove };
}

export function computeShippingFee(subtotal: number, settings: ShippingSettings): number {
  if (settings.freeShippingAbove !== null && subtotal >= settings.freeShippingAbove) {
    return 0;
  }
  return settings.shippingFee;
}
