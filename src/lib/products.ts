import { DB_ENABLED } from "@/lib/demo";
import { CATEGORIES, type ProductDTO } from "@/lib/types";
import {
  filterCatalogue,
  catalogueBySlug,
  catalogueFeatured,
  catalogueRelated,
  catalogueSorted,
} from "@/lib/catalogue";

/**
 * Product reads, resolved against Postgres when a database is configured and
 * against the static catalogue otherwise. Every product read in the app goes
 * through here, so the storefront renders identically with or without a DB.
 */

async function db() {
  const { prisma } = await import("@/lib/db");
  return prisma;
}

type SortKey = "popular" | "newest" | "price-asc" | "price-desc";

function orderBy(sort: string | null | undefined) {
  const key = (sort ?? "popular") as SortKey;
  switch (key) {
    case "newest":
      return { createdAt: "desc" as const };
    case "price-asc":
      return { price: "asc" as const };
    case "price-desc":
      return { price: "desc" as const };
    default:
      return { sold: "desc" as const };
  }
}

/**
 * Scents live in a text[] column, and Postgres can't do a case-insensitive
 * partial match inside an array. So resolve which scent values the query
 * matches first, then match those exactly with `hasSome`. Without this,
 * searching "honey" would miss the products whose Honey variant is the only
 * place that word appears.
 */
async function scentsMatching(q: string): Promise<string[]> {
  const prisma = await db();
  const rows = await prisma.product.findMany({
    where: { active: true },
    select: { scents: true },
  });
  const needle = q.toLowerCase();
  const matched = new Set<string>();
  for (const row of rows) {
    for (const s of row.scents) {
      if (s.toLowerCase().includes(needle)) matched.add(s);
    }
  }
  return [...matched];
}

export async function listProducts(opts: {
  category?: string | null;
  scent?: string | null;
  q?: string | null;
  sort?: string | null;
}): Promise<ProductDTO[]> {
  if (!DB_ENABLED) return filterCatalogue(opts);

  const prisma = await db();
  const { toProductDTO } = await import("@/lib/map");

  const q = opts.q?.trim();
  const matchedScents = q ? await scentsMatching(q) : [];

  const rows = await prisma.product.findMany({
    where: {
      active: true,
      ...(opts.category ? { category: opts.category } : {}),
      ...(opts.scent ? { scents: { has: opts.scent } } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { description: { contains: q, mode: "insensitive" as const } },
              { category: { contains: q, mode: "insensitive" as const } },
              { ingredients: { contains: q, mode: "insensitive" as const } },
              ...(matchedScents.length ? [{ scents: { hasSome: matchedScents } }] : []),
            ],
          }
        : {}),
    },
    orderBy: orderBy(opts.sort),
  });
  return rows.map(toProductDTO);
}

export async function getProductBySlug(slug: string): Promise<ProductDTO | null> {
  if (!DB_ENABLED) return catalogueBySlug(slug);

  const prisma = await db();
  const { toProductDTO } = await import("@/lib/map");
  const row = await prisma.product.findFirst({ where: { slug, active: true } });
  return row ? toProductDTO(row) : null;
}

export async function getFeatured(limit = 4): Promise<ProductDTO[]> {
  if (!DB_ENABLED) return catalogueFeatured(limit);

  const prisma = await db();
  const { toProductDTO } = await import("@/lib/map");
  const rows = await prisma.product.findMany({
    where: { featured: true, active: true },
    orderBy: { sold: "desc" },
    take: limit,
  });
  return rows.map(toProductDTO);
}

export async function getRelated(product: ProductDTO, limit = 4): Promise<ProductDTO[]> {
  if (!DB_ENABLED) return catalogueRelated(product, limit);

  const prisma = await db();
  const { toProductDTO } = await import("@/lib/map");
  const rows = await prisma.product.findMany({
    where: {
      active: true,
      id: { not: product._id },
      OR: [
        { category: product.category },
        { scents: { hasSome: product.scents } },
      ],
    },
    orderBy: { sold: "desc" },
    take: limit,
  });
  return rows.map(toProductDTO);
}

export async function getBy(
  sort: "popular" | "newest",
  limit = 4
): Promise<ProductDTO[]> {
  if (!DB_ENABLED) return catalogueSorted(sort, limit);

  const prisma = await db();
  const { toProductDTO } = await import("@/lib/map");
  const rows = await prisma.product.findMany({
    where: { active: true },
    orderBy: orderBy(sort),
    take: limit,
  });
  return rows.map(toProductDTO);
}

export interface Facets {
  categories: string[];
  scents: string[];
}

/**
 * Filter options built from what's actually in the catalogue, so adding a
 * product with a new scent surfaces it in the filter with no code change.
 */
export async function getFacets(): Promise<Facets> {
  const all = await listProducts({});
  const categories = new Set<string>();
  const scents = new Set<string>();
  for (const p of all) {
    categories.add(p.category);
    p.scents.forEach((s) => scents.add(s));
  }
  return {
    // Keep categories in the canonical catalogue order, not alphabetical
    categories: (CATEGORIES as readonly string[]).filter((c) => categories.has(c)),
    scents: [...scents].sort((a, b) => a.localeCompare(b)),
  };
}
