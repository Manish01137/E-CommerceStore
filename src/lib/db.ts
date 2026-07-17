import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma";
import { databaseUrl } from "@/lib/env";

/**
 * Prisma client singleton.
 *
 * Connects through DATABASE_URL — on Supabase that's the transaction pooler
 * (pgbouncer, port 6543), because serverless functions open many short-lived
 * connections and would exhaust a direct pool. Migrations use DIRECT_URL
 * instead; see prisma.config.ts.
 *
 * The global cache stops hot-reload in dev from opening a new pool per edit.
 */
const globalForPrisma = global as typeof globalThis & {
  _prisma?: PrismaClient;
};

function createClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: databaseUrl() });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma: PrismaClient = globalForPrisma._prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma._prisma = prisma;
}

export default prisma;
