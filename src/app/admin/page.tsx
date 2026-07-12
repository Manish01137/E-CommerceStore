"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatINR, formatDate } from "@/lib/format";
import StatusBadge from "@/components/ui/StatusBadge";
import type { OrderDTO } from "@/lib/types";

interface Stats {
  revenue: number;
  orderCount: number;
  paidCount: number;
  customerCount: number;
  productCount: number;
  lowStock: number;
  newEnquiries: number;
  recentOrders: OrderDTO[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setStats)
      .catch(() => setError("Could not load dashboard data."));
  }, []);

  if (error) {
    return <p className="rounded-xl bg-[#8a4a2b]/10 p-6 font-semibold text-[#8a4a2b]">{error}</p>;
  }

  const tiles = stats
    ? [
        { label: "Revenue (paid orders)", value: formatINR(stats.revenue) },
        { label: "Orders", value: `${stats.orderCount}`, hint: `${stats.paidCount} paid` },
        { label: "Customers", value: `${stats.customerCount}` },
        {
          label: "New B2B enquiries",
          value: `${stats.newEnquiries}`,
          href: "/admin/enquiries",
        },
      ]
    : [];

  return (
    <div>
      <h1 className="font-serif text-3xl">Dashboard</h1>
      <p className="mt-1 text-sm text-earth">Sales overview and recent activity.</p>

      {/* Stat tiles */}
      {stats === null ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-28" />)}
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {tiles.map((t, i) => (
            <motion.div
              key={t.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              {t.href ? (
                <Link href={t.href} className="card card-hover block p-6">
                  <StatBody label={t.label} value={t.value} hint={t.hint} />
                </Link>
              ) : (
                <div className="card p-6">
                  <StatBody label={t.label} value={t.value} hint={t.hint} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {stats !== null && stats.lowStock > 0 && (
        <Link
          href="/admin/products"
          className="mt-4 block rounded-xl border border-[#b3542e]/30 bg-[#b3542e]/10 px-5 py-3.5 text-sm font-semibold text-[#8a4a2b] transition-colors hover:bg-[#b3542e]/15"
        >
          ⚠ {stats.lowStock} product{stats.lowStock > 1 ? "s are" : " is"} low on stock (≤ 5 units) — review inventory
        </Link>
      )}

      {/* Recent orders */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-title">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm font-semibold text-moss-deep hover:underline">
            View all
          </Link>
        </div>
        {stats === null ? (
          <div className="mt-4 skeleton h-64" />
        ) : stats.recentOrders.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-sand bg-almond-light p-8 text-earth">
            No orders yet. They&apos;ll appear here as customers check out.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-sand bg-almond-light">
            <table className="w-full min-w-[40rem] text-sm">
              <thead>
                <tr className="border-b border-sand text-left text-xs uppercase tracking-wider text-earth">
                  <th className="px-5 py-3.5 font-semibold">Order</th>
                  <th className="px-5 py-3.5 font-semibold">Customer</th>
                  <th className="px-5 py-3.5 font-semibold">Date</th>
                  <th className="px-5 py-3.5 font-semibold">Payment</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/60">
                {stats.recentOrders.map((o) => (
                  <tr key={o._id} className="transition-colors hover:bg-almond">
                    <td className="px-5 py-3.5 font-semibold">{o.orderNumber}</td>
                    <td className="px-5 py-3.5">
                      {typeof o.user === "object" ? o.user.name : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-earth">{formatDate(o.createdAt)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={o.paymentStatus} /></td>
                    <td className="px-5 py-3.5"><StatusBadge status={o.status} /></td>
                    <td className="px-5 py-3.5 text-right font-semibold">{formatINR(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatBody({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <>
      <p className="eyebrow text-[11px] text-earth">{label}</p>
      <p className="mt-2 font-serif text-3xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-xs text-earth">{hint}</p>}
    </>
  );
}
