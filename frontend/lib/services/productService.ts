// lib/services/productService.ts
import api from "@/lib/api";

export interface Image {
  _id: string;
  url: string;
  publicId: string;
  format: string;
  size: number;
  filename: string;
  isPrimary: boolean;
  metadata?: {
    width?: number;
    height?: number;
    alt?: string;
    caption?: string;
  };
}

export interface Product {
  _id: string;
  sellerId: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  images: Image[]; // Now returns full image objects
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  price: number;
  stock: number;
  description?: string;
  images?: string[]; // Base64 strings or image URLs
}

export interface UpdateProductData {
  name?: string;
  price?: number;
  stock?: number;
  description?: string;
  images?: string[]; // Base64 strings for new images
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
  data: UpdateProductData
): Promise<Product> => {
  const res = await api.put(`/products/${id}`, data);
  return res.data.data;
};

// DELETE PRODUCT
export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`);
};

// GET PRODUCT IMAGES
export const getProductImages = async (productId: string): Promise<Image[]> => {
  const res = await api.get(`/products/${productId}/images`);
  return res.data.data;
};

// DELETE SINGLE IMAGE
export const deleteProductImage = async (
  productId: string,
  imageId: string
): Promise<void> => {
  await api.delete(`/products/${productId}/images/${imageId}`);
};

// Helper function to get primary image URL
export const getPrimaryImageUrl = (product: Product): string | undefined => {
  const primaryImage = product.images?.find(img => img.isPrimary);
  return primaryImage?.url || product.images?.[0]?.url;
};

// Helper function to format product for display
export const formatProductForDisplay = (product: Product) => {
  return {
    ...product,
    primaryImage: getPrimaryImageUrl(product),
    imageCount: product.images?.length || 0,
    formattedPrice: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(product.price),
    formattedDate: product.createdAt 
      ? new Date(product.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      : undefined
  };
};