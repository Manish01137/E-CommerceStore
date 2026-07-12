import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const AddressSchema = new Schema(
  {
    label: { type: String, default: "Home" },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String, default: "" },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
  },
  { _id: true }
);

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    addresses: { type: [AddressSchema], default: [] },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof UserSchema>;

const User: Model<UserDoc> =
  mongoose.models.User || mongoose.model<UserDoc>("User", UserSchema);

export default User;
