import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { getSession } from "@/lib/auth";
import { isRazorpayConfigured, createRazorpayOrder } from "@/lib/razorpay";

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
  return `TB-${stamp}${rand}`;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please sign in to place an order" }, { status: 401 });
  }

  await dbConnect();
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
  const products = await Product.find({
    _id: { $in: items.map((i) => i.productId) },
    active: true,
  });
  const byId = new Map(products.map((p) => [p._id.toString(), p]));

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
      product: product._id,
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

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: session.userId,
    items: orderItems,
    subtotal,
    shippingFee,
    total,
    shippingAddress: address,
    status: "placed",
    paymentStatus: "pending",
    paymentMethod: isRazorpayConfigured() ? "razorpay" : "mock",
  });

  if (isRazorpayConfigured()) {
    const rzpOrder = await createRazorpayOrder(total, order.orderNumber);
    order.razorpayOrderId = rzpOrder.id;
    await order.save();
    return NextResponse.json({
      orderId: order._id.toString(),
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
    orderId: order._id.toString(),
    orderNumber: order.orderNumber,
    total,
    payment: { provider: "mock" },
  });
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await dbConnect();
  const orders = await Order.find({ user: session.userId })
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json({ orders });
}
