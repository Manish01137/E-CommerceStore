import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { toAddressDTO } from "@/lib/map";
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

  const addresses = await prisma.address.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ addresses: addresses.map(toAddressDTO) });
}

export async function POST(req: NextRequest) {
  if (!DB_ENABLED) {
    return NextResponse.json({ error: DEMO_MESSAGE }, { status: 503 });
  }
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid address" },
      { status: 400 }
    );
  }

  await prisma.address.create({
    data: { ...parsed.data, userId: session.userId },
  });

  const addresses = await prisma.address.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ addresses: addresses.map(toAddressDTO) }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  if (!DB_ENABLED) {
    return NextResponse.json({ error: DEMO_MESSAGE }, { status: 503 });
  }
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const addressId = req.nextUrl.searchParams.get("id");
  if (!addressId) return NextResponse.json({ error: "Missing address id" }, { status: 400 });

  // Scope the delete to the session user — an id alone must not be enough.
  await prisma.address.deleteMany({
    where: { id: addressId, userId: session.userId },
  });

  const addresses = await prisma.address.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ addresses: addresses.map(toAddressDTO) });
}
