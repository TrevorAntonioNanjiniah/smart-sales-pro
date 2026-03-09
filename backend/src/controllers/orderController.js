// src/controllers/orderController.js
import Order from '../models/Order.js';
import Seller from '../models/Sellers.js';

const getSeller = async (clerkId) => {
  const seller = await Seller.findOne({ clerkId });
  if (!seller) throw new Error('Seller not found');
  return seller;
};

// GET /api/orders
export const getOrders = async (req, res) => {
  try {
    const seller = await getSeller(req.auth.userId);
    const { status, deliveryStatus } = req.query;
    const filter = { sellerId: seller._id };
    if (status) filter.status = status;
    if (deliveryStatus) filter.deliveryStatus = deliveryStatus;

    const orders = await Order.find(filter)
      .populate('productId', 'name price images')
      .populate('leadId', 'customerPhone source')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/:id
export const getOrderById = async (req, res) => {
  try {
    const seller = await getSeller(req.auth.userId);
    const order = await Order.findOne({ _id: req.params.id, sellerId: seller._id })
      .populate('productId')
      .populate('leadId');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const seller = await getSeller(req.auth.userId);
    const { leadId, productId, customerName, customerPhone, location, quantity, amount } = req.body;

    const order = await Order.create({
      sellerId: seller._id,
      leadId,
      productId,
      customerName,
      customerPhone,
      location,
      quantity,
      amount,
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/orders/:id — update status or delivery
export const updateOrder = async (req, res) => {
  try {
    const seller = await getSeller(req.auth.userId);
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, sellerId: seller._id },
      { ...req.body },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/orders/:id
export const deleteOrder = async (req, res) => {
  try {
    const seller = await getSeller(req.auth.userId);
    const order = await Order.findOneAndDelete({ _id: req.params.id, sellerId: seller._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};