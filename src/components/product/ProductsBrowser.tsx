"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { ProductDTO } from "@/lib/types";
import ProductCard from "./ProductCard";
import type { Facets } from "@/lib/products";

const SORTS = [
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export default function ProductsBrowser({ facets }: { facets: Facets }) {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [scent, setScent] = useState(searchParams.get("scent") ?? "");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "popular");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    // Entering the loading state alongside the fetch this effect owns.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (scent) params.set("scent", scent);
    if (debouncedQuery) params.set("q", debouncedQuery);
    params.set("sort", sort);

    fetch(`/api/products?${params}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load products");
        return res.json();
      })
      .then((data) => {
        setProducts(data.products);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError("We couldn't load the catalogue. Please try again.");
        setLoading(false);
      });

    return () => controller.abort();
  }, [category, scent, sort, debouncedQuery, refreshKey]);

  const hasFilters = useMemo(
    () => Boolean(category || scent || debouncedQuery),
    [category, scent, debouncedQuery]
  );

  return (
    <div className="mt-10">
      {/* Controls */}
      <div className="flex flex-col gap-4 rounded-2xl border border-sand bg-almond-light p-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 md:max-w-sm">
          <svg
            width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-earth/60"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="M16.5 16.5 L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search soaps, face washes, scents…"
            aria-label="Search products"
            className="field pl-10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
            className="field w-auto cursor-pointer"
          >
            <option value="">All Categories</option>
            {facets.categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={scent}
            onChange={(e) => setScent(e.target.value)}
            aria-label="Filter by scent"
            className="field w-auto cursor-pointer"
          >
            <option value="">All Scents</option>
            {facets.scents.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort products"
            className="field w-auto cursor-pointer"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {category && (
            <FilterChip label={category} onClear={() => setCategory("")} />
          )}
          {scent && <FilterChip label={scent} onClear={() => setScent("")} />}
          {debouncedQuery && (
            <FilterChip label={`“${debouncedQuery}”`} onClear={() => setQuery("")} />
          )}
          <button
            onClick={() => {
              setCategory("");
              setScent("");
              setQuery("");
            }}
            className="text-xs font-semibold text-moss-deep underline-offset-2 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="mt-8 min-h-[24rem]">
        {loading ? (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="skeleton aspect-[4/5]" />
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-sand bg-almond-light py-20 text-center">
            <p className="font-serif text-xl text-earth">{error}</p>
            <button onClick={() => setRefreshKey((k) => k + 1)} className="btn btn-secondary">
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-sand bg-almond-light py-20 text-center">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" className="text-sand" aria-hidden>
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M16.5 16.5 L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p className="font-serif text-xl text-earth">Nothing matches that blend</p>
            <p className="max-w-sm text-sm text-earth/80">
              Try a different scent or category — or clear the filters to see
              the whole collection.
            </p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {products.map((p) => (
                <motion.div
                  key={p._id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-sage/40 px-3 py-1 text-xs font-semibold text-moss-deep">
      {label}
      <button onClick={onClear} aria-label={`Remove ${label} filter`} className="transition-colors hover:text-earth-deep">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>
    </span>
  );
}
