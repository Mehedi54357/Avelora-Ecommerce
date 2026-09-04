'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  QrCode,
  Truck,
  TrendingUp,
  RotateCcw,
  Star,
  FileSpreadsheet,
  Settings,
  Shield,
  CreditCard,
  Landmark,
  Wallet,
  Scale,
  Search,
  Loader2,
} from 'lucide-react';
import { API_BASE_URL, authFetch } from '../../utils/api-config';

interface NavSection {
  title: string;
  items: {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    roles: string[];
    badge?: string;
  }[];
}

const ADMIN_NAV_SECTIONS: NavSection[] = [
  {
    title: 'Executive Overview',
    items: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
      { name: 'Analytics & UTM', href: '/admin/analytics', icon: TrendingUp, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
    ],
  },
  {
    title: 'Commerce & Catalog',
    items: [
      { name: 'Orders Workspace', href: '/admin/orders', icon: Package, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF'] },
      { name: 'Products & Variants', href: '/admin/products', icon: ShoppingBag, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
      { name: 'Categories', href: '/admin/categories', icon: Layers, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
      { name: 'Customers', href: '/admin/customers', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
      { name: 'Customer Reviews', href: '/admin/reviews', icon: Star, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
    ],
  },
  {
    title: 'Operations & Logistics',
    items: [
      { name: 'Inventory & Stock', href: '/admin/inventory', icon: Boxes, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF'] },
      { name: 'Purchases & GRN', href: '/admin/purchases', icon: Truck, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
      { name: 'Returns & Refunds', href: '/admin/returns', icon: RotateCcw, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF'] },
      { name: 'QR Dispatch Station', href: '/admin/scan', icon: QrCode, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF'] },
    ],
  },
  {
    title: 'Finance & Accounting',
    items: [
      { name: 'Business Performance', href: '/admin/finance/business-performance', icon: TrendingUp, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
      { name: 'Statement of P&L', href: '/admin/finance/pnl', icon: FileSpreadsheet, roles: ['SUPER_ADMIN', 'ADMIN'] },
      { name: 'Cash Flow', href: '/admin/finance/cash-flow', icon: Wallet, roles: ['SUPER_ADMIN', 'ADMIN'] },
      { name: 'Capital & Investment', href: '/admin/finance/capital', icon: Landmark, roles: ['SUPER_ADMIN', 'ADMIN'] },
      { name: 'Courier & COD Reconcile', href: '/admin/finance/reconciliation', icon: Scale, roles: ['SUPER_ADMIN', 'ADMIN'] },
      { name: 'Expense Ledger', href: '/admin/finance', icon: DollarSign, roles: ['SUPER_ADMIN', 'ADMIN'] },
      { name: 'Reports & Tax Export', href: '/admin/finance/reports', icon: CreditCard, roles: ['SUPER_ADMIN', 'ADMIN'] },
    ],
  },
  {
    title: 'System Governance',
    items: [
      { name: 'Audit Logs', href: '/admin/audit-logs', icon: Shield, roles: ['SUPER_ADMIN', 'ADMIN'] },
      { name: 'Settings & Pathao', href: '/admin/settings', icon: Settings, roles: ['SUPER_ADMIN', 'ADMIN'] },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [verifyingSession, setVerifyingSession] = useState(pathname !== '/admin/login');
  const [searchQuery, setSearchQuery] = useState('');

  // Verify active session with the backend source of truth
  useEffect(() => {
    if (pathname === '/admin/login') {
      setVerifyingSession(false);
      return;
    }

    let isMounted = true;
    const checkAuthSession = async () => {
      try {
        const res = await authFetch(`${API_BASE_URL}/api/auth/me`);

        if (!res.ok) {
          throw new Error('Unauthorized');
        }

        const data = await res.json();
        if (isMounted) {
          setCurrentUser(data.user || data);
          setVerifyingSession(false);
        }
      } catch {
        if (isMounted) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('admin_token');
          }
          router.replace('/admin/login');
        }
      }
    };

    checkAuthSession();
    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  // If on login page, render children directly
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Session verification loader
  if (verifyingSession) {
    return (
      <div className="min-h-screen bg-[#070A11] flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
        <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
          Authenticating Executive Session...
        </p>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await authFetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
      });
    } catch (e) {
      console.error('Logout notice:', e);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
      }
      window.location.href = '/admin/login';
    }
  };

  const userRole = currentUser?.role || 'STAFF';

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col md:flex-row text-slate-900 font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#0A0E17] text-white p-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-widest text-[#D4AF37] font-serif-luxury">AVELORA</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-gray-800 text-[#D4AF37] rounded font-mono">{userRole}</span>
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
        className={`w-full md:w-72 bg-[#0A0E17] text-gray-300 flex flex-col justify-between transition-all duration-300 z-30 border-r border-gray-800/80 ${
          mobileNavOpen ? 'block' : 'hidden md:flex'
        }`}
      >
        <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-100px)]">
          {/* Logo Brand Header */}
          <div className="hidden md:flex flex-col pb-3 border-b border-gray-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#8C6D23] via-[#D4AF37] to-[#F3E5AB] flex items-center justify-center shadow-lg shadow-[#D4AF37]/10">
                <span className="text-[#0A0E17] font-black text-sm tracking-tighter">AV</span>
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-[0.25em] text-white font-serif-luxury block">
                  AVELORA
                </span>
                <span className="text-[9px] tracking-[0.3em] text-[#D4AF37] uppercase font-bold block">
                  Executive Suite
                </span>
              </div>
            </div>
          </div>

          {/* Categorized Nav Sections */}
          <div className="space-y-6">
            {ADMIN_NAV_SECTIONS.map((section) => {
              const visibleItems = section.items.filter(
                (item) => item.roles.includes(userRole) || userRole === 'SUPER_ADMIN',
              );

              if (visibleItems.length === 0) return null;

              return (
                <div key={section.title} className="space-y-1">
                  <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                    {section.title}
                  </p>
                  <div className="space-y-0.5 mt-1.5">
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        item.href === '/admin'
                          ? pathname === '/admin' || pathname === '/admin/dashboard'
                          : pathname === item.href || pathname.startsWith(item.href + '/');

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileNavOpen(false)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-[#D4AF37] text-slate-950 font-bold shadow-md shadow-[#D4AF37]/20'
                              : 'text-gray-400 hover:bg-slate-900/90 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-slate-950' : 'text-gray-400'}`} />
                            <span>{item.name}</span>
                          </div>
                          {item.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37]">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-800/80 space-y-2 bg-[#080B12]">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-gray-300 hover:text-white text-xs font-semibold transition border border-gray-800"
          >
            <span className="flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-[#D4AF37]" />
              View Live Storefront
            </span>
            <span className="text-[10px] text-gray-400">↗</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-950/30 hover:bg-red-950/70 text-red-300 text-xs font-bold uppercase tracking-wider rounded-lg transition border border-red-900/40"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-8 py-3 items-center justify-between shadow-sm sticky top-0 z-20 flex">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-[#D4AF37] hover:text-slate-950 text-gray-700 text-xs font-bold transition shadow-sm"
              title="Open Public Storefront in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-current" />
              <span>View Public Store</span>
            </Link>

            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-500 w-64">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders, SKUs (⌘K)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    router.push(`/admin/orders?search=${encodeURIComponent(searchQuery.trim())}`);
                  }
                }}
                className="bg-transparent border-none outline-none text-xs w-full text-slate-800 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-mono font-medium">Production Ready</span>
            </div>

            <div className="text-right">
              <p className="text-xs font-bold text-gray-900 leading-tight">{currentUser?.name || 'Administrator'}</p>
              <p className="text-[10px] text-gray-500 font-mono">{currentUser?.email || userRole}</p>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
