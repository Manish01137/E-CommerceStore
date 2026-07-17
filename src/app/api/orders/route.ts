import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { toOrderDTO } from "@/lib/map";
import { isRazorpayConfigured, createRazorpayOrder } from "@/lib/razorpay";
import { DB_ENABLED, DEMO_MESSAGE } from "@/lib/demo";

const SHIPPING_FEE = 79;
const FREE_SHIPPING_ABOVE = 999;

const orderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        scent: z.string(),
        quantity: z.number().int().min(1).max(50),
      })
    )
    .min(1, "Your cart is empty"),
  address: z.object({
    fullName: z.string().min(2, "Enter the recipient's full name"),
    phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
    email: z.string().email("Enter a valid email"),
    line1: z.string().min(5, "Enter the street address"),
    line2: z.string().optional().default(""),
    city: z.string().min(2, "Enter the city"),
    state: z.string().min(2, "Enter the state"),
    pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit PIN code"),
  }),
});

function generateOrderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `EA-${stamp}${rand}`;
}

export async function POST(req: NextRequest) {
  if (!DB_ENABLED) {
    return NextResponse.json({ error: DEMO_MESSAGE }, { status: 503 });
  }
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please sign in to place an order" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid order" },
      { status: 400 }
    );
  }

  const { items, address } = parsed.data;

  // Recompute everything server-side — never trust client prices.
  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, active: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const orderItems = [];
  for (const item of items) {
    const product = byId.get(item.productId);
    if (!product) {
      return NextResponse.json(
        { error: "One of the items in your cart is no longer available" },
        { status: 409 }
      );
    }
    if (product.stock < item.quantity) {
      return NextResponse.json(
        { error: `Only ${product.stock} of "${product.name}" left in stock` },
        { status: 409 }
      );
    }
    orderItems.push({
      productId: product.id,
      name: product.name,
      scent: item.scent,
      price: product.price,
      quantity: item.quantity,
      image: product.images[0] ?? "",
    });
  }

  const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingFee = subtotal >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;
  const total = subtotal + shippingFee;

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: session.userId,
      subtotal,
      shippingFee,
      total,
      shipFullName: address.fullName,
      shipPhone: address.phone,
      shipEmail: address.email,
      shipLine1: address.line1,
      shipLine2: address.line2,
      shipCity: address.city,
      shipState: address.state,
      shipPincode: address.pincode,
      status: "placed",
      paymentStatus: "pending",
      paymentMethod: isRazorpayConfigured() ? "razorpay" : "mock",
      items: { create: orderItems },
    },
  });

  if (isRazorpayConfigured()) {
    const rzpOrder = await createRazorpayOrder(total, order.orderNumber);
    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: rzpOrder.id },
    });
    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      total,
      payment: {
        provider: "razorpay",
        razorpayOrderId: rzpOrder.id,
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
        amount: Math.round(total * 100),
        currency: "INR",
      },
    });
  }

  // No gateway keys configured — dev/test mock flow
  return NextResponse.json({
    orderId: order.id,
    orderNumber: order.orderNumber,
    total,
    payment: { provider: "mock" },
  });
}

export async function GET() {
  if (!DB_ENABLED) {
    return NextResponse.json({ error: DEMO_MESSAGE }, { status: 503 });
  }
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ orders: orders.map(toOrderDTO) });
}
