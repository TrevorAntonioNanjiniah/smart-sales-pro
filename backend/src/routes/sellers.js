import express from 'express';
import Seller  from '../models/Sellers.js';

const router = express.Router();

// ROUTE: Update seller phone after onboarding
router.post('/update-phone', async (req, res) => {
  const { clerkId, phone } = req.body;

  // VALIDATE: Check required fields
  if (!clerkId || !phone) {
    return res.status(400).json({ error: 'clerkId and phone are required' });
  }

  try {
    // UPSERT: Update phone if seller exists, create if not
    const seller = await Seller.findOneAndUpdate(
      { clerkId },
      {
        $set: {
          phone,
          updatedAt: new Date()
        }
      },
      { new: true, upsert: true }  // ✅ upsert creates seller if not found
    );

    console.log('✅ Phone updated for:', clerkId);
    return res.status(200).json({ success: true, seller });

  } catch (err) {
    console.error('❌ Failed to update phone:', err.message);
    return res.status(500).json({ error: 'Failed to update phone' });
  }
});

export default router;