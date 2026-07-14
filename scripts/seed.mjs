// Seeds the database with the Ethereal Artisan catalogue and an admin user.
// The catalogue itself lives in src/data/catalogue.json, which is also what the
// storefront serves in demo mode (no database) — one source of truth.
// Run: npm run seed
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@etherealartisan.in";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

if (!MONGODB_URI) {
  console.error(
    "MONGODB_URI is not set. Add it to .env.local (the app runs in demo mode without it)."
  );
  process.exit(1);
}

const productSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const userSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const Product = mongoose.model("Product", productSchema);
const User = mongoose.model("User", userSchema);

const catalogue = JSON.parse(
  readFileSync(new URL("../src/data/catalogue.json", import.meta.url), "utf8")
);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log(`Connected to ${MONGODB_URI}`);

  await Product.deleteMany({});
  // Strip the demo-only ids — Mongo assigns its own _id
  await Product.insertMany(
    catalogue.map(({ _id, createdAt, ...p }) => ({ ...p, active: true }))
  );
  console.log(`✓ Seeded ${catalogue.length} products`);

  const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
  if (!existingAdmin) {
    await User.create({
      name: "Store Owner",
      email: ADMIN_EMAIL,
      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
      role: "admin",
      addresses: [],
    });
    console.log(`✓ Admin user created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } else {
    console.log(`✓ Admin user already exists: ${ADMIN_EMAIL}`);
  }

  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
