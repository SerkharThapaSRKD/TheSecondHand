const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Product = require("../models/Product");
const Transaction = require("../models/Transaction");
const Order = require("../models/Order");
const { authMiddleware, adminOnly } = require("../middleware/auth");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";
let multer;
let upload;
const path = require("path");
try {
  multer = require("multer");
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // routes are in src/routes, go up two levels to reach backend/uploads
      cb(null, path.resolve(__dirname, "..", "..", "uploads"));
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  });

  // Accept images only and limit size to 5MB
  const fileFilter = (req, file, cb) => {
    if (file && file.mimetype && file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  };

  upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter,
  });
} catch (e) {
  // multer is optional during development; provide a noop upload fallback
  console.warn(
    "Warning: multer not installed. Avatar upload endpoints will be no-ops."
  );
  upload = { single: () => (req, res, next) => next() };
}

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "Missing fields" });
  try {
    const existing = await User.findOne({ email }).exec();
    if (existing) return res.status(400).json({ message: "Email exists" });
    const hash = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hash });
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, isAdmin: newUser.isAdmin },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    const safeUser = newUser.toObject();
    delete safeUser.password;
    res.json({ user: safeUser, token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Missing fields" });
  try {
    const user = await User.findOne({ email }).exec();
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign(
      { id: user._id, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    const safeUser = user.toObject();
    delete safeUser.password;
    res.json({ user: safeUser, token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password").exec();
    if (!user) return res.status(404).json({ message: "Not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update profile (supports avatar upload)
router.put(
  "/me",
  authMiddleware,
  // wrap multer so we can catch errors and return JSON
  (req, res, next) => {
    const mw = upload.single("avatar");
    mw(req, res, function (err) {
      if (err) {
        // Multer error or fileFilter rejection
        console.error("Upload error:", err);
        return res.status(400).json({ message: err.message || "Upload error" });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id).exec();
      if (!user) return res.status(404).json({ message: "User not found" });

      const { name, about, location, phone, website } = req.body;
      if (name) user.name = name;
      if (about !== undefined) user.about = about;
      if (location !== undefined) user.location = location;
      if (phone !== undefined) user.phone = phone;
      if (website !== undefined) user.website = website;

      if (req.file) {
        // store relative path to serve via /uploads
        user.avatar = `/uploads/${req.file.filename}`;
      }

      await user.save();
      const safeUser = user.toObject();
      delete safeUser.password;
      res.json({ user: safeUser });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get user wishlist
router.get("/wishlist", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("wishlist")
      .exec();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add to wishlist
router.post("/wishlist/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).exec();
    if (!user) return res.status(404).json({ message: "User not found" });

    const productId = req.params.id;
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Remove from wishlist
router.delete("/wishlist/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).exec();
    if (!user) return res.status(404).json({ message: "User not found" });

    user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.id);
    await user.save();
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get public user profile
router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -email -wishlist -isAdmin")
      .exec();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users (admin only)
router.get("/admin/users/all", authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });
    
    // Enrich each user with basic stats
    const enrichedUsers = await Promise.all(users.map(async (user) => {
      const productCount = await Product.countDocuments({ seller: user._id });
      const soldCount = await Product.countDocuments({ seller: user._id, status: "sold" });
      const transactionCount = await Transaction.countDocuments({ seller: user._id });
      
      return {
        ...user.toObject(),
        stats: {
          productsListed: productCount,
          productsSold: soldCount,
          transactionCount: transactionCount,
          totalRevenue: user.totalRevenue || 0,
          totalSpent: user.totalSpent || 0,
        }
      };
    }));

    res.json({ users: enrichedUsers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user details by ID (admin only)
router.get("/admin/user/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Get user's products
    const userProducts = await Product.find({ seller: req.params.id })
      .select("_id name price status createdAt")
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user's transactions as seller
    const sellerTransactions = await Transaction.find({ seller: req.params.id })
      .select("amount paymentMethod createdAt product buyer")
      .populate("product", "name")
      .populate("buyer", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user's transactions as buyer
    const buyerTransactions = await Transaction.find({ buyer: req.params.id })
      .select("amount paymentMethod createdAt product seller")
      .populate("product", "name")
      .populate("seller", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user's orders
    const userOrders = await Order.find({ user: req.params.id })
      .select("_id total paymentMethod paymentStatus createdAt")
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate total revenue from transactions
    const totalRevenueFromTransactions = sellerTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

    // Calculate total spent from transactions
    const totalSpentFromTransactions = buyerTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

    res.json({ 
      user: {
        ...user.toObject(),
        stats: {
          totalRevenue: user.totalRevenue || 0,
          totalSpent: user.totalSpent || 0,
          revenueFromTransactions: totalRevenueFromTransactions,
          spentFromTransactions: totalSpentFromTransactions,
          totalSales: user.totalSales || 0,
          totalPurchases: user.totalPurchases || 0,
          productsListed: await Product.countDocuments({ seller: req.params.id }),
          productsSold: await Product.countDocuments({ seller: req.params.id, status: "sold" }),
          productsPending: await Product.countDocuments({ seller: req.params.id, status: "pending" }),
          productsApproved: await Product.countDocuments({ seller: req.params.id, status: "approved" }),
        },
        recentProducts: userProducts,
        sellerTransactions: sellerTransactions,
        buyerTransactions: buyerTransactions,
        orders: userOrders,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete user (admin only)
router.delete("/admin/user/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
