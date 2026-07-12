import Link from "next/link";
import Image from "next/image";
import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";
import { toJSON, type ProductDTO } from "@/lib/types";
import Reveal, { Stagger, StaggerItem } from "@/components/motion/Reveal";
import ProductCard from "@/components/product/ProductCard";
import HeroBotanical from "@/components/home/HeroBotanical";

export const dynamic = "force-dynamic";

const VALUES = [
  {
    title: "Cold-Pressed Oils",
    body: "Every oil we use is pressed slowly and without heat, so nothing fragile is lost.",
    icon: "M12 3 C 8 8 5 11 5 15 A7 7 0 0 0 19 15 C 19 11 16 8 12 3 Z",
  },
  {
    title: "Small Batches",
    body: "We blend in batches of sixty, never six thousand. Freshness you can smell.",
    icon: "M6 20 L6 10 Q6 7 9 7 L15 7 Q18 7 18 10 L18 20 Z M9 7 L9 4 L15 4 L15 7",
  },
  {
    title: "Cruelty Free",
    body: "Tested on family and friends who volunteered enthusiastically — never on animals.",
    icon: "M12 20 C 7 16 3.5 13 3.5 9.5 A4.5 4.5 0 0 1 12 7 A4.5 4.5 0 0 1 20.5 9.5 C 20.5 13 17 16 12 20 Z",
  },
  {
    title: "Honest Labels",
    body: "If it's in the jar, it's on the label — in words you don't need a chemistry degree for.",
    icon: "M5 4 L19 4 L19 20 L5 20 Z M8 9 H16 M8 13 H16 M8 17 H12",
  },
];

export default async function HomePage() {
  await dbConnect();
  const featuredDocs = await Product.find({ featured: true, active: true })
    .sort({ sold: -1 })
    .limit(4)
    .lean();
  const featured = toJSON<ProductDTO[]>(featuredDocs);

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-almond">
        <HeroBotanical />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 pb-20 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:pb-28 lg:pt-24">
          <div>
            <Reveal>
              <p className="eyebrow text-moss-dark">Organic Bath &amp; Body · Est. 2019</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-5 text-hero-sm md:text-hero">
                The earth already wrote
                <br />
                <em className="text-moss-dark">the recipe.</em>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-earth">
                Terra Botanica began in a farmhouse kitchen in Jaipur, where our
                founder Meera crushed her grandmother&apos;s rose-petal ubtan by
                hand. Six years on, we still make every jar the slow way —
                botanicals, cold-pressed oils, and nothing your skin doesn&apos;t need.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-9 flex flex-wrap gap-4">
                <Link href="/products" className="btn btn-primary">
                  Explore the Collection
                </Link>
                <Link href="/business" className="btn btn-outline">
                  Wholesale Enquiries
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.2} className="hidden lg:block">
            <div className="relative mx-auto grid max-w-md grid-cols-2 gap-4">
              <div className="relative mt-10 aspect-[4/5] overflow-hidden rounded-2xl border border-sand shadow-card">
                <Image src="/products/lavender-dream-body-lotion.svg" alt="Lavender Dream Body Lotion"
                  fill className="object-cover" sizes="220px" priority />
              </div>
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-sand shadow-card">
                <Image src="/products/jasmine-honey-soap.svg" alt="Jasmine Honey Soap"
                  fill className="object-cover" sizes="220px" priority />
              </div>
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-sand shadow-card">
                <Image src="/products/citrus-grove-bath-salt.svg" alt="Citrus Grove Bath Salt"
                  fill className="object-cover" sizes="220px" />
              </div>
              <div className="relative mt-[-2.5rem] aspect-[4/5] overflow-hidden rounded-2xl border border-sand shadow-card">
                <Image src="/products/sandalwood-saffron-face-cream.svg" alt="Sandalwood Saffron Face Cream"
                  fill className="object-cover" sizes="220px" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Philosophy ───────────────────────────────────────── */}
      <section className="bg-sand/40">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
          <Reveal>
            <div className="relative aspect-[5/4] overflow-hidden rounded-3xl border border-sand bg-almond-light shadow-card">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 400 320" className="h-full w-full" aria-hidden>
                  <rect width="400" height="320" fill="#f4ede3" />
                  <circle cx="200" cy="160" r="120" fill="#e3d4c0" />
                  <circle cx="200" cy="160" r="120" fill="none" stroke="#c7af94" strokeWidth="1.5" />
                  <path d="M200 250 C 200 200 200 160 200 80 M200 140 Q 245 125 262 82 M200 180 Q 155 165 140 122 M200 110 Q 230 100 240 74"
                    stroke="#737757" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <ellipse cx="264" cy="78" rx="9" ry="15" fill="#8c916c" transform="rotate(40 264 78)" />
                  <ellipse cx="138" cy="118" rx="9" ry="15" fill="#8c916c" transform="rotate(-40 138 118)" />
                  <ellipse cx="242" cy="70" rx="6" ry="11" fill="#acb087" transform="rotate(30 242 70)" />
                  <text x="200" y="292" textAnchor="middle" fill="#95714f"
                    fontFamily="Georgia, serif" fontSize="15" fontStyle="italic">from soil to skin</text>
                </svg>
              </div>
            </div>
          </Reveal>
          <div>
            <Reveal>
              <p className="eyebrow text-moss-dark">Our Philosophy</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-4 text-display">
                Nothing added that the garden didn&apos;t grow.
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-5 leading-relaxed text-earth">
                We work directly with fourteen small farms across Rajasthan and
                Karnataka — lavender from high fields, jasmine picked before
                sunrise, sandalwood sourced under strict stewardship. Every
                ingredient is traceable to a person and a place.
              </p>
              <p className="mt-4 leading-relaxed text-earth">
                No parabens, no sulphates, no synthetic fragrance. Just recipes
                perfected over generations, made stable and safe by modern
                small-batch craft.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <Link href="/shop" className="btn btn-secondary mt-8">
                Meet the Collection
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Values band ──────────────────────────────────────── */}
      <section className="bg-almond">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <Stagger className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <StaggerItem key={v.title}>
                <div className="flex flex-col items-start gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sage/40 text-moss-deep">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d={v.icon} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <h3 className="font-serif text-lg">{v.title}</h3>
                  <p className="text-sm leading-relaxed text-earth">{v.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── Choose Your Path ─────────────────────────────────── */}
      <section className="bg-moss-deep py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow text-sage-light">Choose Your Path</p>
            <h2 className="mt-4 text-display text-almond-light">
              However you&apos;d like to work with us
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Reveal delay={0.1}>
              <Link
                href="/shop"
                className="group relative flex min-h-72 flex-col justify-end overflow-hidden rounded-3xl bg-almond p-8 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-card-hover lg:p-10"
              >
                <svg className="absolute -right-8 -top-8 h-48 w-48 text-sage/50 transition-transform duration-500 group-hover:rotate-12" viewBox="0 0 100 100" fill="currentColor" aria-hidden>
                  <path d="M50 15 C 60 30 80 35 80 55 A30 30 0 0 1 20 55 C 20 35 40 30 50 15 Z" />
                </svg>
                <p className="eyebrow text-moss-dark">For You</p>
                <h3 className="mt-2 font-serif text-3xl">Shop the Collection</h3>
                <p className="mt-3 max-w-sm text-earth">
                  Lotions, creams, salts, clays, scrubs and soaps — delivered to
                  your door, made the week you order.
                </p>
                <span className="mt-6 inline-flex items-center gap-2 font-semibold text-moss-deep">
                  Start shopping
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden>
                    <path d="M4 12 H20 M14 6 L20 12 L14 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            </Reveal>

            <Reveal delay={0.18}>
              <Link
                href="/business"
                className="group relative flex min-h-72 flex-col justify-end overflow-hidden rounded-3xl bg-sand p-8 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-card-hover lg:p-10"
              >
                <svg className="absolute -right-6 -top-10 h-52 w-52 text-earth/25 transition-transform duration-500 group-hover:-rotate-6" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <rect x="20" y="35" width="60" height="45" rx="4" />
                  <path d="M35 35 V25 A5 5 0 0 1 40 20 H60 A5 5 0 0 1 65 25 V35" />
                </svg>
                <p className="eyebrow text-earth-dark">For Business</p>
                <h3 className="mt-2 font-serif text-3xl">Wholesale &amp; Bulk</h3>
                <p className="mt-3 max-w-sm text-earth-deep">
                  Hotels, boutiques, gifting programmes — private-label and bulk
                  botanicals, crafted to your brief.
                </p>
                <span className="mt-6 inline-flex items-center gap-2 font-semibold text-earth-deep">
                  Enquire to know more
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden>
                    <path d="M4 12 H20 M14 6 L20 12 L14 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Featured products ────────────────────────────────── */}
      <section className="bg-almond py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-moss-dark">Most Loved</p>
              <h2 className="mt-3 text-display">This season&apos;s favourites</h2>
            </div>
            <Link href="/products" className="nav-link text-sm font-semibold text-moss-deep">
              View all products
            </Link>
          </Reveal>

          <Stagger className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {featured.map((p) => (
              <StaggerItem key={p._id}>
                <ProductCard product={p} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </div>
  );
}
