const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true },
  size: { type: String, required: true },
  gender: { type: String, enum: ["men", "women", "unisex"], required: true },
  clothType: { 
    type: String, 
    enum: ["t-shirt", "shirt", "jacket", "blazer", "sweater", "hoodie", "pants", "jeans", "shorts", "skirt", "dress", "saree", "shoes", "boots", "sandals", "bag", "accessories", "other"],
    required: true 
  },
  color: { type: String, default: "" },
  material: { type: String, default: "" },
  brand: { type: String, default: "" },
  condition: {
    type: String,
    enum: ["new-with-tags", "like-new", "good", "fair", "worn"],
    required: true,
  },
  location: { type: String, required: true },
  images: { type: [String], default: [] },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "sold"],
    default: "pending",
  },
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", ProductSchema);
