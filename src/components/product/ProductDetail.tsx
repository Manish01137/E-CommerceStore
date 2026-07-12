"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { ProductDTO } from "@/lib/types";
import { formatINR } from "@/lib/format";
import { useCart } from "@/components/cart/CartContext";
import { useToast } from "@/components/ui/Toast";

export default function ProductDetail({ product }: { product: ProductDTO }) {
  const { addItem, openDrawer } = useCart();
  const { toast } = useToast();
  const [scent, setScent] = useState(product.scents[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [justAdded, setJustAdded] = useState(false);

  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 5;
  const images = product.images.length > 0 ? product.images : ["/products/placeholder.svg"];

  const handleAdd = () => {
    if (outOfStock) return;
    addItem(
      {
        productId: product._id,
        slug: product.slug,
        name: product.name,
        scent,
        price: product.price,
        image: images[0],
        stock: product.stock,
      },
      quantity
    );
    toast(`${product.name} added to cart`);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      {/* Gallery */}
      <div>
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-earth/75">
          <Link href="/products" className="hover:underline">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-earth-deep">{product.name}</span>
        </nav>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-sand bg-sand-light shadow-card"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              <Image
                src={images[activeImage]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
        {images.length > 1 && (
          <div className="mt-4 flex gap-3">
            {images.map((img, i) => (
              <button
                key={img}
                onClick={() => setActiveImage(i)}
                aria-label={`View image ${i + 1}`}
                className={`relative h-20 w-16 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                  i === activeImage ? "border-moss" : "border-sand opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={img} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="lg:pt-12"
      >
        <p className="eyebrow text-moss-dark">{product.category}</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight lg:text-5xl">{product.name}</h1>

        <div className="mt-4 flex items-baseline gap-3">
          <span className="font-serif text-3xl font-semibold">{formatINR(product.price)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <>
              <span className="text-lg text-earth/60 line-through">
                {formatINR(product.compareAtPrice)}
              </span>
              <span className="rounded-full bg-sage/50 px-2.5 py-0.5 text-xs font-bold text-moss-deep">
                Save {formatINR(product.compareAtPrice - product.price)}
              </span>
            </>
          )}
        </div>

        <p className="mt-6 leading-relaxed text-earth">{product.description}</p>

        {product.ingredients && (
          <details className="group mt-5 rounded-xl border border-sand bg-almond-light px-5 py-4">
            <summary className="cursor-pointer list-none font-semibold text-earth-deep">
              <span className="flex items-center justify-between">
                Full ingredients
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  className="transition-transform duration-300 group-open:rotate-180" aria-hidden>
                  <path d="M6 9 L12 15 L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-earth">{product.ingredients}</p>
          </details>
        )}

        {/* Scent picker */}
        {product.scents.length > 0 && (
          <div className="mt-8">
            <p className="mb-3 text-sm font-semibold">
              Scent{product.scents.length > 1 && <span className="text-earth/60"> — choose one</span>}
            </p>
            <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Scent">
              {product.scents.map((s) => (
                <button
                  key={s}
                  role="radio"
                  aria-checked={scent === s}
                  onClick={() => setScent(s)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                    scent === s
                      ? "border-moss bg-moss text-almond-light shadow-sm"
                      : "border-sand bg-almond-light text-earth-deep hover:border-moss hover:bg-sage/20"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity + CTA */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <div className="flex items-center rounded-full border border-sand bg-almond-light">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1 || outOfStock}
              aria-label="Decrease quantity"
              className="px-4 py-3 text-lg font-semibold text-earth-deep transition-colors hover:text-moss-deep disabled:opacity-40"
            >
              −
            </button>
            <span className="min-w-8 text-center font-bold" aria-live="polite">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
              disabled={quantity >= product.stock || outOfStock}
              aria-label="Increase quantity"
              className="px-4 py-3 text-lg font-semibold text-earth-deep transition-colors hover:text-moss-deep disabled:opacity-40"
            >
              +
            </button>
          </div>

          <motion.button
            onClick={handleAdd}
            disabled={outOfStock}
            whileTap={{ scale: 0.96 }}
            className="btn btn-primary min-w-48 flex-1 sm:flex-none"
          >
            <AnimatePresence mode="wait" initial={false}>
              {justAdded ? (
                <motion.span
                  key="added"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Added
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {outOfStock ? "Out of Stock" : "Add to Cart"}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <button onClick={openDrawer} className="btn btn-outline">
            View Cart
          </button>
        </div>

        {lowStock && (
          <p className="mt-4 text-sm font-semibold text-[#a3542a]">
            Only {product.stock} left in this batch.
          </p>
        )}

        <ul className="mt-8 grid gap-2.5 border-t border-sand pt-6 text-sm text-earth">
          <li className="flex items-center gap-2.5">
            <Dot /> Free shipping on orders above ₹999
          </li>
          <li className="flex items-center gap-2.5">
            <Dot /> Made fresh in small batches — 12-month shelf life
          </li>
          <li className="flex items-center gap-2.5">
            <Dot /> 100% plastic-conscious packaging
          </li>
        </ul>
      </motion.div>
    </div>
  );
}

function Dot() {
  return <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-moss" aria-hidden />;
}
