// app/dashboard/products/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  HiOutlineArrowLeft,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineExclamation,
  HiOutlineShare
} from 'react-icons/hi';
import { FiPackage } from 'react-icons/fi';
// ✅ Fixed: getProducts removed, getProductById added
import { getProductById, deleteProduct, Product } from '@/lib/services/productService';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      // ✅ Fixed: was getProduct(), now getProductById()
      const data = await getProductById(params.id as string);
      setProduct(data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    try {
      setIsDeleting(true);
      await deleteProduct(product._id);
      router.push('/dashboard/products');
    } catch (error) {
      console.error('Failed to delete product:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePostToN8n = async () => {
    if (!product) return;
    try {
      setIsPosting(true);
      setPostSuccess(false);
      const response = await fetch('http://localhost:8080/api/n8n-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          description: product.description,
          images: product.images,
          timestamp: new Date().toISOString()
        }),
      });
      if (response.ok) {
        setPostSuccess(true);
        setTimeout(() => setPostSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to post to n8n:', error);
    } finally {
      setIsPosting(false);
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
        <Link href="/dashboard/products">
          <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
            <HiOutlineArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
        </Link>

        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePostToN8n}
            disabled={isPosting}
            className={`px-4 py-2 rounded-lg text-sm flex items-center space-x-2 ${
              postSuccess
                ? 'bg-green-600 text-white'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            <HiOutlineShare className="w-4 h-4" />
            <span>{isPosting ? 'Posting...' : postSuccess ? 'Posted!' : 'Post to social media'}</span>
          </motion.button>

          <Link href={`/dashboard/products/edit/${product._id}`}>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              <HiOutlinePencil className="w-4 h-4" />
              <span>Edit</span>
            </button>
          </Link>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm"
          >
            <HiOutlineTrash className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Product Card */}
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

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="fixed inset-0 bg-black z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl z-50 w-full max-w-md p-6"
            >
              <div className="flex items-center space-x-3 text-red-600 mb-4">
                <div className="p-2 bg-red-100 rounded-full">
                  <HiOutlineExclamation className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold">Delete Product</h3>
              </div>
              <p className="text-gray-600 mb-2">
                Delete <span className="font-semibold">{product.name}</span>?
              </p>
              <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}