"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/Toast";

interface ShippingSettings {
  shippingFee: number;
  freeShippingAbove: number | null;
}

export default function SettingsManager() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<ShippingSettings | null>(null);
  const [shippingFee, setShippingFee] = useState("");
  // Kept as a separate toggle + number so unchecking "free shipping" cleanly
  // sends null instead of trying to parse an emptied text field.
  const [freeShippingEnabled, setFreeShippingEnabled] = useState(true);
  const [freeShippingAbove, setFreeShippingAbove] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: ShippingSettings | null) => {
        if (!d) {
          toast("Could not load delivery settings", "error");
          return;
        }
        setSettings(d);
        setShippingFee(String(d.shippingFee));
        setFreeShippingEnabled(d.freeShippingAbove !== null);
        setFreeShippingAbove(d.freeShippingAbove !== null ? String(d.freeShippingAbove) : "");
      })
      .catch(() => toast("Could not load delivery settings", "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    const fee = Number(shippingFee);
    if (!Number.isInteger(fee) || fee < 0) {
      toast("Enter a valid delivery fee", "error");
      return;
    }
    let threshold: number | null = null;
    if (freeShippingEnabled) {
      threshold = Number(freeShippingAbove);
      if (!Number.isInteger(threshold) || threshold < 0) {
        toast("Enter a valid free-shipping threshold", "error");
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shippingFee: fee, freeShippingAbove: threshold }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast(data?.error ?? `Save failed (HTTP ${res.status})`, "error");
      } else {
        setSettings(data);
        toast("Delivery settings saved");
      }
    } catch {
      toast("Save failed — check your internet connection", "error");
    }
    setSaving(false);
  };

  return (
    <div>
      <h1 className="font-serif text-3xl">Delivery Settings</h1>
      <p className="mt-1 text-sm text-earth">
        Set the flat delivery fee and the order value above which shipping is free.
      </p>

      {settings === null ? (
        <div className="mt-8 max-w-xl space-y-3">
          <div className="skeleton h-14" />
          <div className="skeleton h-14" />
        </div>
      ) : (
        <div className="card mt-8 max-w-xl p-6">
          <div>
            <label className="mb-1.5 block text-sm font-semibold" htmlFor="s-fee">
              Delivery fee (₹)
            </label>
            <input
              id="s-fee"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              value={shippingFee}
              onChange={(e) => setShippingFee(e.target.value)}
              className="field"
            />
            <p className="mt-1 text-xs text-earth/75">
              Charged on every order, unless free shipping applies below.
            </p>
          </div>

          <div className="mt-5 border-t border-sand pt-5">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold">
              <input
                type="checkbox"
                checked={freeShippingEnabled}
                onChange={(e) => setFreeShippingEnabled(e.target.checked)}
                className="h-4 w-4 accent-moss"
              />
              Offer free shipping above a cart value
            </label>

            {freeShippingEnabled && (
              <div className="mt-3">
                <label className="mb-1.5 block text-sm font-semibold" htmlFor="s-threshold">
                  Free shipping threshold (₹)
                </label>
                <input
                  id="s-threshold"
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  value={freeShippingAbove}
                  onChange={(e) => setFreeShippingAbove(e.target.value)}
                  className="field"
                />
                <p className="mt-1 text-xs text-earth/75">
                  Orders at or above this subtotal skip the delivery fee entirely.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="btn btn-primary mt-6 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}
