import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isRazorpayConfigured } from "@/lib/razorpay";
import { fulfilPaidOrder, markPaymentFailed } from "@/lib/fulfil";
import { DB_ENABLED, DEMO_MESSAGE } from "@/lib/demo";

const mockSchema = z.object({
  orderId: z.string(),
  outcome: z.enum(["success", "failure"]),
});

/**
 * Development-only payment simulator, active ONLY when no Razorpay keys are
 * configured. Lets the full checkout → fulfilment flow run locally.
 */
export async function POST(req: NextRequest) {
  if (!DB_ENABLED) {
    return NextResponse.json({ error: DEMO_MESSAGE }, { status: 503 });
  }
  if (isRazorpayConfigured()) {
    return NextResponse.json(
      { error: "Mock payments are disabled when Razorpay is configured" },
      { status: 403 }
    );
  }
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = mockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { id: parsed.data.orderId, userId: session.userId },
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.paymentStatus === "paid") {
    return NextResponse.json({ ok: true, orderNumber: order.orderNumber });
  }

  if (parsed.data.outcome === "failure") {
    await markPaymentFailed(order.id);
    return NextResponse.json({ error: "Payment failed (simulated)" }, { status: 402 });
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { razorpayPaymentId: `mock_${Date.now()}` },
  });
  await fulfilPaidOrder(order.id);
  return NextResponse.json({ ok: true, orderNumber: order.orderNumber });
}
