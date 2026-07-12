"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/components/ui/Toast";

const QUANTITY_OPTIONS = [
  "100 – 500 units",
  "500 – 2,000 units",
  "2,000 – 10,000 units",
  "10,000+ units",
  "Not sure yet",
];

const EMPTY = { name: "", company: "", email: "", phone: "", quantity: "", message: "" };

export default function EnquiryForm() {
  const { toast } = useToast();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const next: Record<string, string> = {};
    if (values.name.trim().length < 2) next.name = "Enter your name";
    if (values.company.trim().length < 2) next.company = "Enter your company name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = "Enter a valid email address";
    if (values.phone && !/^[6-9]\d{9}$/.test(values.phone)) next.phone = "Enter a valid 10-digit mobile number";
    if (!values.quantity) next.quantity = "Select an approximate quantity";
    if (values.message.trim().length < 10) next.message = "Tell us a little more (at least 10 characters)";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Something went wrong", "error");
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch {
      toast("Network error — please try again", "error");
      setSubmitting(false);
    }
  };

  const set = (field: keyof typeof EMPTY) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [field]: e.target.value }));

  return (
    <div className="mt-10">
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="thanks"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="card flex flex-col items-center gap-4 p-10 text-center"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 280, damping: 16 }}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-moss text-almond-light"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4.5 12.5 L10 18 L19.5 6.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.span>
            <h3 className="font-serif text-2xl">Thank you, {values.name.split(" ")[0]}.</h3>
            <p className="max-w-md text-earth">
              Your enquiry has reached our partnerships team. Expect a personal
              reply at <strong>{values.email}</strong> within two working days.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleSubmit}
            noValidate
            className="card space-y-5 p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="b-name" className="mb-1.5 block text-sm font-semibold">Your name</label>
                <input id="b-name" className={`field ${errors.name ? "field-error" : ""}`}
                  value={values.name} onChange={set("name")} placeholder="Asha Sharma" autoComplete="name" />
                {errors.name && <p className="form-error">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="b-company" className="mb-1.5 block text-sm font-semibold">Company</label>
                <input id="b-company" className={`field ${errors.company ? "field-error" : ""}`}
                  value={values.company} onChange={set("company")} placeholder="The Lotus Hotel" autoComplete="organization" />
                {errors.company && <p className="form-error">{errors.company}</p>}
              </div>
              <div>
                <label htmlFor="b-email" className="mb-1.5 block text-sm font-semibold">Work email</label>
                <input id="b-email" type="email" className={`field ${errors.email ? "field-error" : ""}`}
                  value={values.email} onChange={set("email")} placeholder="you@company.com" autoComplete="email" />
                {errors.email && <p className="form-error">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="b-phone" className="mb-1.5 block text-sm font-semibold">
                  Phone <span className="font-normal text-earth/70">(optional)</span>
                </label>
                <input id="b-phone" className={`field ${errors.phone ? "field-error" : ""}`}
                  value={values.phone} onChange={set("phone")} placeholder="98765 43210"
                  inputMode="numeric" maxLength={10} autoComplete="tel" />
                {errors.phone && <p className="form-error">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="b-quantity" className="mb-1.5 block text-sm font-semibold">
                Quantity of interest
              </label>
              <select id="b-quantity" className={`field cursor-pointer ${errors.quantity ? "field-error" : ""}`}
                value={values.quantity} onChange={set("quantity")}>
                <option value="">Select a range…</option>
                {QUANTITY_OPTIONS.map((q) => <option key={q} value={q}>{q}</option>)}
              </select>
              {errors.quantity && <p className="form-error">{errors.quantity}</p>}
            </div>

            <div>
              <label htmlFor="b-message" className="mb-1.5 block text-sm font-semibold">
                Tell us about your requirement
              </label>
              <textarea id="b-message" rows={5} className={`field resize-y ${errors.message ? "field-error" : ""}`}
                value={values.message} onChange={set("message")}
                placeholder="Products you're interested in, timelines, private-label needs…" />
              {errors.message && <p className="form-error">{errors.message}</p>}
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary w-full">
              {submitting ? "Sending…" : "Send Enquiry"}
            </button>
            <p className="text-center text-xs text-earth/75">
              We reply personally to every enquiry — no automated quotes.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
