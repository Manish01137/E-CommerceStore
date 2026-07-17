import type { Product, Order, OrderItem, Address, Enquiry, User, Review } from "@/generated/prisma";
import type {
  ProductDTO,
  OrderDTO,
  AddressDTO,
  EnquiryDTO,
  ReviewDTO,
} from "@/lib/types";

/**
 * Prisma row → DTO. Server components pass these straight to client
 * components, so everything here must be JSON-serialisable (no Date objects).
 */

export function toProductDTO(p: Product): ProductDTO {
  return {
    _id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category,
    size: p.size,
    scents: p.scents,
    description: p.description,
    ingredients: p.ingredients,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    images: p.images,
    stock: p.stock,
    featured: p.featured,
    sold: p.sold,
    active: p.active,
    createdAt: p.createdAt.toISOString(),
  };
}

export function toAddressDTO(a: Address): AddressDTO {
  return {
    _id: a.id,
    label: a.label,
    fullName: a.fullName,
    phone: a.phone,
    line1: a.line1,
    line2: a.line2,
    city: a.city,
    state: a.state,
    pincode: a.pincode,
  };
}

type OrderWithItems = Order & {
  items: OrderItem[];
  user?: Pick<User, "id" | "name" | "email"> | null;
};

export function toOrderDTO(o: OrderWithItems): OrderDTO {
  return {
    _id: o.id,
    orderNumber: o.orderNumber,
    user: o.user
      ? { _id: o.user.id, name: o.user.name, email: o.user.email }
      : o.userId,
    items: o.items.map((i) => ({
      product: i.productId,
      name: i.name,
      scent: i.scent,
      price: i.price,
      quantity: i.quantity,
      image: i.image,
    })),
    subtotal: o.subtotal,
    shippingFee: o.shippingFee,
    total: o.total,
    shippingAddress: {
      fullName: o.shipFullName,
      phone: o.shipPhone,
      email: o.shipEmail,
      line1: o.shipLine1,
      line2: o.shipLine2,
      city: o.shipCity,
      state: o.shipState,
      pincode: o.shipPincode,
    },
    status: o.status,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod,
    razorpayOrderId: o.razorpayOrderId,
    shiprocket: {
      orderId: o.shiprocketOrderId,
      shipmentId: o.shiprocketShipmentId,
      awbCode: o.shiprocketAwbCode,
      courier: o.shiprocketCourier,
      trackingUrl: o.shiprocketTrackingUrl,
      status: o.shiprocketStatus,
    },
    createdAt: o.createdAt.toISOString(),
  };
}

export function toEnquiryDTO(e: Enquiry): EnquiryDTO {
  return {
    _id: e.id,
    name: e.name,
    company: e.company,
    email: e.email,
    phone: e.phone,
    quantity: e.quantity,
    message: e.message,
    status: e.status,
    createdAt: e.createdAt.toISOString(),
  };
}

export function toReviewDTO(r: Review, viewerUserId?: string | null): ReviewDTO {
  return {
    _id: r.id,
    productId: r.productId,
    authorName: r.authorName,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    mine: Boolean(viewerUserId && r.userId === viewerUserId),
    createdAt: r.createdAt.toISOString(),
  };
}
