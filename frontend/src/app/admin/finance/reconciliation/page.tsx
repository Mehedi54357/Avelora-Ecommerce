'use client';

import React, { useState, useEffect } from 'react';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Truck,
  CreditCard,
  Building2,
  DollarSign,
  FileSpreadsheet,
} from 'lucide-react';
import { API_BASE_URL, authFetch } from '../../../../utils/api-config';

export default function ReconciliationPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReconciliation = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/finance/reconciliation`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (e) {
      console.error('Error fetching reconciliation:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReconciliation();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" />
        <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">
          Reconciling Gateway & Courier COD Statements...
        </p>
      </div>
    );
  }

  const c = data?.courierReconciliation || {};
  const g = data?.gatewayReconciliation || {};

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6D23]">
            Audit & Remittance Verification
          </span>
          <h1 className="text-2xl font-extrabold font-serif-luxury text-slate-950 mt-0.5">
            Settlement Reconciliation
          </h1>
          <p className="text-xs text-gray-500">
            Verify Pathao Courier COD remittances and digital gateway settlements against order balances.
          </p>
        </div>

        <button
          onClick={fetchReconciliation}
          disabled={loading}
          className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-xs text-gray-500 font-bold">
            <span>Delivered COD Due</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-950 font-mono">
            ৳{(c.totalDeliveredCodDue || 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400">{c.deliveredCodOrdersCount || 0} delivered COD orders</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-xs text-gray-500 font-bold">
            <span>Remitted by Couriers</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 font-mono">
            ৳{(c.totalSettledByCourier || 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400">Fees Deducted: ৳{(c.totalCourierFeesDeducted || 0).toLocaleString()}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-xs text-gray-500 font-bold">
            <span>Outstanding Receivable</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700 font-mono">
            ৳{(c.outstandingCodReceivable || 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400">Pending courier bank disbursement</p>
        </div>
      </div>

      {/* Settlement Batches Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-slate-900">Courier Settlement Batches</h3>
            <p className="text-xs text-gray-500">Official remittance statements from Pathao and other couriers</p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
            System Synchronized
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Batch ID & Date</th>
                <th className="py-3.5 px-4">Courier Provider</th>
                <th className="py-3.5 px-4 text-right">COD Collected</th>
                <th className="py-3.5 px-4 text-right">Fees Deducted</th>
                <th className="py-3.5 px-4 text-right">Net Remitted</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono">
              {!c.settlementBatches || c.settlementBatches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 font-sans">
                    No courier settlement batches uploaded yet. Pathao automated payouts will appear here upon settlement sync.
                  </td>
                </tr>
              ) : (
                c.settlementBatches.map((b: any) => (
                  <tr key={b._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{b.settlementBatchId}</p>
                      <p className="text-[10px] text-gray-400">{new Date(b.settledAt).toLocaleDateString()}</p>
                    </td>
                    <td className="py-3 px-4 font-sans font-bold text-slate-900">{b.provider}</td>
                    <td className="py-3 px-4 text-right">৳{(b.totalCodCollected || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-red-600">-৳{(b.totalFeesDeducted || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700">৳{(b.totalNetRemitted || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800">
                        {b.overallStatus || 'MATCHED'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
