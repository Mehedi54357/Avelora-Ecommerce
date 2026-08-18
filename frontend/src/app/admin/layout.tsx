'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Users,
  DollarSign,
  Boxes,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react';

const ADMIN_NAV = [
  { name: 'Financial Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products & Variants', href: '/admin/products', icon: ShoppingBag },
  { name: 'Categories', href: '/admin/categories', icon: Layers },
  { name: 'Orders Management', href: '/admin/orders', icon: Package },
  { name: 'Inventory & Logs', href: '/admin/inventory', icon: Boxes },
  { name: 'Finance & Expenses', href: '/admin/finance', icon: DollarSign },
  { name: 'Customer Directory', href: '/admin/customers', icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // If on login page, render children directly
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3001/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    window.location.href = '/admin/login';
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col md:flex-row text-slate-900">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-950 text-white p-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-widest text-[#E6CA85] font-serif-luxury">AVELORA</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-gray-800 text-gray-300 rounded font-mono">ADMIN</span>
        </div>
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-2 text-gray-300 hover:text-white"
        >
          {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`w-full md:w-64 bg-slate-950 text-gray-300 flex flex-col justify-between transition-all duration-300 z-30 ${
          mobileNavOpen ? 'block' : 'hidden md:flex'
        }`}
      >
        <div className="p-6 space-y-6">
          {/* Logo Brand Header */}
          <div className="hidden md:flex flex-col">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 100 80" className="w-6 h-6 fill-current text-[#C5A059]" xmlns="http://www.w3.org/2000/svg">
                <path d="M 50 10 L 32 68 L 40 68 L 46 48 L 54 48 L 60 68 L 68 68 Z M 48 42 L 50 25 L 52 42 Z" fill="#F9FAFB" />
                <path d="M 30 52 Q 50 35 68 46 Q 78 36 82 28 Q 78 40 68 48 Q 50 42 30 52 Z" fill="#C5A059" />
              </svg>
              <span className="text-xl font-bold tracking-[0.2em] text-white font-serif-luxury">
                AVELORA
              </span>
            </div>
            <span className="text-[8px] tracking-[0.3em] text-[#C5A059] uppercase font-semibold mt-0.5">
              Control Panel
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-[#C5A059] text-slate-950 font-bold shadow-md'
                      : 'text-gray-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-6 border-t border-gray-800/80 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-900/60 hover:bg-gray-900 text-gray-400 hover:text-white text-xs font-semibold transition"
          >
            <span>View Public Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-950/40 hover:bg-red-900/80 text-red-300 text-xs font-bold uppercase tracking-wider rounded-lg transition border border-red-900/50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <header className="hidden md:flex bg-white border-b border-gray-200 px-8 py-4 items-center justify-between shadow-sm sticky top-0 z-20">
          <div>
            <h2 className="text-lg font-bold font-serif-luxury text-gray-900">
              AVELORA Business Suite
            </h2>
            <p className="text-xs text-gray-500">Live Transactional Synchronization</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>System Live</span>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-900">Super Admin</p>
              <p className="text-[10px] text-gray-500">admin@avelora.com</p>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
