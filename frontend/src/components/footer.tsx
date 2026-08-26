'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0B0F19] text-gray-300 pt-16 pb-12 border-t border-[#D4AF37]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 100 80" className="w-7 h-7 fill-current text-[#C5A059]" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 50 10 L 32 68 L 40 68 L 46 48 L 54 48 L 60 68 L 68 68 Z M 48 42 L 50 25 L 52 42 Z" fill="#F9FAFB" />
                  <path d="M 30 52 Q 50 35 68 46 Q 78 36 82 28 Q 78 40 68 48 Q 50 42 30 52 Z" fill="#C5A059" />
                  <path d="M 72 38 Q 80 34 85 24 Q 78 30 72 38 Z" fill="#C5A059" />
                </svg>
                <span className="text-2xl font-bold tracking-[0.25em] text-white font-serif-luxury">
                  AVELORA
                </span>
              </div>
              <span className="text-[9px] tracking-[0.3em] text-[#C5A059] uppercase font-semibold mt-1">
                Elegance in every choice
              </span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              AVELORA represents timeless refinement, curating bespoke Turkish Silk Hijabs, traditional Velvet & Bridal Churi sets, fine gold-plated Ornaments, luxury Footwear, and Little Girls' festive designer dresses.
            </p>

            <div className="pt-2 text-xs space-y-2 text-gray-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#C5A059] flex-shrink-0 mt-0.5" />
                <span>Dhaka Mohakhali Royal Filling Station, Jam Jam Tower, 5th Building, 6th Floor</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#C5A059] flex-shrink-0" />
                <a href="tel:01353786336" className="hover:text-[#C5A059] transition font-mono">
                  +880 1353-786336 (01353786336)
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#C5A059] flex-shrink-0" />
                <a href="mailto:aveloraelegance@gmail.com" className="hover:text-[#C5A059] transition">
                  aveloraelegance@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4 font-serif-luxury text-sm">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <Link href="/products?category=hijab-collection" className="hover:text-[#C5A059] transition">
                  Premium Hijabs
                </Link>
              </li>
              <li>
                <Link href="/products?category=churi-bangles" className="hover:text-[#C5A059] transition">
                  Bridal & Velvet Churi
                </Link>
              </li>
              <li>
                <Link href="/products?category=ornaments-jewelry" className="hover:text-[#C5A059] transition">
                  Ornaments & Jhumkas
                </Link>
              </li>
              <li>
                <Link href="/products?category=shoes-footwear" className="hover:text-[#C5A059] transition">
                  Shoes & Footwear
                </Link>
              </li>
              <li>
                <Link href="/products?category=little-girls-dress" className="hover:text-[#C5A059] transition">
                  Little Girls' Dresses
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4 font-serif-luxury text-sm">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <Link href="/track-order" className="hover:text-[#C5A059] transition">
                  Track Your Order
                </Link>
              </li>
              <li>
                <span className="cursor-pointer hover:text-[#C5A059] transition">
                  Shipping & Delivery Terms
                </span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-[#C5A059] transition">
                  Authenticity Guarantee
                </span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-[#C5A059] transition">
                  Returns & Exchanges
                </span>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-[#C5A059] transition">
                  Admin Management
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4 font-serif-luxury text-sm">
              The AVELORA Circle
            </h4>
            <p className="text-xs text-gray-400 mb-3">
              Subscribe for private previews, invitations, and complimentary gift packaging.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing to AVELORA Circle.'); }} className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email address"
                required
                className="w-full px-3 py-2 text-xs rounded bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-[#C5A059]"
              />
              <button
                type="submit"
                className="w-full py-2 bg-[#C5A059] hover:bg-[#b08b3a] text-slate-950 font-bold text-xs uppercase tracking-wider rounded transition"
              >
                Join Private Club
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} AVELORA (www.avelora.com). All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-[11px] flex items-center gap-1 text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" /> 100% Genuine & Insured Deliveries
            </span>
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-gray-400 hover:text-[#C5A059] cursor-pointer transition fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <svg className="w-4 h-4 text-gray-400 hover:text-[#C5A059] cursor-pointer transition fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
