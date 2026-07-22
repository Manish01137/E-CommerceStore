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

  // Starter reviews — sample content for the owner to curate or replace from
  // the admin side. Only inserted while the reviews table is empty, so real
  // customer reviews are never touched by a re-seed.
  const reviewCount = await prisma.review.count();
  if (reviewCount === 0) {
    const bySlug = async (slug) =>
      (await prisma.product.findUnique({ where: { slug } }))?.id;
    const samples = [
      ["goat-milk-honey-soap", "Aditi Sharma", 5, "Softest my hands have felt", "Creamy lather and my skin doesn't feel tight afterwards. Ordered twice already."],
      ["ocean-mist-body-wash", "Rohan Iyer", 5, "Ocean Mist is addictive", "Sulphate-free but still foams properly. The scent is fresh without being perfumey. Whole family uses it now."],
      ["neem-tulsi-face-wash", "Meghna Pillai", 4, "Calmed my skin", "Breakouts reduced noticeably in two weeks. It doesn't dry me out like my old face wash did."],
      ["pink-rose-flower-soap", "Kavya Nair", 5, "Too pretty to use (I used it)", "Bought as a gift, kept it myself. It smells like a garden and lathers beautifully."],
      ["ubtan-face-pack", "Sneha Kulkarni", 5, "Just like my nani made", "Mixed with rose water, fifteen minutes, and my face genuinely glows. Powder form means it lasts."],
      ["lavender-bath-salt", "Arjun Mehta", 4, "Sunday evening ritual", "The lavender salt turns an ordinary bath into something worth planning the day around."],
    ];
    let created = 0;
    for (const [slug, authorName, rating, title, comment] of samples) {
      const productId = await bySlug(slug);
      if (!productId) continue;
      await prisma.review.create({
        data: { productId, authorName, rating, title, comment },
      });
      created += 1;
    }
    console.log(`✓ Seeded ${created} starter reviews`);
  } else {
    console.log(`✓ Reviews already present (${reviewCount}) — left untouched`);
  }

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
