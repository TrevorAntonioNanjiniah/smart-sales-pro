import axios from 'axios';
import Product from '../models/Product.js';
import Seller from '../models/Sellers.js';

// HELPER: Get seller from Clerk userId
const getSeller = async (clerkId) => {
  if (!clerkId) throw new Error("User not authenticated");
  const seller = await Seller.findOne({ clerkId });
  if (!seller) throw new Error("Seller not found for this Clerk user");
  return seller;
};

// Get n8n webhook URL from environment variables
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

// ROUTE: Post product data to n8n webhook
export const postToN8n = async (req, res) => {
  try {
    const auth   = req.auth();
    const userId = auth.userId;

    if (!userId) return res.status(401).json({ success: false, message: "User not authenticated" });

    const seller = await getSeller(userId);

    const productId = req.params.productId || req.body.productId;
    if (!productId) return res.status(400).json({ success: false, message: "Product ID is required" });

    const product = await Product.findOne({ _id: productId, sellerId: seller._id }).lean();
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    // IMAGES: Filter valid Cloudinary URLs
    const imageUrls    = (product.images || []).filter(url => url && url.trim() !== '');
    const primaryImage = imageUrls[0] || null;

    const n8nPayload = {
      productId:          product._id.toString(),
      productName:        product.name,
      productPrice:       product.price,
      productStock:       product.stock,
      productDescription: product.description || '',
      productStatus:      product.isActive ? 'active' : 'inactive',
      sellerId:           seller._id.toString(),
      sellerEmail:        seller.email,
      sellerName:         seller.name || '',            
      sellerPhone:        seller.phone || '',
      images:             imageUrls,
      primaryImage:       primaryImage,
      imageCount:         imageUrls.length,
      createdAt:          product.createdAt,
      updatedAt:          product.updatedAt,
      metadata: {
        source:         'smart-sales-pro',
        event:          'product_shared',
        timestamp:      new Date().toISOString(),
        webhookVersion: '1.0'
      }
    };

    if (!N8N_WEBHOOK_URL) {
      console.error("N8N_WEBHOOK_URL not configured");
      return res.status(500).json({ success: false, message: 'n8n webhook URL not configured' });
    }

    console.log(`Sending product ${productId} to n8n webhook...`);

    const n8nResponse = await axios.post(N8N_WEBHOOK_URL, n8nPayload, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      timeout: 10000
    });

    console.log(`✅ n8n webhook called successfully for product ${productId}`);

    res.json({
      success: true,
      message: 'Product posted to n8n successfully',
      data: {
        productId:    product._id.toString(),
        productName:  product.name,
        primaryImage: primaryImage,
        n8nResponse:  n8nResponse.data
      }
    });

  } catch (err) {
    console.error('❌ n8n webhook error:', err.message);
    const status    = err.response?.status || 500;
    const errorData = err.response?.data   || err.message;
    res.status(status).json({ success: false, message: 'Failed to post to n8n', error: errorData });
  }
};

// ROUTE: Test n8n webhook connection
export const testN8nConnection = async (req, res) => {
  try {
    const auth   = req.auth();
    const userId = auth.userId;
    if (!userId) return res.status(401).json({ success: false, message: "User not authenticated" });

    const seller = await getSeller(userId);

    if (!N8N_WEBHOOK_URL) {
      return res.status(500).json({ success: false, message: 'n8n webhook URL not configured' });
    }

    const testPayload = {
      test:      true,
      message:   'Test connection from Smart Sales Pro',
      timestamp: new Date().toISOString(),
      source:    'smart-sales-pro-test',
      seller: {
        id:    seller._id.toString(),
        email: seller.email,
        name:  seller.name  || '',   
        phone: seller.phone || ''   
      }
    };

    console.log('Testing n8n connection...');

    const n8nResponse = await axios.post(N8N_WEBHOOK_URL, testPayload, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      timeout: 5000
    });

    console.log('✅ n8n test connection successful');
    res.json({ success: true, message: 'n8n connection successful', data: n8nResponse.data });

  } catch (err) {
    console.error('❌ n8n test connection failed:', err.message);
    res.status(500).json({ success: false, message: 'n8n connection failed', error: err.message });
  }
};

// ROUTE: Get n8n configuration status
export const getN8nStatus = async (req, res) => {
  try {
    const auth   = req.auth();
    const userId = auth.userId;
    if (!userId) return res.status(401).json({ success: false, message: "User not authenticated" });

    const seller = await getSeller(userId);

    res.json({
      success: true,
      data: {
        configured: !!N8N_WEBHOOK_URL,
        url:        N8N_WEBHOOK_URL ? `${N8N_WEBHOOK_URL.substring(0, 30)}...` : null,
        seller: {
          id:    seller._id.toString(),
          email: seller.email,
          name:  seller.name  || '',   
          phone: seller.phone || ''    
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (err) {
    console.error('❌ Error getting n8n status:', err.message);
    res.status(500).json({ success: false, message: 'Failed to get n8n status', error: err.message });
  }
};