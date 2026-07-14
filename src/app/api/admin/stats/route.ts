import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";
import Enquiry from "@/models/Enquiry";
import { getSession } from "@/lib/auth";
import { DB_ENABLED, DEMO_MESSAGE } from "@/lib/demo";

export async function GET() {
  if (!DB_ENABLED) {
    return NextResponse.json({ error: DEMO_MESSAGE }, { status: 503 });
  }
  const session = await getSession();
  if (session?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await dbConnect();

  const [revenueAgg, orderCount, paidCount, customerCount, productCount, lowStock, newEnquiries, recentOrders] =
    await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.countDocuments(),
      Order.countDocuments({ paymentStatus: "paid" }),
      User.countDocuments({ role: "customer" }),
      Product.countDocuments({ active: true }),
      Product.countDocuments({ active: true, stock: { $lte: 5 } }),
      Enquiry.countDocuments({ status: "new" }),
      Order.find().sort({ createdAt: -1 }).limit(6).populate("user", "name email").lean(),
    ]);

  return NextResponse.json({
    revenue: revenueAgg[0]?.total ?? 0,
    orderCount,
    paidCount,
    customerCount,
    productCount,
    lowStock,
    newEnquiries,
    recentOrders,
  });
}
