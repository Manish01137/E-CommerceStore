"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { formatINR } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import ProductFormModal from "./ProductFormModal";
import type { ProductDTO } from "@/lib/types";

export default function ProductsManager() {
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductDTO[] | null>(null);
  const [editing, setEditing] = useState<ProductDTO | "new" | null>(null);
  const [deleting, setDeleting] = useState<ProductDTO | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    fetch("/api/products?sort=newest")
      .then((r) => r.json())
      .then((d) => setProducts(d.products))
      .catch(() => toast("Could not load products", "error"));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    const res = await fetch(`/api/products/${deleting._id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) {
      toast(`"${deleting.name}" deleted`, "info");
      setDeleting(null);
      load();
    } else {
      toast("Delete failed", "error");
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Products</h1>
          <p className="mt-1 text-sm text-earth">
            {products ? `${products.length} products in the catalogue` : "Loading…"}
          </p>
        </div>
        <button onClick={() => setEditing("new")} className="btn btn-primary">
          + Add Product
        </button>
      </div>

      {products === null ? (
        <div className="mt-8 space-y-3">
          {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-20" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="mt-8 flex flex-col items-start gap-4 rounded-2xl border border-sand bg-almond-light p-10">
          <p className="font-serif text-xl">No products yet</p>
          <p className="text-sm text-earth">Add your first product to open the store.</p>
          <button onClick={() => setEditing("new")} className="btn btn-primary">+ Add Product</button>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-sand bg-almond-light">
          <table className="w-full min-w-[48rem] text-sm">
            <thead>
              <tr className="border-b border-sand text-left text-xs uppercase tracking-wider text-earth">
                <th className="px-5 py-3.5 font-semibold">Product</th>
                <th className="px-5 py-3.5 font-semibold">Category</th>
                <th className="px-5 py-3.5 font-semibold">Scents</th>
                <th className="px-5 py-3.5 text-right font-semibold">Price</th>
                <th className="px-5 py-3.5 text-right font-semibold">Stock</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/60">
              {products.map((p) => (
                <tr key={p._id} className="transition-colors hover:bg-almond">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg border border-sand bg-sand-light">
                        {p.images[0] && (
                          <Image src={p.images[0]} alt="" fill sizes="40px" className="object-cover" />
                        )}
                      </div>
                      <span className="font-semibold">{p.name}</span>
                      {p.featured && (
                        <span className="rounded-full bg-sage/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-moss-deep">
                          Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-earth">{p.category}</td>
                  <td className="px-5 py-3 text-earth">{p.scents.join(", ")}</td>
                  <td className="px-5 py-3 text-right font-semibold">{formatINR(p.price)}</td>
                  <td className={`px-5 py-3 text-right font-semibold ${p.stock <= 5 ? "text-[#a3542a]" : ""}`}>
                    {p.stock}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      p.active ? "bg-moss/25 text-moss-deep" : "bg-earth/15 text-earth"
                    }`}>
                      {p.active ? "Live" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditing(p)}
                        className="rounded-lg border border-sand px-3 py-1.5 text-xs font-semibold transition-colors hover:border-moss hover:bg-sage/20"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleting(p)}
                        className="rounded-lg border border-sand px-3 py-1.5 text-xs font-semibold text-[#8a4a2b] transition-colors hover:border-[#b3542e] hover:bg-[#b3542e]/10"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / edit modal */}
      <AnimatePresence>
        {editing && (
          <ProductFormModal
            product={editing === "new" ? null : editing}
            onClose={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              load();
            }}
          />
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleting && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-earth-deep/50 backdrop-blur-sm"
              onClick={() => setDeleting(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-1/2 top-1/2 z-[85] w-[calc(100%-2.5rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-almond-light p-7 shadow-drawer"
              role="dialog"
            >
              <h3 className="font-serif text-xl">Delete “{deleting.name}”?</h3>
              <p className="mt-2 text-sm text-earth">
                This removes the product from the store permanently. Past orders
                keep their records.
              </p>
              <div className="mt-6 flex gap-3">
                <button onClick={confirmDelete} disabled={busy}
                  className="btn flex-1 bg-[#8a4a2b] text-almond-light hover:bg-[#743e24]">
                  {busy ? "Deleting…" : "Delete"}
                </button>
                <button onClick={() => setDeleting(null)} className="btn btn-outline flex-1">
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
