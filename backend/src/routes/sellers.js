//app/routes/User.js
import express from 'express';
import User from '../models/User.js';


const router = express.Router();

// ROUTE: Update user phone after onboarding
router.post('/update-phone', async (req, res) => {
  const { clerkId, phone } = req.body;

  if (!clerkId || !phone) {
    return res.status(400).json({ error: 'clerkId and phone are required' });
  }

  try {
    // Check if user exists
    const existing = await User.findByClerkId(clerkId);

    let user;
    if (existing) {
      // Update phone
      user = await User.update(clerkId, { phone });
    } else {
      // Create user with phone
      user = await User.create({ clerkId, phone, email: '', role: 'seller' });
    }

    console.log('✅ Phone updated for:', clerkId);
    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error('❌ Failed to update phone:', err.message);
    return res.status(500).json({ error: 'Failed to update phone' });
  }
});

export default router;