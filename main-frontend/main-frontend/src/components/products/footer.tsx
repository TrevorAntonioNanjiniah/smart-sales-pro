// components/products/footer.tsx
import Link from 'next/link';
import { Package } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Logo */}
          <Link href="/products" className="flex items-center space-x-2">
            <div className="bg-blue-500 p-1.5 rounded-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-lg text-gray-800">
              Smart<span className="text-blue-500">E-commerce</span>
            </span>
          </Link>

          {/* Copyright */}
          <p className="text-sm text-gray-500 order-3 sm:order-2">
            © {new Date().getFullYear()} SmartE-commerce. All rights reserved.
          </p>

          {/* Links */}
          <div className="flex space-x-4 order-2 sm:order-3">
            <Link href="/privacy" className="text-xs text-gray-500 hover:text-blue-500 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-gray-500 hover:text-blue-500 transition-colors">
              Terms
            </Link>
            <Link href="/contact" className="text-xs text-gray-500 hover:text-blue-500 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;