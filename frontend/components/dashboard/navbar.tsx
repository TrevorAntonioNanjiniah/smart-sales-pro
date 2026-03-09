// components/dashboard/Navbar.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import { 
  HiOutlineSearch,
  HiOutlineBell,
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineChevronDown,
  HiOutlineMenuAlt2
} from 'react-icons/hi';

const Navbar = () => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  
  const { user } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/sign-in';
  };

  const notifications = [
    { id: 1, title: 'New order received', time: '5 min ago', read: false },
    { id: 2, title: 'Product stock low', time: '1 hour ago', read: false },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-blue-100 px-4 sm:px-6 lg:px-8 py-2 w-full">
      <div className="flex items-center justify-between">
        {/* Left section - Mobile menu button and breadcrumbs can go here */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={() => {
              const event = new CustomEvent('sidebarChange', { 
                detail: { isOpen: true } 
              });
              window.dispatchEvent(event);
            }}
            className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <HiOutlineMenuAlt2 className="w-5 h-5 text-blue-600" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-4 lg:mx-0 lg:ml-0">
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-gray-50 focus:bg-white transition-all duration-200 outline-none"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <div ref={notificationsRef} className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <HiOutlineBell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
                >
                  <div className="p-2 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-xs font-semibold text-gray-600">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-2 cursor-pointer hover:bg-gray-50 border-b border-gray-50 last:border-0 ${
                          !notification.read ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <p className="text-xs text-gray-800">{notification.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Menu */}
          <div ref={profileMenuRef} className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0) || 'U'}
              </div>
              <HiOutlineChevronDown className="w-3 h-3 text-gray-500" />
            </button>

            <AnimatePresence>
              {isProfileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
                >
                  <div className="p-2 border-b border-gray-100 bg-gray-50">
                    <p className="text-xs font-medium text-gray-800 truncate">
                      {user?.fullName || user?.firstName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.emailAddresses[0]?.emailAddress}
                    </p>
                  </div>
                  
                  <Link href="/dashboard/profile">
                    <div className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer">
                      <HiOutlineUser className="w-4 h-4 text-gray-500" />
                      <span>Profile</span>
                    </div>
                  </Link>
                  
                  <Link href="/dashboard/settings">
                    <div className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer">
                      <HiOutlineCog className="w-4 h-4 text-gray-500" />
                      <span>Settings</span>
                    </div>
                  </Link>
                  
                  <div className="border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 w-full cursor-pointer"
                    >
                      <HiOutlineLogout className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;