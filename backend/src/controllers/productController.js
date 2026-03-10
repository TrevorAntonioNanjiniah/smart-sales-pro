// src/controllers/productController.js
import Product from "../models/Product.js";
import Seller from "../models/Sellers.js";

// Helper — get seller from Clerk userId
const getSeller = async (clerkId) => {
  if (!clerkId) throw new Error("User not authenticated");

  const seller = await Seller.findOne({ clerkId });
  if (!seller) throw new Error("Seller not found for this Clerk user");

  return seller;
};

// GET /api/products — all products for logged-in seller
export const getProducts = async (req, res) => {
  try {
    const auth = req.auth(); // Call the function
    const userId = auth.userId;

    const seller = await getSeller(userId);

    const products = await Product.find({ sellerId: seller._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (err) {
    console.error("Get products error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/:id — single product
export const getProductById = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth.userId;

    const seller = await getSeller(userId);

    const product = await Product.findOne({ _id: req.params.id, sellerId: seller._id });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, data: product });
  } catch (err) {
    console.error("Get product by ID error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/products — create product
export const createProduct = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth.userId;
    if (!userId) throw new Error("User not authenticated");

    const seller = await getSeller(userId);

    const { name, price, stock, description, images } = req.body;

    const product = await Product.create({
      sellerId: seller._id,
      name,
      price,
      stock,
      description,
      images: images || [],
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/products/:id — update product
export const updateProduct = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth.userId;

    const seller = await getSeller(userId);

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, sellerId: seller._id },
      { ...req.body },
      { new: true }
    );

    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, data: product });
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/products/:id — delete product
export const deleteProduct = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth.userId;

    const seller = await getSeller(userId);

    const product = await Product.findOneAndDelete({ _id: req.params.id, sellerId: seller._id });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};