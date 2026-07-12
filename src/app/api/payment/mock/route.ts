import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";
import { getSession } from "@/lib/auth";
import { isRazorpayConfigured } from "@/lib/razorpay";
import { fulfilPaidOrder, markPaymentFailed } from "@/lib/fulfil";

const mockSchema = z.object({
  orderId: z.string(),
  outcome: z.enum(["success", "failure"]),
});

/**
 * Development-only payment simulator, active ONLY when no Razorpay keys
 * are configured. Lets the full checkout → fulfilment flow run locally.
 */
export async function POST(req: NextRequest) {
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

  await dbConnect();
  const body = await req.json().catch(() => null);
  const parsed = mockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const order = await Order.findOne({ _id: parsed.data.orderId, user: session.userId });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.paymentStatus === "paid") {
    return NextResponse.json({ ok: true, orderNumber: order.orderNumber });
  }

  if (parsed.data.outcome === "failure") {
    await markPaymentFailed(order._id.toString());
    return NextResponse.json({ error: "Payment failed (simulated)" }, { status: 402 });
  }

  order.razorpayPaymentId = `mock_${Date.now()}`;
  await fulfilPaidOrder(order);
  return NextResponse.json({ ok: true, orderNumber: order.orderNumber });
}
