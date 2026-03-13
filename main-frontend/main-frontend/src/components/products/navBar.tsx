// components/ProductNavbar.tsx
'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, PlusCircle, Home, Package, Menu, X } from 'lucide-react';

const ProductNavbar = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');



  const handleSellClick = () => {
    router.push('/add-product');
  };

  // Base classes without template literal issues
  const desktopInputClasses = "w-full px-4 py-2 pl-12 pr-4 text-sm border border-blue-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent bg-blue-50/30 hover:bg-blue-50 transition-colors";
  
  const mobileInputClasses = "w-full px-4 py-2 pl-10 pr-4 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-blue-50/30";

  return (
    <nav className="bg-white shadow-sm border-b border-blue-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/products" className="flex items-center space-x-2">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-800 hidden sm:block">
                Smart<span className="text-blue-500">E-commerce</span>
              </span>
            </Link>
          </div>

      

          {/* Navigation Icons & Sell Button */}
          <div className="flex items-center space-x-3">
            {/* Home Link */}
            <Link 
              href="/products" 
              className="hidden sm:flex p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            >
              <Home className="h-5 w-5" />
            </Link>

            {/* Sell Button - Primary Action */}
            <button
              onClick={handleSellClick}
              className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md active:scale-95"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Sell</span>
              <span className="sm:hidden">Sell</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-2 border-t border-blue-100 bg-white">
            <div className="flex flex-col space-y-1">
              <Link
                href="/products"
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="h-5 w-5 mr-3 text-blue-500" />
                <span>Home</span>
              </Link>
            </div>
          </div>
        )}
      </div>

   

    </nav>
  );
};

export default ProductNavbar;