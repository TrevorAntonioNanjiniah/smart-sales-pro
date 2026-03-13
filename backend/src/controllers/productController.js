// src/controllers/productController.js
import Product from "../models/Product.js";

// GET /api/products — all products (optionally filtered)
export const getProducts = async (req, res) => {
  try {
    // Optional query parameters for filtering
    const { sellerId, isActive, limit = 100 } = req.query;
    
    // Build filter object
    let filter = {};
    if (sellerId) filter.sellerId = sellerId;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json({ 
      success: true, 
      count: products.length,
      data: products 
    });
  } catch (err) {
    console.error("Get products error:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// GET /api/products/:id — single product
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    res.json({ 
      success: true, 
      data: product 
    });
  } catch (err) {
    console.error("Get product by ID error:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// POST /api/products — create product (no auth required)
export const createProduct = async (req, res) => {
  try {
    const { sellerId, name, price, stock, description, images } = req.body;

    // Validate required fields
    if (!sellerId) {
      return res.status(400).json({ 
        success: false, 
        message: "sellerId is required" 
      });
    }
    
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: "Product name is required" 
      });
    }
    
    if (!price || price <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid price is required" 
      });
    }
    
    if (stock === undefined || stock < 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid stock quantity is required" 
      });
    }

    const product = await Product.create({
      sellerId,
      name,
      price,
      stock,
      description: description || '',
      images: images || [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    res.status(201).json({ 
      success: true, 
      data: product 
    });
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// PUT /api/products/:id — update product
export const updateProduct = async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    res.json({ 
      success: true, 
      data: product 
    });
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// DELETE /api/products/:id — delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    res.json({ 
      success: true, 
      message: "Product deleted successfully" 
    });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// BULK OPERATIONS (Optional)

// POST /api/products/bulk — create multiple products
export const bulkCreateProducts = async (req, res) => {
  try {
    const { products } = req.body;
    
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Products array is required" 
      });
    }

    // Add timestamps to each product
    const productsWithTimestamps = products.map(product => ({
      ...product,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: product.isActive !== undefined ? product.isActive : true,
    }));

    const createdProducts = await Product.insertMany(productsWithTimestamps);

    res.status(201).json({ 
      success: true, 
      count: createdProducts.length,
      data: createdProducts 
    });
  } catch (err) {
    console.error("Bulk create products error:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// DELETE /api/products/bulk — delete multiple products
export const bulkDeleteProducts = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Product IDs array is required" 
      });
    }

    const result = await Product.deleteMany({ _id: { $in: ids } });

    res.json({ 
      success: true, 
      message: `${result.deletedCount} products deleted successfully` 
    });
  } catch (err) {
    console.error("Bulk delete products error:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// PATCH /api/products/:id/stock — update only stock
export const updateProductStock = async (req, res) => {
  try {
    const { stock } = req.body;
    
    if (stock === undefined || stock < 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid stock quantity is required" 
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        stock, 
        updatedAt: new Date().toISOString() 
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    res.json({ 
      success: true, 
      data: product 
    });
  } catch (err) {
    console.error("Update stock error:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// GET /api/products/search — search products
export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ 
        success: false, 
        message: "Search query is required" 
      });
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ],
      isActive: true
    }).sort({ createdAt: -1 }).limit(50);

    res.json({ 
      success: true, 
      count: products.length,
      data: products 
    });
  } catch (err) {
    console.error("Search products error:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};