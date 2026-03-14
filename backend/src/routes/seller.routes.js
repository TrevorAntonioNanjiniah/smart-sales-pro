import express from 'express';
import { requireAuth } from '@clerk/express';
import { updatePhone } from '../controllers/seller.controller.js';

const router = express.Router();

router.put('/update-phone', requireAuth(), updatePhone);

export default router;