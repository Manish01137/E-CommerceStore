import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import Order, { ORDER_STATUSES } from "@/models/Order";
import { getSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({ status: z.enum(ORDER_STATUSES) });

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (session?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await dbConnect();
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const order = await Order.findByIdAndUpdate(
    id,
    { status: parsed.data.status },
    { new: true }
  )
    .populate("user", "name email")
    .lean();
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ order });
}
