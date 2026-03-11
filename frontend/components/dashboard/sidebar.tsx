// components/dashboard/Sidebar.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
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
  const isInitialMount = useRef(true);
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
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
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

  // Hover handlers - NO DELAY
  const handleMouseEnter = () => {
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    setIsExpanded(false);
  };

  const sidebarVariants = {
    expanded: { width: '280px' },
    collapsed: { width: '80px' },
    mobileOpen: { x: 0 },
    mobileClosed: { x: '-100%' },
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-white shadow-md hover:bg-blue-50 transition-all duration-200 border border-gray-100"
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
            className="fixed left-0 top-0 h-full bg-white shadow-xl z-40 overflow-hidden border-r border-blue-50"
          >
            <div className="flex flex-col h-full">
              {/* Logo Section */}
              <div className="h-16 flex items-center px-4 border-b border-blue-50">
                {isExpanded ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm">
                      <span className="text-white font-bold text-sm">SP</span>
                    </div>
                    <span className="font-semibold text-gray-800">Smart Sales Pro</span>
                  </motion.div>
                ) : (
                  <div className="w-full flex justify-center">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm">
                      <span className="text-white font-bold text-sm">SP</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 py-6 px-3 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
                <style jsx>{`
                  nav::-webkit-scrollbar {
                    width: 4px;
                  }
                  nav::-webkit-scrollbar-thumb {
                    background-color: #bfdbfe;
                    border-radius: 4px;
                  }
                  nav::-webkit-scrollbar-track {
                    background-color: transparent;
                  }
                `}</style>
                <ul className="space-y-1.5">
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
                            whileHover={{ 
                              backgroundColor: 'rgba(59, 130, 246, 0.08)',
                              x: 4,
                              transition: { duration: 0.2 }
                            }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group
                              ${isActive 
                                ? 'bg-blue-500 text-white shadow-md shadow-blue-200' 
                                : 'text-gray-600 hover:text-blue-600'
                              }`}
                          >
                            <Icon className={`w-5 h-5 transition-colors duration-200 ${
                              isActive 
                                ? 'text-white' 
                                : 'text-gray-400 group-hover:text-blue-500'
                            }`} />
                            
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.span
                                  initial={{ opacity: 0, width: 0 }}
                                  animate={{ opacity: 1, width: 'auto' }}
                                  exit={{ opacity: 0, width: 0 }}
                                  transition={{ duration: 0.15 }}
                                  className={`ml-3 text-sm font-medium whitespace-nowrap ${
                                    isActive ? 'text-white' : 'text-gray-700'
                                  }`}
                                >
                                  {link.name}
                                </motion.span>
                              )}
                            </AnimatePresence>

                            {/* Active indicator dot */}
                            {isActive && !isExpanded && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute left-1 w-1.5 h-1.5 bg-blue-500 rounded-full"
                              />
                            )}
                          </motion.div>
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>

              {/* Logout Button */}
              <div className="p-3 border-t border-blue-50">
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ 
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    x: 4,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center w-full px-3 py-2.5 rounded-xl text-gray-600 hover:text-red-600 transition-all duration-200 group ${
                    isExpanded ? 'justify-start' : 'justify-center'
                  }`}
                >
                  <HiOutlineLogout className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors duration-200" />
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15 }}
                        className="ml-3 text-sm font-medium whitespace-nowrap text-gray-700 group-hover:text-red-600"
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
            className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;