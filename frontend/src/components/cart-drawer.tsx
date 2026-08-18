'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '../context/cart-context';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeItem, updateQuantity, cartSubtotal, cartCount } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
          {/* Drawer Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-[#FAFAF8]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#C5A059]" />
              <h2 className="text-lg font-bold uppercase tracking-wider text-gray-900 font-serif-luxury">
                Your Shopping Bag
              </h2>
              <span className="bg-[#C5A059]/15 text-[#997B21] text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {cartCount}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition"
              aria-label="Close Shopping Bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#FAFAF8] border border-[#D4AF37]/20 flex items-center justify-center text-[#C5A059] mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold uppercase tracking-wider text-gray-800 mb-1">
                  Your bag is empty
                </h3>
                <p className="text-xs text-gray-500 max-w-xs mb-6">
                  Explore our luxury collection of handcrafted bags, perfumes, watches, and accessories.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 bg-slate-900 text-white text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-[#C5A059] transition shadow"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.sku}
                  className="flex gap-4 pb-6 border-b border-gray-100 last:border-b-0 items-center"
                >
                  <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=300&q=80'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 truncate font-serif-luxury text-base">
                      {item.name}
                    </h4>
                    {(item.color || item.size) && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.color} {item.color && item.size ? '•' : ''} {item.size}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 font-mono mt-0.5">SKU: {item.sku}</p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200 rounded-md">
                        <button
                          onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                          className="p-1 hover:bg-gray-100 text-gray-600 transition"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-semibold text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 text-gray-600 transition"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          ৳{(item.price * item.quantity).toLocaleString()}
                        </p>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <p className="text-[11px] text-gray-400 line-through">
                            ৳{(item.originalPrice * item.quantity).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.sku)}
                    className="p-1 text-gray-300 hover:text-red-500 transition"
                    title="Remove Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer & Checkout Action */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-gray-100 bg-[#FAFAF8] space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-800">৳{cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Delivery (Calculated at checkout)</span>
                  <span className="text-emerald-600 font-medium">From ৳70</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total Amount</span>
                  <span className="text-lg text-[#0F172A]">৳{cartSubtotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-gray-500 bg-white p-2.5 rounded border border-gray-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Cash on Delivery & Instant Mobile Payment Available</span>
              </div>

              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full py-3.5 bg-slate-900 text-white hover:bg-[#C5A059] rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
