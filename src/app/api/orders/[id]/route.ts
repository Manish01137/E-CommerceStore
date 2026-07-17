import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { toOrderDTO } from "@/lib/map";
import { isUuid } from "@/lib/format";
import { trackShipment } from "@/lib/shiprocket";
import { DB_ENABLED, DEMO_MESSAGE } from "@/lib/demo";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  if (!DB_ENABLED) {
    return NextResponse.json({ error: DEMO_MESSAGE }, { status: 503 });
  }
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const order = await prisma.order.findFirst({
    where: {
      id,
      // Admins can view any order; customers only their own.
      ...(session.role === "admin" ? {} : { userId: session.userId }),
    },
    include: { items: true },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Live tracking when requested and a shipment exists
  let tracking = null;
  if (req.nextUrl.searchParams.get("track") === "1" && order.shiprocketShipmentId) {
    tracking = await trackShipment(order.shiprocketShipmentId);
  }

  return NextResponse.json({ order: toOrderDTO(order), tracking });
}
