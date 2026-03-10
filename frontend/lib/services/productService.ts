import api from "@/lib/api";

export interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  images?: string[];
  createdAt?: string;
}

export interface CreateProductData {
  name: string;
  price: number;
  stock: number;
  description?: string;
  images?: string[];
}

// GET ALL PRODUCTS
export const getProducts = async (): Promise<Product[]> => {
  const res = await api.get("/products");
  return res.data.data;
};

// GET SINGLE PRODUCT
export const getProduct = async (id: string): Promise<Product> => {
  const res = await api.get(`/products/${id}`);
  return res.data.data;
};

// CREATE PRODUCT
export const createProduct = async (
  data: CreateProductData
): Promise<Product> => {
  const res = await api.post("/products", data);
  return res.data.data;
};

// UPDATE PRODUCT
export const updateProduct = async (
  id: string,
  data: Partial<CreateProductData>
): Promise<Product> => {
  const res = await api.put(`/products/${id}`, data);
  return res.data.data;
};

// DELETE PRODUCT
export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`);
};