// src/models/Lead.js
import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    customerPhone: { type: String, required: true },
    customerName: { type: String },
    source: {
      type: String,
      enum: ['whatsapp', 'instagram', 'facebook', 'tiktok', 'direct'],
      default: 'whatsapp',
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'interested', 'converted', 'lost'],
      default: 'new',
    },
    lastContacted: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('Lead', leadSchema);