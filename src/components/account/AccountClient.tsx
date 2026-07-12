"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { formatINR, formatDate } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import StatusBadge from "@/components/ui/StatusBadge";
import type { OrderDTO, AddressDTO } from "@/lib/types";

interface Me {
  name: string;
  email: string;
  role: string;
}

export default function AccountClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [me, setMe] = useState<Me | null>(null);
  const [orders, setOrders] = useState<OrderDTO[] | null>(null);
  const [addresses, setAddresses] = useState<AddressDTO[] | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setMe(d.user));
    fetch("/api/orders").then((r) => r.json()).then((d) => setOrders(d.orders ?? []));
    fetch("/api/account/addresses").then((r) => r.json()).then((d) => setAddresses(d.addresses ?? []));
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast("Signed out — see you soon", "info");
    router.push("/");
    router.refresh();
  };

  const removeAddress = async (id: string) => {
    const res = await fetch(`/api/account/addresses?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      const d = await res.json();
      setAddresses(d.addresses);
      toast("Address removed", "info");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8 lg:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <p className="eyebrow text-moss-dark">My Account</p>
          <h1 className="mt-2 text-display">
            {me ? `Hello, ${me.name.split(" ")[0]}` : "Hello"}
          </h1>
          {me && <p className="mt-1 text-sm text-earth">{me.email}</p>}
        </div>
        <div className="flex gap-3">
          {me?.role === "admin" && (
            <Link href="/admin" className="btn btn-secondary">Admin Panel</Link>
          )}
          <button onClick={logout} className="btn btn-outline">Sign Out</button>
        </div>
      </motion.div>

      {/* Orders */}
      <section className="mt-12">
        <h2 className="font-serif text-title">Order history</h2>
        {orders === null ? (
          <div className="mt-5 space-y-3">
            {[0, 1].map((i) => <div key={i} className="skeleton h-24" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-5 flex flex-col items-start gap-3 rounded-2xl border border-sand bg-almond-light p-8">
            <p className="text-earth">You haven&apos;t placed any orders yet.</p>
            <Link href="/products" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <ul className="mt-5 space-y-4">
            {orders.map((order) => (
              <li key={order._id}>
                <Link
                  href={`/account/orders/${order._id}`}
                  className="card card-hover flex flex-wrap items-center gap-5 p-5"
                >
                  <div className="flex -space-x-3">
                    {order.items.slice(0, 3).map((item, i) => (
                      <div key={i} className="relative h-14 w-12 overflow-hidden rounded-lg border-2 border-almond-light bg-sand-light">
                        {item.image && <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />}
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="flex h-14 w-12 items-center justify-center rounded-lg border-2 border-almond-light bg-sand text-xs font-bold text-earth-deep">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{order.orderNumber}</p>
                    <p className="text-xs text-earth">
                      {formatDate(order.createdAt)} · {order.items.reduce((s, i) => s + i.quantity, 0)} items
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                  <p className="font-serif text-lg font-semibold">{formatINR(order.total)}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Addresses */}
      <section className="mt-12">
        <h2 className="font-serif text-title">Saved addresses</h2>
        {addresses === null ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="skeleton h-32" />
            <div className="skeleton h-32" />
          </div>
        ) : addresses.length === 0 ? (
          <p className="mt-5 rounded-2xl border border-sand bg-almond-light p-8 text-earth">
            No saved addresses yet — one will be saved automatically when you
            check out.
          </p>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {addresses.map((a) => (
              <div key={a._id} className="card relative p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-moss-dark">{a.label}</p>
                <p className="mt-2 font-semibold">{a.fullName}</p>
                <p className="mt-1 text-sm text-earth">
                  {a.line1}{a.line2 && `, ${a.line2}`}<br />
                  {a.city}, {a.state} — {a.pincode}<br />
                  {a.phone}
                </p>
                <button
                  onClick={() => removeAddress(a._id!)}
                  aria-label={`Delete address ${a.label}`}
                  className="absolute right-4 top-4 rounded p-1.5 text-earth/50 transition-colors hover:bg-sand-light hover:text-earth-deep"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M5 7 H19 M9 7 V5 A1 1 0 0 1 10 4 H14 A1 1 0 0 1 15 5 V7 M7 7 L8 20 H16 L17 7"
                      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
