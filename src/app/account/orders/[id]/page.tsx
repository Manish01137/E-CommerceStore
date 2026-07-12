import { Suspense } from "react";
import type { Metadata } from "next";
import OrderDetailClient from "@/components/account/OrderDetailClient";

export const metadata: Metadata = { title: "Order Details" };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense>
      <OrderDetailClient orderId={id} />
    </Suspense>
  );
}
