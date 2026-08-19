'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '../../utils/api-config';
import {
  DollarSign,
  TrendingUp,
  Package,
  CheckCircle,
  Clock,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [finRes, ordRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/finance/analytics`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/admin/orders?limit=6`, { credentials: 'include' }),
      ]);

      if (finRes.ok) {
        const finData = await finRes.json();
        setData(finData);
      }
      if (ordRes.ok) {
        const ordData = await ordRes.json();
        setRecentOrders(ordData || []);
      }
    } catch (e) {
      console.error('Error fetching admin dashboard analytics', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const summary = data?.summary || {
    realizedRevenue: 0,
    deliveredSubtotal: 0,
    grossProfit: 0,
    grossProfitMargin: '0',
    totalOperatingExpenses: 0,
    netProfit: 0,
    netProfitMargin: '0',
    totalOrders: 0,
    deliveredOrdersCount: 0,
    pipelineOrdersCount: 0,
    pipelineRevenue: 0,
    cancelledOrdersCount: 0,
  };

  const dailySales = data?.dailySales || [];
  const expensesByCategory = data?.expensesByCategory || {};

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#997B21]">
            Executive Financial & Profit Cockpit
          </span>
          <h1 className="text-2xl font-bold font-serif-luxury text-gray-900">
            Real-Time Business Performance
          </h1>
          <p className="text-xs text-gray-500">
            Realized metrics calculated strictly from <strong>Delivered & Fulfilled orders</strong> (Zero double counting).
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold uppercase tracking-wider rounded-lg transition flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* 5 Core Financial & Pipeline KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* 1. Realized Revenue (Delivered) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Realized Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
              ৳
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold font-mono text-gray-900">
              ৳{(summary.realizedRevenue || 0).toLocaleString()}
            </h3>
            <p className="text-[10px] text-gray-500 mt-1">
              From {summary.deliveredOrdersCount || 0} delivered orders
            </p>
          </div>
        </div>

        {/* 2. Total Orders & Pipeline */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Orders Queue</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold font-mono text-amber-700">
              {recentOrders.length} Orders
            </h3>
            <p className="text-[10px] text-gray-500 mt-1">
              Pipeline Value: ৳{(summary.pipelineRevenue || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* 3. Gross Profit */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Gross Profit</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold font-mono text-emerald-700">
              ৳{(summary.grossProfit || 0).toLocaleString()}
            </h3>
            <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
              <span>{summary.grossProfitMargin}% Margin (Delivered - COGS)</span>
            </p>
          </div>
        </div>

        {/* 4. Operating Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-red-700">Operating Expenses</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold font-mono text-red-600">
              ৳{(summary.totalOperatingExpenses || 0).toLocaleString()}
            </h3>
            <p className="text-[10px] text-gray-500 mt-1">
              Packaging, Delivery & Marketing
            </p>
          </div>
        </div>

        {/* 5. Authentic Net Profit */}
        <div className="bg-slate-950 text-white p-5 rounded-2xl border border-[#D4AF37]/30 shadow-lg space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#C5A059]/15 rounded-full blur-xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E6CA85]">Realized Net Profit</span>
            <div className="w-8 h-8 rounded-lg bg-[#C5A059]/20 text-[#E6CA85] flex items-center justify-center font-bold text-sm">
              ★
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold font-mono text-[#E6CA85]">
              ৳{(summary.netProfit || 0).toLocaleString()}
            </h3>
            <p className="text-[10px] text-gray-400 mt-1">
              Net Margin: {summary.netProfitMargin}%
            </p>
          </div>
        </div>
      </div>

      {/* Middle Row: Sales Activity & Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Sales Trend Visualizer */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                Daily Activity & Dispatch Trajectory
              </h3>
              <p className="text-xs text-gray-500">Sales volume and gross margin across past 7 days</p>
            </div>
            <Link href="/admin/orders" className="text-xs font-bold text-[#997B21] hover:underline flex items-center gap-1">
              All Orders <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {dailySales.map((day: any) => (
              <div key={day.date} className="flex items-center gap-4 text-xs">
                <span className="w-20 font-mono text-gray-500">{day.date}</span>
                <div className="flex-1 bg-gray-100 h-6 rounded-lg overflow-hidden flex">
                  <div
                    className="bg-[#C5A059] h-full transition-all duration-500 flex items-center justify-end px-2 text-[10px] font-bold text-slate-950 font-mono"
                    style={{
                      width: `${Math.min(100, Math.max(12, (day.sales / ((summary.realizedRevenue + summary.pipelineRevenue) || 1)) * 100))}%`,
                    }}
                  >
                    {day.sales > 0 ? `৳${day.sales.toLocaleString()}` : ''}
                  </div>
                </div>
                <span className="w-20 text-right font-semibold text-gray-700">
                  {day.orders} {day.orders === 1 ? 'order' : 'orders'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                Operating Cost Breakdown
              </h3>
              <p className="text-xs text-gray-500">Packaging, courier, marketing & operations</p>
            </div>
            <Link href="/admin/finance" className="text-xs font-bold text-[#997B21] hover:underline flex items-center gap-1">
              Ledger <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-4">
            {Object.keys(expensesByCategory).length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No operating expenses recorded yet.</p>
            ) : (
              Object.entries(expensesByCategory).map(([cat, amount]: [string, any]) => {
                const percentage = summary.totalOperatingExpenses > 0 ? ((amount / summary.totalOperatingExpenses) * 100).toFixed(0) : 0;
                return (
                  <div key={cat} className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-700">{cat}</span>
                      <span className="font-bold text-gray-900 font-mono">৳{amount.toLocaleString()} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-slate-900 h-full rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Orders Quick Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
              Live Order Processing Queue
            </h3>
            <p className="text-xs text-gray-500">Atomic inventory reservations & fulfillment status</p>
          </div>
          <Link
            href="/admin/orders"
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#C5A059] transition"
          >
            View All Orders
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-xs text-gray-400 py-8 text-center">No orders placed yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 bg-gray-50">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">District</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/60">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{order.orderId}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-gray-900">{order.customerDetails?.name}</p>
                      <p className="text-[11px] text-gray-400">{order.customerDetails?.mobile}</p>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">{order.customerDetails?.district || 'Dhaka'}</td>
                    <td className="py-3.5 px-4 text-gray-600">{order.items?.length || 0} items</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                      ৳{order.totalAmount?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : order.status === 'CANCELLED'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href="/admin/orders"
                        className="text-xs font-bold text-[#997B21] hover:underline"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
