// components/dashboard/Sidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineHome,
  HiOutlineShoppingBag,
  HiOutlineUsers,
  HiOutlineClipboardList,
  HiOutlineChartBar,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX
} from 'react-icons/hi';
import { FiPackage } from 'react-icons/fi';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const { signOut } = useClerk();

  // Handle resize and check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Dispatch sidebar state changes for layout
  useEffect(() => {
    const event = new CustomEvent('sidebarChange', { 
      detail: { 
        isOpen: isExpanded,
        width: isExpanded ? 280 : 80 
      } 
    });
    window.dispatchEvent(event);
  }, [isExpanded]);

  const navigationLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: HiOutlineHome },
    { name: 'Products', href: '/dashboard/products', icon: FiPackage },
    { name: 'Orders', href: '/dashboard/orders', icon: HiOutlineShoppingBag },
    { name: 'Customers', href: '/dashboard/customers', icon: HiOutlineUsers },
    { name: 'Analytics', href: '/dashboard/analytics', icon: HiOutlineChartBar },
    { name: 'Inventory', href: '/dashboard/inventory', icon: HiOutlineClipboardList },
    { name: 'Settings', href: '/dashboard/settings', icon: HiOutlineCog },
  ];

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/sign-in';
  };

  // Hover handlers with delay for better UX
  const handleMouseEnter = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsExpanded(false);
    }, 300); // 300ms delay before collapsing
    setHoverTimeout(timeout);
  };

  const sidebarVariants = {
    expanded: { width: '280px' },
    collapsed: { width: '80px' },
    mobileOpen: { x: 0 },
    mobileClosed: { x: '-100%' },
  };

  const linkVariants = {
    hover: {
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.98 }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white shadow-md hover:bg-blue-50 transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <HiOutlineX className="w-5 h-5 text-blue-600" />
        ) : (
          <HiOutlineMenu className="w-5 h-5 text-blue-600" />
        )}
      </button>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {(isMobile ? isMobileMenuOpen : true) && (
          <motion.aside
            initial={isMobile ? "mobileClosed" : "collapsed"}
            animate={isMobile 
              ? (isMobileMenuOpen ? "mobileOpen" : "mobileClosed")
              : (isExpanded ? "expanded" : "collapsed")
            }
            variants={sidebarVariants}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            onMouseEnter={!isMobile ? handleMouseEnter : undefined}
            onMouseLeave={!isMobile ? handleMouseLeave : undefined}
            className="fixed left-0 top-0 h-full bg-white shadow-lg z-40 overflow-hidden border-r border-gray-200"
          >
            <div className="flex flex-col h-full">
              {/* Logo Section */}
              <div className="h-16 flex items-center px-4 border-b border-gray-100">
                {isExpanded ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center space-x-2"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">D</span>
                    </div>
                    <span className="font-semibold text-gray-800">Dashboard</span>
                  </motion.div>
                ) : (
                  <div className="w-full flex justify-center">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">D</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 py-4 px-2 overflow-y-auto">
                <ul className="space-y-1">
                  {navigationLinks.map((link, index) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                      <motion.li
                        key={link.href}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link href={link.href}>
                          <motion.div
                            variants={linkVariants}
                            whileHover="hover"
                            whileTap="tap"
                            className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer
                              ${isActive 
                                ? 'bg-blue-50 text-blue-600' 
                                : 'text-gray-600 hover:bg-gray-50'
                              }`}
                          >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.span
                                  initial={{ opacity: 0, width: 0 }}
                                  animate={{ opacity: 1, width: 'auto' }}
                                  exit={{ opacity: 0, width: 0 }}
                                  transition={{ duration: 0.15 }}
                                  className="ml-3 text-sm font-medium whitespace-nowrap"
                                >
                                  {link.name}
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>

              {/* Logout Button */}
              <div className="p-2 border-t border-gray-100">
                <motion.button
                  onClick={handleLogout}
                  variants={linkVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className={`flex items-center w-full px-3 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors ${
                    isExpanded ? 'justify-start' : 'justify-center'
                  }`}
                >
                  <HiOutlineLogout className="w-5 h-5" />
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15 }}
                        className="ml-3 text-sm font-medium whitespace-nowrap"
                      >
                        Logout
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden fixed inset-0 bg-black z-30"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;