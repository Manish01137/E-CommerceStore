import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
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

  const customers = await prisma.user.findMany({
    where: { role: "customer" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      orders: {
        select: { total: true, paymentStatus: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    customers: customers.map((c) => ({
      _id: c.id,
      name: c.name,
      email: c.email,
      createdAt: c.createdAt.toISOString(),
      orderCount: c.orders.length,
      totalSpent: c.orders
        .filter((o) => o.paymentStatus === "paid")
        .reduce((sum, o) => sum + o.total, 0),
    })),
  });
}
