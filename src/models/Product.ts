import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export const CATEGORIES = [
  "Soap",
  "Face Wash",
  "Bath Salt",
  "Face Pack",
  "Travel Kit",
] as const;

export const SCENTS = [
  "Rose",
  "Citrus",
  "Lavender",
  "Honey",
  "Coffee",
  "Charcoal",
  "Cherry Blossom",
  "Neem & Tulsi",
  "Green Clay",
  "Strawberry",
  "Ubtan",
  "Mixed",
] as const;

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    category: { type: String, enum: CATEGORIES, required: true },
    scents: { type: [String], enum: SCENTS, default: [] },
    description: { type: String, required: true },
    ingredients: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 }, // in INR
    compareAtPrice: { type: Number, default: null },
    images: { type: [String], default: [] },
    stock: { type: Number, default: 0, min: 0 },
    featured: { type: Boolean, default: false },
    sold: { type: Number, default: 0 }, // popularity counter
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ProductSchema.index({ name: "text", description: "text" });

export type ProductDoc = InferSchemaType<typeof ProductSchema>;

const Product: Model<ProductDoc> =
  mongoose.models.Product || mongoose.model<ProductDoc>("Product", ProductSchema);

export default Product;
