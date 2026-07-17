import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isUuid } from "@/lib/format";
import { toEnquiryDTO } from "@/lib/map";
import { ENQUIRY_STATUSES } from "@/lib/types";
import { DB_ENABLED, DEMO_MESSAGE } from "@/lib/demo";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({ status: z.enum(ENQUIRY_STATUSES) });

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!DB_ENABLED) {
    return NextResponse.json({ error: DEMO_MESSAGE }, { status: 503 });
  }
  const session = await getSession();
  if (session?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const existing = await prisma.enquiry.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const enquiry = await prisma.enquiry.update({
    where: { id },
    data: { status: parsed.data.status },
  });
  return NextResponse.json({ enquiry: toEnquiryDTO(enquiry) });
}
