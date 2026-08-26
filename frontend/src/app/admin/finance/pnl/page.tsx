'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { API_BASE_URL, authFetch } from '../../../../utils/api-config';

export default function PnLStatementPage() {
  const [pnl, setPnl] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
  );
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));

  const fetchPnL = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/finance/pnl?from=${from}&to=${to}`);
      if (res.ok) {
        setPnl(await res.json());
      }
    } catch (e) {
      console.error('Error fetching P&L:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPnL();
  }, [from, to]);

  const handleExportCSV = () => {
    window.open(`${API_BASE_URL}/api/admin/finance/export/pnl`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading && !pnl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" />
        <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">
          Generating Statement of Profit & Loss...
        </p>
      </div>
    );
  }

  const rev = pnl?.revenueSection || {};
  const cogs = pnl?.cogsSection || {};
  const direct = pnl?.logisticsAndDirectCosts || {};
  const opex = pnl?.overheadSection || {};
  const net = pnl?.finalNetProfit || {};

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm print:hidden">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6D23]">
            Authoritative Financial Reporting
          </span>
          <h1 className="text-2xl font-extrabold font-serif-luxury text-slate-950 mt-0.5">
            Statement of Profit & Loss (P&L)
          </h1>
          <p className="text-xs text-gray-500">
            Realized delivered revenue, inventory COGS, logistics contribution, and operating overhead.
          </p>
        </div>

        {/* Date Pickers & Export */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-200 text-xs">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="bg-transparent text-slate-800 outline-none text-xs font-mono"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="bg-transparent text-slate-800 outline-none text-xs font-mono"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-slate-900 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Printable P&L Statement Sheet */}
      <div id="printable-pnl" className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-10 space-y-8">
        {/* Statement Header */}
        <div className="flex justify-between items-start pb-6 border-b-2 border-slate-950">
          <div>
            <h2 className="text-3xl font-extrabold tracking-[0.2em] text-[#0F172A] font-serif-luxury">
              AVELORA
            </h2>
            <p className="text-[9px] tracking-[0.3em] text-[#8C6D23] uppercase font-bold mt-0.5">
              Management Accounting & Income Statement
            </p>
            <p className="text-xs text-gray-500 mt-2 font-mono">
              Period: {pnl?.period?.from} to {pnl?.period?.to} • {pnl?.deliveredOrdersCount || 0} Delivered Orders
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-gray-100 rounded text-xs font-bold uppercase tracking-wider text-slate-800">
              AUDITED INTERNAL
            </span>
            <p className="text-xs text-gray-400 font-mono mt-1">Currency: BDT (৳)</p>
          </div>
        </div>

        {/* Structured Income Statement Table */}
        <div className="space-y-6 text-xs font-sans">
          {/* SECTION 1: REVENUE */}
          <div className="space-y-2">
            <div className="bg-gray-100 px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-slate-900 text-[11px] flex justify-between">
              <span>1. Realized Revenue & Net Sales</span>
              <span>Amount (BDT)</span>
            </div>

            <div className="px-4 divide-y divide-gray-100 font-mono">
              <div className="py-2 flex justify-between">
                <span className="text-gray-700 font-sans">Gross Product Sales (Delivered Orders)</span>
                <span className="font-bold text-slate-950">৳{(rev.grossProductSales || 0).toLocaleString()}</span>
              </div>
              <div className="py-2 flex justify-between text-red-600">
                <span className="text-gray-600 font-sans">Less: Item Discounts & Coupons</span>
                <span>-৳{((rev.productDiscounts || 0) + (rev.couponDiscounts || 0)).toLocaleString()}</span>
              </div>
              <div className="py-2 flex justify-between text-red-600">
                <span className="text-gray-600 font-sans">Less: Sales Returns & Refunds</span>
                <span>-৳{(rev.returnedMerchandiseValue || 0).toLocaleString()}</span>
              </div>
              <div className="py-2.5 flex justify-between font-bold text-slate-950 bg-slate-50 px-2 rounded">
                <span className="font-sans">Net Product Sales</span>
                <span>৳{(rev.netProductSales || 0).toLocaleString()}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-gray-700 font-sans">Add: Customer Delivery Charges Collected</span>
                <span>৳{(rev.shippingCollected || 0).toLocaleString()}</span>
              </div>
              <div className="py-2.5 flex justify-between font-black text-slate-950 bg-slate-100 px-2 rounded text-sm">
                <span className="font-sans">TOTAL NET REVENUE</span>
                <span>৳{(rev.netTotalRevenue || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: COST OF GOODS SOLD (COGS) */}
          <div className="space-y-2">
            <div className="bg-gray-100 px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-slate-900 text-[11px] flex justify-between">
              <span>2. Cost of Goods Sold (COGS)</span>
              <span>Amount (BDT)</span>
            </div>

            <div className="px-4 divide-y divide-gray-100 font-mono">
              <div className="py-2 flex justify-between text-red-600">
                <span className="text-gray-700 font-sans">Recognized Inventory Acquisition Cost (Weighted-Average)</span>
                <span>-৳{(cogs.recognizedCogs || 0).toLocaleString()}</span>
              </div>
              <div className="py-3 flex justify-between font-black text-slate-950 bg-[#D4AF37]/10 px-2 rounded text-sm border border-[#D4AF37]/30">
                <span className="font-sans flex items-center gap-2">
                  GROSS PROFIT (Margin: {cogs.grossMarginPercent || 0}%)
                </span>
                <span className="text-slate-950">৳{(cogs.grossProfit || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: DIRECT FULFILLMENT & LOGISTICS */}
          <div className="space-y-2">
            <div className="bg-gray-100 px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-slate-900 text-[11px] flex justify-between">
              <span>3. Direct Logistics, Packaging & Payment Gateway Fees</span>
              <span>Amount (BDT)</span>
            </div>

            <div className="px-4 divide-y divide-gray-100 font-mono">
              <div className="py-2 flex justify-between text-red-600">
                <span className="text-gray-700 font-sans">Actual Outbound Courier Cost (Pathao / Freight)</span>
                <span>-৳{(direct.actualCourierCost || 0).toLocaleString()}</span>
              </div>
              <div className="py-2 flex justify-between text-red-600">
                <span className="text-gray-700 font-sans">Packaging Boxes & Luxury Tissue Paper</span>
                <span>-৳{(direct.packagingExpense || 0).toLocaleString()}</span>
              </div>
              <div className="py-2 flex justify-between text-red-600">
                <span className="text-gray-700 font-sans">bKash / SSLCOMMERZ Gateway Commission</span>
                <span>-৳{(direct.paymentFees || 0).toLocaleString()}</span>
              </div>
              <div className="py-2.5 flex justify-between font-bold text-slate-950 bg-slate-50 px-2 rounded">
                <span className="font-sans">CONTRIBUTION PROFIT (Post-Fulfillment)</span>
                <span>৳{(direct.contributionProfit || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* SECTION 4: OPERATING OVERHEAD (OPEX) */}
          <div className="space-y-2">
            <div className="bg-gray-100 px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-slate-900 text-[11px] flex justify-between">
              <span>4. Operating Overhead (OPEX)</span>
              <span>Amount (BDT)</span>
            </div>

            <div className="px-4 divide-y divide-gray-100 font-mono">
              <div className="py-2 flex justify-between text-red-600">
                <span className="text-gray-700 font-sans">Digital Marketing & Meta Ad Spend</span>
                <span>-৳{(opex.marketingExpense || 0).toLocaleString()}</span>
              </div>
              <div className="py-2 flex justify-between text-red-600">
                <span className="text-gray-700 font-sans">Team Salaries & Operations</span>
                <span>-৳{(opex.salaryExpense || 0).toLocaleString()}</span>
              </div>
              <div className="py-2 flex justify-between text-red-600">
                <span className="text-gray-700 font-sans">Office Rent & Utilities</span>
                <span>-৳{(opex.utilityExpense || 0).toLocaleString()}</span>
              </div>
              <div className="py-2 flex justify-between text-red-600">
                <span className="text-gray-700 font-sans">Other General & Administrative</span>
                <span>-৳{(opex.otherOperatingExpense || 0).toLocaleString()}</span>
              </div>
              <div className="py-2.5 flex justify-between font-bold text-red-700 bg-red-50 px-2 rounded">
                <span className="font-sans">Total Operating Overhead</span>
                <span>-৳{(opex.totalOverhead || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* FINAL NET PROFIT BANNER */}
          <div className="p-6 bg-slate-950 text-white rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">
                Authentic Bottom-Line Management Profit
              </p>
              <h3 className="text-xl font-extrabold font-serif-luxury mt-1">
                NET OPERATING PROFIT
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Calculated on delivered fulfillment, recognized COGS, and paid operating expenses.
              </p>
            </div>

            <div className="sm:text-right font-mono">
              <p className={`text-3xl font-black ${net.netProfit >= 0 ? 'text-[#D4AF37]' : 'text-red-400'}`}>
                ৳{(net.netProfit || 0).toLocaleString()}
              </p>
              <p className="text-xs text-emerald-400 font-bold mt-1">
                Net Profit Margin: {net.netMarginPercent || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
