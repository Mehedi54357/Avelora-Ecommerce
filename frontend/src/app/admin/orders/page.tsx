'use client';

import React, { useState, useEffect } from 'react';
import InvoiceModal from '../../../components/invoice-modal';
import { API_BASE_URL } from '../../../utils/api-config';
import {
  Package,
  Search,
  Printer,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  RotateCcw,
  AlertCircle,
  RefreshCw,
  X,
  ShieldCheck,
  Check,
  Smartphone,
} from 'lucide-react';

const STATUS_OPTIONS = [
  'ALL',
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'RETURN_REQUESTED',
  'RETURNED',
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Selected Order for Modal / Invoice
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'ALL') params.set('status', statusFilter);
      if (search) params.set('search', search);

      const res = await fetch(`${API_BASE_URL}/api/admin/orders?${params.toString()}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data || []);
      }
    } catch (e) {
      console.error('Error fetching admin orders', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, search]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchOrders();
      }
    } catch (e) {
      console.error('Error updating status', e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleVerifyPayment = async (orderId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'PAID' ? 'PENDING' : 'PAID';
    setUpdatingId(orderId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ paymentStatus: nextStatus }),
      });

      if (res.ok) {
        fetchOrders();
      }
    } catch (e) {
      console.error('Error verifying payment', e);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#997B21]">
            Bangladesh Logistics & Payment Cockpit
          </span>
          <h1 className="text-2xl font-bold font-serif-luxury text-gray-900">
            Order Fulfillment & Verification ({orders.length})
          </h1>
          <p className="text-xs text-gray-500">
            Verify bKash / Nagad advance delivery payments, track COD balances, and manage dispatch timelines.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold uppercase tracking-wider rounded-xl transition flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Status Filter Tabs & Search */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search Order ID, recipient name, phone, TrxID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#C5A059] text-xs text-gray-900 bg-gray-50"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2 border-t border-gray-100">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-slate-900 text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">No orders match current filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 bg-gray-50">
                  <th className="py-3.5 px-4">Order ID & Date</th>
                  <th className="py-3.5 px-4">Recipient & District</th>
                  <th className="py-3.5 px-4">Payment & TrxID</th>
                  <th className="py-3.5 px-4">Paid (Advance)</th>
                  <th className="py-3.5 px-4">Due on Delivery</th>
                  <th className="py-3.5 px-4">Order Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {orders.map((order) => {
                  const paid = order.paidAmount !== undefined ? order.paidAmount : (order.paymentMethod === 'COD' ? order.deliveryCharge : order.totalAmount);
                  const due = order.dueAmount !== undefined ? order.dueAmount : (order.paymentMethod === 'COD' ? order.subtotal : 0);

                  return (
                    <tr key={order._id} className="hover:bg-gray-50/60">
                      <td className="py-3.5 px-4">
                        <p className="font-bold font-mono text-gray-900">{order.orderId}</p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-gray-900">{order.customerDetails?.name}</p>
                        <p className="text-[11px] text-gray-500 font-mono">{order.customerDetails?.mobile}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-medium">
                          {order.customerDetails?.district}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-gray-800">
                            {order.paymentMethod === 'COD' ? 'COD (Advance)' : order.paymentMethod}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            order.paymentProvider === 'bKash' ? 'bg-[#E2136E]/10 text-[#E2136E]' : 'bg-[#F7921E]/10 text-[#F7921E]'
                          }`}>
                            {order.paymentProvider || 'bKash'}
                          </span>
                        </div>
                        {order.transactionId && (
                          <p className="text-[10px] font-mono text-gray-500 mt-0.5">
                            TrxID: <strong className="text-gray-700">{order.transactionId}</strong>
                          </p>
                        )}
                        {order.senderMobile && (
                          <p className="text-[10px] font-mono text-gray-400">
                            From: {order.senderMobile}
                          </p>
                        )}
                        <button
                          onClick={() => handleVerifyPayment(order._id, order.paymentStatus)}
                          disabled={updatingId === order._id}
                          className={`mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded border transition flex items-center gap-1 ${
                            order.paymentStatus === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                          }`}
                        >
                          {order.paymentStatus === 'PAID' ? <Check className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                          <span>{order.paymentStatus === 'PAID' ? 'Payment Verified' : 'Verify Payment'}</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                        ৳{paid?.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-amber-800">
                        ৳{due?.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={order.status}
                          disabled={updatingId === order._id}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold bg-white text-gray-800 focus:outline-none focus:border-[#C5A059]"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED (Restores Stock)</option>
                          <option value="RETURN_REQUESTED">RETURN REQUESTED</option>
                          <option value="RETURNED">RETURNED (Restores Stock)</option>
                          <option value="REFUNDED">REFUNDED</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDetailsModal(true);
                          }}
                          className="p-1.5 text-gray-600 hover:text-slate-950 hover:bg-gray-100 rounded transition"
                          title="View Snapshot Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowInvoiceModal(true);
                          }}
                          className="p-1.5 text-[#997B21] hover:text-slate-950 hover:bg-[#D4AF37]/10 rounded transition"
                          title="Print Invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Snapshot Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="p-6 bg-slate-950 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-serif-luxury text-[#E6CA85]">
                  Order Details #{selectedOrder.orderId}
                </h3>
                <p className="text-xs text-gray-400">Complete recipient, item snapshots & payment verification</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs text-gray-700">
              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <p className="font-bold text-gray-900 uppercase">Customer & Delivery Details:</p>
                <p className="mt-1 text-sm font-semibold">{selectedOrder.customerDetails?.name}</p>
                <p className="font-mono text-gray-600">{selectedOrder.customerDetails?.mobile}</p>
                <p className="mt-1 text-gray-600">{selectedOrder.customerDetails?.address}, {selectedOrder.customerDetails?.district}</p>
                {selectedOrder.notes && (
                  <p className="mt-2 text-gray-500 italic bg-white p-2 rounded border">Notes: "{selectedOrder.notes}"</p>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <p className="font-bold text-gray-900 uppercase">Ordered Pieces:</p>
                <div className="divide-y divide-gray-100">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.productImage || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=100&q=80'}
                          alt={item.productName}
                          className="w-10 h-12 object-cover rounded border"
                        />
                        <div>
                          <p className="font-bold text-gray-900">{item.productName}</p>
                          <p className="text-[11px] text-gray-500 font-mono">
                            {item.variant} • SKU: {item.sku}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            Unit Price: ৳{item.unitPrice?.toLocaleString()} | Unit Cost (COGS): ৳{item.costPrice?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold font-mono">Qty: {item.quantity}</p>
                        <p className="font-mono font-bold text-gray-900">
                          ৳{((item.unitPrice || 0) * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Calculation */}
              <div className="bg-[#FAF7F0] p-4 rounded-xl border border-gray-200 space-y-1.5">
                <div className="flex justify-between">
                  <span>Bag Subtotal:</span>
                  <span className="font-mono font-semibold">৳{selectedOrder.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge:</span>
                  <span className="font-mono font-semibold">৳{selectedOrder.deliveryCharge?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Grand Total:</span>
                  <span className="font-mono text-base">৳{selectedOrder.totalAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-800 font-semibold pt-1 border-t border-dashed">
                  <span>Advance Paid ({selectedOrder.paymentProvider || selectedOrder.paymentMethod}):</span>
                  <span className="font-mono">৳{(selectedOrder.paidAmount || (selectedOrder.paymentMethod === 'COD' ? selectedOrder.deliveryCharge : selectedOrder.totalAmount) || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-amber-800 font-semibold">
                  <span>Cash Due on Delivery:</span>
                  <span className="font-mono">৳{(selectedOrder.dueAmount || (selectedOrder.paymentMethod === 'COD' ? selectedOrder.subtotal : 0) || 0).toLocaleString()}</span>
                </div>
                {selectedOrder.transactionId && (
                  <p className="text-[11px] text-gray-600 font-mono pt-1">
                    TrxID: <strong>{selectedOrder.transactionId}</strong> • Sender Mobile: <strong>{selectedOrder.senderMobile || 'N/A'}</strong>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      <InvoiceModal
        order={selectedOrder}
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
      />
    </div>
  );
}
