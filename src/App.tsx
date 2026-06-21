/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlatformProvider, usePlatform } from './context/PlatformContext';
import Header from './components/Header';
import HomeView from './components/HomeView';
import CatalogView from './components/CatalogView';
import ProductDetailModal from './components/ProductDetailModal';
import CartView from './components/CartView';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import { Sprout, Cpu, Globe, ShoppingBag, ShoppingCart, User, ArrowUp } from 'lucide-react';

function PlatformApp() {
  const { currentScreen, setCurrentScreen, setIsAdminMode, carts, activeBusiness } = usePlatform();
  const mainScrollRef = useRef<HTMLElement>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Unified scroll monitor for both mobile and desktop scrolling on window
  const updateScrollVisibility = () => {
    const windowScroll = window.scrollY || document.documentElement.scrollTop;
    
    if (windowScroll > 350) {
      setShowScrollToTop(true);
    } else {
      setShowScrollToTop(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', updateScrollVisibility, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateScrollVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Reset scroll height instantly on any route transition or active business switch
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0;
    }
    setShowScrollToTop(false);
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, [currentScreen, activeBusiness?.id]);

  // Count items in active cart for premium badge
  const currentCart = carts[activeBusiness?.id || ''] || [];
  const cartItemCount = currentCart.reduce((sum, item) => sum + item.quantity, 0);

  // Route viewport router based on active layout keys
  const renderActiveScreen = () => {
    let element;
    switch (currentScreen) {
      case 'home':
        element = <HomeView />;
        break;
      case 'catalog':
        element = <CatalogView />;
        break;
      case 'detail':
        element = <ProductDetailModal />;
        break;
      case 'cart':
        element = <CartView />;
        break;
      case 'profile':
        element = <UserDashboard />;
        break;
      case 'admin':
        element = <AdminDashboard />;
        break;
      default:
        element = <HomeView />;
        break;
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="flex-1 flex flex-col w-full"
        >
          {element}
        </motion.div>
      </AnimatePresence>
    );
  };

  const renderFooter = () => (
    <footer id="app-footer" className="bg-zinc-900 pt-10 pb-10 text-gray-400 mt-12 border-t border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-zinc-805">
          <div className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-amber-500 animate-pulse" />
            <Cpu className="h-5 w-5 text-amber-500 rotate-12" />
            <span className="font-sans font-bold text-white text-md tracking-tight ml-1">
              Unified Merchant Platform
            </span>
          </div>

          <p className="text-xs text-center sm:text-right leading-relaxed max-w-md">
            A robust, enterprise-grade multi-business suite linking AgroMart & ElectroHub. Browse equipment, request instant specialist quotes, and initiate bookings.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <span>&copy; 2026 Unified Merchant Ltd. Vetted Security certified.</span>
          
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer transition-colors">Security protocol</span>
            <span className="hover:text-white cursor-pointer transition-colors">Privacy coordinates</span>
            <span>● SYSTEM STANDBY</span>
          </div>
        </div>
      </div>
    </footer>
  );

  return (
    <div className="flex min-h-dvh max-w-full box-border flex-col bg-[#F5F5F3] overflow-x-hidden md:overflow-visible selection:bg-amber-100 selection:text-amber-905">
      
      {/* Dynamic Navigation Header */}
      <Header />

      {/* Primary Application Body */}
      <main ref={mainScrollRef} className="flex-1 flex flex-col w-full max-w-full box-border pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-12">
        <div className="flex-1 flex flex-col w-full max-w-full box-border">
          {renderActiveScreen()}
        </div>
        
        {/* Render footer inside standard document flow at content end */}
        <div className="w-full mt-auto">
          {renderFooter()}
        </div>
      </main>

      {/* Fixed Bottom Navigation Bar (Mobile Only - Always Visible and Flush) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] px-6 flex items-center justify-between shadow-[0_-4px_16px_rgba(0,0,0,0.06)] text-gray-500">
        {/* Explore */}
        <button
          onClick={() => { setCurrentScreen('home'); setIsAdminMode(false); }}
          className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-semibold transition-all ${
            currentScreen === 'home' ? 'text-gray-900 scale-105' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Globe className="h-5 w-5" />
          <span>Explore</span>
        </button>

        {/* Catalogue */}
        <button
          onClick={() => { setCurrentScreen('catalog'); setIsAdminMode(false); }}
          className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-semibold transition-all ${
            currentScreen === 'catalog' ? 'text-gray-900 scale-105' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <ShoppingBag className="h-5 w-5" />
          <span>Catalogue</span>
        </button>

        {/* Cart */}
        <button
          onClick={() => { setCurrentScreen('cart'); setIsAdminMode(false); }}
          className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-semibold transition-all relative ${
            currentScreen === 'cart' ? 'text-gray-900 scale-105' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <div className="relative">
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <span 
                className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm"
              >
                {cartItemCount}
              </span>
            )}
          </div>
          <span>Cart</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => { setCurrentScreen('profile'); setIsAdminMode(false); }}
          className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-semibold transition-all ${
            currentScreen === 'profile' ? 'text-gray-900 scale-105' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <User className="h-5 w-5" />
          <span>Profile</span>
        </button>
      </div>



      {/* Subtly Animated Scroll-To-Top Hover Button */}
      <AnimatePresence>
        {showScrollToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={scrollToTop}
            className="fixed bottom-[5.25rem] right-4 md:bottom-8 md:right-8 z-45 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-zinc-90 w-full max-w-[40px] md:max-w-[48px] bg-zinc-900 hover:bg-zinc-805 text-white shadow-xl hover:shadow-2xl border border-zinc-700/60 active:scale-95 hover:-translate-y-0.5 transition-all outline-none cursor-pointer flex shrink-0 group"
            style={{ width: "inherit", height: "inherit" }}
            title="Scroll to Top"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-4 w-4 md:h-5 md:w-5 stroke-[2.5] text-amber-500 group-hover:-translate-y-0.5 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <PlatformProvider>
      <PlatformApp />
    </PlatformProvider>
  );
}
