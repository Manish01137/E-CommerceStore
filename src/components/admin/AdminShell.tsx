"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "M4 13 L10 13 L10 4 L4 4 Z M4 20 L10 20 L10 16 L4 16 Z M14 20 L20 20 L20 11 L14 11 Z M14 8 L20 8 L20 4 L14 4 Z" },
  { href: "/admin/products", label: "Products", icon: "M12 3 L20 7.5 L20 16.5 L12 21 L4 16.5 L4 7.5 Z M4 7.5 L12 12 L20 7.5 M12 12 L12 21" },
  { href: "/admin/orders", label: "Orders", icon: "M6 4 L18 4 L18 20 L6 20 Z M9 8 H15 M9 12 H15 M9 16 H12" },
  { href: "/admin/customers", label: "Customers", icon: "M9 11 A3.5 3.5 0 1 0 9 4 A3.5 3.5 0 0 0 9 11 Z M2.5 20 C 2.5 15.5 5.5 13.5 9 13.5 C 12.5 13.5 15.5 15.5 15.5 20 M16 11 A3 3 0 1 0 15 4.2 M17 13.6 C 19.8 14.2 21.5 16.2 21.5 20" },
  { href: "/admin/enquiries", label: "B2B Enquiries", icon: "M4 5 L20 5 L20 17 L13 17 L8 21 L8 17 L4 17 Z M8 9 H16 M8 12 H13" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNav, setMobileNav] = useState(false);

  // The login page stands alone, outside the shell
  if (pathname === "/admin/login") return <>{children}</>;

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="flex min-h-dvh bg-almond">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-earth-deep text-almond-light transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileNav ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-almond-light/10 px-6 py-5">
          <Image
            src="/brand/logo-compact.png"
            alt="Ethereal Artisan"
            width={277}
            height={87}
            className="h-10 w-auto"
          />
          <p className="eyebrow mt-2 text-almond-light/60">Admin Panel</p>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-5">
          {NAV.map((item) => {
            const active =
              item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNav(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                  active
                    ? "bg-moss text-almond-light"
                    : "text-almond-light/75 hover:bg-earth-dark hover:text-almond-light"
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d={item.icon} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-1 border-t border-almond-light/10 px-3 py-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-almond-light/75 transition-colors hover:bg-earth-dark hover:text-almond-light"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M3 11 L12 4 L21 11 M6 9.5 V20 H18 V9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            View Store
          </Link>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-almond-light/75 transition-colors hover:bg-earth-dark hover:text-almond-light"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M15 4 H6 V20 H15 M11 12 H21 M21 12 L17.5 8.5 M21 12 L17.5 15.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {mobileNav && (
        <div
          className="fixed inset-0 z-30 bg-earth-deep/40 lg:hidden"
          onClick={() => setMobileNav(false)}
          aria-hidden
        />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-sand bg-almond-light px-5 py-3.5 lg:hidden">
          <button
            onClick={() => setMobileNav(true)}
            aria-label="Open admin menu"
            className="rounded-lg p-2 text-earth-deep hover:bg-sand-light"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M4 7 H20 M4 12 H20 M4 17 H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <p className="font-serif text-lg">Admin</p>
        </header>
        <main className="flex-1 px-5 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
