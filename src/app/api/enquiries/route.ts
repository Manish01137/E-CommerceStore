import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { toEnquiryDTO } from "@/lib/map";
import { DB_ENABLED, DEMO_MESSAGE } from "@/lib/demo";

const enquirySchema = z.object({
  name: z.string().min(2, "Enter your name"),
  company: z.string().min(2, "Enter your company name"),
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
    .or(z.literal(""))
    .optional()
    .default(""),
  quantity: z.string().min(1, "Tell us the quantity you're interested in"),
  message: z.string().min(10, "Tell us a little more about your requirement"),
});

export async function POST(req: NextRequest) {
  if (!DB_ENABLED) {
    return NextResponse.json({ error: DEMO_MESSAGE }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid enquiry" },
      { status: 400 }
    );
  }

  const enquiry = await prisma.enquiry.create({
    data: { ...parsed.data, email: parsed.data.email.toLowerCase().trim() },
  });
  return NextResponse.json({ ok: true, id: enquiry.id }, { status: 201 });
}

export async function GET() {
  if (!DB_ENABLED) {
    return NextResponse.json({ error: DEMO_MESSAGE }, { status: 503 });
  }
  const session = await getSession();
  if (session?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const enquiries = await prisma.enquiry.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ enquiries: enquiries.map(toEnquiryDTO) });
}
