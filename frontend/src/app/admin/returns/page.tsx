'use client';

import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Boxes,
  DollarSign,
  Search,
  Package,
} from 'lucide-react';
import { API_BASE_URL, authFetch } from '../../../utils/api-config';

export default function ReturnsManagementPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [reason, setReason] = useState('Customer Changed Mind');
  const [refundAmount, setRefundAmount] = useState(0);
  const [restockInventory, setRestockInventory] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/orders`);
      if (res.ok) {
        const all = await res.json();
        const returnOrders = (all || []).filter(
          (o: any) => o.status === 'RETURN_REQUESTED' || o.status === 'RETURNED' || o.status === 'REFUNDED',
        );
        setOrders(returnOrders);
      }
    } catch (e) {
      console.error('Error fetching returns:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleProcessReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setSubmitting(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/orders/${selectedOrder._id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason,
          refundAmount: Number(refundAmount) || 0,
          restocked: restockInventory,
        }),
      });

      if (res.ok) {
        setShowProcessModal(false);
        fetchReturns();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to process return');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6D23]">
            Reverse Logistics & Quality Assurance
          </span>
          <h1 className="text-2xl font-extrabold font-serif-luxury text-slate-950 mt-0.5">
            Returns & Refund Inspection ({orders.length})
          </h1>
          <p className="text-xs text-gray-500">
            Inspect returned luxury items for restockable vs damaged disposition, and issue customer refunds.
          </p>
        </div>

        <button
          onClick={fetchReturns}
          disabled={loading}
          className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Order ID & Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items to Return</th>
                <th className="py-3.5 px-4 text-right">Order Total</th>
                <th className="py-3.5 px-4 text-center">Return Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#D4AF37] mb-2" />
                    Loading returns...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No return requests or returned parcels pending inspection.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="py-3.5 px-4">
                      <p className="font-mono font-bold text-slate-950">{order.orderId}</p>
                      <p className="text-[10px] text-gray-400 font-mono">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{order.customerDetails?.name}</p>
                      <p className="text-gray-500 font-mono text-[11px]">{order.customerDetails?.mobile}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        {order.items?.map((item: any, i: number) => (
                          <p key={i} className="text-gray-700">
                            {item.quantity}x {item.productName} ({item.sku})
                          </p>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-950">
                      ৳{(order.totalAmount || 0).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 bg-purple-50 text-purple-800 rounded-full font-bold text-[10px] uppercase tracking-wider">
                        {order.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {order.status === 'RETURN_REQUESTED' ? (
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setRefundAmount(order.paidAmount || order.totalAmount);
                            setShowProcessModal(true);
                          }}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition shadow-sm"
                        >
                          Inspect & Refund
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-semibold">
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROCESS RETURN MODAL */}
      {showProcessModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold font-serif-luxury text-slate-950">
              Inspect & Process Return ({selectedOrder.orderId})
            </h3>

            <form onSubmit={handleProcessReturn} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Return Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl outline-none"
                >
                  <option value="Customer Changed Mind">Customer Changed Mind</option>
                  <option value="Wrong Size / Fitting Issue">Wrong Size / Fitting Issue</option>
                  <option value="Fabric Defect / Damaged in Transit">Fabric Defect / Damaged in Transit</option>
                  <option value="Undelivered by Courier (RTO)">Undelivered by Courier (RTO)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Refund Amount to Customer (BDT)</label>
                <input
                  type="number"
                  min="0"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl outline-none font-mono text-sm font-bold"
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={restockInventory}
                    onChange={(e) => setRestockInventory(e.target.checked)}
                    className="rounded text-slate-900"
                  />
                  <span className="font-bold text-slate-900">
                    Restock items back into inventory (Mint Condition)
                  </span>
                </label>
                <p className="text-[11px] text-gray-500 mt-1 pl-6">
                  Uncheck if item is damaged/unsellable to write off as damage loss in P&L.
                </p>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowProcessModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-800 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-slate-900 text-white font-bold rounded-xl"
                >
                  {submitting ? 'Processing...' : 'Confirm Return & Restock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
