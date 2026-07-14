"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-earth text-almond-light">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="font-serif text-2xl">Ethereal Artisan</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-almond-light/80">
            Small-batch bath &amp; body care, crafted from botanicals grown with
            patience and pressed with care.
          </p>
        </div>

        <div>
          <p className="eyebrow mb-4 text-almond-light/70">Explore</p>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/products" className="transition-colors hover:text-sand-light">All Products</Link></li>
            <li><Link href="/shop" className="transition-colors hover:text-sand-light">Shop</Link></li>
            <li><Link href="/business" className="transition-colors hover:text-sand-light">Wholesale &amp; Business</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-4 text-almond-light/70">Account</p>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/account" className="transition-colors hover:text-sand-light">My Orders</Link></li>
            <li><Link href="/login" className="transition-colors hover:text-sand-light">Sign In</Link></li>
            <li><Link href="/register" className="transition-colors hover:text-sand-light">Create Account</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-4 text-almond-light/70">Get in Touch</p>
          <ul className="space-y-2.5 text-sm text-almond-light/85">
            <li>hello@etherealartisan.in</li>
            <li>+91 98765 43210</li>
            <li>Jaipur, Rajasthan, India</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-almond-light/15">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-almond-light/60 sm:flex-row lg:px-8">
          <p>© {new Date().getFullYear()} Ethereal Artisan. All rights reserved.</p>
          <p>Crafted with botanicals &amp; care.</p>
        </div>
      </div>
    </footer>
  );
}
