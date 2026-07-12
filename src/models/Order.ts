import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export const ORDER_STATUSES = [
  "placed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;

const OrderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    scent: { type: String, default: "" },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: "" },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      line1: { type: String, required: true },
      line2: { type: String, default: "" },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    status: { type: String, enum: ORDER_STATUSES, default: "placed" },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: "pending" },
    paymentMethod: { type: String, default: "razorpay" },
    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    shiprocket: {
      orderId: { type: String, default: "" },
      shipmentId: { type: String, default: "" },
      awbCode: { type: String, default: "" },
      courier: { type: String, default: "" },
      trackingUrl: { type: String, default: "" },
      status: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export type OrderDoc = InferSchemaType<typeof OrderSchema>;

const Order: Model<OrderDoc> =
  mongoose.models.Order || mongoose.model<OrderDoc>("Order", OrderSchema);

export default Order;
