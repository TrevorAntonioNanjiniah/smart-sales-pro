// lib/services/leadService.ts
import api from '../api';

export type LeadStatus = 'new' | 'contacted' | 'interested' | 'converted' | 'lost';
export type LeadSource = 'whatsapp' | 'instagram' | 'facebook' | 'tiktok' | 'direct';

export interface Lead {
  _id: string;
  sellerId: string;
  productId?: { _id: string; name: string; price: number };
  customerPhone: string;
  customerName?: string;
  source: LeadSource;
  status: LeadStatus;
  lastContacted?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadInput {
  productId?: string;
  customerPhone: string;
  customerName?: string;
  source?: LeadSource;
}

// Get all leads (optionally filter by status)
export const getLeads = async (status?: LeadStatus): Promise<Lead[]> => {
  const params = status ? { status } : {};
  const res = await api.get('/leads', { params });
  return res.data.data;
};

// Get single lead
export const getLeadById = async (id: string): Promise<Lead> => {
  const res = await api.get(`/leads/${id}`);
  return res.data.data;
};

// Create lead
export const createLead = async (data: CreateLeadInput): Promise<Lead> => {
  const res = await api.post('/leads', data);
  return res.data.data;
};

// Update lead (e.g. change status on Kanban)
export const updateLead = async (id: string, data: Partial<Lead>): Promise<Lead> => {
  const res = await api.put(`/leads/${id}`, data);
  return res.data.data;
};

// Delete lead
export const deleteLead = async (id: string): Promise<void> => {
  await api.delete(`/leads/${id}`);
};