const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ["sale", "purchase"], 
    required: true 
  },
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Product", 
    required: true 
  },
  seller: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  buyer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  amount: { type: Number, required: true },
  paymentMethod: {
    type: String,
    enum: ["cod", "stripe", "khalti"],
    default: "cod",
  },
  paymentStatus: { 
    type: String, 
    enum: ["paid", "unpaid"], 
    default: "unpaid" 
  },
  transactionStatus: {
    type: String,
    enum: ["completed", "cancelled", "refunded"],
    default: "completed",
  },
  notes: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Transaction", TransactionSchema);
