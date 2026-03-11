// app/dashboard/products/add/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { HiOutlineArrowLeft, HiOutlinePhotograph, HiOutlineX } from 'react-icons/hi';
import { FiDollarSign, FiPackage } from 'react-icons/fi';
import { createProduct, CreateProductInput } from '@/lib/services/productService';
import Link from 'next/link';
import Image from 'next/image';

// Helper function to convert blob URL to base64
const blobToBase64 = (blobUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(xhr.response);
    };
    xhr.onerror = reject;
    xhr.open('GET', blobUrl);
    xhr.responseType = 'blob';
    xhr.send();
  });
};

export default function AddProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateProductInput>({
    name: '',
    price: 0,
    stock: 0,
    description: '',
    images: []
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await createProduct(formData);
      router.push('/dashboard/products');
    } catch (error) {
      console.error('Failed to create product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPreviews: string[] = [];
    const newImages: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      newPreviews.push(previewUrl);
      
      // Convert blob to base64 for sending to backend
      try {
        const base64 = await blobToBase64(previewUrl);
        newImages.push(base64);
      } catch (error) {
        console.error('Failed to convert image:', error);
      }
    }

    setImagePreviews([...imagePreviews, ...newPreviews]);
    setFormData({ 
      ...formData, 
      images: [...(formData.images || []), ...newImages] 
    });
  };

  const removeImage = (index: number) => {
    // Revoke the blob URL to free memory
    URL.revokeObjectURL(imagePreviews[index]);
    
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const newImages = (formData.images || []).filter((_, i: number) => i !== index);
    
    setImagePreviews(newPreviews);
    setFormData({ ...formData, images: newImages });
  };

  // Clean up blob URLs when component unmounts
  const cleanup = () => {
    imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/products">
          <motion.button
            whileHover={{ x: -4 }}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-4"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Products</span>
          </motion.button>
        </Link>
        <h1 className="text-2xl font-semibold text-gray-800">Add New Product</h1>
        <p className="text-sm text-gray-500 mt-1">Create a new product in your inventory</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-6">
          {/* Basic Info */}
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder="e.g. Wireless Headphones"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price
                </label>
                <div className="relative">
                  <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity
                </label>
                <div className="relative">
                  <FiPackage className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all">
                  <option value="">Select category</option>
                  <option value="electronics">Electronics</option>
                  <option value="clothing">Clothing</option>
                  <option value="food">Food & Beverages</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              placeholder="Describe your product..."
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6">
              {imagePreviews.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md"
                      >
                        <HiOutlineX className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  {/* Add more images button */}
                  <label className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
                    <HiOutlinePhotograph className="w-8 h-8 text-gray-300" />
                    <span className="text-xs text-gray-400 mt-1">Add More</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      multiple
                    />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center cursor-pointer">
                  <HiOutlinePhotograph className="w-12 h-12 text-gray-300 mb-2" />
                  <span className="text-sm text-gray-500 mb-1">Click to upload images</span>
                  <span className="text-xs text-gray-400">PNG, JPG up to 5MB (multiple allowed)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    multiple
                  />
                </label>
              )}
            </div>
            {imagePreviews.length > 0 && (
              <p className="text-xs text-gray-400 mt-2">
                {imagePreviews.length} image(s) selected. Click on X to remove.
              </p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
            <Link href="/dashboard/products">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={cleanup}
                className="px-6 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </motion.button>
            </Link>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Product'}
            </motion.button>
          </div>
        </div>
      </form>
    </div>
  );
}