import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (session?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await dbConnect();

  const customers = await User.find({ role: "customer" })
    .select("name email createdAt")
    .sort({ createdAt: -1 })
    .lean();

  const stats = await Order.aggregate([
    {
      $group: {
        _id: "$user",
        orderCount: { $sum: 1 },
        totalSpent: {
          $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$total", 0] },
        },
      },
    },
  ]);
  const statsByUser = new Map(stats.map((s) => [s._id.toString(), s]));

  return NextResponse.json({
    customers: customers.map((c) => ({
      ...c,
      orderCount: statsByUser.get(c._id.toString())?.orderCount ?? 0,
      totalSpent: statsByUser.get(c._id.toString())?.totalSpent ?? 0,
    })),
  });
}
