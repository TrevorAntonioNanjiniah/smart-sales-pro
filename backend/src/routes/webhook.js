import express from 'express';
import { Webhook } from 'svix';
import Seller from '../models/Sellers.js';

const router = express.Router();

router.post('/clerk', express.raw({ type: 'application/json' }), async (req, res) => {
  const secret = process.env.CLERK_WEBHOOK_SECRET;

  if (!secret) {
    console.error('CLERK_WEBHOOK_SECRET is missing');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  // Verify the webhook is genuinely from Clerk
  const wh = new Webhook(secret);
  let event;

  try {
    event = wh.verify(req.body, {
      'svix-id': req.headers['svix-id'],
      'svix-timestamp': req.headers['svix-timestamp'],
      'svix-signature': req.headers['svix-signature'],
    });
  } catch (err) {
    console.error('Webhook verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook verification failed' });
  }

  // Handle user.created event
  if (event.type === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = event.data;

    try {
      // Check if seller already exists
      const existing = await Seller.findOne({ clerkId: id });
      if (!existing) {
        await Seller.create({
          clerkId: id,
          email: email_addresses[0]?.email_address || '',
          name: `${first_name || ''} ${last_name || ''}`.trim(),
          imageUrl: image_url || '',
        });
        console.log('✅ Seller created for:', id);
      }
    } catch (err) {
      console.error('❌ Failed to create seller:', err.message);
      return res.status(500).json({ error: 'Failed to create seller' });
    }
  }

  // Handle user.updated event
  if (event.type === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = event.data;

    try {
      await Seller.findOneAndUpdate(
        { clerkId: id },
        {
          email: email_addresses[0]?.email_address || '',
          name: `${first_name || ''} ${last_name || ''}`.trim(),
          imageUrl: image_url || '',
        }
      );
      console.log('✅ Seller updated for:', id);
    } catch (err) {
      console.error('❌ Failed to update seller:', err.message);
    }
  }

  // Handle user.deleted event
  if (event.type === 'user.deleted') {
    try {
      await Seller.findOneAndDelete({ clerkId: event.data.id });
      console.log('✅ Seller deleted for:', event.data.id);
    } catch (err) {
      console.error('❌ Failed to delete seller:', err.message);
    }
  }

  res.json({ received: true });
});

export default router;