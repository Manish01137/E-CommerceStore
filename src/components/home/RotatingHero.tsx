"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

interface HeroSlide {
  src: string;
  alt: string;
}

const SLIDES: HeroSlide[] = [
  { src: "/products/haircare-rosemary.jpg", alt: "Ethereal Artisan Rosemary shampoo and conditioner in a marble bathroom" },
  { src: "/products/face-wash-neem-tulsi.jpg", alt: "Ethereal Artisan Neem Tulsi face wash surrounded by fresh neem and tulsi leaves" },
  { src: "/products/bath-salt-himalayan-pink-new.jpg", alt: "Ethereal Artisan Himalayan Pink bath salt jars with a mountain backdrop" },
  { src: "/products/scrub-soap-coffee.jpg", alt: "Ethereal Artisan Coffee Granules scrub soap on a candlelit marble counter" },
  { src: "/products/goat-milk-saffron-soap.jpg", alt: "Ethereal Artisan Goat Milk Saffron soap bars styled with saffron and flowers" },
];

const INTERVAL_MS = 5500;

/** Full-bleed hero background that crossfades between real product photos. */
export default function RotatingHero() {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return; // respect prefers-reduced-motion: hold on the first slide
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [reduce]);

  const slide = SLIDES[index];

  return (
    <div className="absolute inset-0 -z-10">
      <AnimatePresence initial={false}>
        <motion.div
          key={slide.src}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-r from-earth-deep/85 via-earth-deep/60 to-earth-deep/25" />

      {/* Slide indicators */}
      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2 lg:bottom-9">
        {SLIDES.map((s, i) => (
          <button
            key={s.src}
            onClick={() => setIndex(i)}
            aria-label={`Show slide ${i + 1}`}
            aria-current={i === index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-almond-light" : "w-1.5 bg-almond-light/50 hover:bg-almond-light/75"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
