'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Loader2,
  DollarSign,
  TrendingUp,
  Building2,
  Truck,
  CreditCard,
} from 'lucide-react';
import { API_BASE_URL, authFetch } from '../../../../utils/api-config';

export default function CashFlowPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCashFlow = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/finance/cash-flow`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (e) {
      console.error('Error fetching cash flow:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashFlow();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" />
        <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">
          Calculating Cash Flow Position...
        </p>
      </div>
    );
  }

  const inflows = data?.inflows || {};
  const outflows = data?.outflows || {};
  const net = data?.netCashPosition || 0;

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6D23]">
            Treasury & Working Capital
          </span>
          <h1 className="text-2xl font-extrabold font-serif-luxury text-slate-950 mt-0.5">
            Cash Flow Statement
          </h1>
          <p className="text-xs text-gray-500">
            Realized cash inflows from customer advances, courier COD remittances, and operating disbursements.
          </p>
        </div>

        <button
          onClick={fetchCashFlow}
          disabled={loading}
          className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Net Position Hero Card */}
      <div className="bg-slate-950 text-white p-6 sm:p-8 rounded-2xl border border-gray-800 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">
              Net Working Cash Position
            </span>
          </div>
          <p className="text-3xl sm:text-4xl font-black font-mono text-white mt-2">
            ৳{net.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Available liquid reserve across bank, bKash merchant, and petty cash.
          </p>
        </div>

        <div className="flex gap-4 font-mono text-xs">
          <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-gray-400 text-[10px] uppercase">Total Inflow</p>
            <p className="text-lg font-bold text-emerald-400 mt-1">+৳{(inflows.totalCashIn || 0).toLocaleString()}</p>
          </div>
          <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-gray-400 text-[10px] uppercase">Total Outflow</p>
            <p className="text-lg font-bold text-red-400 mt-1">-৳{(outflows.totalCashOut || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Inflow & Outflow Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* INFLOWS */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                <ArrowDownLeft className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">Cash Inflows</h3>
                <p className="text-[11px] text-gray-500">Receipts into merchant accounts</p>
              </div>
            </div>
            <span className="font-mono font-bold text-emerald-700">৳{(inflows.totalCashIn || 0).toLocaleString()}</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900 font-sans">Customer Advance Payments</p>
                <p className="text-[10px] text-gray-500 font-sans">bKash, Nagad delivery charges</p>
              </div>
              <span className="font-bold text-slate-950">৳{(inflows.customerAdvancePaid || 0).toLocaleString()}</span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900 font-sans">Courier COD Remittances</p>
                <p className="text-[10px] text-gray-500 font-sans">Pathao COD collections settled</p>
              </div>
              <span className="font-bold text-slate-950">৳{(inflows.codSettledFromDelivered || 0).toLocaleString()}</span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900 font-sans">Owner Capital & Loans In</p>
                <p className="text-[10px] text-gray-500 font-sans">Equity capital invested</p>
              </div>
              <span className="font-bold text-slate-950">৳{(inflows.capitalIn || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* OUTFLOWS */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-red-50 text-red-700 rounded-lg">
                <ArrowUpRight className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">Cash Outflows</h3>
                <p className="text-[11px] text-gray-500">Disbursements & operating payments</p>
              </div>
            </div>
            <span className="font-mono font-bold text-red-700">-৳{(outflows.totalCashOut || 0).toLocaleString()}</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900 font-sans">Supplier & Procurement Payments</p>
                <p className="text-[10px] text-gray-500 font-sans">Purchase orders paid to vendors</p>
              </div>
              <span className="font-bold text-red-700">-৳{(outflows.supplierPaid || 0).toLocaleString()}</span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900 font-sans">Operating Expenses Paid</p>
                <p className="text-[10px] text-gray-500 font-sans">Marketing, packaging, rent, salaries</p>
              </div>
              <span className="font-bold text-red-700">-৳{(outflows.operatingExpensesPaid || 0).toLocaleString()}</span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900 font-sans">Owner Drawings & Capital Out</p>
                <p className="text-[10px] text-gray-500 font-sans">Withdrawals and loan repayments</p>
              </div>
              <span className="font-bold text-red-700">-৳{(outflows.capitalWithdrawals || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
