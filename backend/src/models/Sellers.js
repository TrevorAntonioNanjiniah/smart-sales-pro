// models/Seller.js
import mongoose from 'mongoose';

const sellerSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true }, // clerk's user id
  email:   { type: String, required: true },
  name:    { type: String },
  imageUrl:{ type: String },
  role:    { type: String, default: 'seller' },
  phone :   { type: String },
  createdAt:{ type: Date, default: Date.now }
});

export default mongoose.model('Seller', sellerSchema);