'use client';

import React, { useState, useEffect } from 'react';
import {
  Boxes,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  RefreshCw,
  Search,
  CheckCircle,
  X,
  Lock,
} from 'lucide-react';

export default function AdminInventoryPage() {
  const [statusData, setStatusData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'STOCK' | 'LOGS'>('STOCK');
  const [search, setSearch] = useState('');

  // Stock Adjustment Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [quantityChange, setQuantityChange] = useState<number>(5);
  const [note, setNote] = useState('Manual restock');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statRes, transRes] = await Promise.all([
        fetch('http://localhost:3001/api/admin/inventory/status', { credentials: 'include' }),
        fetch('http://localhost:3001/api/admin/inventory/transactions?limit=100', { credentials: 'include' }),
      ]);

      if (statRes.ok) {
        const data = await statRes.json();
        setStatusData(data);
      }
      if (transRes.ok) {
        const tData = await transRes.json();
        setTransactions(tData || []);
      }
    } catch (e) {
      console.error('Error fetching inventory data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAdjustModal = (item: any) => {
    setSelectedItem(item);
    setQuantityChange(5);
    setNote('Restock batch received');
    setError('');
    setAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3001/api/admin/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          productId: selectedItem.productId,
          variantSku: selectedItem.sku,
          quantityChange: Number(quantityChange),
          note,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to adjust stock');
      }

      setAdjustModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to adjust stock');
    } finally {
      setSubmitting(false);
    }
  };

  const items = statusData?.items || [];
  const filteredItems = items.filter(
    (i: any) =>
      i.productName?.toLowerCase().includes(search.toLowerCase()) ||
      i.sku?.toLowerCase().includes(search.toLowerCase()) ||
      i.color?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#997B21]">
            Atomic Stock Control & Audit Ledger
          </span>
          <h1 className="text-2xl font-bold font-serif-luxury text-gray-900">
            Inventory & Stock Operations
          </h1>
          <p className="text-xs text-gray-500">
            Track Physical Stock, Active Reservations, Available Units, and Immutable Audit Transactions.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold uppercase tracking-wider rounded-lg transition flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold uppercase text-gray-500">Physical Stock On-Hand</p>
          <p className="text-2xl font-bold font-mono text-gray-900 mt-1">{statusData?.totalStockUnits || 0} units</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Total inventory in warehouse</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold uppercase text-gray-500">Active Order Reservations</p>
          <p className="text-2xl font-bold font-mono text-amber-600 mt-1">{statusData?.totalReservedUnits || 0} units</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Reserved by pending/in-transit orders</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold uppercase text-gray-500">Available to Sell</p>
          <p className="text-2xl font-bold font-mono text-emerald-700 mt-1">{statusData?.totalAvailableUnits || 0} units</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Physical minus active reservations</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold uppercase text-gray-500">Out of Stock Variants</p>
          <p className="text-2xl font-bold font-mono text-red-600 mt-1">{statusData?.outOfStockVariants || 0}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Requiring immediate restock</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('STOCK')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'STOCK' ? 'bg-slate-950 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Live Variant Stock Matrix ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('LOGS')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'LOGS' ? 'bg-slate-950 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Immutable Transaction Audit Logs ({transactions.length})
        </button>
      </div>

      {activeTab === 'STOCK' ? (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search by SKU or product title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#C5A059] text-xs text-gray-900 bg-white shadow-sm"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 bg-gray-50">
                    <th className="py-3 px-4">Product Piece</th>
                    <th className="py-3 px-4">Variant Details</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Selling Price</th>
                    <th className="py-3 px-4">COGS Cost</th>
                    <th className="py-3 px-4">Physical Stock</th>
                    <th className="py-3 px-4">Reserved</th>
                    <th className="py-3 px-4">Available</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Quick Restock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredItems.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50/60">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={item.productImage || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=80&q=80'}
                            alt={item.productName}
                            className="w-10 h-12 object-cover rounded border"
                          />
                          <p className="font-bold text-gray-900">{item.productName}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-700">
                        {item.color} {item.size ? `• ${item.size}` : ''}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-500 font-semibold">{item.sku}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-900">৳{item.price?.toLocaleString()}</td>
                      <td className="py-3.5 px-4 font-mono text-gray-500">৳{item.costPrice?.toLocaleString()}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                        {item.stockQuantity}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-amber-600">
                        {item.reservedQuantity > 0 ? `${item.reservedQuantity} locked` : '0'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-base text-emerald-700">
                        {item.availableStock}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.status === 'OUT_OF_STOCK'
                              ? 'bg-red-100 text-red-700'
                              : item.status === 'LOW_STOCK'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openAdjustModal(item)}
                          className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#C5A059] transition"
                        >
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Inventory Transaction Audit Logs */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 bg-gray-50">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">SKU / Product</th>
                  <th className="py-3 px-4">Movement</th>
                  <th className="py-3 px-4">Transaction Type</th>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Audit Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {transactions.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50/60">
                    <td className="py-3.5 px-4 text-gray-500 font-mono">
                      {new Date(t.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-gray-900">{t.productId?.name || 'Product'}</p>
                      <p className="font-mono text-[11px] text-gray-500">{t.variantSku}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span className={t.quantityChange > 0 ? 'text-emerald-600' : 'text-red-600'}>
                        {t.quantityChange > 0 ? `+${t.quantityChange}` : t.quantityChange} units
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        t.transactionType === 'RESERVE'
                          ? 'bg-amber-50 text-amber-700'
                          : t.transactionType === 'FULFILLMENT'
                          ? 'bg-blue-50 text-blue-700'
                          : t.transactionType === 'RELEASE_RESERVATION' || t.transactionType === 'RETURN'
                          ? 'bg-purple-50 text-purple-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {t.transactionType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-600">
                      {t.orderId ? `#${t.orderId}` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 italic">
                      {t.note || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="p-6 bg-slate-950 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-serif-luxury text-[#E6CA85]">
                  Adjust Inventory Stock
                </h3>
                <p className="text-xs text-gray-400 font-mono">{selectedItem.sku} • {selectedItem.productName}</p>
              </div>
              <button
                onClick={() => setAdjustModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="p-6 space-y-4 text-xs text-gray-700">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <div className="p-3 bg-gray-50 rounded-lg border flex justify-between items-center">
                <span>Current Physical Stock:</span>
                <span className="font-mono font-bold text-base text-gray-900">{selectedItem.stockQuantity} units</span>
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase text-gray-900">
                  Physical Stock Adjustment (positive to add, negative to deduct)
                </label>
                <input
                  type="number"
                  required
                  value={quantityChange}
                  onChange={(e) => setQuantityChange(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 font-mono text-base font-bold text-gray-900"
                />
                <p className="text-[11px] text-gray-400">
                  New physical stock will be: <strong className="text-gray-800">{selectedItem.stockQuantity + Number(quantityChange)}</strong> units
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase text-gray-900">Reason / Note</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New warehouse shipment batch #4"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-300"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold uppercase rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-slate-950 hover:bg-[#C5A059] text-white font-bold uppercase rounded-lg shadow disabled:opacity-50"
                >
                  {submitting ? 'Applying...' : 'Confirm Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
