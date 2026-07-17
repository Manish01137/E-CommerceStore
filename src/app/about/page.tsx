import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Reveal, { Stagger, StaggerItem } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Ethereal Artisan is a homegrown skincare brand founded by a mother-daughter duo in 2020 — honest, handcrafted skincare that celebrates the power of nature.",
};

const BELIEFS = [
  {
    title: "Pure",
    body: "Carefully selected, skin-loving ingredients — and nothing in the jar that doesn't need to be there.",
    icon: "M12 3 C 8 8 5 11 5 15 A7 7 0 0 0 19 15 C 19 11 16 8 12 3 Z",
  },
  {
    title: "Nourishing",
    body: "Formulated to leave skin healthy, balanced and naturally radiant rather than stripped.",
    icon: "M12 20 C 7 16 3.5 13 3.5 9.5 A4.5 4.5 0 0 1 12 7 A4.5 4.5 0 0 1 20.5 9.5 C 20.5 13 17 16 12 20 Z",
  },
  {
    title: "Free from harsh chemicals",
    body: "No SLS, no SLES, no parabens, no silicones. Honest labels, in words you can actually read.",
    icon: "M5 4 L19 4 L19 20 L5 20 Z M8 9 H16 M8 13 H16 M8 17 H12",
  },
  {
    title: "Small batch",
    body: "Blended in batches small enough that every jar is checked by the family that made it.",
    icon: "M6 20 L6 10 Q6 7 9 7 L15 7 Q18 7 18 10 L18 20 Z M9 7 L9 4 L15 4 L15 7",
  },
];

const MILESTONES = [
  { year: "2020", label: "Founded", body: "A mother and daughter, one kitchen, and a shared love of natural wellness." },
  { year: "11", label: "Product lines", body: "From artisan soaps to bath salts, face care and travel kits." },
  { year: "50+", label: "Scents & variants", body: "Every one blended, poured and cured by hand in small batches." },
];

export default function AboutPage() {
  return (
    <div>
      {/* ── 1. Hero ──────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/banners/banner-hands.jpg"
            alt="Hands holding freshly cut bars of handmade soap"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-earth-deep/90 via-earth-deep/65 to-earth-deep/30" />
        </div>
        <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8 lg:py-32">
          <Reveal className="max-w-2xl">
            <p className="eyebrow text-sand-light">Hi there</p>
            <h1 className="mt-4 text-hero-sm text-almond-light md:text-hero">
              About us.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-almond-light/85">
              Ethereal Artisan is a homegrown skincare brand founded by a
              passionate mother-daughter duo in 2020, with a simple vision — to
              create honest, handcrafted skincare that celebrates the power of
              nature.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── 2. Our story ─────────────────────────────────────── */}
      <section className="bg-almond py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:px-8">
          <div>
            <Reveal>
              <p className="eyebrow text-moss-dark">Our Story</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-4 text-display">
                Born from a shared love of natural wellness.
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 leading-relaxed text-earth">
                Born from a shared love for natural wellness and mindful living,
                Ethereal Artisan offers handmade organic skincare products
                crafted with carefully selected, skin-loving ingredients.
              </p>
              <p className="mt-4 leading-relaxed text-earth">
                Every product is thoughtfully formulated in small batches to
                deliver gentle, effective care while staying true to our
                commitment to quality and authenticity. It started as two people
                in a kitchen — and in the important ways, it still is.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.12}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-sand shadow-card">
              <Image
                src="/banners/banner-story.jpg"
                alt="A row of hand-cut soap bars resting on soft linen"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 3. Milestones ────────────────────────────────────── */}
      <section className="bg-sand/40 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Stagger className="grid gap-8 sm:grid-cols-3">
            {MILESTONES.map((m) => (
              <StaggerItem key={m.label}>
                <div className="text-center">
                  <p className="font-serif text-5xl text-moss-dark">{m.year}</p>
                  <p className="eyebrow mt-3 text-earth">{m.label}</p>
                  <p className="mt-3 text-sm leading-relaxed text-earth">{m.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── 4. What we believe ───────────────────────────────── */}
      <section className="bg-almond py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="eyebrow text-moss-dark">What We Believe</p>
            <h2 className="mt-4 text-display">
              Skincare should be pure, nourishing, and free from unnecessary
              harsh chemicals.
            </h2>
            <p className="mt-6 leading-relaxed text-earth">
              That&apos;s why we focus on combining traditional botanical
              ingredients with modern skincare knowledge — to create products
              that help your skin feel healthy, balanced and naturally radiant.
            </p>
          </Reveal>

          <Stagger className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {BELIEFS.map((b) => (
              <StaggerItem key={b.title}>
                <div className="flex flex-col items-start gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sage/50 text-moss-deep">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d={b.icon} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <h3 className="font-serif text-lg">{b.title}</h3>
                  <p className="text-sm leading-relaxed text-earth">{b.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── 5. Craftsmanship (full-bleed) ────────────────────── */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/banners/banner-craft.jpg"
            alt="Hand-poured soap bars set with dried rose petals"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-earth-deep/78" />
        </div>
        <div className="mx-auto max-w-3xl px-5 py-24 text-center lg:py-32">
          <Reveal>
            <p className="eyebrow text-sand-light">Craftsmanship</p>
            <h2 className="mt-4 text-display text-almond-light">
              Every jar, bottle and bar reflects the care of our family.
            </h2>
            <p className="mx-auto mt-6 max-w-xl leading-relaxed text-almond-light/85">
              At Ethereal Artisan, every jar, bottle and bar reflects the care,
              dedication and craftsmanship of our family. Our mission is to help
              you embrace self-care with products that are as kind to your skin
              as they are to the environment.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── 6. Our mission ───────────────────────────────────── */}
      <section className="bg-almond py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <div className="relative aspect-[5/4] overflow-hidden rounded-3xl border border-sand shadow-card">
              <Image
                src="/banners/banner-mission.jpg"
                alt="Two bars of natural soap, one tied with garden twine"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <div>
            <Reveal>
              <p className="eyebrow text-moss-dark">Our Mission</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="mt-4 text-display">
                A healthier, more mindful approach to skincare.
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-6 leading-relaxed text-earth">
                Our mission is to inspire a healthier, more mindful approach to
                skincare by helping people make the switch from harsh
                chemical-based products to safe, natural alternatives. Skincare
                should nourish and protect your skin without compromising your
                well-being or the environment.
              </p>
              <p className="mt-4 leading-relaxed text-earth">
                We strive to make natural skincare accessible, trustworthy and
                sustainable — because everyone deserves products that are kind
                to their skin, their loved ones, and the planet.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 7. Closing invitation ────────────────────────────── */}
      <section className="bg-moss-deep py-20 lg:py-24">
        <div className="mx-auto max-w-2xl px-5 text-center lg:px-8">
          <Reveal>
            <h2 className="text-display text-almond-light">
              We&apos;re delighted to share our handcrafted creations with you.
            </h2>
            <p className="mt-5 leading-relaxed text-almond-light/85">
              We hope Ethereal Artisan becomes a trusted part of your daily
              skincare ritual.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link href="/products" className="btn btn-light">
                Explore the Collection
              </Link>
              <Link href="/business" className="btn btn-secondary">
                Wholesale Enquiries
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
