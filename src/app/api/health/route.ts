import { NextResponse } from "next/server";
import { DB_ENABLED } from "@/lib/demo";
import { databaseUrl } from "@/lib/env";

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
      return new URL(databaseUrl()!).hostname;
    } catch {
      return "UNPARSEABLE DATABASE_URL";
    }
  })();

  /**
   * When the URL won't parse, describe its SHAPE without leaking a single
   * character of the secret — enough to tell a truncated paste from quotes
   * from a key=value paste from placeholder text.
   */
  const raw = process.env.DATABASE_URL ?? "";
  const shape = {
    length: raw.length,
    startsWithPostgres: /^["'\s]*postgres(ql)?:\/\//.test(raw),
    containsNewline: /[\r\n]/.test(raw),
    containsSpace: / /.test(raw),
    containsQuote: /["']/.test(raw),
    containsKeyEquals: /^[A-Z_]+=/.test(raw.trim()),
    atSigns: (raw.match(/@/g) ?? []).length,
    containsPlaceholder: /\[|\]|PASSWORD|<|>/.test(raw),
    endsWithPgbouncer: /pgbouncer=true["'\s]*$/.test(raw),
  };

  try {
    const { prisma } = await import("@/lib/db");
    const started = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const products = await prisma.product.count();
    return NextResponse.json({
      ok: true,
      mode: "database",
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
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
        commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
        host,
        urlShape: shape,
        errorName: e.name,
        errorCode: e.code ?? null,
        error: redact(e.message ?? String(err)),
        cause: e.cause?.message ? redact(e.cause.message) : null,
      },
      { status: 503 }
    );
  }
}
