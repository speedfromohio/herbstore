// api/razorpay/verify-payment.js
// Vercel Serverless Function — POST /api/razorpay/verify-payment
//
// Verifies the HMAC-SHA256 payment signature that Razorpay sends to
// the frontend after a successful payment. This step is critical —
// it prevents order fulfilment for spoofed or tampered payment callbacks.
//
// Required environment variables (set in Vercel project settings):
//   RAZORPAY_KEY_SECRET  — your Razorpay Key Secret
//
// Request body:
//   {
//     razorpay_order_id:   string,
//     razorpay_payment_id: string,
//     razorpay_signature:  string
//   }
//
// Response (success): { success: true, payment_id: string }
// Response (failure): { success: false, error: string }

import crypto from "crypto";

export default function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { RAZORPAY_KEY_SECRET } = process.env;

  if (!RAZORPAY_KEY_SECRET) {
    console.error("RAZORPAY_KEY_SECRET is not set in environment variables.");
    return res.status(500).json({
      error: "Payment verification service is not configured. Please contact support."
    });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // Validate that all three fields are present
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      success: false,
      error: "Missing required payment fields (order_id, payment_id, or signature)."
    });
  }

  try {
    // Razorpay signature = HMAC-SHA256( "<order_id>|<payment_id>", key_secret )
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    // Use timingSafeEqual to prevent timing-based attacks
    const signatureBuffer = Buffer.from(razorpay_signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    const isValid =
      signatureBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(signatureBuffer, expectedBuffer);

    if (!isValid) {
      console.warn("Razorpay signature mismatch for order:", razorpay_order_id);
      return res.status(400).json({
        success: false,
        error: "Payment signature verification failed. The payment could not be confirmed."
      });
    }

    // Signature is valid — payment is authentic
    return res.status(200).json({
      success: true,
      payment_id: razorpay_payment_id
    });
  } catch (err) {
    console.error("Payment verification error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "An unexpected error occurred during payment verification."
    });
  }
}
