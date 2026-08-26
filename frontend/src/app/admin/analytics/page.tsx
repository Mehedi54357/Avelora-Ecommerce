'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Target,
  Users,
  ShoppingBag,
  RefreshCw,
  Loader2,
  DollarSign,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { API_BASE_URL, authFetch } from '../../../utils/api-config';

export default function AnalyticsAndUTMPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/finance/analytics`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const s = data?.summary || {};

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6D23]">
            Acquisition & Growth Attribution
          </span>
          <h1 className="text-2xl font-extrabold font-serif-luxury text-slate-950 mt-0.5">
            Analytics & UTM Tracking
          </h1>
          <p className="text-xs text-gray-500">
            Monitor Meta Ad campaigns, organic direct traffic, customer conversion funnels, and revenue attribution.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* KPI Hero Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-gray-500">Average Order Value (AOV)</p>
          <p className="text-2xl font-black text-slate-950 font-mono">
            ৳{(s.averageOrderValue || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium">Realized per delivery</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-gray-500">Return Rate</p>
          <p className="text-2xl font-black text-slate-950 font-mono">
            {s.returnRate || 0}%
          </p>
          <p className="text-[11px] text-blue-700 font-medium">Industry Benchmark &lt;8%</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-gray-500">Total Placed Value</p>
          <p className="text-2xl font-black text-slate-950 font-mono">
            ৳{(s.totalPlacedValue || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium">Delivered + Pipeline</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <p className="text-xs font-bold text-gray-500">Active Queue Pipeline</p>
          <p className="text-2xl font-black text-slate-950 font-mono">
            ৳{(s.pipelineRevenue || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-amber-700 font-medium">{s.pipelineOrdersCount || 0} active orders</p>
        </div>
      </div>

      {/* Campaign Channels Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-base font-bold text-slate-900">Traffic Source & UTM Campaign Attribution</h3>
          <p className="text-xs text-gray-500">Estimated channel revenue share</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">Channel / Campaign</th>
                <th className="py-3 px-4">Source Medium</th>
                <th className="py-3 px-4 text-center">Orders Share</th>
                <th className="py-3 px-4 text-right">Attributed Revenue (BDT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 font-bold text-slate-900">Meta Eid Collection 2026</td>
                <td className="py-3 px-4 font-mono text-gray-500">facebook / cpc</td>
                <td className="py-3 px-4 text-center font-bold">58%</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">৳{((s.realizedRevenue || 0) * 0.58).toLocaleString()}</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 font-bold text-slate-900">Direct / Organic Storefront</td>
                <td className="py-3 px-4 font-mono text-gray-500">direct / none</td>
                <td className="py-3 px-4 text-center font-bold">32%</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">৳{((s.realizedRevenue || 0) * 0.32).toLocaleString()}</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 font-bold text-slate-900">Instagram Influencer Stories</td>
                <td className="py-3 px-4 font-mono text-gray-500">instagram / story</td>
                <td className="py-3 px-4 text-center font-bold">10%</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">৳{((s.realizedRevenue || 0) * 0.10).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
