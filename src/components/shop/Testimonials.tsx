"use client";

import { useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import Reveal, { Stagger, StaggerItem } from "@/components/motion/Reveal";

const TESTIMONIALS = [
  {
    name: "Samita Aich",
    quote:
      "Well done... So proud of you and believe me the soaps are really amazing... Got feed back from friends whom I gifted and even myself used it",
    rating: 5,
    initial: "S",
    tint: "#c7af94",
  },
  {
    name: "Suparna Bhaumick",
    quote:
      "Wonderful handmade soaps; body washes and now body lotions have also been recently launched. Kudos to my lovely childhood friend Shubhra Dutta and Meghna Dutta, the owners of this luxury brand Ethereal Artisan.",
    rating: 5,
    initial: "S",
    tint: "#acb087",
  },
  {
    name: "Aindrila Chakravarty",
    quote:
      "Have been using the body lotion now for a week and the results are showing up. The skin feels soft, looks healthy and the light fragrance just lingers on. The feeling of using a natural product, free from chemicals, makes the experience even more satisfying. Thank you Ethereal Artisan.",
    rating: 5,
    initial: "A",
    tint: "#d8c6b1",
  },
  {
    name: "Abanti Chatterjee",
    quote:
      "Undoubtedly amazing products!! I am personally using it. Just go for it!",
    rating: 5,
    initial: "A",
    tint: "#c2c5a4",
  },
  {
    name: "Bipasha Banerjee",
    quote:
      "Used these body scrub and face pack...they are so good!! Just after one wash you can feel that soft and smooth skin you have longed for!! I am so happy and satisfied with the products! It's a must use product! Thank you once again Ethereal Artisan!",
    rating: 5,
    initial: "B",
    tint: "#cfae8a",
  },
  {
    name: "Anita Shukla",
    quote:
      "Thank you Shubhra. The soaps are skin friendly with amazing fragrance. As beautiful as they look, they give refreshing bathing experience.",
    rating: 5,
    initial: "A",
    tint: "#b7c19c",
  },
];

const REPEAT = 3;
const LOOP_SECONDS = 36;

function AnimatedStars({ count, active, baseDelay }: { count: number; active: boolean; baseDelay: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.svg
          key={i}
          width="15"
          height="15"
          viewBox="0 0 24 24"
          aria-hidden
          fill={i < count ? "#95714f" : "none"}
          stroke="#95714f"
          strokeWidth="1.5"
          initial={{ opacity: 0, scale: 0.4 }}
          animate={active ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.25, delay: baseDelay + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
        >
          <path d="M12 2.5 L14.9 8.6 L21.5 9.5 L16.7 14.1 L17.9 20.7 L12 17.5 L6.1 20.7 L7.3 14.1 L2.5 9.5 L9.1 8.6 Z" />
        </motion.svg>
      ))}
    </div>
  );
}

function TestimonialCard({
  t,
  enterDelay,
  hideFromA11y,
}: {
  t: (typeof TESTIMONIALS)[number];
  enterDelay: number;
  hideFromA11y: boolean;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.figure
      ref={ref}
      aria-hidden={hideFromA11y || undefined}
      className="relative flex h-full w-70 shrink-0 flex-col overflow-hidden rounded-2xl bg-almond-light p-7 shadow-card sm:w-85 lg:w-95"
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      whileHover={{ scale: 1.025, boxShadow: "var(--shadow-card-hover)" }}
      transition={{
        opacity: { duration: 0.6, delay: enterDelay, ease: [0.22, 1, 0.36, 1] },
        y: { duration: 0.6, delay: enterDelay, ease: [0.22, 1, 0.36, 1] },
        scale: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
        boxShadow: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
      }}
    >
      <motion.span
        aria-hidden
        className="pointer-events-none absolute -top-3 left-6 select-none font-serif text-7xl leading-none text-earth/15"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.4, delay: enterDelay + 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        &ldquo;
      </motion.span>

      <div className="relative z-10">
        <AnimatedStars count={t.rating} active={inView} baseDelay={enterDelay + 0.42} />
        <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-earth-deep">
          {t.quote}
        </blockquote>
        <figcaption className="mt-6 flex items-center gap-3">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-full font-serif text-base font-semibold text-earth-deep"
            style={{ backgroundColor: t.tint }}
            aria-hidden
          >
            {t.initial}
          </span>
          <p className="text-sm font-bold text-earth-deep">{t.name}</p>
        </figcaption>
      </div>
    </motion.figure>
  );
}

function TestimonialCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const x = useMotionValue(0);

  useAnimationFrame((_, delta) => {
    if (paused || draggingRef.current) return;
    const track = trackRef.current;
    if (!track) return;
    const unitWidth = track.scrollWidth / REPEAT;
    if (unitWidth <= 0) return;
    const speed = unitWidth / LOOP_SECONDS;
    let next = x.get() - (speed * delta) / 1000;
    if (next <= -unitWidth) next += unitWidth;
    x.set(next);
  });

  const wrapAfterDrag = () => {
    draggingRef.current = false;
    const track = trackRef.current;
    if (!track) return;
    const unitWidth = track.scrollWidth / REPEAT;
    if (unitWidth <= 0) return;
    let v = x.get() % unitWidth;
    if (v > 0) v -= unitWidth;
    x.set(v);
  };

  return (
    <div
      className="relative mt-12 overflow-hidden"
      style={{
        WebkitMaskImage:
          "linear-gradient(90deg, transparent, black 4%, black 96%, transparent)",
        maskImage:
          "linear-gradient(90deg, transparent, black 4%, black 96%, transparent)",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Customer testimonials"
    >
      <motion.div
        ref={trackRef}
        className="flex cursor-grab gap-6 px-5 py-2 active:cursor-grabbing lg:px-8"
        style={{ x }}
        drag="x"
        dragMomentum={false}
        onDragStart={() => {
          draggingRef.current = true;
        }}
        onDragEnd={wrapAfterDrag}
      >
        {Array.from({ length: REPEAT }).flatMap((_, repeatIndex) =>
          TESTIMONIALS.map((t, i) => (
            <TestimonialCard
              key={`${repeatIndex}-${t.name}`}
              t={t}
              enterDelay={0.08 * i}
              hideFromA11y={repeatIndex > 0}
            />
          ))
        )}
      </motion.div>
    </div>
  );
}

function StaticTestimonialGrid() {
  return (
    <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
      {TESTIMONIALS.map((t) => (
        <StaggerItem key={t.name}>
          <figure className="flex h-full flex-col rounded-2xl bg-almond-light p-7 shadow-card">
            <div className="flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} width="15" height="15" viewBox="0 0 24 24" aria-hidden
                  fill={i < t.rating ? "#95714f" : "none"}
                  stroke="#95714f" strokeWidth="1.5">
                  <path d="M12 2.5 L14.9 8.6 L21.5 9.5 L16.7 14.1 L17.9 20.7 L12 17.5 L6.1 20.7 L7.3 14.1 L2.5 9.5 L9.1 8.6 Z" />
                </svg>
              ))}
            </div>
            <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-earth-deep">
              {t.quote}
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-full font-serif text-base font-semibold text-earth-deep"
                style={{ backgroundColor: t.tint }}
                aria-hidden
              >
                {t.initial}
              </span>
              <p className="text-sm font-bold text-earth-deep">{t.name}</p>
            </figcaption>
          </figure>
        </StaggerItem>
      ))}
    </Stagger>
  );
}

export default function Testimonials() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="bg-earth py-16 lg:py-24">
      <div className={reduceMotion ? "mx-auto max-w-7xl px-5 lg:px-8" : "mx-auto max-w-7xl"}>
        <Reveal className="mx-auto max-w-2xl px-5 text-center lg:px-8">
          <p className="eyebrow text-sand-light">Kind Words</p>
          <h2 className="mt-4 text-display text-almond-light">
            From bathrooms across the country
          </h2>
        </Reveal>

        {reduceMotion ? (
          <div className="px-5 lg:px-8">
            <StaticTestimonialGrid />
          </div>
        ) : (
          <TestimonialCarousel />
        )}
      </div>
    </section>
  );
}
