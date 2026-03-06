
import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json({ 
      success: true, 
      count: users.length,
      users 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Test create user using the static method
router.post('/test-create', async (req, res) => {
  try {
    const testUserData = {
      id: 'test_user_123',
      email_addresses: [{ 
        id: 'email_123',
        email_address: 'test@example.com' 
      }],
      primary_email_address_id: 'email_123',
      first_name: 'Test',
      last_name: 'User',
      image_url: 'https://via.placeholder.com/150',
      last_sign_in_at: new Date().toISOString()
    };
    
    const user = await User.findOrCreateFromClerk(testUserData);
    
    res.json({
      success: true,
      message: 'Test user created',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
