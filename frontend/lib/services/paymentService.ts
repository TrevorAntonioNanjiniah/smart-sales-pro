// lib/services/paymentService.ts
import api from '../api';

export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface Payment {
  _id: string;
  sellerId: string;
  orderId: { _id: string; customerName: string; customerPhone: string; amount: number };
  mpesaCode?: string;
  phone: string;
  amount: number;
  status: PaymentStatus;
  confirmedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentInput {
  orderId: string;
  phone: string;
  amount: number;
}

// Get all payments (optional status filter)
export const getPayments = async (status?: PaymentStatus): Promise<Payment[]> => {
  const params = status ? { status } : {};
  const res = await api.get('/payments', { params });
  return res.data.data;
};

// Get single payment
export const getPaymentById = async (id: string): Promise<Payment> => {
  const res = await api.get(`/payments/${id}`);
  return res.data.data;
};

// Create payment record (when STK push is initiated)
export const createPayment = async (data: CreatePaymentInput): Promise<Payment> => {
  const res = await api.post('/payments', data);
  return res.data.data;
};

// Update payment after M-Pesa confirmation
export const updatePayment = async (
  id: string,
  data: { status: PaymentStatus; mpesaCode?: string }
): Promise<Payment> => {
  const res = await api.put(`/payments/${id}`, data);
  return res.data.data;
};