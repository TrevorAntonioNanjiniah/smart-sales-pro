// models/Seller.js
import mongoose from 'mongoose';

const sellerSchema = new mongoose.Schema({
  clerkId:   { type: String, required: true, unique: true },
  email:     { type: String, required: true },
  name:      { type: String },
  imageUrl:  { type: String },
  phone:     { type: String, default: '' },  
  role:      { type: String, default: 'seller' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Seller', sellerSchema);