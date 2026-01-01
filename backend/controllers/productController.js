import express from "express";
import Product from "../models/Product.js";

/**
 * ✅ ADDED: authMiddleware import
 * WHY:
 * - To protect product APIs
 * - Ensures only authenticated users can access products
 */
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * =========================
 * CREATE PRODUCT (PROTECTED)
 * =========================
 *
 * 🔐 CHANGE:
 * - Added `authMiddleware`
 * WHY:
 * - Creating products must be restricted
 * - Prevents unauthenticated users from mutating data
 */
router.post("/products", authMiddleware, async (req, res) => {
  try {
    const { name, quantity } = req.body;

    if (!name || quantity == null) {
      return res
        .status(400)
        .json({ message: "Name and quantity are required" });
    }

    const product = await Product.create({ name, quantity });

    res.status(201).json({
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * =========================================
 * GET PRODUCTS (PROTECTED + PAGINATION)
 * =========================================
 *
 * 🔐 CHANGE:
 * - Added `authMiddleware`
 * WHY:
 * - Products should not be publicly accessible
 * - Forces valid access token
 * - Enables frontend `authFetch` refresh + retry flow
 */
router.get("/products", authMiddleware, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 3;
    const search = req.query.search || "";

    /**
     * ✅ EXISTING VALIDATION (UNCHANGED)
     * - Guards against invalid pagination input
     */
    if (page <= 0 || limit <= 0) {
      return res.status(400).json({ message: "Invalid pagination values" });
    }

    const skip = (page - 1) * limit;

    /**
     * ✅ EXISTING SEARCH LOGIC (UNCHANGED)
     * - Case-insensitive search by product name
     */
    const filter = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    const total = await Product.countDocuments(filter);

    /**
     * ✅ EXISTING EDGE CASE HANDLING (UNCHANGED)
     * - Prevents empty page crash
     */
    if (skip >= total) {
      return res.json({
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        data: [],
      });
    }

    const products = await Product.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      totalItems: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      data: products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
