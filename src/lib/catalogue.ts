import catalogueData from "@/data/catalogue.json";
import type { ProductDTO } from "@/lib/types";

/** The static catalogue served when no database is configured (demo mode). */
export const CATALOGUE = catalogueData as unknown as ProductDTO[];

const SORTERS: Record<string, (a: ProductDTO, b: ProductDTO) => number> = {
  popular: (a, b) => b.sold - a.sold,
  newest: (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
};

export function filterCatalogue(opts: {
  category?: string | null;
  scent?: string | null;
  q?: string | null;
  sort?: string | null;
}): ProductDTO[] {
  const q = opts.q?.trim().toLowerCase();

  const list = CATALOGUE.filter((p) => {
    if (!p.active) return false;
    if (opts.category && p.category !== opts.category) return false;
    if (opts.scent && !p.scents.includes(opts.scent)) return false;
    if (q) {
      // Same fields the Postgres query searches — including scents, which are
      // often the only place a term like "honey" appears.
      const haystack =
        `${p.name} ${p.description} ${p.category} ${p.ingredients} ${p.scents.join(" ")}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return list.sort(SORTERS[opts.sort ?? "popular"] ?? SORTERS.popular);
}

export function catalogueBySlug(slug: string): ProductDTO | null {
  return CATALOGUE.find((p) => p.slug === slug && p.active) ?? null;
}

export function catalogueFeatured(limit = 4): ProductDTO[] {
  return CATALOGUE.filter((p) => p.featured && p.active)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, limit);
}

export function catalogueRelated(product: ProductDTO, limit = 4): ProductDTO[] {
  return CATALOGUE.filter(
    (p) =>
      p.active &&
      p._id !== product._id &&
      (p.category === product.category ||
        p.scents.some((s) => product.scents.includes(s)))
  )
    .sort((a, b) => b.sold - a.sold)
    .slice(0, limit);
}

export function catalogueSorted(
  sort: "popular" | "newest",
  limit = 4
): ProductDTO[] {
  return [...CATALOGUE.filter((p) => p.active)]
    .sort(SORTERS[sort])
    .slice(0, limit);
}
