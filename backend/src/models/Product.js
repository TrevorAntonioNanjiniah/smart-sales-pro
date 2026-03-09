// src/models/Product.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    description: { type: String, trim: true },
    images: [{ type: String }],           // array of image URLs
    whatsappLink: { type: String },        // generated deep link
    qrCode: { type: String },             // base64 or URL
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);