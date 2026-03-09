// src/controllers/paymentController.js
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import Seller from '../models/Sellers.js';

const getSeller = async (clerkId) => {
  const seller = await Seller.findOne({ clerkId });
  if (!seller) throw new Error('Seller not found');
  return seller;
};

// GET /api/payments
export const getPayments = async (req, res) => {
  try {
    const seller = await getSeller(req.auth.userId);
    const { status } = req.query;
    const filter = { sellerId: seller._id };
    if (status) filter.status = status;

    const payments = await Payment.find(filter)
      .populate('orderId', 'customerName customerPhone amount')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/payments/:id
export const getPaymentById = async (req, res) => {
  try {
    const seller = await getSeller(req.auth.userId);
    const payment = await Payment.findOne({ _id: req.params.id, sellerId: seller._id })
      .populate('orderId');
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    res.json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/payments — create payment record (usually called after STK push initiated)
export const createPayment = async (req, res) => {
  try {
    const seller = await getSeller(req.auth.userId);
    const { orderId, phone, amount } = req.body;

    const payment = await Payment.create({
      sellerId: seller._id,
      orderId,
      phone,
      amount,
      status: 'pending',
    });

    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/payments/:id — update status (e.g. after M-Pesa confirmation)
export const updatePayment = async (req, res) => {
  try {
    const seller = await getSeller(req.auth.userId);
    const { status, mpesaCode } = req.body;

    const updateData = { status };
    if (mpesaCode) updateData.mpesaCode = mpesaCode;
    if (status === 'completed') updateData.confirmedAt = new Date();

    const payment = await Payment.findOneAndUpdate(
      { _id: req.params.id, sellerId: seller._id },
      updateData,
      { new: true }
    );

    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    // Also update the linked order to confirmed
    if (status === 'completed') {
      await Order.findByIdAndUpdate(payment.orderId, { status: 'confirmed' });
    }

    res.json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};