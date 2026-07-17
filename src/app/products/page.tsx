import { Suspense } from "react";
import type { Metadata } from "next";
import Reveal from "@/components/motion/Reveal";
import { getFacets } from "@/lib/products";
import ProductsBrowser from "@/components/product/ProductsBrowser";

export const metadata: Metadata = {
  title: "Products",
  description:
    "The full Ethereal Artisan catalogue — organic lotions, face creams, bath salts, clays, scrubs and soaps.",
};

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const facets = await getFacets();
  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
      <Reveal>
        <p className="eyebrow text-moss-dark">The Catalogue</p>
        <h1 className="mt-3 text-display md:text-5xl">Everything we make</h1>
        <p className="mt-4 max-w-xl text-earth">
          Hand-poured soaps, amino-acid face washes, bath salts, face packs and
          travel kits — one promise, nothing your skin doesn&apos;t need.
        </p>
      </Reveal>
      <Suspense>
        <ProductsBrowser facets={facets} />
      </Suspense>
    </div>
  );
}
