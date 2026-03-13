// src/routes/products.js (Simplified)
import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts
} from '../controllers/productController.js';

const router = express.Router();

// Public routes - no authentication required
router.get('/', getProducts);           // Get all products
router.get('/search', searchProducts);  // Search products
router.get('/:id', getProductById);     // Get single product
router.post('/', createProduct);         // Create product
router.put('/:id', updateProduct);       // Update product
router.delete('/:id', deleteProduct);    // Delete product

export default router;