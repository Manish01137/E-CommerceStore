import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isUuid } from "@/lib/format";
import { toReviewDTO } from "@/lib/map";
import { DB_ENABLED, DEMO_MESSAGE } from "@/lib/demo";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  // Demo mode has no persistence — an empty review list, not an error.
  if (!DB_ENABLED) {
    return NextResponse.json({ reviews: [], average: 0, count: 0 });
  }
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const session = await getSession();
  const [reviews, agg] = await Promise.all([
    prisma.review.findMany({
      where: { productId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.review.aggregate({
      where: { productId: id },
      _avg: { rating: true },
      _count: true,
    }),
  ]);

  return NextResponse.json({
    reviews: reviews.map((r) => toReviewDTO(r, session?.userId)),
    average: Math.round((agg._avg.rating ?? 0) * 10) / 10,
    count: agg._count,
  });
}

const reviewSchema = z.object({
  rating: z.number().int().min(1, "Pick a star rating").max(5),
  title: z.string().max(80, "Keep the title under 80 characters").optional().default(""),
  comment: z
    .string()
    .min(10, "Tell us a little more — at least 10 characters")
    .max(1200, "Keep the review under 1200 characters"),
});

export async function POST(req: NextRequest, { params }: Params) {
  if (!DB_ENABLED) {
    return NextResponse.json({ error: DEMO_MESSAGE }, { status: 503 });
  }
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "Please sign in to write a review" },
      { status: 401 }
    );
  }

  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const product = await prisma.product.findFirst({ where: { id, active: true } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid review" },
      { status: 400 }
    );
  }

  // One review per user per product — writing again updates your review.
  const review = await prisma.review.upsert({
    where: {
      productId_userId: { productId: id, userId: session.userId },
    },
    update: { ...parsed.data, authorName: session.name },
    create: {
      ...parsed.data,
      productId: id,
      userId: session.userId,
      authorName: session.name,
    },
  });

  return NextResponse.json({ review: toReviewDTO(review, session.userId) }, { status: 201 });
}
