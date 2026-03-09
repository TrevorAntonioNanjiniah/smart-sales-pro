// routes/webhooks.js
import express from 'express';
import { Webhook } from 'svix';
import Seller from '../models/Sellers.js';

const router = express.Router();

// ⚠️ IMPORTANT: This route needs raw body, NOT json-parsed
router.post('/clerk', express.raw({ type: 'application/json' }), async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  // 1. Verify the webhook signature
  const svix_id        = req.headers['svix-id'];
  const svix_timestamp = req.headers['svix-timestamp'];
  const svix_signature = req.headers['svix-signature'];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Missing svix headers' });
  }

  let event;
  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    event = wh.verify(req.body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch {
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  // 2. Handle the event
  const { type, data } = event;

  if (type === 'user.created') {
    await Seller.create({
      clerkId:  data.id,
      email:    data.email_addresses[0].email_address,
      name:     `${data.first_name} ${data.last_name}`.trim(),
      imageUrl: data.image_url,
    });
  }

  if (type === 'user.updated') {
    await Seller.findOneAndUpdate(
      { clerkId: data.id },
      {
        email:    data.email_addresses[0].email_address,
        name:     `${data.first_name} ${data.last_name}`.trim(),
        imageUrl: data.image_url,
      }
    );
  }

  if (type === 'user.deleted') {
    await Seller.findOneAndDelete({ clerkId: data.id });
  }

  res.status(200).json({ received: true });
});

export default router;