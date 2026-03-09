// lib/services/orderService.ts
import api from '../api';

export type OrderStatus = 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
export type DeliveryStatus = 'not_shipped' | 'packed' | 'shipped' | 'delivered';

export interface Order {
  _id: string;
  sellerId: string;
  leadId?: { _id: string; customerPhone: string; source: string };
  productId: { _id: string; name: string; price: number; images: string[] };
  customerName: string;
  customerPhone: string;
  location: string;
  quantity: number;
  amount: number;
  status: OrderStatus;
  deliveryStatus: DeliveryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  leadId?: string;
  productId: string;
  customerName: string;
  customerPhone: string;
  location: string;
  quantity: number;
  amount: number;
}

// Get all orders (optional filters)
export const getOrders = async (filters?: {
  status?: OrderStatus;
  deliveryStatus?: DeliveryStatus;
}): Promise<Order[]> => {
  const res = await api.get('/orders', { params: filters });
  return res.data.data;
};

// Get single order
export const getOrderById = async (id: string): Promise<Order> => {
  const res = await api.get(`/orders/${id}`);
  return res.data.data;
};

// Create order
export const createOrder = async (data: CreateOrderInput): Promise<Order> => {
  const res = await api.post('/orders', data);
  return res.data.data;
};

// Update order status or delivery status
export const updateOrder = async (
  id: string,
  data: { status?: OrderStatus; deliveryStatus?: DeliveryStatus }
): Promise<Order> => {
  const res = await api.put(`/orders/${id}`, data);
  return res.data.data;
};

// Delete order
export const deleteOrder = async (id: string): Promise<void> => {
  await api.delete(`/orders/${id}`);
};