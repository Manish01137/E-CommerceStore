import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { signSession, setSessionCookie } from "@/lib/auth";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;
  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  const user = await User.create({
    name,
    email,
    passwordHash: await bcrypt.hash(password, 10),
    role: "customer",
  });

  const token = await signSession({
    userId: user._id.toString(),
    name: user.name,
    email: user.email,
    role: "customer",
  });
  await setSessionCookie(token);

  return NextResponse.json(
    { user: { name: user.name, email: user.email, role: user.role } },
    { status: 201 }
  );
}
