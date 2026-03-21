//src/routes/n8n.js
import express from 'express';
import { requireAuth } from '@clerk/express';
import {
  postToN8n,
  testN8nConnection,
  getN8nStatus
} from '../controllers/n8nController.js';

const router = express.Router();

// ← temporarily remove requireAuth to test if route works
// router.use(requireAuth());

// Debug middleware ← added
router.use((req, res, next) => {
  console.log('🔥 n8n route hit');
  console.log('🔥 Authorization header:', req.headers.authorization ? '✅ exists' : '❌ missing');
  next();
});

// Post product to n8n
router.post('/product', postToN8n);

// Test webhook connection
router.get('/test', testN8nConnection);

// Get n8n configuration status
router.get('/status', getN8nStatus);

export default router;