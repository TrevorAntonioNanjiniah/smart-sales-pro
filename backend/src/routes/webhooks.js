import express from 'express';
import { Webhook } from 'svix';
import User from '../models/User.js';

const router = express.Router();

// IMPORTANT: This route must use express.raw() to get the raw body for signature verification
router.post('/clerk', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Get the signature headers
    const svixId = req.headers['svix-id'];
    const svixTimestamp = req.headers['svix-timestamp'];
    const svixSignature = req.headers['svix-signature'];

    console.log('📨 Webhook received with headers:', { svixId, svixTimestamp });

    // If there are no headers, error out
    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error('❌ Missing Svix headers');
      return res.status(400).json({ error: 'Missing svix headers' });
    }

    // Get the webhook secret from environment variables
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    
    if (!secret) {
      console.error('❌ CLERK_WEBHOOK_SECRET is not set');
      throw new Error('Webhook secret is missing');
    }

    // Create a new Webhook instance with your secret
    const wh = new Webhook(secret);
    
    // Get the raw body as a string
    const payload = req.body.toString();
    
    // Verify the webhook payload
    const evt = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });

    console.log('✅ Webhook verified successfully');
    console.log('Event type:', evt.type);

    // Handle different event types
    const { type, data } = evt;
    
    switch (type) {
      case 'user.created':
        await handleUserCreated(data);
        break;
      case 'user.updated':
        await handleUserUpdated(data);
        break;
      case 'user.deleted':
        await handleUserDeleted(data);
        break;
      default:
        console.log(`📝 Unhandled webhook event type: ${type}`);
    }

    res.status(200).json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('❌ Webhook error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// Handler for user.created events
async function handleUserCreated(data) {
  console.log('👤 User created event received for:', data.id);
  
  try {
    // Use your existing findOrCreateFromClerk method
    const user = await User.findOrCreateFromClerk(data);
    console.log(`✅ User synced to database: ${user.email} (${user.clerkId})`);
  } catch (error) {
    console.error('❌ Error handling user.created:', error.message);
    throw error;
  }
}

// Handler for user.updated events
async function handleUserUpdated(data) {
  console.log('🔄 User updated event received for:', data.id);
  
  try {
    // Find and update the user
    const user = await User.findOne({ clerkId: data.id });
    
    if (user) {
      // Update user fields
      user.email = data.email_addresses?.[0]?.email_address || user.email;
      user.firstName = data.first_name || user.firstName;
      user.lastName = data.last_name || user.lastName;
      user.profileImageUrl = data.image_url || user.profileImageUrl;
      user.lastSignInAt = data.last_sign_in_at ? new Date(data.last_sign_in_at) : user.lastSignInAt;
      user.lastActiveAt = new Date();
      user.loginCount = (user.loginCount || 0) + 1;
      
      await user.save();
      console.log(`✅ User updated in database: ${user.email}`);
    } else {
      // If user doesn't exist, create them
      console.log(`⚠️ User ${data.id} not found, creating...`);
      await User.findOrCreateFromClerk(data);
    }
  } catch (error) {
    console.error('❌ Error handling user.updated:', error.message);
    throw error;
  }
}

// Handler for user.deleted events
async function handleUserDeleted(data) {
  console.log('🗑️ User deleted event received for:', data.id);
  
  try {
    // Delete the user from database
    const result = await User.deleteOne({ clerkId: data.id });
    
    if (result.deletedCount > 0) {
      console.log(`✅ User deleted from database: ${data.id}`);
    } else {
      console.log(`⚠️ User ${data.id} not found in database`);
    }
  } catch (error) {
    console.error('❌ Error handling user.deleted:', error.message);
    throw error;
  }
}

export default router;