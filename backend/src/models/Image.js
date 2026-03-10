// src/models/Image.js
import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    url: { type: String, required: true },        // path or cloud URL
    filename: { type: String, required: true },   // e.g. "shoe-front.png"
    mimetype: {
      type: String,
      enum: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
      required: true,
    },
    size: { type: Number },                       // in bytes
    isPrimary: { type: Boolean, default: false }, // main display image
    order: { type: Number, default: 0 },          // display order
  },
  { timestamps: true }
);

export default mongoose.model('Image', imageSchema);