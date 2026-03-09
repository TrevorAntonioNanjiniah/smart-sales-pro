// app/dashboard/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/sidebar';
import Navbar from '@/components/dashboard/navbar';
import Footer from '@/components/dashboard/Footer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const handleSidebarChange = (e: CustomEvent) => {
      setSidebarOpen(e.detail.isOpen);
    };
    
    window.addEventListener('sidebarChange' as any, handleSidebarChange);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('sidebarChange' as any, handleSidebarChange);
    };
  }, []);

  // Don't render until mounted to avoid hydration issues
  if (!mounted) return null;

  const sidebarWidth = !isMobile && sidebarOpen ? 280 : !isMobile && !sidebarOpen ? 80 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex">
      <Sidebar />
      
      {/* Main Content Area */}
      <div 
        className="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out"
        style={{ 
          marginLeft: sidebarWidth,
          width: `calc(100% - ${sidebarWidth}px)`
        }}
      >
        {/* Navbar - fixed at top */}
        <div className="sticky top-0 z-30 w-full">
          <Navbar />
        </div>

        {/* Main Content - scrollable */}
        <main className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4 sm:p-6 lg:p-8 h-full">
              {children}
            </div>
          </div>
          
          {/* Footer - attached to bottom */}
          <Footer />
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => {
            const event = new CustomEvent('sidebarChange', { 
              detail: { isOpen: false } 
            });
            window.dispatchEvent(event);
          }}
        />
      )}
    </div>
  );
}