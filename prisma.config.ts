import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Next.js reads .env.local automatically; the Prisma CLI does not.
config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

/**
 * Prisma 7 keeps connection URLs here rather than in schema.prisma.
 *
 * This URL is used by the CLI (migrate, studio, db push). It must be a
 * DIRECT connection — Prisma Migrate needs a real session, which Supabase's
 * transaction pooler (pgbouncer, port 6543) cannot provide.
 *
 * The runtime client uses the pooled DATABASE_URL instead; see src/lib/db.ts.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),
  },
});
