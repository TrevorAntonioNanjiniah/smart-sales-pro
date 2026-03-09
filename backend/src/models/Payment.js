// src/models/Payment.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    mpesaCode: { type: String },           // M-Pesa transaction code
    phone: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    confirmedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('Payment', paymentSchema);