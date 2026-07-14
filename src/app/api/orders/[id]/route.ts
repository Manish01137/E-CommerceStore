import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";
import { getSession } from "@/lib/auth";
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

  await dbConnect();
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filter: Record<string, unknown> = { _id: id };
  if (session.role !== "admin") filter.user = session.userId;

  const order = await Order.findOne(filter).lean();
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Live tracking when requested and a shipment exists
  let tracking = null;
  if (req.nextUrl.searchParams.get("track") === "1" && order.shiprocket?.shipmentId) {
    tracking = await trackShipment(order.shiprocket.shipmentId);
  }

  return NextResponse.json({ order, tracking });
}
