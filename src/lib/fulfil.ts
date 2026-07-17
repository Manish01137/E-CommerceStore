import { prisma } from "@/lib/db";
import { createShipment } from "@/lib/shiprocket";

/**
 * Runs after a successful payment: marks the order paid, adjusts stock and
 * popularity counters, then creates the Shiprocket shipment.
 *
 * The paid-marking and stock moves run in one transaction so a crash can't
 * leave an order paid with stock un-decremented (or vice versa). Shipment
 * creation is deliberately outside it — a courier API hiccup must not roll
 * back a payment we've already taken.
 */
export async function fulfilPaidOrder(orderId: string): Promise<void> {
  const order = await prisma.$transaction(async (tx) => {
    const o = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!o) throw new Error(`Order ${orderId} not found`);

    for (const item of o.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
          sold: { increment: item.quantity },
        },
      });
    }

    return tx.order.update({
      where: { id: orderId },
      data: { paymentStatus: "paid", status: "processing" },
      include: { items: true },
    });
  });

  const shipment = await createShipment(order);
  if (shipment) {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        shiprocketOrderId: shipment.orderId,
        shiprocketShipmentId: shipment.shipmentId,
        shiprocketAwbCode: shipment.awbCode,
        shiprocketCourier: shipment.courier,
        shiprocketTrackingUrl: shipment.trackingUrl,
        shiprocketStatus: shipment.status,
        status: "shipped",
      },
    });
  }
}

export async function markPaymentFailed(orderId: string): Promise<void> {
  await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: "failed" },
  });
}
