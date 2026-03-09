// src/controllers/leadController.js
import Lead from '../models/Lead.js';
import Seller from '../models/Sellers.js';

const getSeller = async (clerkId) => {
  const seller = await Seller.findOne({ clerkId });
  if (!seller) throw new Error('Seller not found');
  return seller;
};

// GET /api/leads
export const getLeads = async (req, res) => {
  try {
    const seller = await getSeller(req.auth.userId);
    const { status } = req.query;
    const filter = { sellerId: seller._id };
    if (status) filter.status = status;

    const leads = await Lead.find(filter)
      .populate('productId', 'name price')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: leads });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/leads/:id
export const getLeadById = async (req, res) => {
  try {
    const seller = await getSeller(req.auth.userId);
    const lead = await Lead.findOne({ _id: req.params.id, sellerId: seller._id })
      .populate('productId', 'name price images');
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/leads
export const createLead = async (req, res) => {
  try {
    const seller = await getSeller(req.auth.userId);
    const { productId, customerPhone, customerName, source } = req.body;

    const lead = await Lead.create({
      sellerId: seller._id,
      productId,
      customerPhone,
      customerName,
      source,
    });

    res.status(201).json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/leads/:id — update status, name etc
export const updateLead = async (req, res) => {
  try {
    const seller = await getSeller(req.auth.userId);
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, sellerId: seller._id },
      { ...req.body, lastContacted: new Date() },
      { new: true }
    );
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/leads/:id
export const deleteLead = async (req, res) => {
  try {
    const seller = await getSeller(req.auth.userId);
    const lead = await Lead.findOneAndDelete({ _id: req.params.id, sellerId: seller._id });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};