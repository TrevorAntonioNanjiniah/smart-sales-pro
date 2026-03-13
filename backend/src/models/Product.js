// src/models/Product.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    sellerId: {
      type: String,       
      ref: 'Seller',       
      required: true,      
    },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    description: { type: String, trim: true },
    images: [{ type: String }],
    whatsappLink: { type: String },
    qrCode: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);