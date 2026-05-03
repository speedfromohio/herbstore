const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: { type: String, required: true },
  botanical: { type: String },
  price: { type: Number, required: true },
  category: { type: String },
  image: { type: String },
  description: { type: String, required: true },
  rating: { type: Number, default: 4.5 }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
