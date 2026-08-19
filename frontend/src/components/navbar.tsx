'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../context/cart-context';
import { ShoppingBag, Search, Menu, X, Compass, ShieldCheck, ChevronDown, Sparkles, ArrowRight } from 'lucide-react';

export const AveloraLogo = ({ className = 'h-10' }: { className?: string }) => (
  <div className={`flex flex-col items-center justify-center select-none ${className}`}>
    <div className="flex items-center justify-center">
      <svg viewBox="0 0 120 90" className="w-9 h-9" xmlns="http://www.w3.org/2000/svg">
        {/* Classical Serif 'A' Body */}
        <path
          d="M 60 8 L 36 74 L 46 74 L 52 56 L 68 56 L 74 74 L 84 74 Z M 55 46 L 60 25 L 65 46 Z"
          fill="#0B0F19"
        />
        {/* Dual Graceful Wave Ribbon across the 'A' */}
        <path
          d="M 28 58 Q 50 38 72 49 Q 84 54 94 48 Q 80 58 68 53 Q 48 46 28 58 Z"
          fill="#C5A059"
        />
        <path
          d="M 36 63 Q 54 48 74 56 Q 84 60 92 54 Q 80 62 70 59 Q 52 53 36 63 Z"
          fill="#9E7B34"
        />
        {/* 5-Leaf Botanical Sprig sprouting from wave */}
        <path d="M 85 45 Q 92 34 94 24 Q 85 32 85 45 Z" fill="#0B0F19" />
        <path d="M 88 47 Q 98 42 104 32 Q 95 38 88 47 Z" fill="#0B0F19" />
        <path d="M 89 50 Q 102 52 106 44 Q 97 47 89 50 Z" fill="#0B0F19" />
        <path d="M 82 46 Q 85 36 86 28 Q 79 36 82 46 Z" fill="#C5A059" />
        <path d="M 85 52 Q 94 53 98 48 Q 91 50 85 52 Z" fill="#C5A059" />
      </svg>
    </div>
    <span className="text-xl md:text-2xl font-bold tracking-[0.28em] text-[#0B0F19] font-serif-luxury leading-tight mt-0.5">
      AVELORA
    </span>
    <span className="text-[7px] md:text-[8px] tracking-[0.35em] text-[#C5A059] uppercase font-semibold">
      Elegance in every choice
    </span>
  </div>
);

const MEGA_MENU = {
  women: {
    title: 'Women',
    badge: 'Haute Collection',
    columns: [
      {
        heading: 'Modest & Ethnic',
        items: [
          { name: 'Hijab Collection', slug: 'women-hijab', desc: 'Turkish Silk, Georgette & Satin' },
          { name: 'Churi & Bangles', slug: 'women-churi-bangles', desc: 'কাঁচের চুড়ি, রেশমি চুড়ি ও কঙ্কন' },
          { name: 'Hair Accessories', slug: 'women-hair-accessories', desc: 'Clips, pins & pearl headbands' },
        ],
      },
      {
        heading: 'Apparel & Footwear',
        items: [
          { name: 'Dresses & Modest Wear', slug: 'women-dresses', desc: 'Festive gowns & luxury kurtis' },
          { name: 'Shoes & Footwear', slug: 'women-shoes', desc: 'Velvet nagras & bridal heels' },
          { name: 'Accessories & Fine Jewellery', slug: 'women-accessories', desc: '18K Jhumkas, Chokers & Payel' },
        ],
      },
    ],
    feature: {
      title: 'The Royal Churi & Hijab Edit',
      desc: 'Handcrafted reshmi velvet bangles & pure silk georgette drapes.',
      image: 'https://images.unsplash.com/photo-1611591475152-478311399767?auto=format&fit=crop&w=600&q=80',
      link: '/products?category=women-churi-bangles',
    },
  },
  men: {
    title: 'Men',
    badge: 'Gentleman Atelier',
    columns: [
      {
        heading: 'Footwear & Apparel',
        items: [
          { name: 'Shoes & Loafers', slug: 'men-shoes', desc: 'Italian calf leather penny loafers & nagras' },
          { name: 'Clothing & Panjabi', slug: 'men-clothing', desc: 'Festive silk & fine cotton panjabis' },
          { name: 'Accessories & Leather', slug: 'men-accessories', desc: 'Full-grain wallets, belts & cufflinks' },
        ],
      },
    ],
    feature: {
      title: 'Handcrafted Leather Loafers',
      desc: 'Full-grain Italian calf leather with artisan apron stitching.',
      image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=600&q=80',
      link: '/products?category=men-shoes',
    },
  },
  kids: {
    title: 'Kids',
    badge: 'Little Princess & Princes',
    columns: [
      {
        heading: 'Little Girls',
        items: [
          { name: "Girls' Dresses", slug: 'kids-girls-dresses', desc: 'Princess organza gowns & velvet frocks' },
          { name: "Girls' Shoes", slug: 'kids-girls-shoes', desc: 'Ballerina flats & soft ethnic nagras' },
        ],
      },
      {
        heading: 'Little Boys & Accessories',
        items: [
          { name: "Boys' Clothing", slug: 'kids-boys-clothing', desc: 'Festive panjabi sets & waistcoats' },
          { name: "Boys' Shoes", slug: 'kids-boys-shoes', desc: 'Mini leather loafers & ethnic shoes' },
          { name: "Kids' Accessories", slug: 'kids-accessories', desc: 'Floral headbands & mini jewellery' },
        ],
      },
    ],
    feature: {
      title: 'Little Princess Festive Gowns',
      desc: 'Multi-layer floral organza party dresses gentle on delicate skin.',
      image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=600&q=80',
      link: '/products?category=kids-girls-dresses',
    },
  },
};

export default function Navbar() {
  const { cartCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeHoverMenu, setActiveHoverMenu] = useState<string | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      {/* Top Notification Announcement Bar */}
      <div className="bg-[#0B0F19] text-[#E6CA85] text-[11px] font-medium tracking-widest uppercase py-2 px-4 text-center border-b border-[#D4AF37]/20 flex items-center justify-center gap-2">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
        <span>Complimentary Signature Gift Packaging & Express Delivery Nationwide</span>
      </div>

      {/* Main Luxury Header */}
      <header
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 transition-all duration-300 shadow-sm"
        onMouseLeave={() => setActiveHoverMenu(null)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: Mobile Hamburger & Desktop Mega Menu Triggers */}
            <div className="flex items-center gap-8">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-700 hover:text-[#C5A059] transition"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-[0.15em] text-gray-800">
                {/* Women Mega Menu Trigger */}
                <div
                  className="relative py-7 cursor-pointer group"
                  onMouseEnter={() => setActiveHoverMenu('women')}
                >
                  <Link
                    href="/products?department=women"
                    className={`flex items-center gap-1 hover:text-[#C5A059] transition-colors ${
                      activeHoverMenu === 'women' ? 'text-[#C5A059]' : ''
                    }`}
                  >
                    <span>Women</span>
                    <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180" />
                  </Link>
                </div>

                {/* Men Mega Menu Trigger */}
                <div
                  className="relative py-7 cursor-pointer group"
                  onMouseEnter={() => setActiveHoverMenu('men')}
                >
                  <Link
                    href="/products?department=men"
                    className={`flex items-center gap-1 hover:text-[#C5A059] transition-colors ${
                      activeHoverMenu === 'men' ? 'text-[#C5A059]' : ''
                    }`}
                  >
                    <span>Men</span>
                    <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180" />
                  </Link>
                </div>

                {/* Kids Mega Menu Trigger */}
                <div
                  className="relative py-7 cursor-pointer group"
                  onMouseEnter={() => setActiveHoverMenu('kids')}
                >
                  <Link
                    href="/products?department=kids"
                    className={`flex items-center gap-1 hover:text-[#C5A059] transition-colors ${
                      activeHoverMenu === 'kids' ? 'text-[#C5A059]' : ''
                    }`}
                  >
                    <span>Kids</span>
                    <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180" />
                  </Link>
                </div>

                <Link
                  href="/products"
                  className="hover:text-[#C5A059] transition-colors py-7 border-b-2 border-transparent hover:border-[#C5A059]"
                >
                  All Catalog
                </Link>
              </nav>
            </div>

            {/* Center: Brand Signature Logo */}
            <div className="flex-1 flex justify-center">
              <Link href="/" className="group flex flex-col items-center">
                <AveloraLogo />
              </Link>
            </div>

            {/* Right: Actions (Search, Track Order, Cart) */}
            <div className="flex items-center gap-3 sm:gap-5">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-gray-700 hover:text-[#C5A059] transition"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              <Link
                href="/track-order"
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 hover:text-[#C5A059] transition"
              >
                <Compass className="w-4 h-4 text-[#C5A059]" />
                <span>Track Order</span>
              </Link>

              {/* Shopping Bag Trigger with Animated Badge */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 bg-slate-950 text-white rounded-full hover:bg-[#C5A059] transition shadow-md group"
                aria-label="Shopping Bag"
              >
                <ShoppingBag className="w-4 h-4 transition-transform group-hover:scale-110" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C5A059] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Aarong-Style Full Mega Menu Dropdown */}
        {activeHoverMenu && MEGA_MENU[activeHoverMenu as keyof typeof MEGA_MENU] && (
          <div
            className="hidden lg:block absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-2xl animate-fadeIn"
            onMouseEnter={() => setActiveHoverMenu(activeHoverMenu)}
            onMouseLeave={() => setActiveHoverMenu(null)}
          >
            <div className="max-w-7xl mx-auto px-8 py-8">
              <div className="grid grid-cols-12 gap-8 items-start">
                {/* Category Columns */}
                <div className="col-span-8 grid grid-cols-2 gap-8">
                  {MEGA_MENU[activeHoverMenu as keyof typeof MEGA_MENU].columns.map((col, idx) => (
                    <div key={idx} className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#997B21] border-b border-gray-100 pb-2">
                        {col.heading}
                      </h4>
                      <ul className="space-y-3">
                        {col.items.map((item) => (
                          <li key={item.slug}>
                            <Link
                              href={`/products?category=${item.slug}`}
                              onClick={() => setActiveHoverMenu(null)}
                              className="group block"
                            >
                              <p className="text-sm font-semibold text-gray-900 group-hover:text-[#C5A059] transition">
                                {item.name}
                              </p>
                              <p className="text-[11px] text-gray-400 mt-0.5">{item.desc}</p>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Curated Lookbook Feature Banner */}
                <div className="col-span-4 bg-[#FAF7F0] rounded-2xl p-4 border border-[#D4AF37]/20 flex flex-col justify-between space-y-3">
                  <div className="aspect-[16/10] w-full rounded-xl overflow-hidden shadow-sm relative">
                    <img
                      src={MEGA_MENU[activeHoverMenu as keyof typeof MEGA_MENU].feature.image}
                      alt={MEGA_MENU[activeHoverMenu as keyof typeof MEGA_MENU].feature.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2.5 py-1 rounded bg-black/70 text-[#E6CA85] text-[9px] font-bold uppercase tracking-widest backdrop-blur-sm">
                      {MEGA_MENU[activeHoverMenu as keyof typeof MEGA_MENU].badge}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-gray-900 font-serif-luxury text-sm">
                      {MEGA_MENU[activeHoverMenu as keyof typeof MEGA_MENU].feature.title}
                    </h5>
                    <p className="text-[11px] text-gray-600">
                      {MEGA_MENU[activeHoverMenu as keyof typeof MEGA_MENU].feature.desc}
                    </p>
                  </div>
                  <Link
                    href={MEGA_MENU[activeHoverMenu as keyof typeof MEGA_MENU].feature.link}
                    onClick={() => setActiveHoverMenu(null)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-950 hover:text-[#C5A059] pt-1"
                  >
                    <span>Explore Department</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expandable Search Overlay Bar */}
        {searchOpen && (
          <div className="bg-white border-t border-gray-200 py-4 px-4 shadow-md animate-fadeIn">
            <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search silk Hijabs, কাঁচের ও রেশমি চুড়ি, jewellery, nagras, kids' frocks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:border-[#C5A059] text-xs sm:text-sm text-gray-900 bg-[#FAFAF8]"
                  autoFocus
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-950 text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-[#C5A059] transition"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 px-6 py-6 space-y-6 shadow-xl max-h-[85vh] overflow-y-auto">
            {/* Women */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#997B21]">Women</span>
              <div className="pl-2 space-y-1.5 text-xs text-gray-700">
                <Link href="/products?category=women-hijab" onClick={() => setMobileMenuOpen(false)} className="block py-1">
                  • Hijab Collection
                </Link>
                <Link href="/products?category=women-churi-bangles" onClick={() => setMobileMenuOpen(false)} className="block py-1">
                  • Churi & Bangles (কাঁচের ও রেশমি চুড়ি)
                </Link>
                <Link href="/products?category=women-hair-accessories" onClick={() => setMobileMenuOpen(false)} className="block py-1">
                  • Hair Accessories
                </Link>
                <Link href="/products?category=women-dresses" onClick={() => setMobileMenuOpen(false)} className="block py-1">
                  • Dresses & Modest Wear
                </Link>
                <Link href="/products?category=women-shoes" onClick={() => setMobileMenuOpen(false)} className="block py-1">
                  • Shoes & Nagras
                </Link>
                <Link href="/products?category=women-accessories" onClick={() => setMobileMenuOpen(false)} className="block py-1">
                  • Accessories & Fine Jewellery
                </Link>
              </div>
            </div>

            {/* Men */}
            <div className="space-y-2 pt-2 border-t">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#997B21]">Men</span>
              <div className="pl-2 space-y-1.5 text-xs text-gray-700">
                <Link href="/products?category=men-shoes" onClick={() => setMobileMenuOpen(false)} className="block py-1">
                  • Shoes & Leather Loafers
                </Link>
                <Link href="/products?category=men-clothing" onClick={() => setMobileMenuOpen(false)} className="block py-1">
                  • Clothing & Panjabi
                </Link>
                <Link href="/products?category=men-accessories" onClick={() => setMobileMenuOpen(false)} className="block py-1">
                  • Wallets & Belts
                </Link>
              </div>
            </div>

            {/* Kids */}
            <div className="space-y-2 pt-2 border-t">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#997B21]">Kids</span>
              <div className="pl-2 space-y-1.5 text-xs text-gray-700">
                <Link href="/products?category=kids-girls-dresses" onClick={() => setMobileMenuOpen(false)} className="block py-1">
                  • Girls' Festive Dresses
                </Link>
                <Link href="/products?category=kids-girls-shoes" onClick={() => setMobileMenuOpen(false)} className="block py-1">
                  • Girls' Shoes
                </Link>
                <Link href="/products?category=kids-boys-clothing" onClick={() => setMobileMenuOpen(false)} className="block py-1">
                  • Boys' Clothing & Panjabi
                </Link>
                <Link href="/products?category=kids-boys-shoes" onClick={() => setMobileMenuOpen(false)} className="block py-1">
                  • Boys' Shoes
                </Link>
                <Link href="/products?category=kids-accessories" onClick={() => setMobileMenuOpen(false)} className="block py-1">
                  • Kids' Accessories
                </Link>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <Link
                href="/track-order"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-bold uppercase tracking-wider text-[#C5A059]"
              >
                Track Your Order →
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
