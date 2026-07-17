import Link from "next/link";
import Image from "next/image";
import { getFeatured } from "@/lib/products";
import Reveal, { Stagger, StaggerItem } from "@/components/motion/Reveal";
import ProductCard from "@/components/product/ProductCard";
import HomeReviews from "@/components/home/HomeReviews";

export const dynamic = "force-dynamic";

const VALUES = [
  {
    title: "Cold-Pressed Oils",
    body: "Every oil we use is pressed slowly and without heat, so nothing fragile is lost.",
    icon: "M12 3 C 8 8 5 11 5 15 A7 7 0 0 0 19 15 C 19 11 16 8 12 3 Z",
  },
  {
    title: "Small Batches",
    body: "We pour in batches of sixty, never six thousand. Freshness you can smell.",
    icon: "M6 20 L6 10 Q6 7 9 7 L15 7 Q18 7 18 10 L18 20 Z M9 7 L9 4 L15 4 L15 7",
  },
  {
    title: "Cruelty Free",
    body: "Tested on family and friends who volunteered enthusiastically — never on animals.",
    icon: "M12 20 C 7 16 3.5 13 3.5 9.5 A4.5 4.5 0 0 1 12 7 A4.5 4.5 0 0 1 20.5 9.5 C 20.5 13 17 16 12 20 Z",
  },
  {
    title: "Honest Labels",
    body: "SLS-free, paraben-free, silicone-free — and every ingredient printed in plain words.",
    icon: "M5 4 L19 4 L19 20 L5 20 Z M8 9 H16 M8 13 H16 M8 17 H12",
  },
];

export default async function HomePage() {
  const featured = await getFeatured(4);

  return (
    <div>
      {/* ── Hero banner ──────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/banners/banner-hero.jpg"
            alt="Hand-cut artisan soaps wrapped in paper, resting beside dried lavender"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-earth-deep/85 via-earth-deep/60 to-earth-deep/25" />
        </div>

        <div className="mx-auto flex min-h-[34rem] max-w-7xl items-center px-5 py-24 lg:min-h-[42rem] lg:px-8">
          <div className="max-w-2xl">
            <Reveal>
              <p className="eyebrow text-sand-light">
                Organic · Cruelty Free · 100% Natural
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-5 text-hero-sm text-almond-light md:text-hero">
                The earth already wrote
                <br />
                <em className="text-sage-light">the recipe.</em>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-almond-light/85">
                Ethereal Artisan began in a farmhouse kitchen, pouring soap by
                hand in batches small enough to smell the difference. Cold-pressed
                oils, real botanicals, and nothing your skin doesn&apos;t need.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-9 flex flex-wrap gap-4">
                <Link href="/products" className="btn btn-primary">
                  Explore the Collection
                </Link>
                <Link href="/business" className="btn btn-light">
                  Wholesale Enquiries
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Philosophy ───────────────────────────────────────── */}
      <section className="bg-almond">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
          <Reveal>
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-sand shadow-card">
              <Image
                src="/banners/banner-story.jpg"
                alt="A row of hand-cut soap bars on soft linen"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
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
                Goat milk and raw honey. Activated charcoal and French green
                clay. Rose, cherry blossom, neem, tulsi, coffee — ingredients you
                could name blindfolded, sourced from growers we know and pay
                fairly.
              </p>
              <p className="mt-4 leading-relaxed text-earth">
                No SLS, no parabens, no silicones, no synthetic fillers. Just
                recipes perfected slowly, poured by hand, and cured with patience.
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
      <section className="bg-sand/40">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <Stagger className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <StaggerItem key={v.title}>
                <div className="flex flex-col items-start gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sage/50 text-moss-deep">
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

      {/* ── Our Mission ──────────────────────────────────────── */}
      <section className="bg-almond py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="eyebrow text-moss-dark">Our Mission</p>
            <h2 className="mt-4 text-display">
              Making the switch to safe, natural skincare.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-earth">
              At Ethereal Artisan, our mission is to inspire a healthier, more
              mindful approach to skincare by helping people make the switch
              from harsh chemical-based products to safe, natural alternatives.
              We believe that skincare should nourish and protect your skin
              without compromising your well-being or the environment.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            <Reveal delay={0.06}>
              <article className="card flex h-full flex-col overflow-hidden">
                <div className="relative aspect-[5/3] w-full">
                  <Image
                    src="/banners/banner-hands.jpg"
                    alt="Hands holding freshly cut bars of handmade soap"
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <h3 className="font-serif text-2xl">Thoughtfully handcrafted</h3>
                  <p className="mt-3 leading-relaxed text-earth">
                    Every product we create is thoughtfully handcrafted using
                    carefully selected natural ingredients — poured, cured and
                    checked by the same pair of hands that made it.
                  </p>
                </div>
              </article>
            </Reveal>

            <Reveal delay={0.14}>
              <article className="card flex h-full flex-col overflow-hidden">
                <div className="relative aspect-[5/3] w-full">
                  <Image
                    src="/banners/banner-mission.jpg"
                    alt="Two bars of natural soap, one tied with garden twine"
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <h3 className="font-serif text-2xl">Gentle, without compromise</h3>
                  <p className="mt-3 leading-relaxed text-earth">
                    Our commitment is to provide gentle, effective skincare
                    solutions that are free from unnecessary harsh chemicals,
                    allowing you to embrace a cleaner, healthier beauty routine
                    with confidence.
                  </p>
                </div>
              </article>
            </Reveal>

            <Reveal delay={0.22}>
              <article className="card flex h-full flex-col overflow-hidden">
                <div className="relative aspect-[5/3] w-full">
                  <Image
                    src="/banners/banner-stack.jpg"
                    alt="A stack of naturally coloured handmade soap bars"
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <h3 className="font-serif text-2xl">Accessible &amp; sustainable</h3>
                  <p className="mt-3 leading-relaxed text-earth">
                    We strive to make natural skincare accessible, trustworthy
                    and sustainable — because everyone deserves products that
                    are kind to their skin, their loved ones, and the planet.
                  </p>
                </div>
              </article>
            </Reveal>
          </div>

          <Reveal delay={0.28} className="mt-12 text-center">
            <Link href="/about" className="btn btn-outline">
              Read our story
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── Craft banner (full-bleed) ────────────────────────── */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/banners/banner-craft.jpg"
            alt="Soap bars set with dried rose petals, laid out on a workbench"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-earth-deep/75" />
        </div>
        <div className="mx-auto max-w-3xl px-5 py-24 text-center lg:py-32">
          <Reveal>
            <p className="eyebrow text-sand-light">Poured by Hand</p>
            <h2 className="mt-4 text-display text-almond-light">
              Every bar cures for four weeks before it earns a label.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-almond-light/85">
              It would be quicker to machine-press them. It would also be a
              different product entirely — and not one we&apos;d put our name on.
            </p>
            <Link href="/products?category=Soap" className="btn btn-light mt-8">
              Shop the Soaps
            </Link>
          </Reveal>
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
                className="group relative flex min-h-80 flex-col justify-end overflow-hidden rounded-3xl p-8 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-card-hover lg:p-10"
              >
                <Image
                  src="/banners/banner-shop.jpg"
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-earth-deep/95 via-earth-deep/80 to-earth-deep/35" />
                <div className="relative">
                  <p className="eyebrow text-sand-light">For You</p>
                  <h3 className="mt-2 font-serif text-3xl text-almond-light">Shop the Collection</h3>
                  <p className="mt-3 max-w-sm text-almond-light/85">
                    Soaps, face washes, bath salts and travel kits — delivered to
                    your door, poured the week you order.
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 font-semibold text-almond-light">
                    Start shopping
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden>
                      <path d="M4 12 H20 M14 6 L20 12 L14 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </Link>
            </Reveal>

            <Reveal delay={0.18}>
              <Link
                href="/business"
                className="group relative flex min-h-80 flex-col justify-end overflow-hidden rounded-3xl p-8 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-card-hover lg:p-10"
              >
                <Image
                  src="/banners/banner-botanicals.jpg"
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-earth-deep/95 via-earth-deep/80 to-earth-deep/35" />
                <div className="relative">
                  <p className="eyebrow text-sand-light">For Business</p>
                  <h3 className="mt-2 font-serif text-3xl text-almond-light">Wholesale &amp; Bulk</h3>
                  <p className="mt-3 max-w-sm text-almond-light/85">
                    Hotels, boutiques, gifting programmes — private-label and bulk
                    botanicals, crafted to your brief.
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 font-semibold text-almond-light">
                    Enquire to know more
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden>
                      <path d="M4 12 H20 M14 6 L20 12 L14 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
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

      {/* ── Customer reviews ─────────────────────────────────── */}
      <HomeReviews />
    </div>
  );
}
