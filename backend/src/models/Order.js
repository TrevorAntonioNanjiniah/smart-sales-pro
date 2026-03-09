// src/models/Order.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    location: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    deliveryStatus: {
      type: String,
      enum: ['not_shipped', 'packed', 'shipped', 'delivered'],
      default: 'not_shipped',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);