import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isUuid } from "@/lib/format";
import { DB_ENABLED, DEMO_MESSAGE } from "@/lib/demo";

type Params = { params: Promise<{ id: string }> };

/** Admins moderate any review; customers may delete their own. */
export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!DB_ENABLED) {
    return NextResponse.json({ error: DEMO_MESSAGE }, { status: 503 });
  }
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { count } = await prisma.review.deleteMany({
    where: {
      id,
      ...(session.role === "admin" ? {} : { userId: session.userId }),
    },
  });
  if (count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
