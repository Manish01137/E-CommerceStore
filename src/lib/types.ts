export interface ProductDTO {
  _id: string;
  name: string;
  slug: string;
  category: string;
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

/** Convert a Mongoose doc/lean object into a JSON-safe plain object. */
export function toJSON<T>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc)) as T;
}
