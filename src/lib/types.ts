/**
 * DTOs shared between server and client components.
 *
 * `_id` is a string on every entity. It's a Postgres uuid now (it was a Mongo
 * ObjectId before); the name is kept so the cart, which persists product ids in
 * localStorage, keeps working across the migration.
 */

export const CATEGORIES = [
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
] as const;

export const ORDER_STATUSES = [
  "placed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;

export const ENQUIRY_STATUSES = ["new", "contacted", "closed"] as const;

export interface ProductDTO {
  _id: string;
  name: string;
  slug: string;
  category: string;
  /** Pack size, e.g. "200 ml" or "100 gms". */
  size?: string;
  scents: string[];
  description: string;
  ingredients: string;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  stock: number;
  featured: boolean;
  sold: number;
  active: boolean;
  createdAt: string;
}

export interface AddressDTO {
  _id?: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItemDTO {
  product: string;
  name: string;
  scent: string;
  price: number;
  quantity: number;
  image: string;
}

export interface OrderDTO {
  _id: string;
  orderNumber: string;
  user: string | { _id: string; name: string; email: string };
  items: OrderItemDTO[];
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    email: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
  };
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  razorpayOrderId?: string;
  shiprocket?: {
    orderId: string;
    shipmentId: string;
    awbCode: string;
    courier: string;
    trackingUrl: string;
    status: string;
  };
  createdAt: string;
}

export interface EnquiryDTO {
  _id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  quantity: string;
  message: string;
  status: string;
  createdAt: string;
}
