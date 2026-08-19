'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  TrendingUp,
  Trash2,
  Calendar,
  Filter,
  RefreshCw,
  X,
  PieChart,
} from 'lucide-react';
import { API_BASE_URL, authFetch } from '../../../utils/api-config';

const EXPENSE_CATEGORIES = [
  'Delivery Cost',
  'Packaging Cost',
  'Payment Fee',
  'Marketing Expense',
  'Other Operating Expense',
];

export default function AdminFinancePage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set('category', selectedCategory);

      const [expRes, anaRes] = await Promise.all([
        authFetch(`${API_BASE_URL}/api/admin/finance/expenses?${params.toString()}`),
        authFetch(`${API_BASE_URL}/api/admin/finance/analytics`),
      ]);

      if (expRes.ok) {
        const expData = await expRes.json();
        setExpenses(expData || []);
      }
      if (anaRes.ok) {
        const anaData = await anaRes.json();
        setAnalytics(anaData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) {
      setError('Please provide a valid title and positive expense amount.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/finance/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category,
          amount: Number(amount),
          date,
          description: description.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to record expense');
      }

      setIsModalOpen(false);
      setTitle('');
      setAmount(0);
      setDescription('');
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Error recording expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, expTitle: string) => {
    if (!confirm(`Delete expense "${expTitle}"?`)) return;

    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/finance/expenses/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const summary = analytics?.summary || {
    totalRevenue: 0,
    grossProfit: 0,
    grossProfitMargin: '0',
    totalExpenses: 0,
    netProfit: 0,
    netProfitMargin: '0',
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#997B21]">
            Business Ledger & Profitability
          </span>
          <h1 className="text-2xl font-bold font-serif-luxury text-gray-900">
            Expenses & Net Profit Engine
          </h1>
          <p className="text-xs text-gray-500">
            Track operational expenditures to compute authentic Net Profit (Gross Profit - Total Expenses).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-slate-950 hover:bg-[#C5A059] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Expense</span>
        </button>
      </div>

      {/* Financial Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Gross Profit</span>
          <h3 className="text-2xl font-bold font-mono text-emerald-700">
            ৳{summary.grossProfit?.toLocaleString()}
          </h3>
          <p className="text-[11px] text-gray-500">Sales revenue minus item cost of goods (COGS)</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Business Expenses</span>
          <h3 className="text-2xl font-bold font-mono text-red-600">
            ৳{summary.totalExpenses?.toLocaleString()}
          </h3>
          <p className="text-[11px] text-gray-500">{expenses.length} expense entries recorded</p>
        </div>

        <div className="bg-slate-950 text-white p-6 rounded-2xl border border-[#D4AF37]/30 shadow-lg space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E6CA85]">Authentic Net Profit</span>
          <h3 className="text-2xl font-bold font-mono text-[#E6CA85]">
            ৳{summary.netProfit?.toLocaleString()}
          </h3>
          <p className="text-[11px] text-gray-400">Net Profit Margin: {summary.netProfitMargin}%</p>
        </div>
      </div>

      {/* Expense Filter Tabs */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition whitespace-nowrap ${
              selectedCategory === '' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Categories ({expenses.length})
          </button>
          {EXPENSE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition whitespace-nowrap ${
                selectedCategory === cat ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={fetchData}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">Loading expense ledger...</div>
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">No expenses recorded in this category.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 bg-gray-50">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Expense Title & Note</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Amount (BDT)</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {expenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-gray-50/60">
                    <td className="py-3.5 px-4 font-mono text-gray-500">
                      {new Date(exp.date).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-gray-900">{exp.title}</p>
                      {exp.description && <p className="text-[11px] text-gray-400 mt-0.5">{exp.description}</p>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-800 border">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-red-600 text-sm">
                      ৳{exp.amount?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(exp._id, exp.title)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="p-6 bg-slate-950 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-serif-luxury text-[#E6CA85]">
                  Record Business Expense
                </h3>
                <p className="text-xs text-gray-400">Deducts automatically from Net Profit calculations</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="p-6 space-y-4 text-xs text-gray-700">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold uppercase text-gray-900">Expense Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Custom luxury bag production batch"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold uppercase text-gray-900">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white font-semibold"
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase text-gray-900">Amount (৳) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white font-mono font-bold text-gray-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase text-gray-900">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase text-gray-900">Description / Receipt Note</label>
                <textarea
                  rows={2}
                  placeholder="Vendor name, voucher number, or purpose..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-300 bg-white"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold uppercase rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-slate-950 hover:bg-[#C5A059] text-white font-bold uppercase rounded-lg shadow disabled:opacity-50"
                >
                  {submitting ? 'Recording...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
