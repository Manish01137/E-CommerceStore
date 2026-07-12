"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { formatINR, formatDate } from "@/lib/format";
import StatusBadge from "@/components/ui/StatusBadge";
import type { OrderDTO } from "@/lib/types";

const STEPS = ["placed", "processing", "shipped", "delivered"] as const;

export default function OrderDetailClient({ orderId }: { orderId: string }) {
  const searchParams = useSearchParams();
  const justPlaced = searchParams.get("placed") === "1";
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/orders/${orderId}?track=1`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => {
        setOrder(d.order);
        setLoading(false);
      })
      .catch(() => {
        setError("We couldn't find that order.");
        setLoading(false);
      });
  }, [orderId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
        <div className="skeleton h-10 w-64" />
        <div className="mt-8 skeleton h-40" />
        <div className="mt-4 skeleton h-64" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center gap-4 px-5 text-center">
        <h1 className="font-serif text-3xl">Order not found</h1>
        <p className="text-earth">{error}</p>
        <Link href="/account" className="btn btn-primary">Back to Account</Link>
      </div>
    );
  }

  const stepIndex =
    order.status === "cancelled" ? -1 : STEPS.indexOf(order.status as (typeof STEPS)[number]);

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 lg:px-8 lg:py-16">
      {justPlaced && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 overflow-hidden rounded-2xl bg-moss text-almond-light"
        >
          <div className="flex flex-wrap items-center gap-5 p-7">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.25, type: "spring", stiffness: 300, damping: 18 }}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-almond-light text-moss-deep"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4.5 12.5 L10 18 L19.5 6.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.span>
            <div>
              <h1 className="font-serif text-2xl">Thank you — your order is confirmed!</h1>
              <p className="mt-1 text-sm text-almond-light/85">
                Order number <strong>{order.orderNumber}</strong>. A confirmation
                has been recorded against your account.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-moss-dark">
            <Link href="/account" className="hover:underline">My Account</Link> / Order
          </p>
          <h2 className="mt-2 font-serif text-3xl">{order.orderNumber}</h2>
          <p className="mt-1 text-sm text-earth">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <StatusBadge status={order.paymentStatus} />
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Progress tracker */}
      {stepIndex >= 0 && (
        <div className="card mt-8 p-7">
          <ol className="grid grid-cols-4 gap-2">
            {STEPS.map((step, i) => {
              const done = i <= stepIndex;
              return (
                <li key={step} className="flex flex-col items-center gap-2 text-center">
                  <div className="flex w-full items-center">
                    <div className={`h-0.5 flex-1 ${i === 0 ? "opacity-0" : done ? "bg-moss" : "bg-sand"}`} />
                    <motion.span
                      initial={false}
                      animate={{ scale: done ? 1 : 0.85 }}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                        done ? "border-moss bg-moss text-almond-light" : "border-sand bg-almond text-earth/50"
                      }`}
                    >
                      {done ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path d="M5 12.5 L10 17.5 L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </motion.span>
                    <div className={`h-0.5 flex-1 ${i === STEPS.length - 1 ? "opacity-0" : i < stepIndex ? "bg-moss" : "bg-sand"}`} />
                  </div>
                  <span className={`text-xs font-semibold capitalize ${done ? "text-moss-deep" : "text-earth/60"}`}>
                    {step}
                  </span>
                </li>
              );
            })}
          </ol>

          {/* Shipping / tracking info */}
          <div className="mt-6 border-t border-sand pt-5">
            {order.shiprocket?.shipmentId ? (
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <div>
                  <p className="font-semibold">
                    Shipped via {order.shiprocket.courier || "our courier partner"}
                  </p>
                  {order.shiprocket.awbCode && (
                    <p className="text-earth">AWB: {order.shiprocket.awbCode}</p>
                  )}
                </div>
                {order.shiprocket.trackingUrl && (
                  <a
                    href={order.shiprocket.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                  >
                    Track Shipment
                  </a>
                )}
              </div>
            ) : (
              <p className="text-sm text-earth">
                {order.status === "delivered"
                  ? "Delivered — we hope you love it."
                  : order.paymentStatus === "paid"
                    ? "Your order is being prepared. Tracking details will appear here once it ships."
                    : "Tracking will be available after payment is confirmed."}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_18rem]">
        {/* Items */}
        <div className="card p-7">
          <h3 className="font-serif text-title">Items</h3>
          <ul className="mt-5 divide-y divide-sand/60">
            {order.items.map((item, i) => (
              <li key={i} className="flex items-center gap-4 py-4">
                <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg border border-sand bg-sand-light">
                  {item.image && <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-earth">
                    {item.scent && `${item.scent} · `}Qty {item.quantity}
                  </p>
                </div>
                <p className="font-bold">{formatINR(item.price * item.quantity)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-sand pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-earth">Subtotal</dt>
              <dd className="font-semibold">{formatINR(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-earth">Shipping</dt>
              <dd className="font-semibold">
                {order.shippingFee === 0 ? "Free" : formatINR(order.shippingFee)}
              </dd>
            </div>
            <div className="flex justify-between pt-2 text-base">
              <dt className="font-bold">Total</dt>
              <dd className="font-serif text-lg font-semibold">{formatINR(order.total)}</dd>
            </div>
          </dl>
        </div>

        {/* Delivery address */}
        <div className="card h-fit p-7">
          <h3 className="font-serif text-title">Delivering to</h3>
          <p className="mt-4 font-semibold">{order.shippingAddress.fullName}</p>
          <p className="mt-1 text-sm leading-relaxed text-earth">
            {order.shippingAddress.line1}
            {order.shippingAddress.line2 && <>, {order.shippingAddress.line2}</>}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state}
            <br />
            {order.shippingAddress.pincode}
            <br />
            {order.shippingAddress.phone}
          </p>
        </div>
      </div>
    </div>
  );
}
