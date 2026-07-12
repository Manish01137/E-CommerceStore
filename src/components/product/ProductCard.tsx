"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { ProductDTO } from "@/lib/types";
import { formatINR } from "@/lib/format";
import { useCart } from "@/components/cart/CartContext";
import { useToast } from "@/components/ui/Toast";

export default function ProductCard({ product }: { product: ProductDTO }) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const outOfStock = product.stock <= 0;

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addItem({
      productId: product._id,
      slug: product.slug,
      name: product.name,
      scent: product.scents[0] ?? "",
      price: product.price,
      image: product.images[0] ?? "",
      stock: product.stock,
    });
    toast(`${product.name} added to cart`);
  };

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <motion.article
        whileHover={{ y: -5 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="card card-hover overflow-hidden"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-sand-light">
          {product.images[0] && (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
            />
          )}
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="absolute left-3 top-3 rounded-full bg-moss px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-almond-light">
              Save {formatINR(product.compareAtPrice - product.price)}
            </span>
          )}
          {outOfStock && (
            <span className="absolute left-3 top-3 rounded-full bg-earth px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-almond-light">
              Out of Stock
            </span>
          )}
          <button
            onClick={quickAdd}
            disabled={outOfStock}
            aria-label={`Add ${product.name} to cart`}
            className="absolute bottom-3 right-3 flex h-10 w-10 translate-y-3 items-center justify-center rounded-full bg-almond-light text-earth-deep opacity-0 shadow-md transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-moss hover:text-almond-light focus-visible:translate-y-0 focus-visible:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 disabled:hidden"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 5 V19 M5 12 H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          <p className="eyebrow text-[11px] text-moss-dark">{product.category}</p>
          <h3 className="mt-1 font-serif text-lg leading-snug">{product.name}</h3>
          <p className="mt-0.5 text-xs text-earth">
            {product.scents.length > 1
              ? `${product.scents.length} scents`
              : product.scents[0] ?? ""}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-semibold">{formatINR(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-sm text-earth/60 line-through">
                {formatINR(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </motion.article>
    </Link>
  );
}