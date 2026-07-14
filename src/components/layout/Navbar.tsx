"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/components/cart/CartContext";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/business", label: "Business" },
  { href: "/shop", label: "Shop" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { count, bumpKey, hydrated, openDrawer } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bumping, setBumping] = useState(false);
  const firstBump = useRef(true);

  useEffect(() => {
    if (firstBump.current) {
      firstBump.current = false;
      return;
    }
    setBumping(true);
    const t = setTimeout(() => setBumping(false), 500);
    return () => clearTimeout(t);
  }, [bumpKey]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-moss-deep/40 bg-moss/95 text-almond-light shadow-[0_2px_12px_rgba(88,92,66,0.18)] backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="Ethereal Artisan home">
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden
            className="transition-transform duration-300 group-hover:rotate-12">
            <circle cx="15" cy="15" r="14" stroke="currentColor" strokeWidth="1.5" />
            <path d="M15 23 C 15 15 15 12 15 7 M15 12 Q 20 10 22 6 M15 16 Q 10 14 8 10"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
          <span className="font-serif text-xl tracking-wide">Ethereal Artisan</span>
        </Link>

        {/* Connected tab group — one continuous pill, sliding active indicator */}
        <ul className="hidden items-center rounded-full border border-moss-deep/35 bg-moss-deep/25 p-1 md:flex">
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className="relative block rounded-full px-4 py-1.5 text-sm font-semibold tracking-wide transition-colors duration-200"
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active-pill"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      className="absolute inset-0 rounded-full bg-almond-light"
                    />
                  )}
                  <span
                    className={`relative z-10 ${
                      active ? "text-moss-deep" : "text-almond-light/85 hover:text-almond-light"
                    }`}
                  >
                    {l.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-3">
          <Link
            href="/account"
            aria-label="My account"
            className="rounded-full p-2 transition-colors duration-200 hover:bg-moss-dark"
          >
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
              <path d="M4 20.5 C 4 16 8 14 12 14 C 16 14 20 16 20 20.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </Link>

          <button
            onClick={openDrawer}
            aria-label={`Open cart, ${count} items`}
            className={`relative rounded-full p-2 transition-colors duration-200 hover:bg-moss-dark ${bumping ? "cart-bump" : ""}`}
          >
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 8 H19 L18 20 A1.5 1.5 0 0 1 16.5 21.3 H7.5 A1.5 1.5 0 0 1 6 20 Z"
                stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M9 8 V6.5 A3 3 0 0 1 15 6.5 V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            {hydrated && count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-almond px-1 text-[11px] font-bold text-moss-deep">
                {count}
              </span>
            )}
          </button>

          <button
            className="rounded-full p-2 transition-colors duration-200 hover:bg-moss-dark md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              {mobileOpen ? (
                <path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <path d="M4 7 H20 M4 12 H20 M4 17 H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-moss-dark md:hidden"
          >
            <ul className="flex flex-col gap-1 px-5 py-4">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                      pathname === l.href ? "bg-moss-dark" : "hover:bg-moss-dark"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
