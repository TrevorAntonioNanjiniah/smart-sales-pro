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
import { getProduct, updateProduct } from '@/lib/services/productService';
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

// Default fallback image
const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';

// Helper function to get safe image URL
const getSafeImageUrl = (imageUrl: string | undefined | null): string => {
  if (!imageUrl || imageUrl === '') {
    return DEFAULT_PRODUCT_IMAGE;
  }
  return imageUrl;
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    stock: 0,
    description: '',
    images: [] as string[] // This will store image URLs for existing and base64 for new
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const product = await getProduct(params.id as string);
      
      // Extract image URLs from product images
      const imageUrls = product.images?.map(img => 
        typeof img === 'string' ? img : img.url
      ) || [];
      
      setFormData({
        name: product.name,
        price: product.price,
        stock: product.stock,
        description: product.description || '',
        images: imageUrls
      });
      
      setImagePreviews(imageUrls);
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
      images: [...formData.images, ...newImages] 
    });
  };

  const removeImage = (index: number) => {
    // If it's a blob URL (new image), revoke it to free memory
    if (imagePreviews[index]?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviews[index]);
    }
    
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const newImages = formData.images.filter((_, i) => i !== index);
    
    setImagePreviews(newPreviews);
    setFormData({ ...formData, images: newImages });
  };

  // Clean up blob URLs when component unmounts
  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => {
        if (preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [imagePreviews]);

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
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
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
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
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
            
            {/* Image Grid */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={getSafeImageUrl(preview)}
                    alt={`Product ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 25vw, 100px"
                    onError={(e) => {
                      // If image fails to load, replace with default
                      e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md z-10"
                  >
                    <HiOutlineX className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              {/* Upload Button - Show if less than 5 images */}
              {imagePreviews.length < 5 && (
                <label className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors bg-gray-50">
                  <HiOutlinePhotograph className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">Upload</span>
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
            <p className="text-xs text-gray-400">
              {imagePreviews.length} / 5 images. Click to upload new images (PNG, JPG up to 5MB)
            </p>
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
              disabled={isSubmitting}
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