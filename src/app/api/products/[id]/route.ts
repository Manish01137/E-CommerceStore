import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isUuid } from "@/lib/format";
import { toProductDTO } from "@/lib/map";
import { CATEGORIES } from "@/lib/types";
import { DB_ENABLED, DEMO_MESSAGE } from "@/lib/demo";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  if (!DB_ENABLED) {
    return NextResponse.json({ error: DEMO_MESSAGE }, { status: 503 });
  }
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product: toProductDTO(product) });
}

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  category: z.enum(CATEGORIES).optional(),
  size: z.string().optional(),
  scents: z.array(z.string().min(1)).min(1).optional(),
  description: z.string().min(10).optional(),
  ingredients: z.string().optional(),
  price: z.number().int().positive().optional(),
  compareAtPrice: z.number().int().positive().nullable().optional(),
  images: z.array(z.string()).optional(),
  stock: z.number().int().min(0).optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: Params) {
  if (!DB_ENABLED) {
    return NextResponse.json({ error: DEMO_MESSAGE }, { status: 503 });
  }
  const session = await getSession();
  if (session?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid product data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const product = await prisma.product.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ product: toProductDTO(product) });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!DB_ENABLED) {
    return NextResponse.json({ error: DEMO_MESSAGE }, { status: 503 });
  }
  const session = await getSession();
  if (session?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await prisma.product.findUnique({
    where: { id },
    include: { _count: { select: { orderItems: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Past orders reference this product, so a hard delete would break their
  // history (and violate the FK). Retire it from the store instead.
  if (existing._count.orderItems > 0) {
    await prisma.product.update({ where: { id }, data: { active: false } });
    return NextResponse.json({
      ok: true,
      retired: true,
      message:
        "This product appears in past orders, so it was hidden from the store rather than deleted.",
    });
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true, retired: false });
}
