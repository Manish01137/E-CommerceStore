"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

const SLIDES = [
  {
    src: "/products/goat-milk-strawberry-soap.jpg",
    alt: "Ethereal Artisan Goat Milk Strawberry soap bar, hand-poured with creamy goat milk and sweet strawberry",
  },
  {
    src: "/products/body-wash-coffee-granules.png",
    alt: "Ethereal Artisan Coffee Body Wash with exfoliating coffee granules",
  },
  {
    src: "/products/haircare-lavender.jpg",
    alt: "Ethereal Artisan Lush Lavender shampoo and conditioner with calming botanical lavender",
  },
  {
    src: "/products/goat-milk-cherry-blossom-soap.jpg",
    alt: "Ethereal Artisan Goat Milk Cherry Blossom soap bar, hand-poured with fresh goat milk",
  },
];

const INTERVAL_MS = 5500;

/**
 * Absolutely-positioned crossfade behind the hero copy. Every slide fills the
 * same box (fill + object-cover), so swapping never reflows or overlaps the
 * text sitting on top — only the photo underneath changes.
 */
export default function HeroSlideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 -z-10">
      <AnimatePresence>
        <motion.div
          key={SLIDES[index].src}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={SLIDES[index].src}
            alt={SLIDES[index].alt}
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover object-center"
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-r from-earth-deep/90 via-earth-deep/60 to-earth-deep/20" />
    </div>
  );
}
