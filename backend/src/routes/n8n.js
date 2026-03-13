import express from 'express';
import { requireAuth } from '@clerk/express';
import {
  postToN8n,
  testN8nConnection,
  getN8nStatus
} from '../controllers/n8nController.js';

const router = express.Router();

// Protect all n8n routes
router.use(requireAuth());

// Post product to n8n
router.post('/product', postToN8n);

// Test webhook connection
router.get('/test', testN8nConnection);

// Get n8n configuration status
router.get('/status', getN8nStatus);

export default router;