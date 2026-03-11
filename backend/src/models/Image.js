// src/models/Image.js
import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
      index: true
    },
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    format: {
      type: String,
      enum: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'other'],
      default: 'jpg'  // Make optional with default
    },
    size: {
      type: Number,
      default: 0  // Make optional with default
    },
    filename: {
      type: String,
      default: ''  // Make optional with default
    },
    mimetype: {
      type: String,
      default: 'image/jpeg'  // Add this field with default
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    metadata: {
      width: Number,
      height: Number,
      alt: String,
      caption: String
    }
  },
  { timestamps: true }
);

// Compound index for efficient queries
imageSchema.index({ productId: 1, isPrimary: 1 });
imageSchema.index({ sellerId: 1, createdAt: -1 });

export default mongoose.model('Image', imageSchema);