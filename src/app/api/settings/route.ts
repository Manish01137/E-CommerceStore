import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getShippingSettings, DEFAULT_SHIPPING } from "@/lib/settings";
import { DB_ENABLED } from "@/lib/demo";

/**
 * GET is public and unauthenticated on purpose — checkout needs the current
 * delivery fee before a customer signs in, same as browsing prices.
 */
export async function GET() {
  if (!DB_ENABLED) {
    return NextResponse.json(DEFAULT_SHIPPING);
  }
  const settings = await getShippingSettings();
  return NextResponse.json(settings);
}

const settingsSchema = z.object({
  shippingFee: z.number().int().min(0).max(100_000),
  // Empty string / null from the admin form means "no free-shipping tier".
  freeShippingAbove: z.number().int().min(0).max(10_000_000).nullable(),
});

export async function PUT(req: NextRequest) {
  if (!DB_ENABLED) {
    return NextResponse.json(
      { error: "Connect a database to change delivery settings." },
      { status: 503 }
    );
  }
  const session = await getSession();
  if (session?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid delivery settings" },
      { status: 400 }
    );
  }

  const row = await prisma.settings.upsert({
    where: { id: "main" },
    update: parsed.data,
    create: { id: "main", ...parsed.data },
  });

  return NextResponse.json({
    shippingFee: row.shippingFee,
    freeShippingAbove: row.freeShippingAbove,
  });
}
