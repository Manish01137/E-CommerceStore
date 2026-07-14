import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getSession } from "@/lib/auth";
import { DB_ENABLED, DEMO_MESSAGE } from "@/lib/demo";

const addressSchema = z.object({
  label: z.string().min(1).default("Home"),
  fullName: z.string().min(2, "Enter the full name"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  line1: z.string().min(5, "Enter the street address"),
  line2: z.string().optional().default(""),
  city: z.string().min(2, "Enter the city"),
  state: z.string().min(2, "Enter the state"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit PIN code"),
});

export async function GET() {
  if (!DB_ENABLED) {
    return NextResponse.json({ error: DEMO_MESSAGE }, { status: 503 });
  }
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const user = await User.findById(session.userId).select("addresses").lean();
  return NextResponse.json({ addresses: user?.addresses ?? [] });
}

export async function POST(req: NextRequest) {
  if (!DB_ENABLED) {
    return NextResponse.json({ error: DEMO_MESSAGE }, { status: 503 });
  }
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const body = await req.json().catch(() => null);
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid address" },
      { status: 400 }
    );
  }

  const user = await User.findByIdAndUpdate(
    session.userId,
    { $push: { addresses: parsed.data } },
    { new: true }
  ).select("addresses");
  return NextResponse.json({ addresses: user?.addresses ?? [] }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  if (!DB_ENABLED) {
    return NextResponse.json({ error: DEMO_MESSAGE }, { status: 503 });
  }
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const addressId = req.nextUrl.searchParams.get("id");
  if (!addressId) return NextResponse.json({ error: "Missing address id" }, { status: 400 });

  const user = await User.findByIdAndUpdate(
    session.userId,
    { $pull: { addresses: { _id: addressId } } },
    { new: true }
  ).select("addresses");
  return NextResponse.json({ addresses: user?.addresses ?? [] });
}
