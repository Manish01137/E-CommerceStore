import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { toOrderDTO } from "@/lib/map";
import { DB_ENABLED, DEMO_MESSAGE } from "@/lib/demo";

export async function GET() {
  if (!DB_ENABLED) {
    return NextResponse.json({ error: DEMO_MESSAGE }, { status: 503 });
  }
  const session = await getSession();
  if (session?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    revenue,
    orderCount,
    paidCount,
    customerCount,
    productCount,
    lowStock,
    newEnquiries,
    recentOrders,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { paymentStatus: "paid" },
      _sum: { total: true },
    }),
    prisma.order.count(),
    prisma.order.count({ where: { paymentStatus: "paid" } }),
    prisma.user.count({ where: { role: "customer" } }),
    prisma.product.count({ where: { active: true } }),
    prisma.product.count({ where: { active: true, stock: { lte: 5 } } }),
    prisma.enquiry.count({ where: { status: "new" } }),
    prisma.order.findMany({
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  return NextResponse.json({
    revenue: revenue._sum.total ?? 0,
    orderCount,
    paidCount,
    customerCount,
    productCount,
    lowStock,
    newEnquiries,
    recentOrders: recentOrders.map(toOrderDTO),
  });
}
