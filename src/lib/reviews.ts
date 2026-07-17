import { DB_ENABLED } from "@/lib/demo";

export interface HomeReview {
  id: string;
  authorName: string;
  rating: number;
  title: string;
  comment: string;
  productName: string;
  productSlug: string;
}

/**
 * Recent well-rated reviews for the home page. Returns [] in demo mode or
 * when nothing has been reviewed yet — the page then falls back to the
 * static testimonials.
 */
export async function getHomeReviews(limit = 3): Promise<HomeReview[]> {
  if (!DB_ENABLED) return [];

  const { prisma } = await import("@/lib/db");
  const rows = await prisma.review.findMany({
    where: { rating: { gte: 4 }, product: { active: true } },
    include: { product: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return rows.map((r) => ({
    id: r.id,
    authorName: r.authorName,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    productName: r.product.name,
    productSlug: r.product.slug,
  }));
}
