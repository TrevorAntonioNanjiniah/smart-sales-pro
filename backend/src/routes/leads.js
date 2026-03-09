// src/routes/leads.js
import express from 'express';
import { requireAuth } from '@clerk/express';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
} from '../controllers/leadController.js';

const router = express.Router();

router.use(requireAuth());

router.get('/', getLeads);
router.get('/:id', getLeadById);
router.post('/', createLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

export default router;