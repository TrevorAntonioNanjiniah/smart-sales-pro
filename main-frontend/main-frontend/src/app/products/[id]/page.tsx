// app/dashboard/products/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  HiOutlineArrowLeft,
  HiOutlinePencil,
  
  
  HiOutlineShare
} from 'react-icons/hi';
import { FiPackage } from 'react-icons/fi';
import { getProductById, Product } from '@/lib/service/productService'; 

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const data = await getProductById(params.id as string);
      setProduct(data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  



  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="h-64 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
            <div className="h-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">Product not found</h3>
        <Link href="/dashboard/products">
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Back to Products
          </button>
        </Link>
      </div>
    );
  }

  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';

  return (
    <div className="max-w-4xl mx-auto space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/products">
          <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
            <HiOutlineArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
        </Link>

        <div className="flex items-center space-x-2">

       

        

        

        </div>
      </div>



      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3 relative aspect-square">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="md:w-2/3 p-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">{product.name}</h1>
            <p className="text-sm text-gray-500 mb-4">ID: {product._id.slice(-8)}</p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Price</p>
                <p className="text-xl font-bold text-gray-800">{formatPrice(product.price)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Stock</p>
                <p className="text-xl font-bold text-gray-800">{product.stock}</p>
              </div>
            </div>
            {product.description && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  {product.description}
                </p>
              </div>
            )}
            <div className="text-xs text-gray-400">
              <p>Created: {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}