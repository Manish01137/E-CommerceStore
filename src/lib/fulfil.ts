import Product from "@/models/Product";
import Order, { type OrderDoc } from "@/models/Order";
import { createShipment } from "@/lib/shiprocket";
import type mongoose from "mongoose";

type OrderInstance = mongoose.HydratedDocument<OrderDoc>;

/**
 * Runs after a successful payment: marks the order paid, adjusts stock
 * and popularity counters, and creates the Shiprocket shipment.
 */
export async function fulfilPaidOrder(order: OrderInstance): Promise<void> {
  order.paymentStatus = "paid";
  order.status = "processing";

  await Promise.all(
    order.items.map((item) =>
      Product.updateOne(
        { _id: item.product },
        { $inc: { stock: -item.quantity, sold: item.quantity } }
      )
    )
  );

  const shipment = await createShipment(order);
  if (shipment) {
    order.shiprocket = shipment;
    order.status = "shipped";
  }

  await order.save();
}

export async function markPaymentFailed(orderId: string): Promise<void> {
  await Order.updateOne({ _id: orderId }, { paymentStatus: "failed" });
}
