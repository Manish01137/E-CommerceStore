import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (session?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await dbConnect();
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .populate("user", "name email")
    .lean();
  return NextResponse.json({ orders });
}
