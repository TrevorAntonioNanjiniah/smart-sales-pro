// src/routes/n8nWebhook.js
import express from 'express';
import { clerkMiddleware } from '@clerk/express';
import {
  postToN8n,
  testN8nConnection,
  getN8nStatus
} from '../controllers/n8nWebhookController.js';

const router = express.Router();

// Apply Clerk auth middleware
router.use(clerkMiddleware());

// POST product to n8n
router.post('/product', postToN8n);

// Test webhook connection
router.get('/test', testN8nConnection);

// Get n8n configuration status
router.get('/status', getN8nStatus);

export default router;