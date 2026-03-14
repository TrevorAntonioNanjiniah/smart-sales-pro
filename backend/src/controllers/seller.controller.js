import Seller from '../models/Sellers.js';

export const updatePhone = async (req, res) => {
  try {
    const { phone } = req.body;
    const clerkId = req.body.clerkId; // "user_3AkKevUUPj28TBCwkEgsQiaQT5G"

    if (!clerkId || !phone) {
      return res.status(400).json({ message: 'clerkId and phone are required' });
    }

    // finds seller using clerkId field in MongoDB
    const seller = await Seller.findOneAndUpdate(
      { clerkId },        // matches "user_3AkKevUUPj28TBCwkEgsQiaQT5G"
      { $set: { phone } }, // updates only phone field
      { new: true }
    );

    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    res.status(200).json({ 
      message: 'Phone updated successfully', 
      seller 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};