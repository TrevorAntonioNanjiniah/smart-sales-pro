// layouts/ProductLayout.tsx
import React from 'react';
import ProductNavbar from "@/components/products/navBar";
import Footer from "@/components/products/footer"; // Import the footer

interface ProductLayoutProps {
  children: React.ReactNode;
}

const ProductLayout = ({ children }: ProductLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ProductNavbar />
      
      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ProductLayout;