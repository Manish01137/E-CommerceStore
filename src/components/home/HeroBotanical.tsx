"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Slow-drifting botanical line art behind the hero. Purely decorative. */
export default function HeroBotanical() {
  const reduce = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <motion.svg
        viewBox="0 0 200 200"
        className="absolute -left-16 top-8 h-72 w-72 text-sage/35"
        animate={reduce ? undefined : { rotate: [0, 6, 0], y: [0, -10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      >
        <path d="M100 180 C 100 130 100 90 100 30" />
        <path d="M100 70 Q 135 55 148 22" />
        <path d="M100 105 Q 65 90 52 58" />
        <path d="M100 140 Q 140 128 154 100" />
        <ellipse cx="150" cy="20" rx="6" ry="11" fill="currentColor" transform="rotate(35 150 20)" />
        <ellipse cx="50" cy="56" rx="6" ry="11" fill="currentColor" transform="rotate(-35 50 56)" />
      </motion.svg>

      <motion.svg
        viewBox="0 0 200 200"
        className="absolute -bottom-10 right-[8%] h-96 w-96 text-sand/60"
        animate={reduce ? undefined : { rotate: [0, -5, 0], y: [0, 12, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        fill="currentColor"
      >
        <path d="M100 30 C 118 60 155 68 155 105 A55 55 0 0 1 45 105 C 45 68 82 60 100 30 Z" opacity="0.5" />
      </motion.svg>

      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-sage/20 blur-3xl" />
      <div className="absolute -bottom-32 left-[15%] h-80 w-80 rounded-full bg-sand/40 blur-3xl" />
    </div>
  );
}
