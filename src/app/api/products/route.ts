import { NextResponse, type NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import Product, { CATEGORIES, SCENTS } from "@/models/Product";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { listProducts } from "@/lib/products";
import { DB_ENABLED, DEMO_MESSAGE } from "@/lib/demo";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  const rawCategory = params.get("category");
  const rawScent = params.get("scent");

  const products = await listProducts({
    category:
      rawCategory && (CATEGORIES as readonly string[]).includes(rawCategory)
        ? rawCategory
        : null,
    scent:
      rawScent && (SCENTS as readonly string[]).includes(rawScent) ? rawScent : null,
    q: params.get("q")?.trim() || null,
    sort: params.get("sort"),
  });

  return NextResponse.json({ products });
}

const productSchema = z.object({
  name: z.string().min(2),
  category: z.enum(CATEGORIES),
  scents: z.array(z.enum(SCENTS)).min(1),
  description: z.string().min(10),
  ingredients: z.string().optional().default(""),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().nullable().optional(),
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
  await dbConnect();

  const body = await req.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid product data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  let slug = slugify(parsed.data.name);
  if (await Product.exists({ slug })) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const product = await Product.create({ ...parsed.data, slug });
  return NextResponse.json({ product }, { status: 201 });
}
