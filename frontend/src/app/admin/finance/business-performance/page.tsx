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
          Compiling Multi-Category Financial Intelligence...
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-1">
            <Link href="/admin" className="hover:text-[#C5A059] transition">
              Admin
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <Link href="/admin/finance/pnl" className="hover:text-[#C5A059] transition">
              Finance
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-900 font-bold">Business Performance</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold font-serif-luxury text-gray-900">
              AVELORA Business Performance
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
              Executive View
            </span>
          </div>
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
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-[#C5A059] text-white text-xs font-bold uppercase tracking-wider transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DATE FILTER CONTROLS & DRILL-DOWN BREADCRUMB                           */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/90 shadow-2xs">
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
              { id: 'all', label: 'ALL Time' },
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
          <span className="font-bold text-gray-400 text-[10px] uppercase tracking-wider">Viewing:</span>
          <button
            onClick={() => {
              setSelectedCategoryId(null);
              setSelectedProductId(null);
            }}
            className={`font-semibold transition ${
              !selectedCategoryId ? 'text-slate-950 underline font-bold' : 'text-gray-500 hover:text-slate-900'
            }`}
          >
            All Business
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
      {/* 3. OWNER EXECUTIVE SUMMARY TOP BAR (BUSINESS AT A GLANCE)                 */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-[#1e1a12] text-white p-5 sm:p-6 rounded-3xl border border-amber-500/20 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#D4AF37]">
              Business At A Glance
            </h2>
          </div>
          {/* Reconciliation Guarantee Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Business = Σ Categories = Σ Products (Reconciled)</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 text-center sm:text-left">
          <div className="space-y-0.5 border-r border-white/10 pr-2">
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider block">Investment</span>
            <p className="text-sm sm:text-base font-bold font-mono text-white">৳{(allBiz.purchaseInvestment || 0).toLocaleString()}</p>
          </div>
          <div className="space-y-0.5 border-r border-white/10 pr-2">
            <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider block">Stock Asset</span>
            <p className="text-sm sm:text-base font-bold font-mono text-emerald-300">৳{(allBiz.inventoryValue || 0).toLocaleString()}</p>
          </div>
          <div className="space-y-0.5 border-r border-white/10 pr-2">
            <span className="text-[10px] text-[#D4AF37] font-medium uppercase tracking-wider block">Revenue</span>
            <p className="text-sm sm:text-base font-bold font-mono text-[#F7E7CE]">৳{(allBiz.revenue || 0).toLocaleString()}</p>
          </div>
          <div className="space-y-0.5 border-r border-white/10 pr-2">
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider block">COGS (Sold Cost)</span>
            <p className="text-sm sm:text-base font-bold font-mono text-gray-300">৳{(allBiz.cogs || 0).toLocaleString()}</p>
          </div>
          <div className="space-y-0.5 border-r border-white/10 pr-2">
            <span className="text-[10px] text-amber-300 font-medium uppercase tracking-wider block">Gross Profit</span>
            <p className="text-sm sm:text-base font-bold font-mono text-amber-200">৳{(allBiz.grossProfit || 0).toLocaleString()}</p>
          </div>
          <div className="space-y-0.5 border-r border-white/10 pr-2">
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider block">Gross Margin</span>
            <p className="text-sm sm:text-base font-bold font-mono text-white">{allBiz.grossMarginPercent || 0}%</p>
          </div>
          <div className="space-y-0.5 border-r border-white/10 pr-2">
            <span className="text-[10px] text-blue-400 font-medium uppercase tracking-wider block">COD Receivable</span>
            <p className="text-sm sm:text-base font-bold font-mono text-blue-300">৳{(capital.courierCodReceivable || 0).toLocaleString()}</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider block">Available Stock</span>
            <p className="text-sm sm:text-base font-bold font-mono text-white">{(allBiz.availableStock || 0).toLocaleString()} pcs</p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. EXECUTIVE 3-ROW KPI CARDS                                              */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {/* ROW 1: CAPITAL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-gray-500 text-xs">
              <span className="font-bold uppercase tracking-wider">Total Purchase Investment</span>
              <Landmark className="w-4 h-4 text-slate-700" />
            </div>
            <p className="text-xl sm:text-2xl font-bold font-mono text-gray-900">
              ৳{(allBiz.purchaseInvestment || 0).toLocaleString()}
            </p>
            <p className="text-[11px] text-gray-500">Total acquisition cost of inventory received</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-gray-500 text-xs">
              <span className="font-bold uppercase tracking-wider">Current Inventory Value</span>
              <Boxes className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-900">
              ৳{(allBiz.inventoryValue || 0).toLocaleString()}
            </p>
            <p className="text-[11px] text-gray-500">Physical stock × weighted-average acquisition cost</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-gray-500 text-xs">
              <span className="font-bold uppercase tracking-wider">Inventory Sold at Cost (COGS)</span>
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
              ৳{(allBiz.cogs || 0).toLocaleString()}
            </p>
            <p className="text-[11px] text-gray-500">Acquisition cost recognized for sold merchandise</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-gray-500 text-xs">
              <span className="font-bold uppercase tracking-wider">Capital Recovery %</span>
              <TrendingUp className="w-4 h-4 text-[#C5A059]" />
            </div>
            <p className="text-xl sm:text-2xl font-bold font-mono text-[#997B21]">
              {allBiz.capitalRecoveryPercent || 0}%
            </p>
            <p className="text-[11px] text-gray-500">COGS / Total Purchase Investment × 100</p>
          </div>
        </div>

        {/* ROW 2: SALES & PROFIT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-gray-500 text-xs">
              <span className="font-bold uppercase tracking-wider">Recognized Sales Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-950">
              ৳{(allBiz.revenue || 0).toLocaleString()}
            </p>
            <p className="text-[11px] text-gray-500">Delivered orders realized merchandise value</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-gray-500 text-xs">
              <span className="font-bold uppercase tracking-wider">Recognized COGS</span>
              <Scale className="w-4 h-4 text-slate-700" />
            </div>
            <p className="text-xl sm:text-2xl font-bold font-mono text-gray-800">
              ৳{(allBiz.cogs || 0).toLocaleString()}
            </p>
            <p className="text-[11px] text-gray-500">Sale-time cost snapshot calculation</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-gray-500 text-xs">
              <span className="font-bold uppercase tracking-wider">Gross Profit</span>
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <p className="text-xl sm:text-2xl font-bold font-mono text-[#997B21]">
              ৳{(allBiz.grossProfit || 0).toLocaleString()}
            </p>
            <p className="text-[11px] text-gray-500">Revenue − Recognized COGS</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-gray-500 text-xs">
              <span className="font-bold uppercase tracking-wider">Gross Margin %</span>
              <PieChart className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-xl sm:text-2xl font-bold font-mono text-indigo-950">
              {allBiz.grossMarginPercent || 0}%
            </p>
            <p className="text-[11px] text-gray-500">Gross Profit / Revenue × 100</p>
          </div>
        </div>

        {/* ROW 3: INVENTORY SNAPSHOT */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200/90 shadow-2xs space-y-1">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Physical Stock</span>
            <p className="text-lg font-bold font-mono text-gray-900">{allBiz.physicalStock || 0}</p>
            <span className="text-[10px] text-gray-400">Total units on hand</span>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200/90 shadow-2xs space-y-1">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Reserved Stock</span>
            <p className="text-lg font-bold font-mono text-amber-700">{allBiz.reservedStock || 0}</p>
            <span className="text-[10px] text-gray-400">Locked in pipeline orders</span>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200/90 shadow-2xs space-y-1">
            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">Available to Sell</span>
            <p className="text-lg font-bold font-mono text-emerald-800">{allBiz.availableStock || 0}</p>
            <span className="text-[10px] text-gray-400">Physical − Reserved</span>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200/90 shadow-2xs space-y-1">
            <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block">Sold Units</span>
            <p className="text-lg font-bold font-mono text-blue-900">{allBiz.soldQty || 0}</p>
            <span className="text-[10px] text-gray-400">Delivered during period</span>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200/90 shadow-2xs space-y-1">
            <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider block">Returned Qty</span>
            <p className="text-lg font-bold font-mono text-purple-900">{allBiz.returnQty || 0}</p>
            <span className="text-[10px] text-gray-400">Processed return requests</span>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200/90 shadow-2xs space-y-1">
            <span className="text-[10px] text-red-600 font-bold uppercase tracking-wider block">Damaged Loss</span>
            <p className="text-lg font-bold font-mono text-red-900">৳{(allBiz.damageLoss || 0).toLocaleString()}</p>
            <span className="text-[10px] text-gray-400">{allBiz.damageQty || 0} pcs damaged</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. WHERE IS MY MONEY? (WORKING CAPITAL ALLOCATION)                        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#997B21]" />
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide">
                Where Is My Money? (Working Capital Allocation)
              </h3>
            </div>
            <span className="text-xs text-gray-500 font-medium">Reconciled Balances</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">1. Inventory Asset</span>
              <p className="text-base font-bold font-mono text-slate-950">৳{(capital.currentInventoryAsset || 0).toLocaleString()}</p>
              <p className="text-[10px] text-gray-500">Physical stock at cost</p>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-1">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">2. Courier COD Due</span>
              <p className="text-base font-bold font-mono text-blue-950">৳{(capital.courierCodReceivable || 0).toLocaleString()}</p>
              <p className="text-[10px] text-blue-600">Delivered awaiting remittance</p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">3. Settled Cash & Bank</span>
              <p className="text-base font-bold font-mono text-emerald-950">৳{(capital.settledCashAndBank || 0).toLocaleString()}</p>
              <p className="text-[10px] text-emerald-600">Net cash in hand & bank</p>
            </div>
          </div>

          <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/80 flex items-center justify-between text-xs flex-wrap gap-2">
            <span className="text-amber-950 font-semibold">
              Total Active Working Capital (Asset + Receivable + Cash):
            </span>
            <span className="font-mono font-bold text-base text-amber-950">
              ৳{(capital.totalWorkingCapital || 0).toLocaleString()}
            </span>
          </div>

          <div className="text-[11px] text-gray-500 flex items-start gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
            <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Inventory Cost Recovered Through Sales:</strong> ৳{(capital.inventoryCostRecoveredThroughSales || 0).toLocaleString()} represents inventory value already converted into sales and recovered.
            </span>
          </div>
        </div>

        {/* Category Profitability Comparison Chart */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#997B21]" />
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide">
                Category Comparison
              </h3>
            </div>
            {/* Metric Switchers */}
            <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-[10px] font-bold">
              {(['revenue', 'grossProfit', 'inventoryValue'] as ChartMetric[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setChartMetric(m)}
                  className={`px-2 py-1 rounded-md transition ${
                    chartMetric === m ? 'bg-white text-slate-950 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {m === 'revenue' ? 'Revenue' : m === 'grossProfit' ? 'Profit' : 'Stock Value'}
                </button>
              ))}
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {(data?.categoryChartData || []).map((cat: any) => {
              const maxVal = Math.max(
                1,
                ...(data?.categoryChartData || []).map((c: any) => c[chartMetric] || 0)
              );
              const val = cat[chartMetric] || 0;
              const pct = Math.min(100, Math.round((val / maxVal) * 100));

              return (
                <div key={cat.categoryId} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-gray-800">{cat.categoryName}</span>
                    <span className="font-mono font-bold text-gray-900">৳{val.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        chartMetric === 'revenue'
                          ? 'bg-emerald-600'
                          : chartMetric === 'grossProfit'
                          ? 'bg-[#C5A059]'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. EXECUTIVE INSIGHTS GRID                                                */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Top Revenue Category</span>
          <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
            {insights.topRevenueCategory?.name || 'N/A'}
          </p>
          <span className="text-[11px] font-mono font-bold text-emerald-800">
            ৳{(insights.topRevenueCategory?.revenue || 0).toLocaleString()}
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Most Profitable Category</span>
          <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
            {insights.mostProfitableCategory?.name || 'N/A'}
          </p>
          <span className="text-[11px] font-mono font-bold text-[#997B21]">
            ৳{(insights.mostProfitableCategory?.grossProfit || 0).toLocaleString()}
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Highest Margin</span>
          <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
            {insights.highestMarginCategory?.name || 'N/A'}
          </p>
          <span className="text-[11px] font-mono font-bold text-indigo-700">
            {insights.highestMarginCategory?.margin || 0}%
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Most Capital in Stock</span>
          <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
            {insights.mostCapitalInStockCategory?.name || 'N/A'}
          </p>
          <span className="text-[11px] font-mono font-bold text-slate-900">
            ৳{(insights.mostCapitalInStockCategory?.inventoryValue || 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. HIERARCHICAL DRILL-DOWN PERFORMANCE TABLE                              */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden space-y-4 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900 uppercase tracking-wide">
              {!selectedCategoryId
                ? 'Category Performance (ক্যাটেগরি পারফরম্যান্স)'
                : !selectedProductId
                ? `${selectedCategory?.categoryName} — Product Performance`
                : `${selectedProduct?.productName} — Variant / SKU Accounting`}
            </h3>
            <p className="text-xs text-gray-500">
              {!selectedCategoryId
                ? 'Click on any category row to drill down to its products'
                : !selectedProductId
                ? 'Click on any product row to drill down to its variants and SKUs'
                : 'Independent SKU-level accounting with historical cost snapshots'}
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
                <th className="py-3 px-3 text-right">Purchased Qty</th>
                <th className="py-3 px-3 text-right">Investment</th>
                <th className="py-3 px-3 text-right">Sold Qty</th>
                <th className="py-3 px-3 text-right">Revenue</th>
                <th className="py-3 px-3 text-right">COGS</th>
                <th className="py-3 px-3 text-right">Gross Profit</th>
                <th className="py-3 px-3 text-right">Margin %</th>
                <th className="py-3 px-3 text-right">Physical Stock</th>
                <th className="py-3 px-3 text-right">Available</th>
                <th className="py-3 px-3 text-right">Stock Value</th>
                <th className="py-3 px-3 text-right">Returns</th>
                <th className="py-3 px-3 text-right">Damage</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* LEVEL 1: CATEGORIES */}
              {!selectedCategoryId &&
                (data?.categories || [])
                  .filter((c: any) =>
                    c.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((cat: any) => (
                    <tr
                      key={cat.categoryId}
                      onClick={() => setSelectedCategoryId(cat.categoryId)}
                      className="hover:bg-amber-50/40 cursor-pointer transition group"
                    >
                      <td className="py-3 px-3 font-bold text-gray-900 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#997B21]" />
                        <span>{cat.categoryName}</span>
                        <span className="text-[10px] text-gray-400 font-normal">({cat.productCount} products)</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-gray-700">{cat.purchasedQty}</td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-gray-900">৳{cat.purchaseInvestment.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-mono text-gray-700">{cat.soldQty}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-950">৳{cat.revenue.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-mono text-gray-700">৳{cat.cogs.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-[#997B21]">৳{cat.grossProfit.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-indigo-900">{cat.grossMarginPercent}%</td>
                      <td className="py-3 px-3 text-right font-mono text-gray-900">{cat.physicalStock}</td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-800 font-bold">{cat.availableStock}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">৳{cat.inventoryValue.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-mono text-purple-700">{cat.returnQty}</td>
                      <td className="py-3 px-3 text-right font-mono text-red-700">{cat.damageQty}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#997B21] font-bold group-hover:underline">
                          <span>Drill down</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </td>
                    </tr>
                  ))}

              {/* LEVEL 2: PRODUCTS */}
              {selectedCategoryId &&
                !selectedProductId &&
                (selectedCategory?.products || [])
                  .filter((p: any) =>
                    p.productName.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((prod: any) => (
                    <tr
                      key={prod.productId}
                      onClick={() => setSelectedProductId(prod.productId)}
                      className="hover:bg-amber-50/40 cursor-pointer transition group"
                    >
                      <td className="py-3 px-3 font-bold text-gray-900 flex items-center gap-2">
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
                      <td className="py-3 px-3 text-right font-mono text-gray-700">{prod.purchasedQty}</td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-gray-900">৳{prod.purchaseInvestment.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-mono text-gray-700">{prod.soldQty}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-950">৳{prod.revenue.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-mono text-gray-700">৳{prod.cogs.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-[#997B21]">৳{prod.grossProfit.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-indigo-900">{prod.grossMarginPercent}%</td>
                      <td className="py-3 px-3 text-right font-mono text-gray-900">{prod.physicalStock}</td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-800 font-bold">{prod.availableStock}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">৳{prod.inventoryValue.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-mono text-purple-700">{prod.returnQty}</td>
                      <td className="py-3 px-3 text-right font-mono text-red-700">{prod.damageQty}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#997B21] font-bold group-hover:underline">
                          <span>View SKUs</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </td>
                    </tr>
                  ))}

              {/* LEVEL 3: VARIANTS / SKUS */}
              {selectedCategoryId &&
                selectedProductId &&
                (selectedProduct?.variants || [])
                  .filter((v: any) =>
                    v.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    v.variantDetails.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((v: any) => (
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
                      <td className="py-3 px-3 text-right font-mono text-gray-700">{v.purchasedQty}</td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-gray-900">৳{v.purchaseInvestment.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-mono text-gray-700">{v.soldQty}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-950">৳{v.revenue.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-mono text-gray-700">৳{v.cogs.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-[#997B21]">৳{v.grossProfit.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-indigo-900">{v.grossMarginPercent}%</td>
                      <td className="py-3 px-3 text-right font-mono text-gray-900">{v.physicalStock}</td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-800 font-bold">{v.availableStock}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">৳{v.inventoryValue.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right font-mono text-purple-700">{v.returnQty}</td>
                      <td className="py-3 px-3 text-right font-mono text-red-700">{v.damageQty}</td>
                      <td className="py-3 px-3 text-right font-mono text-[10px] text-gray-400">
                        {v.daysSinceLastSale < 999 ? `${v.daysSinceLastSale}d ago` : 'No sales'}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 8. SLOW MOVING / CAPITAL LOCKED IN INVENTORY                              */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide">
              Capital Locked In Slow-Moving Inventory (ধীরগতির পণ্য)
            </h3>
          </div>
          <span className="text-[11px] text-gray-500 font-medium">Zero / Low Sales in Period</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3 text-right">Physical Stock</th>
                <th className="py-2.5 px-3 text-right">Unit Cost</th>
                <th className="py-2.5 px-3 text-right">Locked Capital</th>
                <th className="py-2.5 px-3 text-right">Days Inactive</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(data?.slowMovingStock || []).map((item: any) => (
                <tr key={item.sku} className="hover:bg-amber-50/30">
                  <td className="py-2.5 px-3 font-semibold text-gray-900 truncate max-w-[200px]">{item.productName}</td>
                  <td className="py-2.5 px-3 text-gray-500">{item.categoryName}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-gray-800">{item.sku}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900">{item.physicalStock}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-gray-600">৳{item.unitCost}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-900">৳{item.inventoryValue.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-gray-500">
                    {item.daysSinceLastSale < 999 ? `${item.daysSinceLastSale} days` : 'No sales yet'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
