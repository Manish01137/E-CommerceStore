import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Next.js reads .env.local automatically; the Prisma CLI does not.
config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

/**
 * Prisma 7 keeps connection URLs here rather than in schema.prisma.
 *
 * DIRECT_URL is the *direct* (session-mode) connection. Prisma Migrate needs a
 * real session, which Supabase's transaction pooler (port 6543) can't give.
 * The runtime client uses the pooled DATABASE_URL instead; see src/lib/db.ts.
 *
 * `datasource` is only required by commands that touch a database (migrate,
 * db push, studio) — `prisma generate` does not need it. It's attached
 * conditionally because Prisma's `env()` helper THROWS on a missing variable,
 * which would break `postinstall: prisma generate` on any build without the
 * database configured — including preview deploys that run with no backend
 * at all. Migration commands still fail loudly, with a clear message.
 */
const directUrl = process.env.DIRECT_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  ...(directUrl ? { datasource: { url: directUrl } } : {}),
});
