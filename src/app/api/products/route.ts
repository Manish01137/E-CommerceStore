import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { listProducts } from "@/lib/products";
import { toProductDTO } from "@/lib/map";
import { CATEGORIES } from "@/lib/types";
import { DB_ENABLED, DEMO_MESSAGE } from "@/lib/demo";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const rawCategory = params.get("category");

  const products = await listProducts({
    category:
      rawCategory && (CATEGORIES as readonly string[]).includes(rawCategory)
        ? rawCategory
        : null,
    scent: params.get("scent") || null,
    q: params.get("q")?.trim() || null,
    sort: params.get("sort"),
  });

  return NextResponse.json({ products });
}

const productSchema = z.object({
  name: z.string().min(2),
  category: z.enum(CATEGORIES),
  size: z.string().optional().default(""),
  scents: z.array(z.string().min(1)).min(1),
  description: z.string().min(10),
  ingredients: z.string().optional().default(""),
  price: z.number().int().positive(),
  compareAtPrice: z.number().int().positive().nullable().optional(),
  images: z.array(z.string()).optional().default([]),
  stock: z.number().int().min(0),
  featured: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
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
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid product data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  let slug = slugify(parsed.data.name);
  if (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const product = await prisma.product.create({
    data: { ...parsed.data, slug },
  });
  return NextResponse.json({ product: toProductDTO(product) }, { status: 201 });
}
