import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { DB_ENABLED, DEMO_MESSAGE } from "@/lib/demo";

export async function GET() {
  if (!DB_ENABLED) {
    return NextResponse.json({ error: DEMO_MESSAGE }, { status: 503 });
  }
  const session = await getSession();
  if (session?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  // Product.category is a plain string, not a foreign key (see schema
  // comment), so "how many products use this" is a count-by-name, not a
  // join — cheap enough at catalogue scale to just run one per category.
  const withCounts = await Promise.all(
    categories.map(async (c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      sortOrder: c.sortOrder,
      productCount: await prisma.product.count({ where: { category: c.name } }),
    }))
  );

  return NextResponse.json({ categories: withCounts });
}

const createSchema = z.object({
  name: z.string().trim().min(2, "Category name is too short").max(60),
});

export async function POST(req: NextRequest) {
  if (!DB_ENABLED) {
    return NextResponse.json({ error: DEMO_MESSAGE }, { status: 503 });
  }
  const session = await getSession();
  if (session?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid category" },
      { status: 400 }
    );
  }

  const existing = await prisma.category.findFirst({
    where: { name: { equals: parsed.data.name, mode: "insensitive" } },
  });
  if (existing) {
    return NextResponse.json({ error: "That category already exists" }, { status: 409 });
  }

  const maxSort = await prisma.category.aggregate({ _max: { sortOrder: true } });
  const category = await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug: slugify(parsed.data.name),
      sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
    },
  });

  return NextResponse.json({ category: { ...category, productCount: 0 } }, { status: 201 });
}
