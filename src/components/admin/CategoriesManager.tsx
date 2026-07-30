"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/Toast";

interface Category {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  productCount: number;
}

export default function CategoriesManager() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []))
      .catch(() => toast("Could not load categories", "error"));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const create = async () => {
    const name = newName.trim();
    if (name.length < 2) {
      toast("Enter a category name", "error");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast(data?.error ?? "Could not create category", "error");
      } else {
        toast(`"${name}" added`);
        setNewName("");
        load();
      }
    } catch {
      toast("Network error — please try again", "error");
    }
    setCreating(false);
  };

  const startRename = (c: Category) => {
    setRenamingId(c.id);
    setRenameValue(c.name);
  };

  const saveRename = async (id: string) => {
    const name = renameValue.trim();
    if (name.length < 2) {
      toast("Enter a category name", "error");
      return;
    }
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast(data?.error ?? "Rename failed", "error");
      } else {
        toast("Category renamed — every product using it was updated too");
        setRenamingId(null);
        load();
      }
    } catch {
      toast("Network error — please try again", "error");
    }
    setBusyId(null);
  };

  const remove = async (c: Category) => {
    if (!confirm(`Delete "${c.name}"? This can't be undone.`)) return;
    setBusyId(c.id);
    try {
      const res = await fetch(`/api/admin/categories/${c.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast(data?.error ?? "Delete failed", "error");
      } else {
        toast(`"${c.name}" deleted`, "info");
        load();
      }
    } catch {
      toast("Network error — please try again", "error");
    }
    setBusyId(null);
  };

  return (
    <div>
      <div>
        <h1 className="font-serif text-3xl">Categories</h1>
        <p className="mt-1 text-sm text-earth">
          {categories ? `${categories.length} categories` : "Loading…"} — rename here and
          every product using it updates automatically.
        </p>
      </div>

      <div className="mt-6 flex max-w-md gap-2">
        <input
          className="field"
          placeholder="New category name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && create()}
        />
        <button onClick={create} disabled={creating} className="btn btn-primary shrink-0">
          {creating ? "Adding…" : "+ Add"}
        </button>
      </div>

      {categories === null ? (
        <div className="mt-8 space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="skeleton h-14" />)}
        </div>
      ) : categories.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-sand bg-almond-light p-10 text-earth">
          No categories yet — add one above.
        </p>
      ) : (
        <div className="mt-8 divide-y divide-sand/60 rounded-2xl border border-sand bg-almond-light">
          {categories.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.2) }}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              {renamingId === c.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    className="field"
                    value={renameValue}
                    autoFocus
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveRename(c.id)}
                  />
                  <button
                    onClick={() => saveRename(c.id)}
                    disabled={busyId === c.id}
                    className="btn btn-primary shrink-0 px-4 py-2 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setRenamingId(null)}
                    className="btn btn-outline shrink-0 px-4 py-2 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-xs text-earth">
                      {c.productCount} product{c.productCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => startRename(c)}
                      className="rounded-lg border border-sand px-3 py-1.5 text-xs font-semibold transition-colors hover:border-moss hover:bg-sage/20"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => remove(c)}
                      disabled={busyId === c.id}
                      className="rounded-lg border border-sand px-3 py-1.5 text-xs font-semibold text-[#8a4a2b] transition-colors hover:border-[#b3542e] hover:bg-[#b3542e]/10 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
