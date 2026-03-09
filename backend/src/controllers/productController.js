// src/controllers/productController.js
import Product from '../models/Product.js';
import Seller from '../models/Sellers.js';

// Helper — get seller from clerkId
const getSeller = async (clerkId) => {
  const seller = await Seller.findOne({ clerkId });
  if (!seller) throw new Error('Seller not found');
  return seller;
};

// GET /api/products — all products for logged-in seller
export const getProducts = async (req, res) => {
  try {
    const seller = await getSeller(req.auth.userId);
    const products = await Product.find({ sellerId: seller._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/:id — single product
export const getProductById = async (req, res) => {
  try {
    const seller = await getSeller(req.auth.userId);
    const product = await Product.findOne({ _id: req.params.id, sellerId: seller._id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/products — create product
export const createProduct = async (req, res) => {
  try {
    const seller = await getSeller(req.auth.userId);
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
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/products/:id — update product
export const updateProduct = async (req, res) => {
  try {
    const seller = await getSeller(req.auth.userId);
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, sellerId: seller._id },
      { ...req.body },
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/products/:id — delete product
export const deleteProduct = async (req, res) => {
  try {
    const seller = await getSeller(req.auth.userId);
    const product = await Product.findOneAndDelete({ _id: req.params.id, sellerId: seller._id });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};