import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isUuid } from "@/lib/format";
import { toOrderDTO } from "@/lib/map";
import { ORDER_STATUSES } from "@/lib/types";
import { DB_ENABLED, DEMO_MESSAGE } from "@/lib/demo";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({ status: z.enum(ORDER_STATUSES) });

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
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const order = await prisma.order.update({
    where: { id },
    data: { status: parsed.data.status },
    include: {
      items: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });
  return NextResponse.json({ order: toOrderDTO(order) });
}
