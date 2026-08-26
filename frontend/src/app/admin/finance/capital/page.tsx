'use client';

import React, { useState, useEffect } from 'react';
import {
  Landmark,
  Plus,
  Boxes,
  Wallet,
  Scale,
  RefreshCw,
  Loader2,
  X,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
} from 'lucide-react';
import { API_BASE_URL, authFetch } from '../../../../utils/api-config';

export default function CapitalAndAssetsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [txType, setTxType] = useState('OWNER_CAPITAL_IN');
  const [txAmount, setTxAmount] = useState(50000);
  const [txSource, setTxSource] = useState('Owner');
  const [txAccount, setTxAccount] = useState('Bank Account');
  const [txRef, setTxRef] = useState('');
  const [txNotes, setTxNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, anaRes, txRes] = await Promise.all([
        authFetch(`${API_BASE_URL}/api/admin/capital/summary`),
        authFetch(`${API_BASE_URL}/api/admin/finance/analytics`),
        authFetch(`${API_BASE_URL}/api/admin/capital/transactions`),
      ]);

      if (sumRes.ok) setSummary(await sumRes.json());
      if (anaRes.ok) setAnalytics(await anaRes.json());
      if (txRes.ok) setTransactions(await txRes.json());
    } catch (e) {
      console.error('Error fetching capital data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAmount || txAmount <= 0) return;

    setSubmitting(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/capital/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: txType,
          amount: Number(txAmount),
          source: txSource,
          account: txAccount,
          reference: txRef,
          notes: txNotes,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setTxRef('');
        setTxNotes('');
        fetchData();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to record transaction');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTx = async (id: string) => {
    if (!confirm('Are you sure you want to remove this capital transaction?')) return;
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/capital/transactions/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading && !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" />
        <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">
          Compiling Capital & Asset Balances...
        </p>
      </div>
    );
  }

  const s = analytics?.summary || {};
  const inventoryCost = s.inventoryValueAtCost || 0;
  const liquidCash = s.cashCollected || 0;
  const codReceivable = s.codReceivable || 0;
  const totalAssets = inventoryCost + liquidCash + codReceivable;

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6D23]">
            Owner Equity & Balance Sheet Breakdown
          </span>
          <h1 className="text-2xl font-extrabold font-serif-luxury text-slate-950 mt-0.5">
            Capital & Asset Investment
          </h1>
          <p className="text-xs text-gray-500">
            Realized overview of where company wealth is deployed across inventory, liquid cash, and courier receivables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" />
            <span>Record Capital Event</span>
          </button>

          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* "WHERE YOUR MONEY IS" ASSET HERO COCKPIT */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Landmark className="w-4 h-4 text-[#8C6D23]" />
            Where Your Money Is (Total Capital Deployment: ৳{totalAssets.toLocaleString()})
          </h2>
          <span className="text-xs text-gray-500 font-mono">100% Tangible Asset Backed</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Asset 1: Inventory at Cost */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2 relative overflow-hidden">
            <div className="flex justify-between items-center text-xs font-bold text-gray-500">
              <span>Inventory Stock at Cost</span>
              <span className="p-1.5 bg-[#D4AF37]/10 text-[#8C6D23] rounded-lg">
                <Boxes className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-black text-slate-950 font-mono">
              ৳{inventoryCost.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              {totalAssets > 0 ? ((inventoryCost / totalAssets) * 100).toFixed(1) : 0}% of Total Asset Deployment
            </p>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                style={{ width: `${totalAssets > 0 ? (inventoryCost / totalAssets) * 100 : 0}%` }}
                className="bg-[#D4AF37] h-full"
              ></div>
            </div>
          </div>

          {/* Asset 2: Liquid Cash & Bank */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-gray-500">
              <span>Liquid Cash & Bank Reserves</span>
              <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                <Wallet className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-black text-slate-950 font-mono">
              ৳{liquidCash.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              {totalAssets > 0 ? ((liquidCash / totalAssets) * 100).toFixed(1) : 0}% Liquid Working Capital
            </p>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                style={{ width: `${totalAssets > 0 ? (liquidCash / totalAssets) * 100 : 0}%` }}
                className="bg-emerald-500 h-full"
              ></div>
            </div>
          </div>

          {/* Asset 3: Courier COD Receivables */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-gray-500">
              <span>Courier COD Receivables</span>
              <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
                <Scale className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-black text-slate-950 font-mono">
              ৳{codReceivable.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              {totalAssets > 0 ? ((codReceivable / totalAssets) * 100).toFixed(1) : 0}% In-Transit Delivery Due
            </p>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                style={{ width: `${totalAssets > 0 ? (codReceivable / totalAssets) * 100 : 0}%` }}
                className="bg-blue-500 h-full"
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* EQUITY & TRANSACTIONS LEDGER */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-slate-900">Owner Equity & Capital Transactions</h3>
            <p className="text-xs text-gray-500">History of capital injections, drawings, and debt repayments</p>
          </div>
          <span className="text-xs font-mono font-bold text-[#8C6D23]">
            Net Equity: ৳{(summary?.netCapital || 0).toLocaleString()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Transaction Type</th>
                <th className="py-3 px-4">Source / Partner</th>
                <th className="py-3 px-4">Account</th>
                <th className="py-3 px-4">Reference / Notes</th>
                <th className="py-3 px-4 text-right">Amount (BDT)</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No capital transactions recorded yet. Click "Record Capital Event" to log owner equity.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isIn = tx.type === 'OWNER_CAPITAL_IN' || tx.type === 'LOAN_IN';

                  return (
                    <tr key={tx._id} className="hover:bg-gray-50 transition font-mono">
                      <td className="py-3 px-4 text-gray-500">
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-sans font-bold text-slate-900">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            isIn ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                          }`}
                        >
                          {isIn ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          {tx.type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-800">{tx.source}</td>
                      <td className="py-3 px-4 font-sans text-gray-600">{tx.account}</td>
                      <td className="py-3 px-4 font-sans text-gray-500 text-[11px] truncate max-w-xs">
                        {tx.reference} {tx.notes ? `(${tx.notes})` : ''}
                      </td>
                      <td className={`py-3 px-4 text-right font-bold text-sm ${isIn ? 'text-emerald-700' : 'text-red-700'}`}>
                        {isIn ? '+' : '-'}৳{tx.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDeleteTx(tx._id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: RECORD CAPITAL EVENT */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <h3 className="text-base font-bold font-serif-luxury text-slate-950">Record Capital Event</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTx} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Transaction Type *</label>
                <select
                  value={txType}
                  onChange={(e) => setTxType(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl outline-none"
                >
                  <option value="OWNER_CAPITAL_IN">Owner Capital In (Equity Investment)</option>
                  <option value="OWNER_WITHDRAWAL">Owner Withdrawal (Drawings)</option>
                  <option value="LOAN_IN">Loan / Borrowed Capital In</option>
                  <option value="LOAN_REPAYMENT">Loan Principal Repayment</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Amount (BDT) *</label>
                <input
                  type="number"
                  min="1"
                  value={txAmount}
                  onChange={(e) => setTxAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl outline-none font-mono text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Investor / Source</label>
                  <input
                    type="text"
                    value={txSource}
                    onChange={(e) => setTxSource(e.target.value)}
                    placeholder="e.g. Managing Director"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Deposit Account</label>
                  <input
                    type="text"
                    value={txAccount}
                    onChange={(e) => setTxAccount(e.target.value)}
                    placeholder="e.g. City Bank / bKash"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Reference / Bank Slip No</label>
                <input
                  type="text"
                  value={txRef}
                  onChange={(e) => setTxRef(e.target.value)}
                  placeholder="e.g. CHEQUE-10294"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={txNotes}
                  onChange={(e) => setTxNotes(e.target.value)}
                  placeholder="e.g. Seasonal festive inventory purchase fund"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-800 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-slate-900 text-white font-bold rounded-xl"
                >
                  {submitting ? 'Recording...' : 'Save Capital Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
