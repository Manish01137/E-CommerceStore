import { DB_ENABLED } from "@/lib/demo";
import { CATEGORIES } from "@/lib/types";

/**
 * Category names in display order. Demo mode has no database to manage
 * categories in, so it falls back to the original hardcoded list — the same
 * one the Category table was seeded from.
 */
export async function listCategoryNames(): Promise<string[]> {
  if (!DB_ENABLED) return [...CATEGORIES];

  const { prisma } = await import("@/lib/db");
  const rows = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  return rows.map((r) => r.name);
}
