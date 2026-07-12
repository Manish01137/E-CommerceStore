"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/components/cart/CartContext";
import { useToast } from "@/components/ui/Toast";
import { formatINR } from "@/lib/format";
import type { AddressDTO } from "@/lib/types";

const FREE_SHIPPING_ABOVE = 999;
const SHIPPING_FEE = 79;

const EMPTY_ADDRESS = {
  fullName: "",
  phone: "",
  email: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, cb: (resp: { error: { description?: string } }) => void) => void;
    };
  }
}

export default function CheckoutClient() {
  const router = useRouter();
  const { items, hydrated, subtotal, clearCart } = useCart();
  const { toast } = useToast();

  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [saveAddress, setSaveAddress] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState<AddressDTO[]>([]);
  const [selectedSaved, setSelectedSaved] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);
  const [mockOrder, setMockOrder] = useState<{ orderId: string; orderNumber: string; total: number } | null>(null);
  const [mockBusy, setMockBusy] = useState(false);

  const shippingFee = subtotal >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;
  const total = subtotal + shippingFee;

  useEffect(() => {
    fetch("/api/account/addresses")
      .then((r) => (r.ok ? r.json() : { addresses: [] }))
      .then((d) => setSavedAddresses(d.addresses ?? []))
      .catch(() => {});
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user?.email) {
          setAddress((a) => ({ ...a, email: a.email || d.user.email }));
        }
      })
      .catch(() => {});
  }, []);

  const applySaved = (id: string) => {
    setSelectedSaved(id);
    const found = savedAddresses.find((a) => a._id === id);
    if (found) {
      setAddress((a) => ({
        ...a,
        fullName: found.fullName,
        phone: found.phone,
        line1: found.line1,
        line2: found.line2,
        city: found.city,
        state: found.state,
        pincode: found.pincode,
      }));
      setErrors({});
    }
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (address.fullName.trim().length < 2) next.fullName = "Enter the recipient's name";
    if (!/^[6-9]\d{9}$/.test(address.phone)) next.phone = "Enter a valid 10-digit mobile number";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) next.email = "Enter a valid email";
    if (address.line1.trim().length < 5) next.line1 = "Enter the street address";
    if (address.city.trim().length < 2) next.city = "Enter the city";
    if (address.state.trim().length < 2) next.state = "Enter the state";
    if (!/^\d{6}$/.test(address.pincode)) next.pincode = "Enter a valid 6-digit PIN code";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const finishSuccess = (orderId: string) => {
    clearCart();
    router.push(`/account/orders/${orderId}?placed=1`);
  };

  const openRazorpay = (
    orderId: string,
    payment: { razorpayOrderId: string; keyId: string; amount: number }
  ) => {
    const launch = () => {
      const rzp = new window.Razorpay!({
        key: payment.keyId,
        amount: payment.amount,
        currency: "INR",
        name: "Terra Botanica",
        description: "Organic bath & body",
        order_id: payment.razorpayOrderId,
        prefill: { name: address.fullName, email: address.email, contact: address.phone },
        theme: { color: "#8c916c" },
        handler: async (resp: RazorpayResponse) => {
          const verify = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId, ...resp }),
          });
          if (verify.ok) {
            toast("Payment successful — order confirmed!");
            finishSuccess(orderId);
          } else {
            const d = await verify.json();
            toast(d.error ?? "Payment verification failed", "error");
            setPlacing(false);
          }
        },
        modal: { ondismiss: () => setPlacing(false) },
      });
      rzp.on("payment.failed", () => {
        toast("Payment failed — please try again", "error");
        setPlacing(false);
      });
      rzp.open();
    };

    if (window.Razorpay) {
      launch();
    } else {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = launch;
      script.onerror = () => {
        toast("Could not load the payment gateway", "error");
        setPlacing(false);
      };
      document.body.appendChild(script);
    }
  };

  const placeOrder = async () => {
    if (!validate()) {
      toast("Please fix the highlighted fields", "error");
      return;
    }
    setPlacing(true);

    if (saveAddress && !selectedSaved) {
      // Fire-and-forget; a failure here shouldn't block the order
      fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: "Home", ...address }),
      }).catch(() => {});
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            scent: i.scent,
            quantity: i.quantity,
          })),
          address,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Could not place the order", "error");
        setPlacing(false);
        return;
      }

      if (data.payment.provider === "razorpay") {
        openRazorpay(data.orderId, data.payment);
      } else {
        setMockOrder({ orderId: data.orderId, orderNumber: data.orderNumber, total: data.total });
      }
    } catch {
      toast("Network error — please try again", "error");
      setPlacing(false);
    }
  };

  const settleMock = async (outcome: "success" | "failure") => {
    if (!mockOrder) return;
    setMockBusy(true);
    const res = await fetch("/api/payment/mock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: mockOrder.orderId, outcome }),
    });
    setMockBusy(false);
    if (res.ok) {
      toast("Payment successful — order confirmed!");
      finishSuccess(mockOrder.orderId);
    } else {
      const d = await res.json();
      toast(d.error ?? "Payment failed", "error");
      setMockOrder(null);
      setPlacing(false);
    }
  };

  const set = (field: keyof typeof EMPTY_ADDRESS) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setAddress((a) => ({ ...a, [field]: e.target.value }));

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
        <div className="skeleton h-8 w-48" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_24rem]">
          <div className="skeleton h-96" />
          <div className="skeleton h-64" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-5 text-center">
        <h1 className="font-serif text-3xl">Your cart is empty</h1>
        <p className="text-earth">Add something lovely before checking out.</p>
        <Link href="/products" className="btn btn-primary mt-2">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 lg:px-8 lg:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="eyebrow text-moss-dark">Checkout</p>
        <h1 className="mt-2 text-display">Almost there</h1>
      </motion.div>

      <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1fr_24rem]">
        {/* Shipping form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          onSubmit={(e) => {
            e.preventDefault();
            placeOrder();
          }}
          noValidate
          className="card p-7"
        >
          <h2 className="font-serif text-title">Shipping address</h2>

          {savedAddresses.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold">Saved addresses</p>
              <div className="flex flex-wrap gap-2.5">
                {savedAddresses.map((a) => (
                  <button
                    key={a._id}
                    type="button"
                    onClick={() => applySaved(a._id!)}
                    className={`rounded-xl border px-4 py-2.5 text-left text-xs transition-all duration-200 ${
                      selectedSaved === a._id
                        ? "border-moss bg-sage/25"
                        : "border-sand bg-almond hover:border-moss"
                    }`}
                  >
                    <span className="block font-bold">{a.label} · {a.fullName}</span>
                    <span className="text-earth">{a.line1}, {a.city} {a.pincode}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSaved("");
                    setAddress((a) => ({ ...EMPTY_ADDRESS, email: a.email }));
                  }}
                  className={`rounded-xl border border-dashed px-4 py-2.5 text-xs font-semibold transition-colors ${
                    selectedSaved === "" ? "border-moss text-moss-deep" : "border-sand text-earth hover:border-moss"
                  }`}
                >
                  + New address
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field label="Full name" id="fullName" error={errors.fullName}>
              <input id="fullName" className={`field ${errors.fullName ? "field-error" : ""}`}
                value={address.fullName} onChange={set("fullName")} autoComplete="name" placeholder="Asha Sharma" />
            </Field>
            <Field label="Mobile number" id="phone" error={errors.phone}>
              <input id="phone" className={`field ${errors.phone ? "field-error" : ""}`}
                value={address.phone} onChange={set("phone")} autoComplete="tel" inputMode="numeric"
                placeholder="98765 43210" maxLength={10} />
            </Field>
            <Field label="Email" id="email" error={errors.email} full>
              <input id="email" type="email" className={`field ${errors.email ? "field-error" : ""}`}
                value={address.email} onChange={set("email")} autoComplete="email" placeholder="you@example.com" />
            </Field>
            <Field label="Address line 1" id="line1" error={errors.line1} full>
              <input id="line1" className={`field ${errors.line1 ? "field-error" : ""}`}
                value={address.line1} onChange={set("line1")} autoComplete="address-line1"
                placeholder="Flat / house no., street" />
            </Field>
            <Field label="Address line 2 (optional)" id="line2" full>
              <input id="line2" className="field" value={address.line2} onChange={set("line2")}
                autoComplete="address-line2" placeholder="Landmark, area" />
            </Field>
            <Field label="City" id="city" error={errors.city}>
              <input id="city" className={`field ${errors.city ? "field-error" : ""}`}
                value={address.city} onChange={set("city")} autoComplete="address-level2" placeholder="Jaipur" />
            </Field>
            <Field label="State" id="state" error={errors.state}>
              <input id="state" className={`field ${errors.state ? "field-error" : ""}`}
                value={address.state} onChange={set("state")} autoComplete="address-level1" placeholder="Rajasthan" />
            </Field>
            <Field label="PIN code" id="pincode" error={errors.pincode}>
              <input id="pincode" className={`field ${errors.pincode ? "field-error" : ""}`}
                value={address.pincode} onChange={set("pincode")} autoComplete="postal-code"
                inputMode="numeric" placeholder="302001" maxLength={6} />
            </Field>
          </div>

          {!selectedSaved && (
            <label className="mt-5 flex cursor-pointer items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
                className="h-4 w-4 accent-[#8c916c]"
              />
              Save this address for next time
            </label>
          )}

          <button type="submit" disabled={placing} className="btn btn-primary mt-7 w-full">
            {placing ? "Processing…" : `Pay ${formatINR(total)}`}
          </button>
          <p className="mt-3 text-center text-xs text-earth/75">
            Secured by Razorpay · UPI, cards &amp; net-banking accepted
          </p>
        </motion.form>

        {/* Order summary */}
        <motion.aside
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="card sticky top-24 p-7"
        >
          <h2 className="font-serif text-title">Order summary</h2>
          <ul className="mt-5 space-y-4">
            {items.map((item) => (
              <li key={`${item.productId}-${item.scent}`} className="flex items-center gap-3.5">
                <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg border border-sand">
                  <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-earth">
                    {item.scent && `${item.scent} · `}Qty {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-bold">{formatINR(item.price * item.quantity)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-2 border-t border-sand pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-earth">Subtotal</dt>
              <dd className="font-semibold">{formatINR(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-earth">Shipping</dt>
              <dd className="font-semibold">
                {shippingFee === 0 ? <span className="text-moss-deep">Free</span> : formatINR(shippingFee)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-sand pt-3 text-base">
              <dt className="font-bold">Total</dt>
              <dd className="font-serif text-xl font-semibold">{formatINR(total)}</dd>
            </div>
          </dl>
          {shippingFee > 0 && (
            <p className="mt-3 rounded-lg bg-sage/25 px-3 py-2 text-xs text-moss-deep">
              Add {formatINR(FREE_SHIPPING_ABOVE - subtotal)} more for free shipping.
            </p>
          )}
        </motion.aside>
      </div>

      {/* Mock payment dialog (dev mode without Razorpay keys) */}
      <AnimatePresence>
        {mockOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-earth-deep/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-1/2 top-1/2 z-[85] w-[calc(100%-2.5rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-almond-light p-7 shadow-drawer"
              role="dialog" aria-label="Test payment"
            >
              <p className="eyebrow text-moss-dark">Test Mode</p>
              <h3 className="mt-2 font-serif text-2xl">Simulated payment</h3>
              <p className="mt-3 text-sm text-earth">
                No Razorpay keys are configured, so this sandbox simulates the
                gateway. Order <strong>{mockOrder.orderNumber}</strong> —{" "}
                <strong>{formatINR(mockOrder.total)}</strong>.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <button onClick={() => settleMock("success")} disabled={mockBusy} className="btn btn-primary">
                  {mockBusy ? "Processing…" : "Simulate successful payment"}
                </button>
                <button onClick={() => settleMock("failure")} disabled={mockBusy} className="btn btn-outline">
                  Simulate failed payment
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  label,
  id,
  error,
  full,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      {children}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
