'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Package,
  Boxes,
  AlertTriangle,
  Clock,
  RotateCcw,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Truck,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { API_BASE_URL, authFetch } from '../../utils/api-config';

export default function AdminExecutiveDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D' | 'ALL'>('7D');
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      const res = await authFetch(`${API_BASE_URL}/api/admin/finance/analytics`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Failed to fetch analytics:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">
          Compiling Financial Cockpit...
        </p>
      </div>
    );
  }

  const s = data?.summary || {};
  const a = data?.actionCenter || {};
  const daily = data?.dailySales || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Range Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-serif-luxury tracking-tight">
              Executive Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D4AF37]/20 text-[#8C6D23] border border-[#D4AF37]/40 uppercase">
              Authoritative
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time management accounting, realized revenue, fulfillment health, and action center.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs font-semibold">
            {(['7D', '30D', '90D', 'ALL'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg transition ${
                  timeRange === range
                    ? 'bg-slate-900 text-white shadow-sm font-bold'
                    : 'text-gray-600 hover:text-slate-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={fetchAnalytics}
            disabled={refreshing}
            className="p-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-gray-700 transition shadow-sm"
            title="Refresh analytics"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#D4AF37]' : ''}`} />
          </button>
        </div>
      </div>

      {/* ACTION REQUIRED COCKPIT (Interactive Operational Callouts) */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-slate-900/5 border border-amber-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Action Required Center
            </h2>
          </div>
          <span className="text-xs text-amber-800 font-medium">
            Pending items requiring immediate admin intervention
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/admin/orders?status=PENDING"
            className="p-3 bg-white rounded-xl border border-amber-200/80 hover:border-amber-400 transition hover:shadow-sm group"
          >
            <p className="text-[11px] font-semibold text-gray-500">Unconfirmed Orders</p>
            <p className="text-xl font-bold text-amber-700 mt-1">{a.unconfirmedOrders || 0}</p>
            <span className="text-[10px] text-amber-600 font-medium flex items-center gap-0.5 mt-1 group-hover:underline">
              Confirm order →
            </span>
          </Link>

          <Link
            href="/admin/orders"
            className="p-3 bg-white rounded-xl border border-red-200/80 hover:border-red-400 transition hover:shadow-sm group"
          >
            <p className="text-[11px] font-semibold text-gray-500">Stale Processing (&gt;12h)</p>
            <p className="text-xl font-bold text-red-700 mt-1">{a.staleOrders || 0}</p>
            <span className="text-[10px] text-red-600 font-medium flex items-center gap-0.5 mt-1 group-hover:underline">
              Review queue →
            </span>
          </Link>

          <Link
            href="/admin/inventory"
            className="p-3 bg-white rounded-xl border border-rose-200/80 hover:border-rose-400 transition hover:shadow-sm group"
          >
            <p className="text-[11px] font-semibold text-gray-500">Out-of-Stock SKUs</p>
            <p className="text-xl font-bold text-rose-700 mt-1">{a.outOfStockVariants || 0}</p>
            <span className="text-[10px] text-rose-600 font-medium flex items-center gap-0.5 mt-1 group-hover:underline">
              Create PO →
            </span>
          </Link>

          <Link
            href="/admin/inventory"
            className="p-3 bg-white rounded-xl border border-yellow-200/80 hover:border-yellow-400 transition hover:shadow-sm group"
          >
            <p className="text-[11px] font-semibold text-gray-500">Low Stock SKUs</p>
            <p className="text-xl font-bold text-yellow-700 mt-1">{a.lowStockVariants || 0}</p>
            <span className="text-[10px] text-yellow-600 font-medium flex items-center gap-0.5 mt-1 group-hover:underline">
              Check stock →
            </span>
          </Link>

          <Link
            href="/admin/returns"
            className="p-3 bg-white rounded-xl border border-purple-200/80 hover:border-purple-400 transition hover:shadow-sm group"
          >
            <p className="text-[11px] font-semibold text-gray-500">Return Requests</p>
            <p className="text-xl font-bold text-purple-700 mt-1">{a.returnRequestsPending || 0}</p>
            <span className="text-[10px] text-purple-600 font-medium flex items-center gap-0.5 mt-1 group-hover:underline">
              Inspect returns →
            </span>
          </Link>

          <Link
            href="/admin/finance/reconciliation"
            className="p-3 bg-white rounded-xl border border-blue-200/80 hover:border-blue-400 transition hover:shadow-sm group"
          >
            <p className="text-[11px] font-semibold text-gray-500">Pending COD Due</p>
            <p className="text-xl font-bold text-blue-700 mt-1">৳{(a.codSettlementPendingAmount || 0).toLocaleString()}</p>
            <span className="text-[10px] text-blue-600 font-medium flex items-center gap-0.5 mt-1 group-hover:underline">
              Reconcile →
            </span>
          </Link>
        </div>
      </div>

      {/* PRIMARY 5 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Realized Net Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
            <span>Realized Revenue</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-950 mt-2 font-mono">
            ৳{(s.realizedRevenue || 0).toLocaleString()}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 mt-2 font-medium">
            <ArrowUpRight className="w-3 h-3" />
            <span>{s.deliveredOrdersCount || 0} delivered orders</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Pipeline: ৳{(s.pipelineRevenue || 0).toLocaleString()}</p>
        </div>

        {/* Card 2: Gross Profit */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
            <span>Gross Profit</span>
            <span className="p-1.5 bg-[#D4AF37]/10 text-[#8C6D23] rounded-lg">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-950 mt-2 font-mono">
            ৳{(s.grossProfit || 0).toLocaleString()}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 mt-2 font-medium">
            <span>Margin: {s.grossProfitMargin || 0}%</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">COGS: ৳{(s.deliveredCostOfGoods || 0).toLocaleString()}</p>
        </div>

        {/* Card 3: Authentic Net Profit */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
            <span>Authentic Net Profit</span>
            <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
              <DollarSign className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className={`text-2xl font-black mt-2 font-mono ${s.netProfit >= 0 ? 'text-slate-950' : 'text-red-600'}`}>
            ৳{(s.netProfit || 0).toLocaleString()}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-indigo-700 mt-2 font-medium">
            <span>Net Margin: {s.netProfitMargin || 0}%</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">OPEX: ৳{(s.totalOperatingExpenses || 0).toLocaleString()}</p>
        </div>

        {/* Card 4: Orders Queue & Volume */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
            <span>Orders Volume</span>
            <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
              <Package className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-950 mt-2 font-mono">
            {s.totalOrders || 0}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-blue-700 mt-2 font-medium">
            <span>{s.pipelineOrdersCount || 0} in active queue</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">AOV: ৳{(s.averageOrderValue || 0).toLocaleString()}</p>
        </div>

        {/* Card 5: Cash vs COD Receivable */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
            <span>Cash vs Courier COD</span>
            <span className="p-1.5 bg-teal-50 text-teal-700 rounded-lg">
              <Truck className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-xl font-black text-slate-950 mt-2 font-mono">
            ৳{(s.cashCollected || 0).toLocaleString()}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-amber-700 mt-2 font-medium">
            <span>COD Due: ৳{(s.codReceivable || 0).toLocaleString()}</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Return rate: {s.returnRate || 0}%</p>
        </div>
      </div>

      {/* CHARTS & RECENT TRAJECTORY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 7-Day Performance Bar Trajectory */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">7-Day Financial Performance</h3>
              <p className="text-xs text-gray-500">Daily sales revenue and gross profit contribution</p>
            </div>
            <Link
              href="/admin/finance/pnl"
              className="text-xs font-bold text-[#8C6D23] hover:text-[#D4AF37] flex items-center gap-1"
            >
              Detailed P&L Statement →
            </Link>
          </div>

          <div className="h-64 flex items-end gap-3 pt-6 pb-2 px-2">
            {daily.map((d: any) => {
              const maxSales = Math.max(...daily.map((x: any) => x.sales || 1), 1000);
              const heightPercent = Math.max(8, Math.min(100, ((d.sales || 0) / maxSales) * 100));
              const gpPercent = Math.max(4, Math.min(100, ((d.grossProfit || 0) / maxSales) * 100));

              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition absolute -top-12 bg-slate-900 text-white text-[10px] px-2.5 py-1.5 rounded shadow-lg pointer-events-none z-10 whitespace-nowrap">
                    <p className="font-bold">৳{d.sales.toLocaleString()} Sales</p>
                    <p className="text-emerald-400">৳{d.grossProfit.toLocaleString()} GP ({d.orders} orders)</p>
                  </div>

                  <div className="w-full h-48 flex items-end justify-center gap-1">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[20px] bg-slate-900 rounded-t-md transition-all group-hover:bg-[#D4AF37]"
                    ></div>
                    <div
                      style={{ height: `${gpPercent}%` }}
                      className="w-full max-w-[12px] bg-emerald-500 rounded-t-md transition-all"
                    ></div>
                  </div>

                  <span className="text-[10px] text-gray-500 font-mono">
                    {d.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-slate-900 rounded"></span>
              <span>Daily Placed Sales</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded"></span>
              <span>Estimated Gross Profit</span>
            </div>
          </div>
        </div>

        {/* Right: Inventory Capital Valuation & Health */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Inventory Valuation</h3>
                <p className="text-xs text-gray-500">Asset investment & physical stock</p>
              </div>
              <Link
                href="/admin/inventory"
                className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-600"
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 font-medium">Stock Investment at Cost</p>
                <p className="text-2xl font-black text-slate-950 font-mono mt-1">
                  ৳{(s.inventoryValueAtCost || 0).toLocaleString()}
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Potential Retail: ৳{(s.inventoryPotentialRetail || 0).toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[11px] text-gray-500">Total Units on Hand</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{s.totalStockUnits || 0} pcs</p>
                </div>

                <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-[11px] text-red-600 font-medium">Stockouts / Depleted</p>
                  <p className="text-lg font-bold text-red-700 mt-0.5">{s.outOfStockCount || 0} SKUs</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 mt-4 flex gap-2">
            <Link
              href="/admin/purchases"
              className="flex-1 text-center py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              + Create Purchase Order
            </Link>
            <Link
              href="/admin/finance/capital"
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-slate-800 rounded-xl text-xs font-bold transition"
            >
              Capital & Assets
            </Link>
          </div>
        </div>
      </div>

      {/* QUICK WORKSPACE LAUNCHERS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/admin/orders"
          className="p-4 bg-white rounded-2xl border border-gray-200 hover:border-[#D4AF37] transition shadow-sm flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 group-hover:bg-[#D4AF37] group-hover:text-slate-950 transition">
              <Package className="w-5 h-5 text-slate-800 group-hover:text-slate-950" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Orders Workspace</p>
              <p className="text-[10px] text-gray-500">Pathao dispatch & invoices</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#D4AF37] transition" />
        </Link>

        <Link
          href="/admin/purchases"
          className="p-4 bg-white rounded-2xl border border-gray-200 hover:border-[#D4AF37] transition shadow-sm flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 group-hover:bg-[#D4AF37] group-hover:text-slate-950 transition">
              <Truck className="w-5 h-5 text-slate-800 group-hover:text-slate-950" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Purchases & GRN</p>
              <p className="text-[10px] text-gray-500">Suppliers & stock receipts</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#D4AF37] transition" />
        </Link>

        <Link
          href="/admin/finance/pnl"
          className="p-4 bg-white rounded-2xl border border-gray-200 hover:border-[#D4AF37] transition shadow-sm flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 group-hover:bg-[#D4AF37] group-hover:text-slate-950 transition">
              <FileSpreadsheet className="w-5 h-5 text-slate-800 group-hover:text-slate-950" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Statement of P&L</p>
              <p className="text-[10px] text-gray-500">Gross profit & overhead</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#D4AF37] transition" />
        </Link>

        <Link
          href="/admin/finance/reconciliation"
          className="p-4 bg-white rounded-2xl border border-gray-200 hover:border-[#D4AF37] transition shadow-sm flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 group-hover:bg-[#D4AF37] group-hover:text-slate-950 transition">
              <DollarSign className="w-5 h-5 text-slate-800 group-hover:text-slate-950" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">COD Reconciliation</p>
              <p className="text-[10px] text-gray-500">Courier remittance checks</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#D4AF37] transition" />
        </Link>
      </div>
    </div>
  );
}
