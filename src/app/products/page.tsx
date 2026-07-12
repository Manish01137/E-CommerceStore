import { Suspense } from "react";
import type { Metadata } from "next";
import Reveal from "@/components/motion/Reveal";
import ProductsBrowser from "@/components/product/ProductsBrowser";

export const metadata: Metadata = {
  title: "Products",
  description:
    "The full Terra Botanica catalogue — organic lotions, face creams, bath salts, clays, scrubs and soaps.",
};

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
      <Reveal>
        <p className="eyebrow text-moss-dark">The Catalogue</p>
        <h1 className="mt-3 text-display md:text-5xl">Every jar we make</h1>
        <p className="mt-4 max-w-xl text-earth">
          Six categories, five signature scents, one promise — nothing your
          skin doesn&apos;t need.
        </p>
      </Reveal>
      <Suspense>
        <ProductsBrowser />
      </Suspense>
    </div>
  );
}
