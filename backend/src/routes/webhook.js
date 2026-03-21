//app/routes/webhook.js
import express from 'express';
import { Webhook } from 'svix';
import User from '../models/User.js';
import supabase from '../config/database.js'; // ← added

const router = express.Router();

router.post('/clerk', express.raw({ type: 'application/json' }), async (req, res) => {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error('CLERK_WEBHOOK_SECRET is missing');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  // STEP 1: Verify the webhook is genuinely from Clerk
  const wh = new Webhook(secret);
  let event;
  try {
    event = wh.verify(req.body, {
      'svix-id':        req.headers['svix-id'],
      'svix-timestamp': req.headers['svix-timestamp'],
      'svix-signature': req.headers['svix-signature'],
    });
  } catch (err) {
    console.error('Webhook verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook verification failed' });
  }

  // STEP 2: Handle user.created event
  if (event.type === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url, phone_numbers } = event.data;
    try {
      const existing = await User.findByClerkId(id);
      if (!existing) {
        await User.create({
          clerkId:  id,
          email:    email_addresses[0]?.email_address || '',
          name:     `${first_name || ''} ${last_name || ''}`.trim(),
          imageUrl: image_url || '',
          phone:    phone_numbers?.[0]?.phone_number || '',
        });
        console.log('✅ User created for:', id);
      }
    } catch (err) {
      console.error('❌ Failed to create user:', err.message);
      return res.status(500).json({ error: 'Failed to create user' });
    }
  }

  // STEP 3: Handle user.updated event
  if (event.type === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url, phone_numbers } = event.data;
    try {
      await User.update(id, {
        email:     email_addresses[0]?.email_address || '',
        name:      `${first_name || ''} ${last_name || ''}`.trim(),
        image_url: image_url || '',
        phone:     phone_numbers?.[0]?.phone_number || '',
      });
      console.log('✅ User updated for:', id);
    } catch (err) {
      console.error('❌ Failed to update user:', err.message);
    }
  }

  // STEP 4: Handle user.deleted event ← updated
  if (event.type === 'user.deleted') {
    const clerkId = event.data.id;
    try {
      // Step 1: Deactivate all products belonging to this user
      const { error: productsError } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('seller_id', clerkId);

      if (productsError) {
        console.error('❌ Failed to deactivate user products:', productsError.message);
      } else {
        console.log('✅ Products deactivated for user:', clerkId);
      }

      // Step 2: Delete the user
      await User.delete(clerkId);
      console.log('✅ User deleted for:', clerkId);

    } catch (err) {
      console.error('❌ Failed to delete user:', err.message);
    }
  }

  res.json({ received: true });
});

export default router;