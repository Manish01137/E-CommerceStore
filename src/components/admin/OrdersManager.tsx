"use client";

import { Fragment, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { formatINR, formatDate } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import StatusBadge from "@/components/ui/StatusBadge";
import type { OrderDTO } from "@/lib/types";

const STATUSES = ["placed", "processing", "shipped", "delivered", "cancelled"];

export default function OrdersManager() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderDTO[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders ?? []))
      .catch(() => toast("Could not load orders", "error"));
  }, [toast]);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const d = await res.json();
      setOrders((prev) => prev!.map((o) => (o._id === id ? d.order : o)));
      toast(`Order marked ${status}`);
    } else {
      toast("Update failed", "error");
    }
  };

  const visible = orders?.filter((o) => filter === "all" || o.status === filter) ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Orders</h1>
          <p className="mt-1 text-sm text-earth">
            {orders ? `${orders.length} orders total` : "Loading…"}
          </p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          aria-label="Filter orders by status" className="field w-auto cursor-pointer">
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      {orders === null ? (
        <div className="mt-8 space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="skeleton h-20" />)}
        </div>
      ) : visible.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-sand bg-almond-light p-10 text-earth">
          {filter === "all" ? "No orders yet." : `No ${filter} orders.`}
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-sand bg-almond-light">
          <table className="w-full min-w-[52rem] text-sm">
            <thead>
              <tr className="border-b border-sand text-left text-xs uppercase tracking-wider text-earth">
                <th className="px-5 py-3.5 font-semibold">Order</th>
                <th className="px-5 py-3.5 font-semibold">Customer</th>
                <th className="px-5 py-3.5 font-semibold">Date</th>
                <th className="px-5 py-3.5 font-semibold">Payment</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 text-right font-semibold">Total</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/60">
              {visible.map((o) => (
                <Fragment key={o._id}>
                  <tr className="transition-colors hover:bg-almond">
                    <td className="px-5 py-3.5 font-semibold">{o.orderNumber}</td>
                    <td className="px-5 py-3.5">
                      {typeof o.user === "object" ? (
                        <>
                          {o.user.name}
                          <span className="block text-xs text-earth">{o.user.email}</span>
                        </>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-earth">{formatDate(o.createdAt)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={o.paymentStatus} /></td>
                    <td className="px-5 py-3.5">
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o._id, e.target.value)}
                        aria-label={`Status for ${o.orderNumber}`}
                        className="cursor-pointer rounded-lg border border-sand bg-almond px-2.5 py-1.5 text-xs font-semibold capitalize focus:border-moss focus:outline-none"
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold">{formatINR(o.total)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setExpanded(expanded === o._id ? null : o._id)}
                        className="text-xs font-semibold text-moss-deep hover:underline"
                      >
                        {expanded === o._id ? "Hide" : "Details"}
                      </button>
                    </td>
                  </tr>
                  <AnimatePresence>
                    {expanded === o._id && (
                      <tr>
                        <td colSpan={7} className="bg-almond px-5 py-0">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="grid gap-6 py-5 md:grid-cols-2">
                              <div>
                                <p className="eyebrow text-[11px] text-earth">Items</p>
                                <ul className="mt-2 space-y-2">
                                  {o.items.map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                      <div className="relative h-10 w-8 shrink-0 overflow-hidden rounded border border-sand">
                                        {item.image && <Image src={item.image} alt="" fill sizes="32px" className="object-cover" />}
                                      </div>
                                      <span className="flex-1">
                                        {item.name}
                                        {item.scent && <span className="text-earth"> · {item.scent}</span>}
                                        <span className="text-earth"> × {item.quantity}</span>
                                      </span>
                                      <span className="font-semibold">{formatINR(item.price * item.quantity)}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="eyebrow text-[11px] text-earth">Shipping</p>
                                <p className="mt-2 text-sm">
                                  {o.shippingAddress.fullName} · {o.shippingAddress.phone}<br />
                                  {o.shippingAddress.line1}
                                  {o.shippingAddress.line2 && `, ${o.shippingAddress.line2}`}<br />
                                  {o.shippingAddress.city}, {o.shippingAddress.state} — {o.shippingAddress.pincode}
                                </p>
                                {o.shiprocket?.shipmentId ? (
                                  <p className="mt-3 text-sm">
                                    <span className="font-semibold">Shiprocket:</span>{" "}
                                    shipment {o.shiprocket.shipmentId}
                                    {o.shiprocket.awbCode && ` · AWB ${o.shiprocket.awbCode}`}
                                    {o.shiprocket.trackingUrl && (
                                      <>
                                        {" · "}
                                        <a href={o.shiprocket.trackingUrl} target="_blank" rel="noopener noreferrer"
                                          className="font-semibold text-moss-deep underline">
                                          track
                                        </a>
                                      </>
                                    )}
                                  </p>
                                ) : (
                                  <p className="mt-3 text-xs text-earth">
                                    No shipment created{o.paymentStatus !== "paid" && " (awaiting payment)"}.
                                  </p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
