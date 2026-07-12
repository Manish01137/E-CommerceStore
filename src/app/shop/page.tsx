import type { Metadata } from "next";
import Link from "next/link";
import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";
import { toJSON, type ProductDTO } from "@/lib/types";
import Reveal, { Stagger, StaggerItem } from "@/components/motion/Reveal";
import ProductCard from "@/components/product/ProductCard";
import Testimonials from "@/components/shop/Testimonials";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Shop Terra Botanica's organic bath & body collection — delivered fresh, made in small batches.",
};

const CATEGORY_TILES = [
  { name: "Body Lotion", blurb: "Silken daily hydration" },
  { name: "Face Cream", blurb: "Botanical skin rituals" },
  { name: "Bath Salt", blurb: "Mineral-rich soaks" },
  { name: "Clay", blurb: "Deep-cleansing masks" },
  { name: "Scrub", blurb: "Gentle renewal" },
  { name: "Soap", blurb: "Slow-cured bars" },
];

export default async function ShopPage() {
  await dbConnect();
  const [bestsellerDocs, newestDocs] = await Promise.all([
    Product.find({ active: true }).sort({ sold: -1 }).limit(4).lean(),
    Product.find({ active: true }).sort({ createdAt: -1 }).limit(4).lean(),
  ]);
  const bestsellers = toJSON<ProductDTO[]>(bestsellerDocs);
  const newest = toJSON<ProductDTO[]>(newestDocs);

  return (
    <div>
      {/* Intro */}
      <section className="bg-almond">
        <div className="mx-auto max-w-7xl px-5 pb-14 pt-14 lg:px-8 lg:pt-20">
          <Reveal className="max-w-2xl">
            <p className="eyebrow text-moss-dark">The Storefront</p>
            <h1 className="mt-4 text-hero-sm md:text-hero">Everyday rituals, delivered.</h1>
            <p className="mt-5 text-lg text-earth">
              Every order is blended, poured and packed within the week — so
              what reaches you is as alive as the garden it came from.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Category tiles */}
      <section className="bg-almond pb-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Stagger className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {CATEGORY_TILES.map((c) => (
              <StaggerItem key={c.name}>
                <Link
                  href={`/products?category=${encodeURIComponent(c.name)}`}
                  className="card card-hover block p-5 text-center"
                >
                  <p className="font-serif text-lg">{c.name}</p>
                  <p className="mt-1 text-xs text-earth">{c.blurb}</p>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="bg-sand/40 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-moss-dark">Bestsellers</p>
              <h2 className="mt-3 text-display">What everyone reaches for</h2>
            </div>
            <Link href="/products?sort=popular" className="nav-link text-sm font-semibold text-moss-deep">
              See all
            </Link>
          </Reveal>
          <Stagger className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {bestsellers.map((p) => (
              <StaggerItem key={p._id}>
                <ProductCard product={p} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* New arrivals */}
      <section className="bg-almond py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-moss-dark">Fresh from the workshop</p>
              <h2 className="mt-3 text-display">New this season</h2>
            </div>
            <Link href="/products?sort=newest" className="nav-link text-sm font-semibold text-moss-deep">
              See all
            </Link>
          </Reveal>
          <Stagger className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {newest.map((p) => (
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
