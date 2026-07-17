"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import type { ProductDTO } from "@/lib/types";

const CATEGORIES = [
  "Soap",
  "Body Wash",
  "Body Lotion",
  "Body Scrub",
  "Face Wash",
  "Face Cream",
  "Face Pack",
  "Shampoo",
  "Conditioner",
  "Bath Salt",
  "Travel Kit",
];

interface Props {
  product: ProductDTO | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function ProductFormModal({ product, onClose, onSaved }: Props) {
  const { toast } = useToast();
  const isNew = product === null;
  const fileRef = useRef<HTMLInputElement>(null);

  const [values, setValues] = useState({
    name: product?.name ?? "",
    category: product?.category ?? "",
    size: product?.size ?? "",
    scents: product?.scents ?? ([] as string[]),
    description: product?.description ?? "",
    ingredients: product?.ingredients ?? "",
    price: product?.price?.toString() ?? "",
    compareAtPrice: product?.compareAtPrice?.toString() ?? "",
    stock: product?.stock?.toString() ?? "",
    featured: product?.featured ?? false,
    active: product?.active ?? true,
    images: product?.images ?? ([] as string[]),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [scentDraft, setScentDraft] = useState("");

  const addScent = () => {
    const value = scentDraft.trim();
    if (!value) return;
    setValues((v) =>
      v.scents.includes(value) ? v : { ...v, scents: [...v.scents, value] }
    );
    setScentDraft("");
  };

  const removeScent = (scent: string) =>
    setValues((v) => ({ ...v, scents: v.scents.filter((s) => s !== scent) }));

  const uploadImage = async (file: File) => {
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Upload failed", "error");
      } else {
        setValues((v) => ({ ...v, images: [...v.images, data.url] }));
      }
    } catch {
      toast("Upload failed — network error", "error");
    }
    setUploading(false);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (values.name.trim().length < 2) next.name = "Enter a product name";
    if (!values.category) next.category = "Pick a category";
    if (values.scents.length === 0) next.scents = "Add at least one scent or variant";
    if (values.description.trim().length < 10) next.description = "Write a short description (10+ characters)";
    const price = Number(values.price);
    if (!price || price <= 0) next.price = "Enter a valid price";
    if (values.compareAtPrice && Number(values.compareAtPrice) <= price) {
      next.compareAtPrice = "Compare-at price should be higher than the price";
    }
    const stock = Number(values.stock);
    if (values.stock === "" || !Number.isInteger(stock) || stock < 0) {
      next.stock = "Enter the stock count";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      name: values.name.trim(),
      category: values.category,
      size: values.size.trim(),
      scents: values.scents,
      description: values.description.trim(),
      ingredients: values.ingredients.trim(),
      price: Number(values.price),
      compareAtPrice: values.compareAtPrice ? Number(values.compareAtPrice) : null,
      stock: Number(values.stock),
      featured: values.featured,
      active: values.active,
      images: values.images,
    };
    try {
      const res = await fetch(isNew ? "/api/products" : `/api/products/${product!._id}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json();
        toast(d.error ?? "Save failed", "error");
        setSaving(false);
        return;
      }
      toast(isNew ? "Product created" : "Product updated");
      onSaved();
    } catch {
      toast("Network error — please try again", "error");
      setSaving(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] bg-earth-deep/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-[4vh] z-[85] mx-auto flex max-h-[92vh] w-[calc(100%-2rem)] max-w-2xl flex-col rounded-2xl bg-almond-light shadow-drawer"
        role="dialog"
        aria-label={isNew ? "Add product" : "Edit product"}
      >
        <div className="flex items-center justify-between border-b border-sand px-7 py-5">
          <h2 className="font-serif text-2xl">{isNew ? "Add product" : `Edit ${product!.name}`}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-2 hover:bg-sand-light">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-7 py-6">
          <div>
            <label className="mb-1.5 block text-sm font-semibold" htmlFor="p-name">Name</label>
            <input id="p-name" className={`field ${errors.name ? "field-error" : ""}`}
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold" htmlFor="p-category">Category</label>
              <select id="p-category" className={`field cursor-pointer ${errors.category ? "field-error" : ""}`}
                value={values.category}
                onChange={(e) => setValues((v) => ({ ...v, category: e.target.value }))}>
                <option value="">Select…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="form-error">{errors.category}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold" htmlFor="p-size">
                Pack size <span className="font-normal text-earth/70">(e.g. 200 ml)</span>
              </label>
              <input id="p-size" className="field" placeholder="100 gms"
                value={values.size}
                onChange={(e) => setValues((v) => ({ ...v, size: e.target.value }))} />
            </div>
          </div>

          {/* Scents / variants — free-form, one per product */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold" htmlFor="p-scent">
              Scents / variants{" "}
              <span className="font-normal text-earth/70">
                — what the customer picks at checkout
              </span>
            </label>
            <div className="flex gap-2">
              <input
                id="p-scent"
                className={`field ${errors.scents ? "field-error" : ""}`}
                placeholder="Type a scent and press Enter — e.g. Ocean Mist"
                value={scentDraft}
                onChange={(e) => setScentDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addScent();
                  }
                }}
              />
              <button type="button" onClick={addScent} className="btn btn-secondary shrink-0 px-5">
                Add
              </button>
            </div>
            {values.scents.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {values.scents.map((s) => (
                  <span key={s}
                    className="inline-flex items-center gap-1.5 rounded-full bg-moss px-3 py-1 text-xs font-semibold text-almond-light">
                    {s}
                    <button type="button" onClick={() => removeScent(s)} aria-label={`Remove ${s}`}
                      className="transition-opacity hover:opacity-70">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
            {errors.scents && <p className="form-error">{errors.scents}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold" htmlFor="p-desc">Description</label>
            <textarea id="p-desc" rows={3} className={`field resize-y ${errors.description ? "field-error" : ""}`}
              value={values.description}
              onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))} />
            {errors.description && <p className="form-error">{errors.description}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold" htmlFor="p-ingredients">
              Ingredients <span className="font-normal text-earth/70">(optional)</span>
            </label>
            <textarea id="p-ingredients" rows={2} className="field resize-y"
              value={values.ingredients}
              onChange={(e) => setValues((v) => ({ ...v, ingredients: e.target.value }))} />
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-semibold" htmlFor="p-price">Price (₹)</label>
              <input id="p-price" type="number" min="0" className={`field ${errors.price ? "field-error" : ""}`}
                value={values.price}
                onChange={(e) => setValues((v) => ({ ...v, price: e.target.value }))} />
              {errors.price && <p className="form-error">{errors.price}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold" htmlFor="p-compare">
                Compare-at (₹) <span className="font-normal text-earth/70">(optional)</span>
              </label>
              <input id="p-compare" type="number" min="0" className={`field ${errors.compareAtPrice ? "field-error" : ""}`}
                value={values.compareAtPrice}
                onChange={(e) => setValues((v) => ({ ...v, compareAtPrice: e.target.value }))} />
              {errors.compareAtPrice && <p className="form-error">{errors.compareAtPrice}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold" htmlFor="p-stock">Stock</label>
              <input id="p-stock" type="number" min="0" className={`field ${errors.stock ? "field-error" : ""}`}
                value={values.stock}
                onChange={(e) => setValues((v) => ({ ...v, stock: e.target.value }))} />
              {errors.stock && <p className="form-error">{errors.stock}</p>}
            </div>
          </div>

          {/* Images */}
          <div>
            <p className="mb-1.5 text-sm font-semibold">Images</p>
            <div className="flex flex-wrap gap-3">
              {values.images.map((img, i) => (
                <div key={img} className="group relative h-24 w-20 overflow-hidden rounded-xl border border-sand">
                  <Image src={img} alt="" fill sizes="80px" className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setValues((v) => ({ ...v, images: v.images.filter((_, j) => j !== i) }))}
                    aria-label="Remove image"
                    className="absolute right-1 top-1 rounded-full bg-earth-deep/70 p-1 text-almond-light opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex h-24 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-sand text-xs font-semibold text-earth transition-colors hover:border-moss hover:text-moss-deep disabled:opacity-50"
              >
                {uploading ? (
                  "…"
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M12 5 V19 M5 12 H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Upload
                  </>
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadImage(f);
                  e.target.value = "";
                }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 border-t border-sand pt-5">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold">
              <input type="checkbox" checked={values.featured}
                onChange={(e) => setValues((v) => ({ ...v, featured: e.target.checked }))}
                className="h-4 w-4 accent-[#8c916c]" />
              Featured on home page
            </label>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold">
              <input type="checkbox" checked={values.active}
                onChange={(e) => setValues((v) => ({ ...v, active: e.target.checked }))}
                className="h-4 w-4 accent-[#8c916c]" />
              Visible in store
            </label>
          </div>
        </div>

        <div className="flex gap-3 border-t border-sand px-7 py-5">
          <button onClick={save} disabled={saving || uploading} className="btn btn-primary flex-1">
            {saving ? "Saving…" : isNew ? "Create Product" : "Save Changes"}
          </button>
          <button onClick={onClose} className="btn btn-outline">Cancel</button>
        </div>
      </motion.div>
    </>
  );
}
