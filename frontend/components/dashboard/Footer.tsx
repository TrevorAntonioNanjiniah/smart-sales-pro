// components/dashboard/Footer.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FiGithub, 
  FiTwitter, 
  FiLinkedin, 
  FiMail,
  FiHeart 
} from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: FiGithub, href: 'https://github.com', label: 'GitHub', color: 'hover:text-gray-900' },
    { icon: FiTwitter, href: 'https://twitter.com', label: 'Twitter', color: 'hover:text-blue-400' },
    { icon: FiLinkedin, href: 'https://linkedin.com', label: 'LinkedIn', color: 'hover:text-blue-600' },
    { icon: FiMail, href: 'mailto:support@dashboard.com', label: 'Email', color: 'hover:text-red-500' },
  ];

  const quickLinks = [
    { name: 'About', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Careers', href: '/careers' },
    { name: 'Contact', href: '/contact' },
  ];

  const resourceLinks = [
    { name: 'Documentation', href: '/docs' },
    { name: 'API', href: '/api' },
    { name: 'Status', href: '/status' },
    { name: 'Support', href: '/support' },
  ];

  return (
    <footer className="bg-gray-400 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-3">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-2"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-base font-semibold text-gray-800">Smart Sales</span>
            </motion.div>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
              Modern  solution for your business needs.
            </p>
            
            {/* Social Icons */}
            <div className="flex items-center space-x-2 pt-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -2, scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2 rounded-lg bg-white text-gray-600 shadow-sm ${social.color} transition-all duration-200`}
                    aria-label={social.label}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <motion.h3 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-xs font-semibold text-gray-800 uppercase tracking-wider mb-3"
            >
              Company
            </motion.h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Link href={link.href}>
                    <motion.span
                      whileHover={{ x: 3 }}
                      className="text-xs text-gray-500 hover:text-blue-600 transition-colors cursor-pointer inline-block"
                    >
                      {link.name}
                    </motion.span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <motion.h3 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xs font-semibold text-gray-800 uppercase tracking-wider mb-3"
            >
              Resources
            </motion.h3>
            <ul className="space-y-2">
              {resourceLinks.map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  <Link href={link.href}>
                    <motion.span
                      whileHover={{ x: 3 }}
                      className="text-xs text-gray-500 hover:text-blue-600 transition-colors cursor-pointer inline-block"
                    >
                      {link.name}
                    </motion.span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Legal & Version */}
          <div>
            <motion.h3 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xs font-semibold text-gray-800 uppercase tracking-wider mb-3"
            >
              Legal
            </motion.h3>
            <ul className="space-y-2">
              {[
                { name: 'Privacy Policy', href: '/privacy' },
                { name: 'Terms of Service', href: '/terms' },
                { name: 'Cookie Policy', href: '/cookies' },
              ].map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  <Link href={link.href}>
                    <motion.span
                      whileHover={{ x: 3 }}
                      className="text-xs text-gray-500 hover:text-blue-600 transition-colors cursor-pointer inline-block"
                    >
                      {link.name}
                    </motion.span>
                  </Link>
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="pt-2 text-xs text-gray-400"
              >
                Version 2.0.1
              </motion.li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 pt-4 border-t border-gray-200"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <span>© {currentYear} Dashboard. All rights reserved.</span>
            </div>
            
            <div className="flex items-center space-x-1 mt-2 sm:mt-0">
              <span>Made with</span>
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2,
                  ease: "easeInOut"
                }}
              >
                <FiHeart className="w-3 h-3 text-red-500" />
              </motion.div>
              <span>Smart sales Devs</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;