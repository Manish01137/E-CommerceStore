import { DB_ENABLED } from "@/lib/demo";
import { toJSON, type ProductDTO } from "@/lib/types";
import {
  filterCatalogue,
  catalogueBySlug,
  catalogueFeatured,
  catalogueRelated,
  catalogueSorted,
} from "@/lib/catalogue";

/**
 * Product reads, resolved against MongoDB when it's configured and against the
 * static catalogue otherwise. Every product read in the app goes through here,
 * so the storefront renders identically with or without a database.
 */

async function db() {
  const [{ dbConnect }, { default: Product }] = await Promise.all([
    import("@/lib/db"),
    import("@/models/Product"),
  ]);
  await dbConnect();
  return Product;
}

const SORTS: Record<string, Record<string, 1 | -1>> = {
  popular: { sold: -1 },
  newest: { createdAt: -1 },
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
};

export async function listProducts(opts: {
  category?: string | null;
  scent?: string | null;
  q?: string | null;
  sort?: string | null;
}): Promise<ProductDTO[]> {
  if (!DB_ENABLED) return filterCatalogue(opts);

  const Product = await db();
  const filter: Record<string, unknown> = { active: true };
  if (opts.category) filter.category = opts.category;
  if (opts.scent) filter.scents = opts.scent;
  if (opts.q) {
    filter.$or = [
      { name: { $regex: opts.q, $options: "i" } },
      { description: { $regex: opts.q, $options: "i" } },
      { category: { $regex: opts.q, $options: "i" } },
    ];
  }
  const sort = SORTS[opts.sort ?? "popular"] ?? SORTS.popular;
  return toJSON<ProductDTO[]>(await Product.find(filter).sort(sort).lean());
}

export async function getProductBySlug(slug: string): Promise<ProductDTO | null> {
  if (!DB_ENABLED) return catalogueBySlug(slug);

  const Product = await db();
  const doc = await Product.findOne({ slug, active: true }).lean();
  return doc ? toJSON<ProductDTO>(doc) : null;
}

export async function getFeatured(limit = 4): Promise<ProductDTO[]> {
  if (!DB_ENABLED) return catalogueFeatured(limit);

  const Product = await db();
  return toJSON<ProductDTO[]>(
    await Product.find({ featured: true, active: true }).sort({ sold: -1 }).limit(limit).lean()
  );
}

export async function getRelated(product: ProductDTO, limit = 4): Promise<ProductDTO[]> {
  if (!DB_ENABLED) return catalogueRelated(product, limit);

  const Product = await db();
  const filter: Record<string, unknown> = {
    active: true,
    _id: { $ne: product._id },
    $or: [{ category: product.category }, { scents: { $in: product.scents } }],
  };
  return toJSON<ProductDTO[]>(await Product.find(filter).sort({ sold: -1 }).limit(limit).lean());
}

export async function getBy(
  sort: "popular" | "newest",
  limit = 4
): Promise<ProductDTO[]> {
  if (!DB_ENABLED) return catalogueSorted(sort, limit);

  const Product = await db();
  const order: Record<string, -1> = sort === "newest" ? { createdAt: -1 } : { sold: -1 };
  return toJSON<ProductDTO[]>(await Product.find({ active: true }).sort(order).limit(limit).lean());
}
