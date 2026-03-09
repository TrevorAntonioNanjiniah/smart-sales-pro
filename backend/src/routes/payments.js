// src/routes/payments.js
import express from 'express';
import { requireAuth } from '@clerk/express';
import {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
} from '../controllers/paymentController.js';

const router = express.Router();

router.use(requireAuth());

router.get('/', getPayments);
router.get('/:id', getPaymentById);
router.post('/', createPayment);
router.put('/:id', updatePayment);

export default router;