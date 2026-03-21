// app/products/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useUser, useAuth } from '@clerk/nextjs'; // ← added useAuth
import api from '@/lib/api'; // ← added
import {
  HiOutlineArrowLeft,
  HiOutlinePencil,
  HiOutlineShare,
  HiOutlineTrash,
  HiExclamationCircle,
  HiShoppingCart,
  HiCheckCircle,
} from 'react-icons/hi';
import { FiPackage } from 'react-icons/fi';
import { getProductById, deleteProduct, Product } from '@/lib/service/productService'; // ← removed shareProductToN8n

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth(); // ← added
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

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

  const isSeller = isLoaded && user && product?.seller_id === user.id;

  const handleDelete = async () => {
    if (!product) return;
    const confirmed = window.confirm('Are you sure you want to delete this product?');
    if (!confirmed) return;
    try {
      setIsDeleting(true);
      await deleteProduct(product.id);
      router.push('/products');
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // ← fully updated: now uses auth token and only shows Posted on real success
  const handleShare = async () => {
    if (!product) return;
    try {
      setIsSharing(true);
      setShareError(null);
      setShareSuccess(false);

      const token = await getToken();
      console.log('🔥 token:', token ? '✅ exists' : '❌ missing');
      console.log('🔥 productId being sent:', product.id);

      const response = await api.post(
        '/n8n/product',
        { productId: product.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('✅ n8n response:', response.data);

      // Only show Posted! if backend confirmed success
      if (response.data.success) {
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      } else {
        setShareError('Share failed. Please try again.');
        setTimeout(() => setShareError(null), 3000);
      }

    } catch (error: any) {
      console.error('❌ Failed to share product:', error);
      console.error('❌ Error response:', error?.response?.data);
      setShareError(error?.response?.data?.message || 'Failed to share. Please try again.');
      setTimeout(() => setShareError(null), 3000);
    } finally {
      setIsSharing(false);
    }
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
        <Link href="/products">
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Back to Products
          </button>
        </Link>
      </div>
    );
  }

  const isSellerUnavailable = !product.seller_id;
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

        {/* Seller Action Buttons */}
        {isSeller && (
          <div className="flex items-center space-x-2">

            {/* Share Button */}
            <button
              onClick={handleShare}
              disabled={isSharing}
              className={`flex items-center px-3 py-2 text-sm border rounded-lg transition-all duration-200 disabled:opacity-50
                ${shareSuccess
                  ? 'text-green-600 border-green-300 bg-green-50'
                  : shareError
                  ? 'text-red-500 border-red-300 bg-red-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 border-gray-200'
                }`}
            >
              {shareSuccess ? (
                <>
                  <HiCheckCircle className="w-4 h-4 mr-1" />
                  <span>Posted!</span>
                </>
              ) : shareError ? (
                <>
                  <HiExclamationCircle className="w-4 h-4 mr-1" />
                  <span>{shareError}</span>
                </>
              ) : (
                <>
                  <HiOutlineShare className="w-4 h-4 mr-1" />
                  <span>{isSharing ? 'Sharing...' : 'Share to Social Media'}</span>
                </>
              )}
            </button>

            {/* Edit Button */}
            <button
              onClick={() => router.push(`/products/${product.id}/edit`)}
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 rounded-lg transition-all duration-200"
            >
              <HiOutlinePencil className="w-4 h-4 mr-1" />
              <span>Edit</span>
            </button>

            {/* Delete Button */}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center px-3 py-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              <HiOutlineTrash className="w-4 h-4 mr-1" />
              <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
            </button>

          </div>
        )}
      </div>

      {/* Seller Unavailable Banner */}
      {isSellerUnavailable && (
        <div className="flex items-center space-x-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <HiExclamationCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Seller Unavailable</p>
            <p className="text-xs text-amber-600">
              The seller of this product is no longer active. This item cannot be purchased.
            </p>
          </div>
        </div>
      )}

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
            <div className="flex items-center space-x-2 mb-2">
              <h1 className="text-2xl font-semibold text-gray-800">{product.name}</h1>
              {isSellerUnavailable && (
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-full flex-shrink-0">
                  Seller Unavailable
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-4">ID: {product.id.slice(-8)}</p>
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

            {/* Seller status */}
            <div className="mb-6">
              <p className="text-xs text-gray-500 mb-1">Seller</p>
              {isSellerUnavailable ? (
                <p className="text-sm text-red-500 flex items-center space-x-1">
                  <HiExclamationCircle className="w-4 h-4" />
                  <span>This seller is no longer available</span>
                </p>
              ) : (
                <p className="text-sm text-green-600">✓ Active Seller</p>
              )}
            </div>

            {/* Buy Button — buyers only */}
            {!isSeller && (
              <button
                disabled={isSellerUnavailable || product.stock === 0}
                onClick={() => {
                  // TODO: implement buy functionality
                }}
                className={`w-full flex items-center justify-center px-6 py-3 rounded-xl text-white font-semibold transition-all duration-200 
                  ${isSellerUnavailable || product.stock === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 hover:shadow-md active:scale-95'
                  }`}
              >
                <HiShoppingCart className="w-5 h-5 mr-2" />
                {isSellerUnavailable
                  ? 'Unavailable'
                  : product.stock === 0
                  ? 'Out of Stock'
                  : 'Buy Now'}
              </button>
            )}

            <div className="text-xs text-gray-400 mt-4">
              <p>Created: {product.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}