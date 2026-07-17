// Seeds Postgres (Supabase) with the Ethereal Artisan catalogue and an admin user.
// The catalogue itself lives in src/data/catalogue.json, which is also what the
// storefront serves in demo mode (no database) — one source of truth.
// Run: npm run seed
import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/index.js";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@etherealartisan.in";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL is not set. Add it to .env.local — the app runs in demo mode without it."
  );
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const catalogue = JSON.parse(
  readFileSync(new URL("../src/data/catalogue.json", import.meta.url), "utf8")
);

async function seed() {
  // Upsert by slug so re-seeding doesn't orphan order_items that reference a
  // product (a plain deleteMany would violate the FK on any existing order).
  for (const p of catalogue) {
    const { _id, createdAt, ...data } = p;
    await prisma.product.upsert({
      where: { slug: data.slug },
      update: data,
      create: data,
    });
  }
  console.log(`✓ Seeded ${catalogue.length} products`);

  // Retire anything in the DB that's no longer in the price list, rather than
  // deleting it — past orders must keep resolving their product rows.
  const slugs = catalogue.map((p) => p.slug);
  const { count } = await prisma.product.updateMany({
    where: { slug: { notIn: slugs }, active: true },
    data: { active: false },
  });
  if (count > 0) console.log(`✓ Retired ${count} product(s) no longer in the price list`);

  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (existing) {
    console.log(`✓ Admin user already exists: ${ADMIN_EMAIL}`);
  } else {
    await prisma.user.create({
      data: {
        name: "Store Owner",
        email: ADMIN_EMAIL,
        passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
        role: "admin",
      },
    });
    console.log(`✓ Admin user created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  }
}

seed()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Done.");
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
