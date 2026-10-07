'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  DollarSign,
  Boxes,
  Layers,
  ShoppingBag,
  ArrowRight,
  Download,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Landmark,
  Wallet,
  Scale,
  PieChart,
  BarChart3,
  Flame,
  Clock,
  ShieldCheck,
  Package,
  Sparkles,
  Info,
  ArrowUpRight,
  Printer,
  X,
  Calculator,
  HelpCircle,
} from 'lucide-react';
import { API_BASE_URL, authFetch } from '../../../../utils/api-config';

type RangePreset = 'today' | '7d' | '30d' | '90d' | 'this_month' | 'this_year' | 'all' | 'custom';
type ChartMetric = 'revenue' | 'grossProfit' | 'inventoryValue';

export default function BusinessPerformancePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  // Filters State
  const [range, setRange] = useState<RangePreset>('30d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [chartMetric, setChartMetric] = useState<ChartMetric>('revenue');

  // Drill-down State: null means All Business; categoryId drills into Category; productId drills into Product
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Product Drill-Down Calculation Modal State
  const [drillDownItem, setDrillDownItem] = useState<any>(null);

  // Print Report Modal State
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Fetch Business Performance Data from Backend
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      let url = `${API_BASE_URL}/api/admin/finance/business-performance?range=${range}`;
      if (range === 'custom' && startDate) {
        url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;
      }

      const res = await authFetch(url);
      if (!res.ok) {
        throw new Error('Failed to load business intelligence data');
      }

      const result = await res.json();
      setData(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error fetching business performance metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [range, startDate, endDate]);

  // Derived Objects based on Drill-Down Level
  const selectedCategory = useMemo(() => {
    if (!data || !selectedCategoryId) return null;
    return data.categories.find((c: any) => c.categoryId === selectedCategoryId) || null;
  }, [data, selectedCategoryId]);

  const selectedProduct = useMemo(() => {
    if (!selectedCategory || !selectedProductId) return null;
    return selectedCategory.products.find((p: any) => p.productId === selectedProductId) || null;
  }, [selectedCategory, selectedProductId]);

  // Handle Export CSV
  const handleExportCsv = async () => {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/finance/business-performance/export`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `avelora-business-performance-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Failed to download CSV export');
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-[#C5A059]" />
        <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">
          Compiling Two-Level Profit & SKU Intelligence...
        </p>
      </div>
    );
  }

  const allBiz = data?.allBusiness || {};
  const capital = data?.capitalAllocation || {};
  const insights = data?.insights || {};

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & BREADCRUMBS                                               */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/90 shadow-2xs print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-1">
            <Link href="/admin/finance" className="inline-flex items-center gap-1 text-gray-600 hover:text-slate-900 font-bold transition">
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Finance Overview</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <Link href="/admin/finance/pnl" className="hover:text-[#C5A059] transition">
              P&L
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-900 font-bold">Business Performance & Profit</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold font-serif-luxury text-gray-900">
              Two-Level Profit & Business Performance
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
              Management Intelligence
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Realized product sales vs. capitalized actual COGS (Product Gross Profit) and net business profit after operating expenses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition shadow-2xs"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowPrintModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-slate-800 text-xs font-bold transition"
            title="Print Report"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-[#C5A059] text-white text-xs font-bold uppercase tracking-wider transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DATE FILTER CONTROLS & DRILL-DOWN BREADCRUMB                           */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/90 shadow-2xs print:hidden">
        {/* Preset Date Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {(
            [
              { id: 'today', label: 'Today' },
              { id: '7d', label: '7D' },
              { id: '30d', label: '30D' },
              { id: '90d', label: '90D' },
              { id: 'this_month', label: 'This Month' },
              { id: 'this_year', label: 'This Year' },
              { id: 'all', label: 'All Time' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setRange(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition min-h-[36px] ${
                range === t.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Drill-down Navigation Path */}
        <div className="flex items-center gap-1.5 text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700">
          <span className="font-bold text-gray-400 text-[10px] uppercase tracking-wider">Drill-Down:</span>
          <button
            onClick={() => {
              setSelectedCategoryId(null);
              setSelectedProductId(null);
            }}
            className={`font-semibold transition ${
              !selectedCategoryId ? 'text-slate-950 underline font-bold' : 'text-gray-500 hover:text-slate-900'
            }`}
          >
            All Categories
          </button>
          {selectedCategory && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <button
                onClick={() => setSelectedProductId(null)}
                className={`font-semibold transition ${
                  !selectedProductId ? 'text-slate-950 underline font-bold' : 'text-gray-500 hover:text-slate-900'
                }`}
              >
                {selectedCategory.categoryName}
              </button>
            </>
          )}
          {selectedProduct && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <span className="text-slate-950 font-bold underline">{selectedProduct.productName}</span>
            </>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TWO-LEVEL PROFIT SYSTEM HERO BANNER                                    */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-[#1e1a12] text-white p-5 sm:p-6 rounded-3xl border border-amber-500/20 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#D4AF37]">
              Two-Level Profit Management Engine
            </h2>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Delivered & Completed Sales Realized Only</span>
          </div>
        </div>

        {/* 5 Premium Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Realized Sales */}
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
              1. Realized Sales
            </span>
            <p className="text-2xl font-black font-mono text-white">
              ৳{(allBiz.revenue || 0).toLocaleString()}
            </p>
            <p className="text-[11px] text-gray-400">
              Sold: {(allBiz.soldQty || 0).toLocaleString()} pcs
            </p>
          </div>

          {/* Card 2: Actual Product COGS */}
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
              2. Actual Product COGS
            </span>
            <p className="text-2xl font-black font-mono text-gray-300">
              ৳{(allBiz.cogs || 0).toLocaleString()}
            </p>
            <p className="text-[11px] text-gray-400">
              Capitalized WAC acquisition
            </p>
          </div>

          {/* Card 3: Level A - Product Gross Profit */}
          <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30 space-y-1 relative overflow-hidden">
            <span className="text-[10px] text-amber-300 uppercase tracking-wider block font-bold">
              Level A: Product Gross Profit
            </span>
            <p className="text-2xl font-black font-mono text-[#D4AF37]">
              ৳{(allBiz.grossProfit || 0).toLocaleString()}
            </p>
            <p className="text-[11px] text-amber-200/80">
              Margin: {allBiz.grossMarginPercent || 0}% • Avg ৳{allBiz.profitPerUnit || 0}/unit
            </p>
          </div>

          {/* Card 4: Operating Expenses (OPEX) */}
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
              Operating Expenses (OPEX)
            </span>
            <p className="text-2xl font-black font-mono text-red-300">
              ৳{(allBiz.operatingExpenses || 0).toLocaleString()}
            </p>
            <p className="text-[11px] text-gray-400">
              Ads, Team Salaries, Rent, Utilities
            </p>
          </div>

          {/* Card 5: Level B - Net Business Profit */}
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 space-y-1 relative overflow-hidden">
            <span className="text-[10px] text-emerald-300 uppercase tracking-wider block font-bold">
              Level B: Net Business Profit
            </span>
            <p className="text-2xl font-black font-mono text-emerald-400">
              ৳{(allBiz.netBusinessProfit || 0).toLocaleString()}
            </p>
            <p className="text-[11px] text-emerald-300/80">
              Net Margin: {allBiz.netMarginPercent || 0}%
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. HIERARCHICAL DRILL-DOWN PERFORMANCE TABLE                              */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden space-y-4 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900 uppercase tracking-wide">
              {!selectedCategoryId
                ? 'Category Profitability (ক্যাটেগরি ভিত্তিক মুনাফা)'
                : !selectedProductId
                ? `${selectedCategory?.categoryName} — Product Profitability`
                : `${selectedProduct?.productName} — SKU & Variant Costing`}
            </h3>
            <p className="text-xs text-gray-500">
              {!selectedCategoryId
                ? 'Click any category to drill down to products'
                : !selectedProductId
                ? 'Click any product to inspect individual variants and calculation formula'
                : 'Unit-by-unit profitability with actual capitalized cost'}
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search category / product / SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#C5A059]"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-y border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">
                  {!selectedCategoryId ? 'Category' : !selectedProductId ? 'Product' : 'SKU / Variant'}
                </th>
                <th className="py-3 px-3 text-right">Sold Qty</th>
                <th className="py-3 px-3 text-right">Realized Sales</th>
                <th className="py-3 px-3 text-right">Actual COGS</th>
                <th className="py-3 px-3 text-right">Avg Selling Price</th>
                <th className="py-3 px-3 text-right">Actual Cost/Unit</th>
                <th className="py-3 px-3 text-right font-bold text-slate-900">Profit / Unit</th>
                <th className="py-3 px-3 text-right font-bold text-[#997B21]">Total Gross Profit</th>
                <th className="py-3 px-3 text-right">Margin %</th>
                <th className="py-3 px-3 text-center">Drill-Down</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* LEVEL 1: CATEGORIES */}
              {!selectedCategoryId &&
                (data?.categories || [])
                  .filter((c: any) =>
                    c.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((cat: any) => {
                    const avgPrice = cat.soldQty > 0 ? Math.round(cat.revenue / cat.soldQty) : 0;
                    const avgCost = cat.soldQty > 0 ? Math.round(cat.cogs / cat.soldQty) : 0;
                    const profitPerUnit = cat.soldQty > 0 ? Math.round(cat.grossProfit / cat.soldQty) : 0;

                    return (
                      <tr
                        key={cat.categoryId}
                        className="hover:bg-amber-50/40 transition group"
                      >
                        <td
                          onClick={() => setSelectedCategoryId(cat.categoryId)}
                          className="py-3 px-3 font-bold text-gray-900 flex items-center gap-2 cursor-pointer"
                        >
                          <Layers className="w-4 h-4 text-[#997B21]" />
                          <span>{cat.categoryName}</span>
                          <span className="text-[10px] text-gray-400 font-normal">({cat.productCount} products)</span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-gray-700">{cat.soldQty}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-950">৳{cat.revenue.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-mono text-gray-700">৳{cat.cogs.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-mono text-gray-600">৳{avgPrice}</td>
                        <td className="py-3 px-3 text-right font-mono text-gray-600">৳{avgCost}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 bg-amber-50/50">৳{profitPerUnit}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-[#997B21]">৳{cat.grossProfit.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-indigo-900">{cat.grossMarginPercent}%</td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => setSelectedCategoryId(cat.categoryId)}
                            className="inline-flex items-center gap-1 text-[11px] text-[#997B21] font-bold hover:underline"
                          >
                            <span>Products</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

              {/* LEVEL 2: PRODUCTS */}
              {selectedCategoryId &&
                !selectedProductId &&
                (selectedCategory?.products || [])
                  .filter((p: any) =>
                    p.productName.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((prod: any) => {
                    const profitPerUnit = prod.profitPerUnit ?? (prod.soldQty > 0 ? Math.round(prod.grossProfit / prod.soldQty) : 0);

                    return (
                      <tr
                        key={prod.productId}
                        className="hover:bg-amber-50/40 transition group"
                      >
                        <td
                          onClick={() => setSelectedProductId(prod.productId)}
                          className="py-3 px-3 font-bold text-gray-900 flex items-center gap-2 cursor-pointer"
                        >
                          {prod.image ? (
                            <img src={prod.image} alt={prod.productName} className="w-7 h-8 object-cover rounded border" />
                          ) : (
                            <ShoppingBag className="w-4 h-4 text-gray-400" />
                          )}
                          <div>
                            <p className="truncate max-w-[200px]">{prod.productName}</p>
                            <span className="text-[10px] text-gray-400 font-normal font-mono">{prod.variants?.length || 0} variants</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-gray-700">{prod.soldQty}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-950">৳{prod.revenue.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-mono text-gray-700">৳{prod.cogs.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-mono text-gray-600">৳{prod.averageSellingPrice}</td>
                        <td className="py-3 px-3 text-right font-mono text-gray-600">৳{prod.averageCost}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 bg-amber-50/50">৳{profitPerUnit}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-[#997B21]">৳{prod.grossProfit.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-indigo-900">{prod.grossMarginPercent}%</td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setDrillDownItem(prod)}
                              className="px-2 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-slate-800"
                              title="Formula Calculation Drill-Down"
                            >
                              <Calculator className="w-3 h-3 text-[#D4AF37]" />
                              <span>Formula</span>
                            </button>
                            <button
                              onClick={() => setSelectedProductId(prod.productId)}
                              className="text-[11px] text-[#997B21] font-bold hover:underline"
                            >
                              SKUs →
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

              {/* LEVEL 3: VARIANTS / SKUS */}
              {selectedCategoryId &&
                selectedProductId &&
                (selectedProduct?.variants || [])
                  .filter((v: any) =>
                    v.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    v.variantDetails.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((v: any) => {
                    const profitPerUnit = v.profitPerUnit ?? (v.soldQty > 0 ? Math.round(v.grossProfit / v.soldQty) : 0);

                    return (
                      <tr key={v.sku} className="hover:bg-gray-50/80 transition">
                        <td className="py-3 px-3 text-gray-900">
                          <div className="flex items-center gap-2">
                            {v.image && <img src={v.image} alt={v.sku} className="w-6 h-7 object-cover rounded border" />}
                            <div>
                              <span className="font-mono font-bold text-xs">{v.sku}</span>
                              <p className="text-[10px] text-gray-500">{v.variantDetails}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-gray-700">{v.soldQty}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-950">৳{v.revenue.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-mono text-gray-700">৳{v.cogs.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-mono text-gray-600">৳{v.averageSellingPrice}</td>
                        <td className="py-3 px-3 text-right font-mono text-gray-600">৳{v.unitCost}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 bg-amber-50/50">৳{profitPerUnit}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-[#997B21]">৳{v.grossProfit.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-indigo-900">{v.grossMarginPercent}%</td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => setDrillDownItem(v)}
                            className="px-2 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-slate-800 mx-auto"
                          >
                            <Calculator className="w-3 h-3 text-[#D4AF37]" />
                            <span>Formula</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: PRODUCT PROFIT DRILL-DOWN FORMULA CALCULATION                      */}
      {/* ========================================================================= */}
      {drillDownItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6D23]">
                  Product Profit Drill-Down Breakdown
                </span>
                <h3 className="text-lg font-bold font-serif-luxury text-slate-950 mt-0.5">
                  {drillDownItem.productName || drillDownItem.sku}
                </h3>
              </div>
              <button
                onClick={() => setDrillDownItem(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Structured Mathematical Flow */}
            <div className="space-y-3 font-sans text-xs">
              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-500">Step 1: Sold Quantity</span>
                <p className="text-base font-bold font-mono text-slate-900">
                  {drillDownItem.soldQty || 0} units delivered / completed
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-500">Step 2: Realized Sales Revenue</span>
                <div className="flex justify-between items-center font-mono">
                  <span>{drillDownItem.soldQty || 0} units × ৳{drillDownItem.averageSellingPrice || 0} avg price</span>
                  <span className="font-bold text-emerald-700 text-sm">৳{(drillDownItem.revenue || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-500">Step 3: Actual Capitalized COGS</span>
                <div className="flex justify-between items-center font-mono">
                  <span>{drillDownItem.soldQty || 0} units × ৳{drillDownItem.averageCost || drillDownItem.unitCost || 0} actual cost</span>
                  <span className="font-bold text-red-600 text-sm">৳{(drillDownItem.cogs || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-950 text-white rounded-2xl space-y-2 border border-amber-500/30">
                <span className="text-[10px] uppercase font-bold text-[#D4AF37]">
                  Step 4: Profit per Unit & Total Gross Profit
                </span>
                <div className="flex justify-between items-center font-mono text-xs">
                  <span>Profit per Unit:</span>
                  <span className="font-bold text-amber-300 text-sm">
                    ৳{drillDownItem.profitPerUnit ?? (drillDownItem.averageSellingPrice - (drillDownItem.averageCost || drillDownItem.unitCost || 0))}
                  </span>
                </div>
                <div className="flex justify-between items-center font-mono text-sm pt-2 border-t border-white/10">
                  <span className="font-bold">Total Product Profit:</span>
                  <span className="text-lg font-black text-[#D4AF37]">
                    ৳{(drillDownItem.grossProfit || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center font-mono text-xs text-gray-400">
                  <span>Gross Margin %:</span>
                  <span className="font-bold text-white">{drillDownItem.grossMarginPercent || 0}%</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setDrillDownItem(null)}
              className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs"
            >
              Close Formula Breakdown
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PRINT / PDF EXPORT REPORT                                          */}
      {/* ========================================================================= */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl p-6 sm:p-10 space-y-6 my-8">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <h3 className="text-lg font-bold font-serif-luxury text-slate-950">
                Profit Report Print & PDF Preview
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Print / Save as PDF</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Report Sheet */}
            <div id="printable-profit-report" className="space-y-6 p-6 border border-gray-200 rounded-2xl bg-white font-sans text-xs">
              <div className="flex justify-between items-start pb-4 border-b-2 border-slate-950">
                <div>
                  <h2 className="text-3xl font-extrabold tracking-[0.2em] text-[#0F172A] font-serif-luxury">
                    AVELORA
                  </h2>
                  <p className="text-[9px] tracking-[0.3em] text-[#8C6D23] uppercase font-bold mt-0.5">
                    Executive Two-Level Profitability Statement
                  </p>
                  <p className="text-xs text-gray-500 mt-2 font-mono">
                    Period: {range.toUpperCase()} • Generated: {new Date().toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-gray-100 rounded text-xs font-bold uppercase tracking-wider text-slate-800">
                    AUDITED REALIZED
                  </span>
                  <p className="text-xs text-gray-400 font-mono mt-1">Currency: BDT (৳)</p>
                </div>
              </div>

              {/* Two-Level Profit Highlights */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 font-mono">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase block">Realized Sales</span>
                  <span className="text-base font-bold text-slate-950">৳{(allBiz.revenue || 0).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase block">Product Gross Profit</span>
                  <span className="text-base font-bold text-amber-700">৳{(allBiz.grossProfit || 0).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase block">Operating Expenses</span>
                  <span className="text-base font-bold text-red-600">-৳{(allBiz.operatingExpenses || 0).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase block">Net Business Profit</span>
                  <span className="text-base font-black text-emerald-700">৳{(allBiz.netBusinessProfit || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Category Breakdown Table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-950 text-[10px] uppercase font-bold text-slate-800">
                    <th className="py-2">Category</th>
                    <th className="py-2 text-right">Sold Qty</th>
                    <th className="py-2 text-right">Sales (৳)</th>
                    <th className="py-2 text-right">COGS (৳)</th>
                    <th className="py-2 text-right">Gross Profit (৳)</th>
                    <th className="py-2 text-right">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-mono text-[11px]">
                  {(data?.categories || []).map((cat: any) => (
                    <tr key={cat.categoryId}>
                      <td className="py-2 font-sans font-bold text-slate-900">{cat.categoryName}</td>
                      <td className="py-2 text-right">{cat.soldQty}</td>
                      <td className="py-2 text-right font-bold text-emerald-800">৳{cat.revenue.toLocaleString()}</td>
                      <td className="py-2 text-right text-gray-600">৳{cat.cogs.toLocaleString()}</td>
                      <td className="py-2 text-right font-bold text-amber-700">৳{cat.grossProfit.toLocaleString()}</td>
                      <td className="py-2 text-right font-bold">{cat.grossMarginPercent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
