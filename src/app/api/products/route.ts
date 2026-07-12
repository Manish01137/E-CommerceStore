import { NextResponse, type NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import Product, { CATEGORIES, SCENTS } from "@/models/Product";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { z } from "zod";

const SORTS: Record<string, Record<string, 1 | -1>> = {
  popular: { sold: -1 },
  newest: { createdAt: -1 },
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
};

export async function GET(req: NextRequest) {
  await dbConnect();
  const params = req.nextUrl.searchParams;

  const filter: Record<string, unknown> = { active: true };
  const category = params.get("category");
  const scent = params.get("scent");
  const q = params.get("q")?.trim();

  if (category && (CATEGORIES as readonly string[]).includes(category)) {
    filter.category = category;
  }
  if (scent && (SCENTS as readonly string[]).includes(scent)) {
    filter.scents = scent;
  }
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { category: { $regex: q, $options: "i" } },
    ];
  }

  const sort = SORTS[params.get("sort") ?? "popular"] ?? SORTS.popular;
  const products = await Product.find(filter).sort(sort).lean();
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
