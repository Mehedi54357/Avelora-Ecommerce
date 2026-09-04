'use client';

import React from 'react';
import { useCart } from '../context/cart-context';
import { ShoppingCart } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function FloatingCartButton() {
  const { cartCount, cartSubtotal, setIsCartOpen } = useCart();
  const pathname = usePathname();

  // Hide floating cart on admin pages and checkout page
  if (pathname?.startsWith('/admin') || pathname === '/checkout') {
    return null;
  }

  const isProductDetailPage = pathname?.startsWith('/products/') && pathname !== '/products';

  return (
    <div
      className={`fixed right-4 sm:right-6 z-30 animate-fadeIn ${
        isProductDetailPage ? 'bottom-20 md:bottom-6' : 'bottom-4 sm:bottom-6'
      }`}
    >
      <button
        onClick={() => setIsCartOpen(true)}
        className="group relative flex items-center gap-2.5 sm:gap-3 bg-slate-950 hover:bg-[#0B0F19] text-white pl-3.5 sm:pl-4 pr-4 sm:pr-5 py-2.5 sm:py-3 rounded-full shadow-2xl border-2 border-[#D4AF37]/50 hover:border-[#C5A059] transition-all duration-300 hover:scale-105 active:scale-95 min-h-[44px]"
        aria-label="Open Cart Drawer"
      >
        {/* Animated Glow Halo */}
        <div className="absolute inset-0 rounded-full bg-[#C5A059]/20 blur-md group-hover:bg-[#C5A059]/40 transition-all -z-10" />

        {/* Icon with Counter Badge */}
        <div className="relative">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#C5A059] text-slate-950 flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform">
            <ShoppingCart className="w-4 h-4 text-slate-950" />
          </div>
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] sm:min-w-[20px] h-4.5 sm:h-5 px-1 bg-red-600 text-white text-[9px] sm:text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white shadow-md animate-pulse">
              {cartCount}
            </span>
          )}
        </div>

        {/* Text Info */}
        <div className="text-left">
          <p className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-[#E6CA85] leading-none">
            {cartCount === 0 ? 'Cart' : `Cart (${cartCount})`}
          </p>
          <p className="text-[11px] sm:text-xs font-mono font-bold text-white mt-0.5 leading-none">
            ৳{cartSubtotal.toLocaleString()}
          </p>
        </div>
      </button>
    </div>
  );
}
