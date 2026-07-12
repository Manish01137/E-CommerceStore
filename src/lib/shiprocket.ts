import type mongoose from "mongoose";
import type { OrderDoc } from "@/models/Order";

const BASE = "https://apiv2.shiprocket.in/v1/external";

export function isShiprocketConfigured(): boolean {
  return Boolean(process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD);
}

// Shiprocket tokens are valid ~10 days; cache for 8.
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token;

  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  });
  if (!res.ok) throw new Error(`Shiprocket auth failed: ${res.status}`);
  const data = await res.json();
  cachedToken = {
    token: data.token,
    expiresAt: Date.now() + 8 * 24 * 60 * 60 * 1000,
  };
  return data.token;
}

interface ShipmentResult {
  orderId: string;
  shipmentId: string;
  awbCode: string;
  courier: string;
  trackingUrl: string;
  status: string;
}

/**
 * Create a Shiprocket order for a paid store order.
 * Returns null (after logging) on any failure — shipping problems must
 * never break the payment flow; admins can retry from the panel.
 */
export async function createShipment(
  order: mongoose.HydratedDocument<OrderDoc>
): Promise<ShipmentResult | null> {
  if (!isShiprocketConfigured()) return null;

  const addr = order.shippingAddress;
  if (!addr) return null;

  try {
    const token = await getToken();

    const res = await fetch(`${BASE}/orders/create/adhoc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        order_id: order.orderNumber,
        order_date: new Date(order.get("createdAt") ?? Date.now())
          .toISOString()
          .slice(0, 16)
          .replace("T", " "),
        pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || "Primary",
        billing_customer_name: addr.fullName,
        billing_last_name: "",
        billing_address: addr.line1,
        billing_address_2: addr.line2,
        billing_city: addr.city,
        billing_pincode: addr.pincode,
        billing_state: addr.state,
        billing_country: "India",
        billing_email: addr.email,
        billing_phone: addr.phone,
        shipping_is_billing: true,
        order_items: order.items.map((item) => ({
          name: item.scent ? `${item.name} (${item.scent})` : item.name,
          sku: `${item.product}`.slice(-12),
          units: item.quantity,
          selling_price: item.price,
        })),
        payment_method: "Prepaid",
        sub_total: order.subtotal,
        length: 20,
        breadth: 15,
        height: 10,
        weight: 0.5,
      }),
    });

    if (!res.ok) {
      console.error("Shiprocket order creation failed:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    return {
      orderId: String(data.order_id ?? ""),
      shipmentId: String(data.shipment_id ?? ""),
      awbCode: String(data.awb_code ?? ""),
      courier: String(data.courier_name ?? ""),
      trackingUrl: data.shipment_id
        ? `https://shiprocket.co/tracking/${data.shipment_id}`
        : "",
      status: String(data.status ?? "created"),
    };
  } catch (err) {
    console.error("Shiprocket error:", err);
    return null;
  }
}

/** Fetch live tracking for a shipment. Returns null when unavailable. */
export async function trackShipment(shipmentId: string) {
  if (!isShiprocketConfigured() || !shipmentId) return null;
  try {
    const token = await getToken();
    const res = await fetch(`${BASE}/courier/track/shipment/${shipmentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
