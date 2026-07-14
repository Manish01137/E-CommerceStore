import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";
import { getSession } from "@/lib/auth";
import { isRazorpayConfigured, verifyPaymentSignature } from "@/lib/razorpay";
import { fulfilPaidOrder, markPaymentFailed } from "@/lib/fulfil";
import { DB_ENABLED, DEMO_MESSAGE } from "@/lib/demo";

const verifySchema = z.object({
  orderId: z.string(),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export async function POST(req: NextRequest) {
  if (!DB_ENABLED) {
    return NextResponse.json({ error: DEMO_MESSAGE }, { status: 503 });
  }
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isRazorpayConfigured()) {
    return NextResponse.json({ error: "Payment gateway not configured" }, { status: 503 });
  }

  await dbConnect();
  const body = await req.json().catch(() => null);
  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payment payload" }, { status: 400 });
  }

  const order = await Order.findOne({
    _id: parsed.data.orderId,
    user: session.userId,
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.razorpayOrderId !== parsed.data.razorpay_order_id) {
    return NextResponse.json({ error: "Order mismatch" }, { status: 400 });
  }
  if (order.paymentStatus === "paid") {
    return NextResponse.json({ ok: true, orderNumber: order.orderNumber });
  }

  const valid = verifyPaymentSignature({
    razorpayOrderId: parsed.data.razorpay_order_id,
    razorpayPaymentId: parsed.data.razorpay_payment_id,
    signature: parsed.data.razorpay_signature,
  });

  if (!valid) {
    await markPaymentFailed(order._id.toString());
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
  }

  order.razorpayPaymentId = parsed.data.razorpay_payment_id;
  await fulfilPaidOrder(order);

  return NextResponse.json({ ok: true, orderNumber: order.orderNumber });
}
