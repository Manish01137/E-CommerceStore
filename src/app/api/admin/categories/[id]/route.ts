import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { slugify, isUuid } from "@/lib/format";
import { DB_ENABLED, DEMO_MESSAGE } from "@/lib/demo";

type Params = { params: Promise<{ id: string }> };

const renameSchema = z.object({
  name: z.string().trim().min(2, "Category name is too short").max(60),
});

/**
 * Renaming updates the Category row and every product currently filed under
 * the old name in one transaction — Product.category is a plain string, so
 * without this cascade a rename would silently orphan existing products
 * under a name that no longer appears anywhere in the admin category list.
 */
export async function PATCH(req: NextRequest, { params }: Params) {
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
  const parsed = renameSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid name" },
      { status: 400 }
    );
  }

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const newName = parsed.data.name;
  if (newName === existing.name) {
    return NextResponse.json({ category: existing });
  }

  const clash = await prisma.category.findFirst({
    where: { id: { not: id }, name: { equals: newName, mode: "insensitive" } },
  });
  if (clash) {
    return NextResponse.json({ error: "That category already exists" }, { status: 409 });
  }

  const [category] = await prisma.$transaction([
    prisma.category.update({
      where: { id },
      data: { name: newName, slug: slugify(newName) },
    }),
    prisma.product.updateMany({
      where: { category: existing.name },
      data: { category: newName },
    }),
  ]);

  return NextResponse.json({ category });
}

/** Refused if any product still uses this category — reassign them first. */
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

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const productCount = await prisma.product.count({ where: { category: existing.name } });
  if (productCount > 0) {
    return NextResponse.json(
      {
        error: `${productCount} product${productCount === 1 ? "" : "s"} still use${
          productCount === 1 ? "s" : ""
        } "${existing.name}" — move them to another category first.`,
      },
      { status: 409 }
    );
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
