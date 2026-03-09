// src/routes/orders.js
import express from 'express';
import { requireAuth } from '@clerk/express';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} from '../controllers/orderController.js';

const router = express.Router();

router.use(requireAuth());

router.get('/', getOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

export default router;