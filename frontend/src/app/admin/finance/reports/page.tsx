'use client';

import React from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Boxes,
  DollarSign,
  Landmark,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { API_BASE_URL } from '../../../../utils/api-config';

export default function FinanceReportsPage() {
  const downloadReport = (type: string) => {
    window.open(`${API_BASE_URL}/api/admin/finance/export/${type}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6D23]">
          Financial Compliance & Tax Audit
        </span>
        <h1 className="text-2xl font-extrabold font-serif-luxury text-slate-950 mt-0.5">
          Reports & Data Export
        </h1>
        <p className="text-xs text-gray-500">
          Export full management spreadsheets, inventory valuation registers, expense audit logs, and VAT records.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* P&L Report */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 flex flex-col justify-between hover:border-[#D4AF37] transition">
          <div className="space-y-2">
            <div className="p-3 bg-[#D4AF37]/10 text-[#8C6D23] rounded-xl w-fit">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-950">Statement of Profit & Loss</h3>
            <p className="text-xs text-gray-500">
              Complete breakdown of gross product sales, discounts, realized COGS, logistics contribution, and operating overhead.
            </p>
          </div>
          <button
            onClick={() => downloadReport('pnl')}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-[#D4AF37]" />
            <span>Download CSV Spreadsheet</span>
          </button>
        </div>

        {/* Inventory Valuation */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 flex flex-col justify-between hover:border-[#D4AF37] transition">
          <div className="space-y-2">
            <div className="p-3 bg-blue-50 text-blue-700 rounded-xl w-fit">
              <Boxes className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-950">Inventory Valuation Register</h3>
            <p className="text-xs text-gray-500">
              SKU-level valuation at weighted-average acquisition cost, on-hand units, reserved stock, and potential retail gross margin.
            </p>
          </div>
          <button
            onClick={() => downloadReport('inventory')}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-[#D4AF37]" />
            <span>Download Inventory Valuation CSV</span>
          </button>
        </div>

        {/* Expense Ledger */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 flex flex-col justify-between hover:border-[#D4AF37] transition">
          <div className="space-y-2">
            <div className="p-3 bg-red-50 text-red-700 rounded-xl w-fit">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-950">Operating Expense Register</h3>
            <p className="text-xs text-gray-500">
              Complete dated transactions of marketing spend, packaging purchases, team salaries, and office overhead.
            </p>
          </div>
          <button
            onClick={() => downloadReport('expenses')}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-[#D4AF37]" />
            <span>Download Expenses CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
}
