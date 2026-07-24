import Razorpay from "razorpay";
import crypto from "crypto";

export function isRazorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

function getClient(): Razorpay {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

/** Create a Razorpay order. Amount is in INR rupees; Razorpay wants paise. */
export async function createRazorpayOrder(amountINR: number, receipt: string) {
  const client = getClient();
  return client.orders.create({
    amount: Math.round(amountINR * 100),
    currency: "INR",
    receipt,
  });
}

/** Verify the checkout signature returned by Razorpay after payment. */
export function verifyPaymentSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}): boolean {
  if (!params.razorpayOrderId || !params.razorpayPaymentId || !params.signature) {
    return false;
  }
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expected);
  const sigBuf = Buffer.from(params.signature);

  if (expectedBuf.length !== sigBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuf, sigBuf);
}
