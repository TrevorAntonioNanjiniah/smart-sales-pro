// src/controllers/productController.js
import Product from "../models/Product.js";
import Image from "../models/Image.js";
import Seller from "../models/Sellers.js";
import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";

// Helper — get seller from Clerk userId
const getSeller = async (clerkId) => {
  if (!clerkId) throw new Error("User not authenticated");

  const seller = await Seller.findOne({ clerkId });
  if (!seller) throw new Error("Seller not found for this Clerk user");

  return seller;
};

// Helper — upload image to Cloudinary
const uploadImageToCloudinary = async (imageFile, productId, sellerId, index) => {
  try {
    let fileToUpload = imageFile;
    
    if (typeof imageFile === 'string' && imageFile.startsWith('blob:')) {
      throw new Error("Blob URLs cannot be uploaded directly. Please send base64 or FormData");
    }

    const uploadResult = await cloudinary.uploader.upload(fileToUpload, {
      folder: `sellers/${sellerId}/products/${productId}`,
      public_id: `image_${index}_${Date.now()}`,
      transformation: [
        { width: 1200, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });
    
    // Determine mimetype from format
    const format = uploadResult.format || 'jpg';
    const mimetype = `image/${format === 'jpg' ? 'jpeg' : format}`;
    
    return {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      format: format,
      size: uploadResult.bytes || 0,
      filename: uploadResult.original_filename || `image_${index}.${format}`,
      mimetype: mimetype,
      width: uploadResult.width,
      height: uploadResult.height
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image", { cause: error });
  }
};

// Helper — delete image from Cloudinary
const deleteImageFromCloudinary = async (publicId) => {
  try {
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error("Cloudinary delete error:", error);
  }
};

// GET /api/products — all products for logged-in seller
export const getProducts = async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth.userId;

    const seller = await getSeller(userId);

    const products = await Product.find({ sellerId: seller._id })
      .sort({ createdAt: -1 })
      .lean();

    // Get all image IDs from products (filter out any invalid entries)
    const imageIds = products
      .flatMap(p => p.images || [])
      .filter(id => mongoose.Types.ObjectId.isValid(id));

    // Fetch images if there are valid IDs
    let images = [];
    if (imageIds.length > 0) {
      images = await Image.find({ 
        _id: { $in: imageIds },
        sellerId: seller._id 
      }).lean();
    }

    // Create a map of image ID to image
    const imageMap = {};
    images.forEach(img => {
      imageMap[img._id.toString()] = img;
    });

    // Attach images to products
    const productsWithImages = products.map(product => ({
      ...product,
      images: (product.images || [])
        .filter(id => mongoose.Types.ObjectId.isValid(id))
        .map(imgId => imageMap[imgId.toString()])
        .filter(Boolean)
    }));

    res.json({ success: true, data: productsWithImages });
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

    const product = await Product.findOne({ 
      _id: req.params.id, 
      sellerId: seller._id 
    }).lean();

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Fetch images for this product (filter out invalid IDs)
    const imageIds = (product.images || []).filter(id => 
      mongoose.Types.ObjectId.isValid(id)
    );

    let images = [];
    if (imageIds.length > 0) {
      images = await Image.find({ 
        _id: { $in: imageIds },
        sellerId: seller._id 
      }).sort({ isPrimary: -1, createdAt: -1 }).lean();
    }

    res.json({ 
      success: true, 
      data: {
        ...product,
        images
      }
    });
  } catch (err) {
    console.error("Get product by ID error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/products — create product
export const createProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const auth = req.auth();
    const userId = auth.userId;
    if (!userId) throw new Error("User not authenticated");

    const seller = await getSeller(userId);

    const { name, price, stock, description, images } = req.body;

    // Create product first
    const [product] = await Product.create([{
      sellerId: seller._id,
      name,
      price,
      stock,
      description,
      images: [] // Will update after images are uploaded
    }], { session });

    // Upload images to Cloudinary and create Image documents
    const imageDocs = [];
    
    if (images && Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const imageFile = images[i];
        
        // Skip blob URLs - they should be handled on frontend
        if (typeof imageFile === 'string' && imageFile.startsWith('blob:')) {
          console.warn("Skipping blob URL - frontend should send base64 or FormData");
          continue;
        }

        try {
          // Upload to Cloudinary
          const uploadResult = await uploadImageToCloudinary(
            imageFile, 
            product._id, 
            seller._id, 
            i
          );
          
          // Create image document in MongoDB
          const [imageDoc] = await Image.create([{
            productId: product._id,
            sellerId: seller._id,
            url: uploadResult.url,
            publicId: uploadResult.publicId,
            format: uploadResult.format,
            size: uploadResult.size,
            filename: uploadResult.filename,
            mimetype: uploadResult.mimetype,
            isPrimary: i === 0,
            metadata: {
              width: uploadResult.width,
              height: uploadResult.height
            }
          }], { session });
          
          imageDocs.push(imageDoc);
        } catch (uploadError) {
          console.error(`Failed to upload image ${i}:`, uploadError);
          // Continue with other images
        }
      }
      
      // Update product with image references
      if (imageDocs.length > 0) {
        product.images = imageDocs.map(img => img._id);
        await product.save({ session });
      }
    }

    await session.commitTransaction();

    res.status(201).json({ 
      success: true, 
      data: {
        ...product.toObject(),
        images: imageDocs
      }
    });
  } catch (err) {
    await session.abortTransaction();
    console.error("Create product error:", err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
};

// PUT /api/products/:id — update product
// PUT /api/products/:id — update product
export const updateProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const auth = req.auth();
    const userId = auth.userId;

    const seller = await getSeller(userId);

    const { images, ...productData } = req.body;

    // Find the product
    const product = await Product.findOne({ 
      _id: req.params.id, 
      sellerId: seller._id 
    }).session(session);

    if (!product) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Update product basic info
    Object.assign(product, productData);
    await product.save({ session });

    // Handle images if provided
    if (images && Array.isArray(images)) {
      
      // --- FIX: Separate existing image URLs from new base64 images ---
      const existingImageUrls = images.filter(img => 
        typeof img === 'string' && img.startsWith('http')
      );
      
      const newBase64Images = images.filter(img => 
        typeof img === 'string' && img.startsWith('data:')
      );

      // Get existing image IDs from database (filter out any non-ObjectId strings)
      const existingImageIds = (product.images || [])
        .filter(id => mongoose.Types.ObjectId.isValid(id));

      // If we have existing images in the database
      if (existingImageIds.length > 0) {
        // Get the actual image documents
        const oldImages = await Image.find({ 
          _id: { $in: existingImageIds },
          sellerId: seller._id 
        }).session(session);

        // Find images that are no longer in the updated list
        const imagesToDelete = oldImages.filter(oldImg => 
          !existingImageUrls.includes(oldImg.url)
        );

        // Delete removed images
        for (const imageToDelete of imagesToDelete) {
          await deleteImageFromCloudinary(imageToDelete.publicId);
          await imageToDelete.deleteOne({ session });
        }
      }

      // Upload new base64 images
      const newImageDocs = [];
      for (let i = 0; i < newBase64Images.length; i++) {
        const imageFile = newBase64Images[i];
        
        try {
          // New image upload
          const uploadResult = await uploadImageToCloudinary(
            imageFile, 
            product._id, 
            seller._id, 
            i
          );
          
          // Create image document in MongoDB
          const [imageDoc] = await Image.create([{
            productId: product._id,
            sellerId: seller._id,
            url: uploadResult.url,
            publicId: uploadResult.publicId, // FIX: Use publicId, not public_id
            format: uploadResult.format,
            size: uploadResult.size,
            filename: uploadResult.filename,
            mimetype: uploadResult.mimetype,
            isPrimary: i === 0 && existingImageUrls.length === 0, // Primary if first and no existing
            metadata: {
              width: uploadResult.width,
              height: uploadResult.height
            }
          }], { session });
          
          newImageDocs.push(imageDoc);
        } catch (uploadError) {
          console.error(`Failed to upload image ${i}:`, uploadError);
        }
      }

      // --- FIX: Get IDs of images that remain (existing ones we kept) ---
      const remainingImageIds = [];
      if (existingImageUrls.length > 0) {
        const remainingImages = await Image.find({ 
          url: { $in: existingImageUrls },
          sellerId: seller._id 
        }).session(session);
        
        remainingImageIds.push(...remainingImages.map(img => img._id));
      }

      // Combine remaining image IDs with new image IDs
      const allImageIds = [...remainingImageIds, ...newImageDocs.map(img => img._id)];
      
      // Update product with all image references
      product.images = allImageIds;
      await product.save({ session });
    }

    await session.commitTransaction();

    // Fetch updated images
    const updatedImages = await Image.find({ 
      _id: { $in: (product.images || []).filter(id => mongoose.Types.ObjectId.isValid(id)) },
      sellerId: seller._id 
    }).lean();

    res.json({ 
      success: true, 
      data: {
        ...product.toObject(),
        images: updatedImages
      }
    });
  } catch (err) {
    await session.abortTransaction();
    console.error("Update product error:", err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
};
// DELETE /api/products/:id — delete product
export const deleteProduct = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const auth = req.auth();
    const userId = auth.userId;

    const seller = await getSeller(userId);

    // Find the product
    const product = await Product.findOne({ 
      _id: req.params.id, 
      sellerId: seller._id 
    }).session(session);

    if (!product) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Get valid image IDs
    const validImageIds = (product.images || [])
      .filter(id => mongoose.Types.ObjectId.isValid(id));

    // Get all images for this product
    if (validImageIds.length > 0) {
      const images = await Image.find({ 
        _id: { $in: validImageIds },
        sellerId: seller._id 
      }).session(session);

      // Delete images from Cloudinary
      for (const image of images) {
        await deleteImageFromCloudinary(image.publicId);
      }

      // Delete images from MongoDB
      await Image.deleteMany({ 
        _id: { $in: validImageIds },
        sellerId: seller._id 
      }, { session });
    }

    // Delete the product
    await product.deleteOne({ session });

    await session.commitTransaction();

    res.json({ success: true, message: "Product and associated images deleted" });
  } catch (err) {
    await session.abortTransaction();
    console.error("Delete product error:", err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
};

// Additional endpoint: Delete single image from a product
export const deleteProductImage = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const auth = req.auth();
    const userId = auth.userId;
    const { id: productId, imageId } = req.params;

    const seller = await getSeller(userId);

    // Validate imageId
    if (!mongoose.Types.ObjectId.isValid(imageId)) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Invalid image ID" });
    }

    // Find the image
    const image = await Image.findOne({ 
      _id: imageId,
      productId,
      sellerId: seller._id 
    }).session(session);

    if (!image) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Image not found" });
    }

    // Delete from Cloudinary
    await deleteImageFromCloudinary(image.publicId);

    // Remove image reference from product
    await Product.updateOne(
      { _id: productId, sellerId: seller._id },
      { $pull: { images: image._id } },
      { session }
    );

    // Delete image from MongoDB
    await image.deleteOne({ session });

    await session.commitTransaction();

    res.json({ success: true, message: "Image deleted successfully" });
  } catch (err) {
    await session.abortTransaction();
    console.error("Delete image error:", err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
};