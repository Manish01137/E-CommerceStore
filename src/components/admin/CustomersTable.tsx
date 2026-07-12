"use client";

import { useEffect, useState } from "react";
import { formatINR, formatDate } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";

interface Customer {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

export default function CustomersTable() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then((d) => setCustomers(d.customers ?? []))
      .catch(() => toast("Could not load customers", "error"));
  }, [toast]);

  return (
    <div>
      <h1 className="font-serif text-3xl">Customers</h1>
      <p className="mt-1 text-sm text-earth">
        {customers ? `${customers.length} registered customers` : "Loading…"}
      </p>

      {customers === null ? (
        <div className="mt-8 space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="skeleton h-16" />)}
        </div>
      ) : customers.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-sand bg-almond-light p-10 text-earth">
          No customers have registered yet.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-sand bg-almond-light">
          <table className="w-full min-w-[36rem] text-sm">
            <thead>
              <tr className="border-b border-sand text-left text-xs uppercase tracking-wider text-earth">
                <th className="px-5 py-3.5 font-semibold">Customer</th>
                <th className="px-5 py-3.5 font-semibold">Joined</th>
                <th className="px-5 py-3.5 text-right font-semibold">Orders</th>
                <th className="px-5 py-3.5 text-right font-semibold">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/60">
              {customers.map((c) => (
                <tr key={c._id} className="transition-colors hover:bg-almond">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage/40 font-serif text-sm font-semibold text-moss-deep">
                        {c.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                      </span>
                      <div>
                        <p className="font-semibold">{c.name}</p>
                        <p className="text-xs text-earth">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-earth">{formatDate(c.createdAt)}</td>
                  <td className="px-5 py-3.5 text-right font-semibold">{c.orderCount}</td>
                  <td className="px-5 py-3.5 text-right font-semibold">{formatINR(c.totalSpent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
