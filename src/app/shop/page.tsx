import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getBy } from "@/lib/products";
import Reveal, { Stagger, StaggerItem } from "@/components/motion/Reveal";
import ProductCard from "@/components/product/ProductCard";
import Testimonials from "@/components/shop/Testimonials";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Shop Ethereal Artisan's organic bath & body collection — delivered fresh, made in small batches.",
};

const CATEGORY_TILES = [
  { name: "Soap", blurb: "Hand-poured artisan bars" },
  { name: "Face Wash", blurb: "Amino-acid cleansers" },
  { name: "Bath Salt", blurb: "Mineral-rich soaks" },
  { name: "Face Pack", blurb: "Clay & botanical masks" },
  { name: "Travel Kit", blurb: "Rituals, cabin-sized" },
];

export default async function ShopPage() {
  const [bestsellers, newest] = await Promise.all([
    getBy("popular", 4),
    getBy("newest", 4),
  ]);

  return (
    <div>
      {/* Intro banner */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/banners/banner-craft.jpg"
            alt="Hand-poured soap bars set with dried rose petals"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-earth-deep/85 via-earth-deep/55 to-earth-deep/20" />
        </div>
        <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
          <Reveal className="max-w-2xl">
            <p className="eyebrow text-sand-light">The Storefront</p>
            <h1 className="mt-4 text-hero-sm text-almond-light md:text-hero">
              Everyday rituals, delivered.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-almond-light/85">
              Every order is poured, cured and packed by hand — so what reaches
              you is as alive as the day we made it.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Category tiles */}
      <section className="bg-almond pb-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Stagger className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
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
