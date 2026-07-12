import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import Enquiry from "@/models/Enquiry";
import { getSession } from "@/lib/auth";

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
  await dbConnect();
  const body = await req.json().catch(() => null);
  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid enquiry" },
      { status: 400 }
    );
  }

  const enquiry = await Enquiry.create(parsed.data);
  return NextResponse.json(
    { ok: true, id: enquiry._id.toString() },
    { status: 201 }
  );
}

export async function GET() {
  const session = await getSession();
  if (session?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await dbConnect();
  const enquiries = await Enquiry.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ enquiries });
}
