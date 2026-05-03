const Order = require("../models/Order");
const Otp = require("../models/Otp");
const { sendOrderConfirmation, sendOtpEmail } = require("../config/emailService");

// Create Order
const createOrder = async (req, res) => {
  try {
    const { customer, items, total, payment_method } = req.body;
    
    // Mock Estimated Delivery (7 days from now)
    const estimated_delivery_date = new Date();
    estimated_delivery_date.setDate(estimated_delivery_date.getDate() + 7);

    const order = await Order.create({
      customer_name: customer.name,
      customer_email: customer.email,
      customer_address: customer.address,
      customer_phone: customer.phone,
      items,
      total,
      payment_method: payment_method || "Card",
      payment_status: "Verified", // Mocking verified payment for this implementation
      estimated_delivery_date
    });

    // Trigger Email (Async - don't wait for it to finish before responding to user)
    sendOrderConfirmation(order).catch(err => console.error("Background Email Error:", err));

    res.status(201).json({ message: "Order Created Successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({});
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send OTP
const sendOtp = async (req, res) => {
  console.log("OTP Request received for:", req.body.email);
  try {
    const { email } = req.body;
    if (!email) {
      console.log("Error: Email missing");
      return res.status(400).json({ message: "Email is required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    console.log("Generated OTP:", otp);
    
    await Otp.findOneAndUpdate({ email }, { otp, createdAt: Date.now() }, { upsert: true });
    console.log("OTP saved to DB");
    
    await sendOtpEmail(email, otp);
    console.log("OTP Email sent successfully");
    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("sendOtp error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = await Otp.findOne({ email, otp });
    
    if (record) {
      await Otp.deleteOne({ email, otp });
      res.json({ success: true, message: "OTP Verified" });
    } else {
      res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, getOrders, sendOtp, verifyOtp };
