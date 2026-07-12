import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export const ENQUIRY_STATUSES = ["new", "contacted", "closed"] as const;

const EnquirySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    quantity: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ENQUIRY_STATUSES, default: "new" },
  },
  { timestamps: true }
);

export type EnquiryDoc = InferSchemaType<typeof EnquirySchema>;

const Enquiry: Model<EnquiryDoc> =
  mongoose.models.Enquiry || mongoose.model<EnquiryDoc>("Enquiry", EnquirySchema);

export default Enquiry;
