// lib/services/productService.ts
import api from '../api';

export interface Product {
  _id: string;
  sellerId: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  images: string[];
  whatsappLink?: string;
  qrCode?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  price: number;
  stock: number;
  description?: string;
  images?: string[];
}

// Get all products for logged-in seller
export const getProducts = async (): Promise<Product[]> => {
  const res = await api.get('/products');
  return res.data.data;
};

// Get single product
export const getProductById = async (id: string): Promise<Product> => {
  const res = await api.get(`/products/${id}`);
  return res.data.data;
};

// Create product
export const createProduct = async (data: CreateProductInput): Promise<Product> => {
  const res = await api.post('/products', data);
  return res.data.data;
};

// Update product
export const updateProduct = async (id: string, data: Partial<CreateProductInput>): Promise<Product> => {
  const res = await api.put(`/products/${id}`, data);
  return res.data.data;
};

// Delete product
export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`);
};