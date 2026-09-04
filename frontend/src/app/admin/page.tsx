'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
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
  QrCode,
  Tag,
  ShoppingBag,
  Layers,
  Users,
  CreditCard,
  Percent,
  Download,
} from 'lucide-react';
import { API_BASE_URL, authFetch } from '../../utils/api-config';

// Mini Sparkline SVG Generator
function Sparkline({ isPositive = true, color = '#10B981' }: { isPositive?: boolean; color?: string }) {
  const points = isPositive
    ? '0,18 8,14 16,16 24,10 32,12 40,6 48,2'
    : '0,4 8,8 16,6 24,12 32,10 40,16 48,20';

  return (
    <svg className="w-12 h-5 overflow-visible" viewBox="0 0 48 24" fill="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Circular Donut Ring for Financial Net Profit Margin
function MarginDonutRing({ percentage = 0 }: { percentage: number }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const validPct = Math.max(0, Math.min(100, percentage));
  const strokeDashoffset = circumference - (validPct / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r={radius}
            className="stroke-gray-100"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            className="stroke-emerald-500 transition-all duration-1000 ease-out"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <span className="absolute text-xs font-bold text-slate-900 font-mono">
          {percentage.toFixed(1)}%
        </span>
      </div>
      <span className="text-[10px] text-gray-500 font-semibold mt-1">Net Profit Margin</span>
    </div>
  );
}

// Donut Chart for Order Status
function OrderStatusDonut({
  delivered = 0,
  inTransit = 0,
  processing = 0,
  pending = 0,
  cancelled = 0,
  total = 0,
}: {
  delivered: number;
  inTransit: number;
  processing: number;
  pending: number;
  cancelled: number;
  total: number;
}) {
  const safeTotal = total > 0 ? total : 1;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  // Segments definition
  const segments = [
    { key: 'Delivered', count: delivered, color: '#10B981', dotClass: 'bg-emerald-500' },
    { key: 'In Transit', count: inTransit, color: '#3B82F6', dotClass: 'bg-blue-500' },
    { key: 'Processing', count: processing, color: '#F59E0B', dotClass: 'bg-amber-500' },
    { key: 'Pending', count: pending, color: '#8B5CF6', dotClass: 'bg-purple-500' },
    { key: 'Cancelled', count: cancelled, color: '#EF4444', dotClass: 'bg-rose-500' },
  ];

  let accumulatedPct = 0;
  const renderedArcs = segments.map((seg) => {
    const pct = seg.count / safeTotal;
    const strokeDasharray = `${pct * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPct * circumference;
    accumulatedPct += pct;
    return { ...seg, pct, strokeDasharray, strokeDashoffset };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
      {/* SVG Ring */}
      <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="stroke-gray-100"
            strokeWidth="14"
            fill="transparent"
          />
          {total > 0 &&
            renderedArcs.map((arc) => (
              <circle
                key={arc.key}
                cx="50"
                cy="50"
                r={radius}
                stroke={arc.color}
                strokeWidth="14"
                strokeDasharray={arc.strokeDasharray}
                strokeDashoffset={arc.strokeDashoffset}
                fill="transparent"
                className="transition-all duration-700"
              />
            ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-extrabold text-slate-900 font-mono">{total}</span>
          <span className="text-[9px] text-gray-400 font-semibold uppercase">Orders</span>
        </div>
      </div>

      {/* Legend List */}
      <div className="flex-1 space-y-1.5 w-full text-xs">
        {segments.map((seg) => {
          const percentage = total > 0 ? Math.round((seg.count / total) * 100) : 0;
          return (
            <div key={seg.key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${seg.dotClass}`}></span>
                <span className="text-gray-600 font-medium">{seg.key}</span>
              </div>
              <span className="font-semibold text-slate-900 font-mono">
                {seg.count} <span className="text-gray-400 font-normal">({percentage}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminExecutiveDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D' | 'ALL'>('7D');
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchDashboard = async (range = timeRange) => {
    try {
      setRefreshing(true);
      setFetchError(null);
      const res = await authFetch(`${API_BASE_URL}/api/admin/dashboard?range=${range}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        // Fallback to finance analytics if dashboard endpoint unavailable
        const altRes = await authFetch(`${API_BASE_URL}/api/admin/finance/analytics`);
        if (altRes.ok) {
          const altJson = await altRes.json();
          setData({
            executiveSummary: {
              totalRevenue: altJson.summary?.realizedRevenue || 0,
              totalOrders: altJson.summary?.totalOrders || 0,
              grossProfit: altJson.summary?.grossProfit || 0,
              netProfit: altJson.summary?.netProfit || 0,
              codReceivable: altJson.summary?.codReceivable || 0,
              lowStockItems: altJson.summary?.lowStockCount || 0,
              trends: {
                revenue: '0%',
                revenuePositive: true,
                orders: '0%',
                ordersPositive: true,
                grossProfit: '0%',
                grossProfitPositive: true,
                netProfit: '0%',
                netProfitPositive: true,
                codReceivable: '0%',
                codReceivablePositive: true,
              },
            },
            actionRequired: altJson.actionCenter || {},
            salesOverview: {
              daily: altJson.dailySales || [],
              timeRange: range,
            },
            orderStatus: {
              delivered: { count: altJson.summary?.deliveredOrdersCount || 0, percentage: 0 },
              inTransit: { count: 0, percentage: 0 },
              processing: { count: altJson.summary?.pipelineOrdersCount || 0, percentage: 0 },
              pending: { count: altJson.actionCenter?.unconfirmedOrders || 0, percentage: 0 },
              cancelled: { count: altJson.summary?.cancelledOrdersCount || 0, percentage: 0 },
              totalCount: altJson.summary?.totalOrders || 0,
            },
            recentOrders: [],
            topProducts: [],
            courierSummary: [],
            inventorySummary: {
              totalProducts: 0,
              totalVariants: 0,
              totalStock: altJson.summary?.totalStockUnits || 0,
              lowStock: altJson.summary?.lowStockCount || 0,
              outOfStock: altJson.summary?.outOfStockCount || 0,
              reservedStock: 0,
            },
            financialOverview: {
              totalRevenue: altJson.summary?.realizedRevenue || 0,
              totalCogs: altJson.summary?.deliveredCostOfGoods || 0,
              grossProfit: altJson.summary?.grossProfit || 0,
              totalExpenses: altJson.summary?.totalOperatingExpenses || 0,
              netProfit: altJson.summary?.netProfit || -25000,
              netProfitMargin: Number(altJson.summary?.netProfitMargin || 0),
            },
            recentAuditLogs: [],
          });
        } else {
          setFetchError('Failed to synchronize dashboard metrics with server.');
        }
      }
    } catch (e: any) {
      console.error('Failed to fetch dashboard:', e);
      setFetchError(e.message || 'Network connection issue');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard(timeRange);
  }, [timeRange]);

  // Loading Skeleton View
  if (loading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse">
        <div className="h-12 bg-gray-200 rounded-xl w-1/3"></div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <div className="xl:col-span-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="xl:col-span-4 h-28 bg-gray-200 rounded-xl"></div>
        </div>
        <div className="h-24 bg-gray-200 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-72 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  // Error State View with Retry
  if (fetchError && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />
        <h3 className="text-lg font-bold text-slate-900">Dashboard Metrics Unavailable</h3>
        <p className="text-sm text-gray-500 max-w-md mt-1 mb-4">{fetchError}</p>
        <button
          onClick={() => fetchDashboard(timeRange)}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm transition"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>
      </div>
    );
  }

  const es = data?.executiveSummary || {};
  const trends = es?.trends || {};
  const ar = data?.actionRequired || {};
  const so = data?.salesOverview || {};
  const daily = so?.daily || [];
  const os = data?.orderStatus || {};
  const ro = data?.recentOrders || [];
  const tp = data?.topProducts || [];
  const cs = data?.courierSummary || [];
  const inv = data?.inventorySummary || {};
  const fin = data?.financialOverview || {};
  const logs = data?.recentAuditLogs || [];

  // Line chart calculations
  const maxSales = Math.max(...daily.map((d: any) => d.sales || 0), 1000);

  return (
    <div className="space-y-6 pb-12 text-slate-900">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & RANGE SELECTOR                                            */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-serif-luxury tracking-tight">
              Executive Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D4AF37]/20 text-[#8C6D23] border border-[#D4AF37]/40 uppercase tracking-wider">
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
                    ? 'bg-slate-950 text-white shadow-sm font-bold'
                    : 'text-gray-600 hover:text-slate-950'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchDashboard(timeRange)}
            disabled={refreshing}
            className="p-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-gray-700 transition shadow-sm"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#D4AF37]' : ''}`} />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. EXECUTIVE SUMMARY + QUICK ACTIONS ROW                                  */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left: 6 KPI Cards (8 Columns) */}
        <div className="xl:col-span-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Executive Summary <span className="text-gray-400 font-normal">({timeRange === '7D' ? 'This Week' : timeRange})</span>
            </h2>
            <Link
              href="/admin/finance/business-performance"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#997B21] hover:underline"
            >
              <span>Business Performance →</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* KPI 1: Total Revenue */}
            <Link
              href="/admin/finance/pnl"
              className="bg-white p-3.5 rounded-xl border border-gray-200/90 shadow-sm hover:border-[#D4AF37] transition flex flex-col justify-between group"
            >
              <div>
                <p className="text-[11px] font-semibold text-gray-500 truncate">Total Revenue</p>
                <p className="text-lg font-black text-slate-950 font-mono mt-1 tracking-tight">
                  ৳{(es.totalRevenue || 0).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  {trends.revenue || '0%'}
                </span>
                <Sparkline isPositive={trends.revenuePositive !== false} color="#10B981" />
              </div>
            </Link>

            {/* KPI 2: Total Orders */}
            <Link
              href="/admin/orders"
              className="bg-white p-3.5 rounded-xl border border-gray-200/90 shadow-sm hover:border-[#D4AF37] transition flex flex-col justify-between group"
            >
              <div>
                <p className="text-[11px] font-semibold text-gray-500 truncate">Total Orders</p>
                <p className="text-lg font-black text-slate-950 font-mono mt-1 tracking-tight">
                  {es.totalOrders || 0}
                </p>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  {trends.orders || '0%'}
                </span>
                <Sparkline isPositive={trends.ordersPositive !== false} color="#10B981" />
              </div>
            </Link>

            {/* KPI 3: Gross Profit */}
            <Link
              href="/admin/finance/pnl"
              className="bg-white p-3.5 rounded-xl border border-gray-200/90 shadow-sm hover:border-[#D4AF37] transition flex flex-col justify-between group"
            >
              <div>
                <p className="text-[11px] font-semibold text-gray-500 truncate">Gross Profit</p>
                <p className="text-lg font-black text-slate-950 font-mono mt-1 tracking-tight">
                  ৳{(es.grossProfit || 0).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  {trends.grossProfit || '0%'}
                </span>
                <Sparkline isPositive={trends.grossProfitPositive !== false} color="#10B981" />
              </div>
            </Link>

            {/* KPI 4: Net Profit */}
            <Link
              href="/admin/finance/pnl"
              className="bg-white p-3.5 rounded-xl border border-gray-200/90 shadow-sm hover:border-[#D4AF37] transition flex flex-col justify-between group"
            >
              <div>
                <p className="text-[11px] font-semibold text-gray-500 truncate">Net Profit</p>
                <p className={`text-lg font-black font-mono mt-1 tracking-tight ${es.netProfit >= 0 ? 'text-slate-950' : 'text-rose-600'}`}>
                  ৳{(es.netProfit || 0).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className={`text-[11px] font-bold flex items-center gap-0.5 ${es.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {es.netProfit >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {trends.netProfit || '0%'}
                </span>
                <Sparkline isPositive={es.netProfit >= 0} color={es.netProfit >= 0 ? '#10B981' : '#EF4444'} />
              </div>
            </Link>

            {/* KPI 5: COD Receivable */}
            <Link
              href="/admin/finance/reconciliation"
              className="bg-white p-3.5 rounded-xl border border-gray-200/90 shadow-sm hover:border-[#D4AF37] transition flex flex-col justify-between group"
            >
              <div>
                <p className="text-[11px] font-semibold text-gray-500 truncate">COD Receivable</p>
                <p className="text-lg font-black text-slate-950 font-mono mt-1 tracking-tight">
                  ৳{(es.codReceivable || 0).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  {trends.codReceivable || '0%'}
                </span>
                <Sparkline isPositive={trends.codReceivablePositive !== false} color="#10B981" />
              </div>
            </Link>

            {/* KPI 6: Low Stock Items */}
            <Link
              href="/admin/inventory"
              className="bg-white p-3.5 rounded-xl border border-gray-200/90 shadow-sm hover:border-[#D4AF37] transition flex flex-col justify-between group"
            >
              <div>
                <p className="text-[11px] font-semibold text-gray-500 truncate">Low Stock Items</p>
                <p className="text-lg font-black text-slate-950 font-mono mt-1 tracking-tight">
                  {es.lowStockItems || 0}
                </p>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[11px] font-bold text-rose-600 flex items-center gap-0.5">
                  <ArrowDownRight className="w-3 h-3" />
                  {es.criticalStockItems !== undefined ? es.criticalStockItems : 0}
                </span>
                <div className="p-1 bg-amber-50 rounded border border-amber-200 text-amber-600">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Right: Quick Actions (4 Columns) */}
        <div className="xl:col-span-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Quick Actions
            </h2>
          </div>

          <div className="bg-[#0B132B] p-3 rounded-2xl border border-slate-800 shadow-md h-full flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/admin/products"
                className="flex items-center gap-2 p-2.5 bg-slate-900/90 hover:bg-[#D4AF37] hover:text-slate-950 text-white rounded-xl border border-slate-700/60 transition text-xs font-semibold group shadow-sm"
              >
                <Plus className="w-4 h-4 text-[#D4AF37] group-hover:text-slate-950" />
                <span>Add New Product</span>
              </Link>

              <Link
                href="/admin/settings"
                className="flex items-center gap-2 p-2.5 bg-slate-900/90 hover:bg-[#D4AF37] hover:text-slate-950 text-white rounded-xl border border-slate-700/60 transition text-xs font-semibold group shadow-sm"
              >
                <Percent className="w-4 h-4 text-[#D4AF37] group-hover:text-slate-950" />
                <span>Create Discount</span>
              </Link>

              <Link
                href="/admin/orders"
                className="flex items-center gap-2 p-2.5 bg-slate-900/90 hover:bg-[#D4AF37] hover:text-slate-950 text-white rounded-xl border border-slate-700/60 transition text-xs font-semibold group shadow-sm"
              >
                <Truck className="w-4 h-4 text-[#D4AF37] group-hover:text-slate-950" />
                <span>Book Courier</span>
              </Link>

              <Link
                href="/admin/scan"
                className="flex items-center gap-2 p-2.5 bg-slate-900/90 hover:bg-[#D4AF37] hover:text-slate-950 text-white rounded-xl border border-slate-700/60 transition text-xs font-semibold group shadow-sm"
              >
                <QrCode className="w-4 h-4 text-[#D4AF37] group-hover:text-slate-950" />
                <span>Scan QR Code</span>
              </Link>

              <Link
                href="/admin/finance"
                className="flex items-center gap-2 p-2.5 bg-slate-900/90 hover:bg-[#D4AF37] hover:text-slate-950 text-white rounded-xl border border-slate-700/60 transition text-xs font-semibold group shadow-sm"
              >
                <DollarSign className="w-4 h-4 text-[#D4AF37] group-hover:text-slate-950" />
                <span>Add Expense</span>
              </Link>

              <Link
                href="/admin/finance/reports"
                className="flex items-center gap-2 p-2.5 bg-slate-900/90 hover:bg-[#D4AF37] hover:text-slate-950 text-white rounded-xl border border-slate-700/60 transition text-xs font-semibold group shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#D4AF37] group-hover:text-slate-950" />
                <span>Generate Report</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ACTION REQUIRED CENTER (Operational Callout Cockpit)                    */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-slate-900/5 border border-amber-200/90 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Action Required Center
            </h2>
          </div>
          <span className="text-[11px] text-amber-800 font-medium">
            Pending items requiring immediate admin intervention
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <Link
            href="/admin/orders?status=PENDING"
            className="p-3 bg-white rounded-xl border border-amber-200/80 hover:border-amber-400 transition hover:shadow-sm group"
          >
            <p className="text-[11px] font-semibold text-gray-500">Unconfirmed Orders</p>
            <p className="text-lg font-bold text-amber-700 mt-0.5">{ar.unconfirmedOrders || 0}</p>
            <span className="text-[10px] text-amber-600 font-medium flex items-center gap-0.5 mt-0.5 group-hover:underline">
              Confirm order →
            </span>
          </Link>

          <Link
            href="/admin/orders"
            className="p-3 bg-white rounded-xl border border-red-200/80 hover:border-red-400 transition hover:shadow-sm group"
          >
            <p className="text-[11px] font-semibold text-gray-500">Stale Processing (&gt;12h)</p>
            <p className="text-lg font-bold text-red-700 mt-0.5">{ar.staleOrders || 0}</p>
            <span className="text-[10px] text-red-600 font-medium flex items-center gap-0.5 mt-0.5 group-hover:underline">
              Review queue →
            </span>
          </Link>

          <Link
            href="/admin/inventory"
            className="p-3 bg-white rounded-xl border border-rose-200/80 hover:border-rose-400 transition hover:shadow-sm group"
          >
            <p className="text-[11px] font-semibold text-gray-500">Out-of-Stock SKUs</p>
            <p className="text-lg font-bold text-rose-700 mt-0.5">{ar.outOfStockSKUs || 0}</p>
            <span className="text-[10px] text-rose-600 font-medium flex items-center gap-0.5 mt-0.5 group-hover:underline">
              Create PO →
            </span>
          </Link>

          <Link
            href="/admin/inventory"
            className="p-3 bg-white rounded-xl border border-yellow-200/80 hover:border-yellow-400 transition hover:shadow-sm group"
          >
            <p className="text-[11px] font-semibold text-gray-500">Low Stock SKUs</p>
            <p className="text-lg font-bold text-yellow-700 mt-0.5">{ar.lowStockSKUs || 0}</p>
            <span className="text-[10px] text-yellow-600 font-medium flex items-center gap-0.5 mt-0.5 group-hover:underline">
              Check stock →
            </span>
          </Link>

          <Link
            href="/admin/returns"
            className="p-3 bg-white rounded-xl border border-purple-200/80 hover:border-purple-400 transition hover:shadow-sm group"
          >
            <p className="text-[11px] font-semibold text-gray-500">Return Requests</p>
            <p className="text-lg font-bold text-purple-700 mt-0.5">{ar.returnRequests || 0}</p>
            <span className="text-[10px] text-purple-600 font-medium flex items-center gap-0.5 mt-0.5 group-hover:underline">
              Inspect returns →
            </span>
          </Link>

          <Link
            href="/admin/finance/reconciliation"
            className="p-3 bg-white rounded-xl border border-blue-200/80 hover:border-blue-400 transition hover:shadow-sm group"
          >
            <p className="text-[11px] font-semibold text-gray-500">Pending COD Due</p>
            <p className="text-lg font-bold text-blue-700 mt-0.5">৳{(ar.pendingCodDue || 0).toLocaleString()}</p>
            <span className="text-[10px] text-blue-600 font-medium flex items-center gap-0.5 mt-0.5 group-hover:underline">
              Reconcile →
            </span>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MIDDLE 4-COLUMN DATA GRID (Sales, Order Status, Recent, Top Selling)   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Card 1: SALES OVERVIEW (Line Chart) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Sales Overview <span className="text-gray-400 font-normal">({timeRange})</span>
              </h3>
            </div>
            <p className="text-[11px] text-gray-500">Real-time daily recognized sales revenue</p>

            {/* Custom SVG Line Chart */}
            <div className="mt-4 h-44 relative flex items-end">
              {/* Y-Axis Guidelines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] text-gray-400 font-mono">
                <div className="border-b border-gray-100 flex items-center justify-between">
                  <span>৳{Math.round(maxSales / 1000)}K</span>
                </div>
                <div className="border-b border-gray-100 flex items-center justify-between">
                  <span>৳{Math.round((maxSales * 0.66) / 1000)}K</span>
                </div>
                <div className="border-b border-gray-100 flex items-center justify-between">
                  <span>৳{Math.round((maxSales * 0.33) / 1000)}K</span>
                </div>
                <div className="border-b border-gray-200 flex items-center justify-between">
                  <span>৳0</span>
                </div>
              </div>

              {/* Line & Spark Nodes */}
              <div className="w-full h-36 flex items-end justify-between px-2 z-10">
                {daily.map((d: any, idx: number) => {
                  const heightPct = Math.max(8, Math.min(95, ((d.sales || 0) / maxSales) * 100));
                  return (
                    <div key={d.date || idx} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                      {/* Tooltip on Hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition absolute -top-8 bg-slate-950 text-white text-[10px] px-2 py-1 rounded shadow-lg pointer-events-none z-20 whitespace-nowrap">
                        <span className="font-bold">৳{(d.sales || 0).toLocaleString()}</span>
                        <span className="text-emerald-400 text-[9px] block font-mono">{d.label}</span>
                      </div>

                      {/* Line Bar Node */}
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-2.5 bg-gradient-to-t from-[#D4AF37] to-amber-400 rounded-t transition-all group-hover:scale-110 shadow-sm"
                      ></div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* X-Axis Labels */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[10px] text-gray-500 font-mono">
              {daily.slice(0, 7).map((d: any, i: number) => (
                <span key={d.date || i}>{d.label ? d.label.split(' ')[0] : ''}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: ORDER STATUS (Donut Chart) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Order Status
              </h3>
            </div>
            <p className="text-[11px] text-gray-500">Distribution of active & fulfilled orders</p>

            <OrderStatusDonut
              delivered={os.delivered?.count || 0}
              inTransit={os.inTransit?.count || 0}
              processing={os.processing?.count || 0}
              pending={os.pending?.count || 0}
              cancelled={os.cancelled?.count || 0}
              total={os.totalCount || 0}
            />
          </div>
        </div>

        {/* Card 3: RECENT ORDERS (Table) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Recent Orders
              </h3>
              <Link
                href="/admin/orders"
                className="text-[11px] font-bold text-[#8C6D23] hover:text-[#D4AF37] transition"
              >
                View All Orders
              </Link>
            </div>

            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] text-gray-400 uppercase font-semibold">
                    <th className="pb-2">Order ID</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {ro.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-gray-400 text-xs">
                        No orders recorded yet
                      </td>
                    </tr>
                  ) : (
                    ro.slice(0, 5).map((o: any) => {
                      let badgeClass = 'bg-gray-100 text-gray-700';
                      if (o.status === 'Delivered') badgeClass = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
                      else if (o.status === 'In Transit') badgeClass = 'bg-blue-50 text-blue-700 border border-blue-200';
                      else if (o.status === 'Processing') badgeClass = 'bg-amber-50 text-amber-700 border border-amber-200';
                      else if (o.status === 'Pending') badgeClass = 'bg-purple-50 text-purple-700 border border-purple-200';
                      else if (o.status === 'Cancelled') badgeClass = 'bg-rose-50 text-rose-700 border border-rose-200';

                      return (
                        <tr key={o._id || o.orderId} className="hover:bg-gray-50 transition">
                          <td className="py-2 font-mono font-semibold text-slate-900 text-[11px]">
                            <Link href="/admin/orders" className="hover:text-[#D4AF37]">
                              {o.orderId}
                            </Link>
                            <span className="block text-[10px] text-gray-400 font-sans font-normal truncate max-w-[90px]">
                              {o.customer}
                            </span>
                          </td>
                          <td className="py-2 font-mono font-bold text-slate-900 text-[11px]">
                            ৳{(o.amount || 0).toLocaleString()}
                          </td>
                          <td className="py-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badgeClass}`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Card 4: TOP SELLING PRODUCTS */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Top Selling Products
              </h3>
              <Link
                href="/admin/products"
                className="text-[11px] font-bold text-[#8C6D23] hover:text-[#D4AF37] transition"
              >
                View All
              </Link>
            </div>

            <div className="space-y-2.5 mt-3">
              {tp.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-xs">
                  No sales recorded yet
                </div>
              ) : (
                tp.slice(0, 5).map((p: any, idx: number) => (
                  <div key={p.id || idx} className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-gray-50 transition">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs font-black text-gray-400 font-mono w-3">
                        {p.rank || idx + 1}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingBag className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate max-w-[110px]">
                          {p.name}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono">{p.unitsSold} Units</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-950 font-mono whitespace-nowrap">
                      ৳{(p.revenue || 0).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. BOTTOM 4-COLUMN OPERATIONS & FINANCIALS GRID                           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Card 1: COURIER MANAGEMENT */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Courier Management
              </h3>
              <Link
                href="/admin/orders"
                className="text-[11px] font-bold text-[#8C6D23] hover:text-[#D4AF37] transition"
              >
                View All
              </Link>
            </div>

            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] text-gray-400 uppercase font-semibold">
                    <th className="pb-2">Courier</th>
                    <th className="pb-2">Tracking</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {cs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-gray-400 text-xs">
                        No shipments active
                      </td>
                    </tr>
                  ) : (
                    cs.slice(0, 4).map((c: any, i: number) => {
                      let statusBadge = 'bg-gray-100 text-gray-700';
                      if (c.status === 'In Transit') statusBadge = 'bg-blue-50 text-blue-700 border border-blue-200';
                      else if (c.status === 'Delivered') statusBadge = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
                      else if (c.status === 'Picked Up') statusBadge = 'bg-amber-50 text-amber-700 border border-amber-200';

                      return (
                        <tr key={c._id || i} className="hover:bg-gray-50 transition">
                          <td className="py-2 flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-extrabold flex items-center justify-center">
                              {c.courier ? c.courier[0] : 'P'}
                            </span>
                            <span className="font-semibold text-slate-800 text-[11px]">{c.courier || 'Pathao'}</span>
                          </td>
                          <td className="py-2 font-mono text-[10px] text-gray-500 truncate max-w-[80px]">
                            {c.trackingId || '-'}
                          </td>
                          <td className="py-2">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${statusBadge}`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="py-2 text-right">
                            <Link
                              href="/admin/orders"
                              className="px-2 py-0.5 bg-gray-100 hover:bg-slate-900 hover:text-white rounded text-[10px] font-bold transition text-gray-700"
                            >
                              Track
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Card 2: INVENTORY SUMMARY */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Inventory Summary
              </h3>
              <Link
                href="/admin/inventory"
                className="text-[11px] font-bold text-[#8C6D23] hover:text-[#D4AF37] transition"
              >
                View Details
              </Link>
            </div>

            {/* 3 Metric Boxes */}
            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[10px] text-gray-400 font-semibold">Total Products</p>
                <p className="text-base font-extrabold text-slate-950 font-mono mt-0.5">{inv.totalProducts || 0}</p>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[10px] text-gray-400 font-semibold">Total Variants</p>
                <p className="text-base font-extrabold text-slate-950 font-mono mt-0.5">{inv.totalVariants || 0}</p>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[10px] text-gray-400 font-semibold">Total Stock</p>
                <p className="text-base font-extrabold text-slate-950 font-mono mt-0.5">{inv.totalStock || 0}</p>
              </div>
            </div>

            {/* 3 Status Pills */}
            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              <div className="p-2 bg-amber-50 rounded-xl border border-amber-200/80">
                <p className="text-[10px] text-amber-700 font-semibold">Low Stock</p>
                <p className="text-sm font-bold text-amber-900 font-mono mt-0.5">{inv.lowStock || 0} Items</p>
              </div>
              <div className="p-2 bg-rose-50 rounded-xl border border-rose-200/80">
                <p className="text-[10px] text-rose-700 font-semibold">Out of Stock</p>
                <p className="text-sm font-bold text-rose-900 font-mono mt-0.5">{inv.outOfStock || 0} Items</p>
              </div>
              <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200/80">
                <p className="text-[10px] text-emerald-700 font-semibold">Reserved Stock</p>
                <p className="text-sm font-bold text-emerald-900 font-mono mt-0.5">{inv.reservedStock || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: FINANCIAL OVERVIEW (Statement of P&L) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Financial Overview <span className="text-gray-400 font-normal">({timeRange})</span>
              </h3>
              <Link
                href="/admin/finance/pnl"
                className="text-[11px] font-bold text-[#8C6D23] hover:text-[#D4AF37] transition"
              >
                View Ledger
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mt-3 items-center">
              {/* Financial Key Figures */}
              <div className="sm:col-span-7 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Revenue</span>
                  <span className="font-bold text-slate-900 font-mono">৳{(fin.totalRevenue || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total COGS</span>
                  <span className="font-bold text-slate-900 font-mono">৳{(fin.totalCogs || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Gross Profit</span>
                  <span className="font-bold text-slate-900 font-mono">৳{(fin.grossProfit || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Expenses</span>
                  <span className="font-bold text-slate-900 font-mono">৳{(fin.totalExpenses || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-100">
                  <span className="font-bold text-slate-900">Net Profit</span>
                  <span className={`font-black font-mono ${fin.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    ৳{(fin.netProfit || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Net Profit Margin Gauge */}
              <div className="sm:col-span-5 flex items-center justify-center">
                <MarginDonutRing percentage={fin.netProfitMargin || 0} />
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: AUDIT LOG (Recent Activities) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Audit Log <span className="text-gray-400 font-normal">(Recent Activities)</span>
              </h3>
              <Link
                href="/admin/audit-logs"
                className="text-[11px] font-bold text-[#8C6D23] hover:text-[#D4AF37] transition"
              >
                View All
              </Link>
            </div>

            <div className="space-y-2.5 mt-2">
              {logs.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-xs">
                  No audit logs recorded yet
                </div>
              ) : (
                logs.slice(0, 5).map((log: any, i: number) => (
                  <div key={log._id || i} className="text-xs border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                      <span>{log.date} {log.time}</span>
                      <span className="px-1.5 py-0.2 bg-gray-100 text-gray-600 rounded text-[9px] font-bold">
                        {log.role || 'Admin'}
                      </span>
                    </div>
                    <p className="text-slate-900 font-medium text-[11px] mt-0.5 line-clamp-1">
                      {log.activity}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
