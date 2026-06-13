// api/razorpay/create-order.js
// Vercel Serverless Function — POST /api/razorpay/create-order
//
// Creates a Razorpay order and returns its id, amount, currency, and
// the public key_id so the frontend can open the Razorpay checkout modal.
//
// Required environment variables (set in Vercel project settings):
//   RAZORPAY_KEY_ID      — your Razorpay Key ID     (starts with rzp_)
//   RAZORPAY_KEY_SECRET  — your Razorpay Key Secret
//
// Request body:  { amount: <number>  }   — amount in INR (whole rupees)
// Response:      Razorpay order object + key_id field

import Razorpay from "razorpay";

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    console.error("Razorpay credentials are not set in environment variables.");
    return res.status(500).json({
      error: "Payment gateway is not configured. Please contact support."
    });
  }

  const { amount } = req.body;

  // Validate amount
  if (!amount || typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({
      error: "Invalid amount. Please provide a positive number (in INR)."
    });
  }

  try {
    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET
    });

    // Razorpay expects the amount in the smallest currency unit (paise for INR)
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // convert ₹ → paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1 // auto-capture payment after authorisation
    });

    // Return the order details along with the public key so the
    // frontend can open the Razorpay checkout modal without needing
    // the secret key in the browser.
    return res.status(200).json({
      ...order,
      key_id: RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error("Razorpay order creation failed:", err);
    return res.status(500).json({
      error: err.message || "Failed to create payment order. Please try again."
    });
  }
}
