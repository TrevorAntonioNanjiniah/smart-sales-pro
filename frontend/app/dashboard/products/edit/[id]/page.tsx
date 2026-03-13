// app/dashboard/products/edit/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  HiOutlineArrowLeft,
  HiOutlinePhotograph,
  HiOutlineX
} from 'react-icons/hi';
import { FiDollarSign, FiPackage } from 'react-icons/fi';
import { getProductById, updateProduct } from '@/lib/services/productService';
import Image from 'next/image';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    stock: 0,
    description: '',
    images: [] as string[]
  });

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const product = await getProductById(params.id as string);
      setFormData({
        name: product.name,
        price: product.price,
        stock: product.stock,
        description: product.description || '',
        // ✅ Filter out any empty strings from old MongoDB data
        images: (product.images || []).filter((img: string) => img && img.trim() !== '')
      });
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await updateProduct(params.id as string, formData);
      router.push(`/dashboard/products/${params.id}`);
    } catch (error) {
      console.error('Failed to update product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadError(null);

      const uploadData = new FormData();
      uploadData.append('image', file);

      const res = await fetch('http://localhost:8080/api/upload', {
        method: 'POST',
        body: uploadData,
      });

      // ✅ Handle non-200 responses properly
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await res.json();

      // ✅ Guard against missing URL
      if (!data.url) throw new Error('No URL returned from upload');

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, data.url]
      }));

    } catch (error) {
      console.error('Image upload failed:', error);
      setUploadError(error instanceof Error ? error.message : 'Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
            <div className="h-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-4">
        <Link href={`/dashboard/products/${params.id}`}>
          <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-4">
            <HiOutlineArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Product</span>
          </button>
        </Link>
        <h1 className="text-2xl font-semibold text-gray-800">Edit Product</h1>
        <p className="text-sm text-gray-500 mt-1">Update your product information</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-4">

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
              placeholder="e.g. Wireless Headphones"
            />
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ($)
              </label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock
              </label>
              <div className="relative">
                <FiPackage className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
              placeholder="Describe your product..."
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images
            </label>

            {/* ✅ Show upload error if any */}
            {uploadError && (
              <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600">{uploadError}</p>
              </div>
            )}

            <div className="grid grid-cols-4 gap-2 mb-3">
              {/* ✅ Filter empty strings before rendering */}
              {formData.images
                .filter(image => image && image.trim() !== '')
                .map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    <Image
                      src={image}
                      alt={`Product ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <HiOutlineX className="w-3 h-3" />
                    </button>
                  </div>
                ))}

              {/* Upload Button */}
              <label className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
                {isUploading ? (
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <HiOutlinePhotograph className="w-6 h-6 text-gray-300" />
                    <span className="text-xs text-gray-400 mt-1">Upload</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>
            <p className="text-xs text-gray-400">Click to upload new images</p>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <Link href={`/dashboard/products/${params.id}`}>
              <button
                type="button"
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
            </Link>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting || isUploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  );
}