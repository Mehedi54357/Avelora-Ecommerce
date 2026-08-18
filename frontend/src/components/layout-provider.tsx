'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { CartProvider } from '../context/cart-context';
import Navbar from './navbar';
import CartDrawer from './cart-drawer';
import Footer from './footer';

export default function LayoutProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <CartProvider>
      {isAdmin ? (
        <div className="min-h-screen bg-gray-100">{children}</div>
      ) : (
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <CartDrawer />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      )}
    </CartProvider>
  );
}
