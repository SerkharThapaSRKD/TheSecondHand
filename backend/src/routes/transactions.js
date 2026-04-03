const express = require("express");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const Product = require("../models/Product");
const { authMiddleware, adminOnly } = require("../middleware/auth");

const router = express.Router();

// Create a transaction (when buyer purchases an item)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { productId, sellerId, amount, paymentMethod, type } = req.body;
    const buyerId = req.user.id;

    if (!productId || !sellerId || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Create transaction
    const transaction = new Transaction({
      type: type || "purchase",
      product: productId,
      seller: sellerId,
      buyer: buyerId,
      amount,
      paymentMethod: paymentMethod || "cod",
      paymentStatus: paymentMethod === "cod" ? "unpaid" : "paid",
      transactionStatus: "completed",
    });

    await transaction.save();

    // Update user stats
    await User.findByIdAndUpdate(sellerId, { $inc: { totalSales: 1 } });
    await User.findByIdAndUpdate(buyerId, { $inc: { totalPurchases: 1 } });

    // Update product status to sold
    await Product.findByIdAndUpdate(productId, { status: "sold" });

    res.json({ message: "Transaction created", transaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all transactions for a user (buyer or seller)
router.get("/user/all", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await Transaction.find({
      $or: [{ buyer: userId }, { seller: userId }],
    })
      .populate("product", "name price images")
      .populate("buyer", "name email")
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.json({ transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get sales transactions for a user
router.get("/user/sales", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await Transaction.find({ seller: userId })
      .populate("product", "name price images")
      .populate("buyer", "name email")
      .sort({ createdAt: -1 });

    const stats = {
      totalSales: transactions.length,
      totalRevenue: transactions.reduce((sum, t) => sum + t.amount, 0),
      transactions,
    };

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get purchase transactions for a user
router.get("/user/purchases", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const transactions = await Transaction.find({ buyer: userId })
      .populate("product", "name price images")
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    const stats = {
      totalPurchases: transactions.length,
      totalSpent: transactions.reduce((sum, t) => sum + t.amount, 0),
      transactions,
    };

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all transactions (admin only)
router.get("/admin/all", authMiddleware, adminOnly, async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("product", "name price images")
      .populate("buyer", "name email")
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.json({ transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get transactions for a specific user (admin only)
router.get("/admin/user/:userId", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { userId } = req.params;

    const transactions = await Transaction.find({
      $or: [{ buyer: userId }, { seller: userId }],
    })
      .populate("product", "name price images")
      .populate("buyer", "name email")
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.json({ transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update transaction status (admin only)
router.patch("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionStatus, paymentStatus } = req.body;

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      {
        ...(transactionStatus && { transactionStatus }),
        ...(paymentStatus && { paymentStatus }),
        updatedAt: Date.now(),
      },
      { new: true }
    )
      .populate("product", "name price images")
      .populate("buyer", "name email")
      .populate("seller", "name email");

    res.json({ message: "Transaction updated", transaction: updatedTransaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a transaction (admin only)
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findByIdAndDelete(id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Revert user stats
    await User.findByIdAndUpdate(transaction.seller, { $inc: { totalSales: -1 } });
    await User.findByIdAndUpdate(transaction.buyer, { $inc: { totalPurchases: -1 } });

    // Revert product status
    await Product.findByIdAndUpdate(transaction.product, { status: "approved" });

    res.json({ message: "Transaction deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
