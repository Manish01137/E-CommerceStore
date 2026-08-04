"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-earth text-almond-light">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <Image
            src="/brand/logo-compact.png"
            alt="Ethereal Artisan"
            width={277}
            height={87}
            className="h-11 w-auto"
          />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-almond-light/80">
            Small-batch bath &amp; body care, crafted from botanicals grown with
            patience and pressed with care.
          </p>
        </div>

        <div>
          <p className="eyebrow mb-4 text-almond-light/70">Explore</p>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/products" className="transition-colors hover:text-sand-light">All Products</Link></li>
            <li><Link href="/about" className="transition-colors hover:text-sand-light">About Us</Link></li>
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
            <li>+91 98313 01409</li>
            <li>+91 90073 38118</li>
            <li>203 Radhika Residency, Near Uma Amar Party Plot</li>
            <li>Gorwa Bridge Road, Vadodara, Gujarat 390024</li>
          </ul>

          <div className="mt-5 flex items-center gap-3">
            <a
              href="https://www.instagram.com/ethereal_artisansoap?utm_source=qr&igsh=cWpvaWNoaml2ZjNt"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ethereal Artisan on Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-almond-light/25 transition-colors hover:border-almond-light/50 hover:text-sand-light"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
                <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/share/188e6GK1Nf/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ethereal Artisan on Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-almond-light/25 transition-colors hover:border-almond-light/50 hover:text-sand-light"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                <path d="M14 8.5 H12.8 C11.8 8.5 11 9.3 11 10.3 V12 H14 L13.6 14.3 H11 V19.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
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
