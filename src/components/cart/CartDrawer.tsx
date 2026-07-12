"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "./CartContext";
import { formatINR } from "@/lib/format";

export default function CartDrawer() {
  const { items, drawerOpen, closeDrawer, updateQuantity, removeItem, subtotal } = useCart();

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen, closeDrawer]);

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeDrawer}
            className="fixed inset-0 z-[60] bg-earth-deep/45 backdrop-blur-[2px]"
            aria-hidden
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 z-[70] flex h-dvh w-full max-w-md flex-col bg-almond-light shadow-drawer"
            role="dialog"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between border-b border-sand px-6 py-5">
              <h2 className="font-serif text-title">Your Cart</h2>
              <button
                onClick={closeDrawer}
                aria-label="Close cart"
                className="rounded-full p-2 text-earth-deep transition-colors hover:bg-sand-light"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="text-sand" aria-hidden>
                  <path d="M5 8 H19 L18 20 A1.5 1.5 0 0 1 16.5 21.3 H7.5 A1.5 1.5 0 0 1 6 20 Z"
                    stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                  <path d="M9 8 V6.5 A3 3 0 0 1 15 6.5 V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <p className="font-serif text-xl text-earth">Your cart is empty</p>
                <p className="text-sm text-earth/80">
                  Fill it with botanicals your skin will thank you for.
                </p>
                <Link href="/products" onClick={closeDrawer} className="btn btn-primary mt-2">
                  Browse Products
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-sand/60 overflow-y-auto px-6">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={`${item.productId}-${item.scent}`}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="flex gap-4 py-5">
                          <Link href={`/products/${item.slug}`} onClick={closeDrawer}
                            className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border border-sand bg-almond">
                            <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                          </Link>
                          <div className="flex flex-1 flex-col">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <Link href={`/products/${item.slug}`} onClick={closeDrawer}
                                  className="text-sm font-semibold leading-snug hover:underline">
                                  {item.name}
                                </Link>
                                {item.scent && (
                                  <p className="mt-0.5 text-xs text-earth">{item.scent}</p>
                                )}
                              </div>
                              <button
                                onClick={() => removeItem(item.productId, item.scent)}
                                aria-label={`Remove ${item.name}`}
                                className="rounded p-1 text-earth/60 transition-colors hover:bg-sand-light hover:text-earth-deep"
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                                  <path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                              </button>
                            </div>
                            <div className="mt-auto flex items-center justify-between pt-2">
                              <div className="flex items-center rounded-full border border-sand bg-almond">
                                <button
                                  onClick={() => updateQuantity(item.productId, item.scent, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  aria-label="Decrease quantity"
                                  className="px-2.5 py-1 text-earth-deep transition-colors hover:text-moss-deep disabled:opacity-40"
                                >−</button>
                                <span className="min-w-6 text-center text-sm font-semibold">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.productId, item.scent, item.quantity + 1)}
                                  disabled={item.quantity >= item.stock}
                                  aria-label="Increase quantity"
                                  className="px-2.5 py-1 text-earth-deep transition-colors hover:text-moss-deep disabled:opacity-40"
                                >+</button>
                              </div>
                              <p className="text-sm font-bold">{formatINR(item.price * item.quantity)}</p>
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                <div className="border-t border-sand bg-almond px-6 py-5">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-earth">Subtotal</span>
                    <span className="font-serif text-xl font-semibold">{formatINR(subtotal)}</span>
                  </div>
                  <p className="mb-4 text-xs text-earth/75">
                    Shipping calculated at checkout. Free above ₹999.
                  </p>
                  <Link href="/checkout" onClick={closeDrawer} className="btn btn-primary w-full">
                    Proceed to Checkout
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
