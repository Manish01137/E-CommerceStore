"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import StatusBadge from "@/components/ui/StatusBadge";
import type { EnquiryDTO } from "@/lib/types";

const STATUSES = ["new", "contacted", "closed"];

export default function EnquiriesManager() {
  const { toast } = useToast();
  const [enquiries, setEnquiries] = useState<EnquiryDTO[] | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/enquiries")
      .then((r) => r.json())
      .then((d) => setEnquiries(d.enquiries ?? []))
      .catch(() => toast("Could not load enquiries", "error"));
  }, [toast]);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/enquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const d = await res.json();
      setEnquiries((prev) => prev!.map((e) => (e._id === id ? d.enquiry : e)));
      toast(`Enquiry marked ${status}`);
    } else {
      toast("Update failed", "error");
    }
  };

  const visible = enquiries?.filter((e) => filter === "all" || e.status === filter) ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">B2B Enquiries</h1>
          <p className="mt-1 text-sm text-earth">
            {enquiries ? `${enquiries.length} enquiries received` : "Loading…"}
          </p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          aria-label="Filter enquiries by status" className="field w-auto cursor-pointer">
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      {enquiries === null ? (
        <div className="mt-8 space-y-3">
          {[0, 1].map((i) => <div key={i} className="skeleton h-32" />)}
        </div>
      ) : visible.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-sand bg-almond-light p-10 text-earth">
          {filter === "all"
            ? "No business enquiries yet — they'll land here from the Business page form."
            : `No ${filter} enquiries.`}
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {visible.map((e, i) => (
            <motion.article
              key={e._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
              className="card p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-serif text-lg">
                    {e.name} <span className="text-earth">· {e.company}</span>
                  </h2>
                  <p className="mt-0.5 text-xs text-earth">
                    {formatDate(e.createdAt)} ·{" "}
                    <a href={`mailto:${e.email}`} className="font-semibold text-moss-deep hover:underline">
                      {e.email}
                    </a>
                    {e.phone && <> · {e.phone}</>}
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <StatusBadge status={e.status} />
                  <select
                    value={e.status}
                    onChange={(ev) => updateStatus(e._id, ev.target.value)}
                    aria-label={`Status for enquiry from ${e.name}`}
                    className="cursor-pointer rounded-lg border border-sand bg-almond px-2.5 py-1.5 text-xs font-semibold capitalize focus:border-moss focus:outline-none"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <p className="mt-3 inline-block rounded-full bg-sage/30 px-3 py-1 text-xs font-bold text-moss-deep">
                {e.quantity}
              </p>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-earth-deep">
                {e.message}
              </p>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
