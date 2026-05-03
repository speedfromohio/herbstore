const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customer_name: { type: String, required: true },
  customer_email: { type: String, required: true },
  customer_address: { type: String, required: true },
  customer_phone: { type: String, required: true },
  items: [
    {
      id: String,
      name: String,
      price: Number,
      quantity: Number
    }
  ],
  total: { type: Number, required: true },
  payment_method: { type: String, default: "Card" },
  payment_status: { type: String, default: "Pending" },
  estimated_delivery_date: { type: Date },
  status: { type: String, default: "Pending" }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
