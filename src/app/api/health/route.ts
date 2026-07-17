import { NextResponse } from "next/server";
import { DB_ENABLED } from "@/lib/demo";

export const dynamic = "force-dynamic";

/** Strip credentials out of anything that might contain a connection string. */
function redact(text: string): string {
  return text
    .replace(/:\/\/([^:@/\s]+):([^@/\s]+)@/g, "://$1:•••@")
    .slice(0, 500);
}

/**
 * Deployment health check. Reports whether the database is configured and
 * reachable, with any error sanitised — never the connection string itself.
 */
export async function GET() {
  if (!DB_ENABLED) {
    return NextResponse.json({
      ok: true,
      mode: "demo",
      db: "not configured — storefront serves the static catalogue",
    });
  }

  const host = (() => {
    try {
      return new URL(process.env.DATABASE_URL!).hostname;
    } catch {
      return "UNPARSEABLE DATABASE_URL";
    }
  })();

  try {
    const { prisma } = await import("@/lib/db");
    const started = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const products = await prisma.product.count();
    return NextResponse.json({
      ok: true,
      mode: "database",
      host,
      latencyMs: Date.now() - started,
      products,
    });
  } catch (err) {
    const e = err as Error & { code?: string; cause?: { message?: string } };
    return NextResponse.json(
      {
        ok: false,
        mode: "database",
        host,
        errorName: e.name,
        errorCode: e.code ?? null,
        error: redact(e.message ?? String(err)),
        cause: e.cause?.message ? redact(e.cause.message) : null,
      },
      { status: 503 }
    );
  }
}
