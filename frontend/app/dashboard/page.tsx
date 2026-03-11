// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { 
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineShoppingBag,
  HiOutlineCurrencyDollar,
  HiOutlineCube,
  HiOutlineTrendingUp,
  HiOutlineExclamationCircle,
  HiOutlineArrowUp,
  HiOutlineArrowDown,
  HiOutlineArrowRight
} from 'react-icons/hi';
import { getProducts, Product } from '@/lib/services/productService';

// Carousel images - 8 new modern images
const carouselImages = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    alt: 'Modern Workspace',
    title: 'Digital Workspace',
    description: 'Streamline your business operations'
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    alt: 'E-commerce Dashboard',
    title: 'E-commerce Analytics',
    description: 'Track sales and customer behavior'
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    alt: 'Data Visualization',
    title: 'Smart Insights',
    description: 'Make data-driven decisions'
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    alt: 'Team Collaboration',
    title: 'Team Success',
    description: 'Collaborate effectively with your team'
  },
  {
    id: 5,
    src: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    alt: 'Business Strategy',
    title: 'Growth Strategy',
    description: 'Plan and execute business growth'
  },
  {
    id: 6,
    src: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    alt: 'Mobile Analytics',
    title: 'Mobile Ready',
    description: 'Access insights on the go'
  },
  {
    id: 7,
    src: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    alt: 'Financial Growth',
    title: 'Financial Intelligence',
    description: 'Monitor revenue and expenses'
  },
  {
    id: 8,
    src: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    alt: 'Customer Success',
    title: 'Customer First',
    description: 'Deliver exceptional customer experiences'
  }
];

// Dashboard stats interface
interface DashboardStats {
  totalProducts: number;
  totalValue: number;
  totalStock: number;
  lowStockCount: number;
  outOfStockCount: number;
  averagePrice: number;
  mostExpensive: { name: string; price: number } | null;
  cheapest: { name: string; price: number } | null;
}

export default function DashboardPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalValue: 0,
    totalStock: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    averagePrice: 0,
    mostExpensive: null,
    cheapest: null
  });

  useEffect(() => {
    // Auto-advance carousel every 5 seconds
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
      calculateStats(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (products: Product[]) => {
    if (products.length === 0) return;

    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 10).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;
    const averagePrice = products.reduce((sum, p) => sum + p.price, 0) / totalProducts;

    const sortedByPrice = [...products].sort((a, b) => b.price - a.price);
    const mostExpensive = sortedByPrice[0] ? { name: sortedByPrice[0].name, price: sortedByPrice[0].price } : null;
    const cheapest = sortedByPrice[sortedByPrice.length - 1] ? { 
      name: sortedByPrice[sortedByPrice.length - 1].name, 
      price: sortedByPrice[sortedByPrice.length - 1].price 
    } : null;

    setStats({
      totalProducts,
      totalValue,
      totalStock,
      lowStockCount,
      outOfStockCount,
      averagePrice,
      mostExpensive,
      cheapest
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            {getGreeting()}, welcome back
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Here is what is happening with your dashboard today
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* Carousel Section */}
      <div className="relative rounded-2xl overflow-hidden bg-white shadow-lg border border-gray-100">
        <div className="relative h-64 md:h-[400px] lg:h-[450px] w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <Image
                src={carouselImages[currentSlide].src}
                alt={carouselImages[currentSlide].alt}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              {/* Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <span className="inline-block px-3 py-1 bg-blue-600/30 backdrop-blur-sm rounded-full text-xs font-medium mb-3">
                    Featured
                  </span>
                  <motion.h2 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2"
                  >
                    {carouselImages[currentSlide].title}
                  </motion.h2>
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-sm md:text-base lg:text-lg text-gray-200 max-w-2xl"
                  >
                    {carouselImages[currentSlide].description}
                  </motion.p>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel Controls */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all hover:scale-110 border border-white/20"
            aria-label="Previous slide"
          >
            <HiOutlineChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all hover:scale-110 border border-white/20"
            aria-label="Next slide"
          >
            <HiOutlineChevronRight className="w-5 h-5 text-white" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`transition-all duration-300 ${
                  index === currentSlide 
                    ? 'w-10 h-2.5 bg-white' 
                    : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/60'
                } rounded-full`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Dashboard Stats from Real Data */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  <div className="h-6 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <HiOutlineCube className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-700 mb-1">No products yet</h3>
          <p className="text-sm text-gray-500 mb-4">Add your first product to see statistics</p>
          <Link href="/dashboard/products/add">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              Add Product
            </button>
          </Link>
        </div>
      ) : (
        <>
          {/* Main Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Products */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <HiOutlineCube className="w-6 h-6" />
                </div>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Inventory</span>
              </div>
              <p className="text-sm text-white/80 mb-1">Total Products</p>
              <p className="text-2xl font-bold">{formatNumber(stats.totalProducts)}</p>
              <div className="flex items-center mt-2 text-xs text-white/80">
                <HiOutlineArrowUp className="w-3 h-3 mr-1" />
                <span>Active products</span>
              </div>
            </motion.div>

            {/* Total Inventory Value */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <HiOutlineCurrencyDollar className="w-6 h-6" />
                </div>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Value</span>
              </div>
              <p className="text-sm text-white/80 mb-1">Inventory Value</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
              <div className="flex items-center mt-2 text-xs text-white/80">
                <span>Based on cost × stock</span>
              </div>
            </motion.div>

            {/* Total Stock Units */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <HiOutlineShoppingBag className="w-6 h-6" />
                </div>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Units</span>
              </div>
              <p className="text-sm text-white/80 mb-1">Total Stock</p>
              <p className="text-2xl font-bold">{formatNumber(stats.totalStock)}</p>
              <div className="flex items-center mt-2 text-xs text-white/80">
                <span>Units across all products</span>
              </div>
            </motion.div>

            {/* Average Price */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-5 text-white"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <HiOutlineTrendingUp className="w-6 h-6" />
                </div>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Average</span>
              </div>
              <p className="text-sm text-white/80 mb-1">Average Price</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.averagePrice)}</p>
              <div className="flex items-center mt-2 text-xs text-white/80">
                <span>Per product</span>
              </div>
            </motion.div>
          </div>

          {/* Secondary Stats - Stock Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Low Stock Alert */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${stats.lowStockCount > 0 ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                    <HiOutlineExclamationCircle className={`w-5 h-5 ${stats.lowStockCount > 0 ? 'text-yellow-600' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Low Stock Alert</p>
                    <p className="text-xs text-gray-500">Products with stock ≤ 10</p>
                  </div>
                </div>
                <span className={`text-2xl font-bold ${stats.lowStockCount > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>
                  {stats.lowStockCount}
                </span>
              </div>
              {stats.lowStockCount > 0 && (
                <Link href="/dashboard/products?filter=lowStock">
                  <button className="w-full mt-2 text-sm text-yellow-600 hover:text-yellow-700 font-medium flex items-center justify-center space-x-1">
                    <span>View low stock products</span>
                    <HiOutlineArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              )}
            </motion.div>

            {/* Out of Stock Alert */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${stats.outOfStockCount > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                    <HiOutlineExclamationCircle className={`w-5 h-5 ${stats.outOfStockCount > 0 ? 'text-red-600' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Out of Stock</p>
                    <p className="text-xs text-gray-500">Products with stock = 0</p>
                  </div>
                </div>
                <span className={`text-2xl font-bold ${stats.outOfStockCount > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                  {stats.outOfStockCount}
                </span>
              </div>
              {stats.outOfStockCount > 0 && (
                <Link href="/dashboard/products?filter=outOfStock">
                  <button className="w-full mt-2 text-sm text-red-600 hover:text-red-700 font-medium flex items-center justify-center space-x-1">
                    <span>View out of stock products</span>
                    <HiOutlineArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              )}
            </motion.div>
          </div>

          {/* Price Extremes */}
          {(stats.mostExpensive || stats.cheapest) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.mostExpensive && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <HiOutlineArrowUp className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Most Expensive</p>
                      <p className="text-sm font-medium text-gray-800 truncate">{stats.mostExpensive.name}</p>
                    </div>
                    <p className="text-lg font-bold text-gray-800">{formatCurrency(stats.mostExpensive.price)}</p>
                  </div>
                </motion.div>
              )}
              
              {stats.cheapest && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <HiOutlineArrowDown className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Least Expensive</p>
                      <p className="text-sm font-medium text-gray-800 truncate">{stats.cheapest.name}</p>
                    </div>
                    <p className="text-lg font-bold text-gray-800">{formatCurrency(stats.cheapest.price)}</p>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}