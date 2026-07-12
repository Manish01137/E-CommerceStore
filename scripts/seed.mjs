// Seeds the database with the product catalogue and an admin user.
// Run: npm run seed
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/terra-botanica";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@terrabotanica.in";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

const productSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const userSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const Product = mongoose.model("Product", productSchema);
const User = mongoose.model("User", userSchema);

const img = (slug) => [`/products/${slug}.svg`];

const products = [
  {
    name: "Lavender Dream Body Lotion",
    slug: "lavender-dream-body-lotion",
    category: "Body Lotion",
    scents: ["Lavender"],
    price: 649,
    compareAtPrice: 749,
    stock: 42,
    featured: true,
    sold: 186,
    description:
      "A featherlight daily lotion steeped in steam-distilled lavender from high-altitude farms. Shea butter and cold-pressed sweet almond oil sink in without residue, leaving skin calm, soft and faintly floral until evening.",
    ingredients:
      "Aqua, shea butter, sweet almond oil, lavender essential oil, glycerin, oat extract, vitamin E.",
  },
  {
    name: "Rose Petal Silk Body Lotion",
    slug: "rose-petal-silk-body-lotion",
    category: "Body Lotion",
    scents: ["Rose"],
    price: 679,
    stock: 35,
    featured: false,
    sold: 142,
    description:
      "Damask rose hydrosol folded into a silken emulsion of kokum butter and jojoba. A romantic, tea-like rose that stays close to the skin — never perfumey.",
    ingredients:
      "Rose hydrosol, kokum butter, jojoba oil, rose absolute, glycerin, aloe vera, vitamin E.",
  },
  {
    name: "Botanical Whipped Body Lotion",
    slug: "botanical-whipped-body-lotion",
    category: "Body Lotion",
    scents: ["Jasmine", "Sandalwood", "Citrus"],
    price: 699,
    stock: 58,
    featured: true,
    sold: 210,
    description:
      "Our signature whipped lotion, aerated for a cloud-like texture that melts on contact. Choose your mood — heady jasmine, grounding sandalwood, or bright citrus.",
    ingredients:
      "Aqua, mango butter, apricot kernel oil, botanical essential oil blend, glycerin, calendula extract.",
  },
  {
    name: "Sandalwood Saffron Face Cream",
    slug: "sandalwood-saffron-face-cream",
    category: "Face Cream",
    scents: ["Sandalwood"],
    price: 899,
    compareAtPrice: 999,
    stock: 24,
    featured: true,
    sold: 168,
    description:
      "An heirloom-inspired night cream of Mysore sandalwood and hand-picked saffron threads macerated in almond oil. Rich yet breathable, it evens tone and lends a quiet, woody warmth.",
    ingredients:
      "Almond oil, sandalwood hydrosol & oil, saffron extract, kokum butter, rice bran oil, vitamin E.",
  },
  {
    name: "Jasmine Night Repair Face Cream",
    slug: "jasmine-night-repair-face-cream",
    category: "Face Cream",
    scents: ["Jasmine"],
    price: 949,
    stock: 19,
    featured: false,
    sold: 96,
    description:
      "Night-blooming jasmine sambac in a restorative base of hemp seed and evening primrose oils. Wake to plump, rested skin scented like a courtyard at dusk.",
    ingredients:
      "Jasmine sambac extract, hemp seed oil, evening primrose oil, shea butter, squalane, niacinamide.",
  },
  {
    name: "Rose Hydra-Glow Face Cream",
    slug: "rose-hydra-glow-face-cream",
    category: "Face Cream",
    scents: ["Rose"],
    price: 849,
    stock: 31,
    featured: false,
    sold: 124,
    description:
      "A gel-cream of rose water, hyaluronic acid and pomegranate seed oil for a dewy, lit-from-within finish. Light enough for mornings, kind enough for sensitive skin.",
    ingredients:
      "Rose water, hyaluronic acid, pomegranate seed oil, aloe vera, glycerin, rose absolute.",
  },
  {
    name: "Lavender Himalayan Bath Salt",
    slug: "lavender-himalayan-bath-salt",
    category: "Bath Salt",
    scents: ["Lavender"],
    price: 499,
    stock: 64,
    featured: true,
    sold: 232,
    description:
      "Pink Himalayan salt crystals tumbled with dried lavender buds and a generous pour of essential oil. Twenty minutes in a warm tub and the day dissolves.",
    ingredients:
      "Himalayan pink salt, Epsom salt, dried lavender buds, lavender essential oil, jojoba oil.",
  },
  {
    name: "Citrus Grove Bath Salt",
    slug: "citrus-grove-bath-salt",
    category: "Bath Salt",
    scents: ["Citrus"],
    price: 479,
    stock: 48,
    featured: false,
    sold: 118,
    description:
      "Sun-dried orange peel, lemongrass and grapefruit oil in a mineral-rich sea salt base. A morning bath that works like a double espresso.",
    ingredients:
      "Sea salt, Epsom salt, orange peel, grapefruit & lemongrass essential oils, sunflower oil.",
  },
  {
    name: "Rose Multani Mitti Clay",
    slug: "rose-multani-mitti-clay",
    category: "Clay",
    scents: ["Rose"],
    price: 399,
    stock: 52,
    featured: false,
    sold: 154,
    description:
      "Fuller's earth from Multan blended with sun-dried rose petals, ground fine. Mix with rose water for a weekly mask that lifts oil and heat from the skin.",
    ingredients: "Multani mitti (fuller's earth), rose petal powder, kaolin clay.",
  },
  {
    name: "Sandalwood Vetiver Clay",
    slug: "sandalwood-vetiver-clay",
    category: "Clay",
    scents: ["Sandalwood"],
    price: 449,
    stock: 38,
    featured: false,
    sold: 87,
    description:
      "A grounding mask of rhassoul clay, sandalwood powder and cooling vetiver root. Draws out congestion while the woody aroma slows your breathing.",
    ingredients: "Rhassoul clay, sandalwood powder, vetiver root powder, kaolin clay.",
  },
  {
    name: "Coffee Walnut Body Scrub",
    slug: "coffee-walnut-body-scrub",
    category: "Scrub",
    scents: ["Sandalwood"],
    price: 549,
    stock: 44,
    featured: true,
    sold: 198,
    description:
      "Single-origin coffee grounds and crushed walnut shell suspended in raw cane sugar and coconut oil. Buffs away rough patches; the sandalwood dry-down lingers.",
    ingredients:
      "Coffee grounds, walnut shell powder, cane sugar, coconut oil, sandalwood oil, vitamin E.",
  },
  {
    name: "Citrus Sugar Glow Scrub",
    slug: "citrus-sugar-glow-scrub",
    category: "Scrub",
    scents: ["Citrus"],
    price: 529,
    stock: 40,
    featured: false,
    sold: 133,
    description:
      "Fine demerara sugar, sweet orange oil and a whisper of turmeric for a scrub that polishes without scratching. Skin drinks the glow.",
    ingredients:
      "Demerara sugar, sweet orange essential oil, turmeric extract, sesame oil, honey.",
  },
  {
    name: "Lavender Oat Milk Soap",
    slug: "lavender-oat-milk-soap",
    category: "Soap",
    scents: ["Lavender"],
    price: 249,
    stock: 90,
    featured: false,
    sold: 316,
    description:
      "Cold-processed and cured for six weeks — creamy oat milk, colloidal oats and lavender oil in a bar gentle enough for the whole family.",
    ingredients:
      "Saponified oils of coconut & olive, oat milk, colloidal oatmeal, lavender essential oil.",
  },
  {
    name: "Jasmine Honey Soap",
    slug: "jasmine-honey-soap",
    category: "Soap",
    scents: ["Jasmine"],
    price: 259,
    stock: 76,
    featured: true,
    sold: 271,
    description:
      "Raw forest honey and jasmine absolute in a golden, slow-cured bar. A dense, conditioning lather that leaves a faint floral veil.",
    ingredients:
      "Saponified oils of coconut, castor & olive, raw honey, jasmine absolute, beeswax.",
  },
  {
    name: "Sandalwood Turmeric Soap",
    slug: "sandalwood-turmeric-soap",
    category: "Soap",
    scents: ["Sandalwood"],
    price: 269,
    stock: 68,
    featured: false,
    sold: 244,
    description:
      "The classic ubtan pairing, pressed into a bar — sandalwood powder and wild turmeric brighten while cold-pressed sesame oil nourishes.",
    ingredients:
      "Saponified oils of sesame & coconut, sandalwood powder, wild turmeric, sandalwood oil.",
  },
  {
    name: "Rose Geranium Soap",
    slug: "rose-geranium-soap",
    category: "Soap",
    scents: ["Rose"],
    price: 249,
    stock: 82,
    featured: false,
    sold: 187,
    description:
      "Rose geranium leaf and French pink clay swirled through a creamy olive oil base. Balances both oily and dry patches — our most-gifted bar.",
    ingredients:
      "Saponified olive & coconut oils, rose geranium essential oil, French pink clay, glycerin.",
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log(`Connected to ${MONGODB_URI}`);

  await Product.deleteMany({});
  await Product.insertMany(products.map((p) => ({ ...p, images: img(p.slug), active: true })));
  console.log(`✓ Seeded ${products.length} products`);

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
