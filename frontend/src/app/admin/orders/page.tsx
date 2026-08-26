'use client';

import React, { useState, useEffect } from 'react';
import PrintManagerModal, { PrintMode } from '../../../components/print-manager-modal';
import PathaoBookingModal from '../../../components/pathao-booking-modal';
import QrModal from '../../../components/qr-modal';
import { buildOrderTrackingQrUrl } from '../../../utils/qr-generator';
import { API_BASE_URL, authFetch } from '../../../utils/api-config';
import {
  Package,
  Search,
  Printer,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  AlertCircle,
  RefreshCw,
  X,
  ShieldCheck,
  Check,
  Smartphone,
  QrCode,
  Download,
  History,
  Loader2,
  ChevronDown,
  FileText,
  Tag,
  ExternalLink,
} from 'lucide-react';

const STATUS_OPTIONS = [
  'ALL',
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'PACKED',
  'COURIER_BOOKED',
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Selected Order for Drawer / Action
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Pathao Booking Modal
  const [showPathaoModal, setShowPathaoModal] = useState(false);
  const [bookingOrder, setBookingOrder] = useState<any>(null);

  // Print Modal
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printOrdersList, setPrintOrdersList] = useState<any[]>([]);
  const [printMode, setPrintMode] = useState<PrintMode>('INVOICE');

  // QR Modal
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrOrder, setQrOrder] = useState<any>(null);
  const [qrPayload, setQrPayload] = useState<string>('');

  const handleGenerateQr = async (order: any) => {
    setActiveOrder(order);
    setQrOrder(order);
    setQrPayload(`AV1:F:${order._id}`);
    setShowQrModal(true);

    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/qr/orders/${order._id}/fulfillment`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.payload) {
          setQrPayload(data.payload);
        }
      }
    } catch (e) {
      console.error('Error issuing order QR:', e);
    }
  };

  // Return Processing Modal
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('Customer Changed Mind');
  const [refundAmount, setRefundAmount] = useState(0);
  const [restockInventory, setRestockInventory] = useState(true);
  const [processingReturn, setProcessingReturn] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'ALL') params.set('status', statusFilter);
      if (search) params.set('search', search);

      const res = await authFetch(`${API_BASE_URL}/api/admin/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data || []);
      }
    } catch (e) {
      console.error('Error fetching orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, search]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchOrders();
        if (activeOrder && activeOrder._id === id) {
          setActiveOrder({ ...activeOrder, status: newStatus });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSyncPathaoStatus = async (orderId: string) => {
    setUpdatingId(orderId);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/courier/pathao/orders/${orderId}/sync`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Pathao Status Synced: ${data.pathaoStatus} (Order Status: ${data.orderStatus})`);
        fetchOrders();
      } else {
        const err = await res.json();
        alert(`Pathao Sync: ${err.message || 'Could not sync status'}`);
      }
    } catch (e) {
      console.error('Pathao sync error:', e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenPrint = (targetOrders: any[], mode: PrintMode = 'INVOICE') => {
    setPrintOrdersList(targetOrders);
    setPrintMode(mode);
    setShowPrintModal(true);
  };

  const handleProcessReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;

    setProcessingReturn(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/orders/${activeOrder._id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: returnReason,
          refundAmount: Number(refundAmount) || 0,
          restocked: restockInventory,
        }),
      });
      if (res.ok) {
        setShowReturnModal(false);
        fetchOrders();
      }
    } catch (e) {
      console.error('Error processing return:', e);
    } finally {
      setProcessingReturn(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map((o) => o._id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6D23]">
            AVELORA Commerce Operations
          </span>
          <h1 className="text-2xl font-extrabold font-serif-luxury text-slate-950 mt-0.5">
            Orders Workspace ({orders.length})
          </h1>
          <p className="text-xs text-gray-500">
            Real-time fulfillment, 1-click Pathao dispatch, customer snapshots, and multi-format printing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs">
              <span className="font-bold">{selectedIds.length} Selected</span>
              <button
                onClick={() => {
                  const selectedOrders = orders.filter((o) => selectedIds.includes(o._id));
                  handleOpenPrint(selectedOrders, 'INVOICE');
                }}
                className="px-2 py-1 bg-[#D4AF37] text-slate-950 font-bold rounded-lg text-[11px] hover:bg-[#b58f44] ml-2"
              >
                Batch Print Invoices
              </button>
              <button
                onClick={() => {
                  const selectedOrders = orders.filter((o) => selectedIds.includes(o._id));
                  handleOpenPrint(selectedOrders, 'SHIPPING_LABEL');
                }}
                className="px-2 py-1 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg text-[11px]"
              >
                Labels
              </button>
            </div>
          )}

          <button
            onClick={fetchOrders}
            disabled={loading}
            className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search Order ID, recipient mobile, name, TrxID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#D4AF37] text-xs text-gray-900 bg-gray-50"
            />
          </div>

          <div className="text-xs text-gray-500 font-medium">
            Showing <span className="font-bold text-slate-900">{orders.length}</span> orders
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider transition ${
                statusFilter === status
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3.5 px-4 w-8">
                  <input
                    type="checkbox"
                    checked={orders.length > 0 && selectedIds.length === orders.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-slate-900"
                  />
                </th>
                <th className="py-3.5 px-4">Order ID & Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4 text-right">Financials (BDT)</th>
                <th className="py-3.5 px-4 text-center">Fulfillment Status</th>
                <th className="py-3.5 px-4 text-center">Courier / Dispatch</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#D4AF37] mb-2" />
                    Loading authoritative orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const isSelected = selectedIds.includes(order._id);
                  const isUpdating = updatingId === order._id;
                  const isDelivered = order.status === 'DELIVERED';
                  const isShipped = order.status === 'SHIPPED';
                  const isPending = order.status === 'PENDING';

                  return (
                    <tr
                      key={order._id}
                      className={`hover:bg-gray-50/80 transition ${
                        isSelected ? 'bg-[#D4AF37]/5' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(order._id)}
                          className="rounded border-gray-300 text-slate-900"
                        />
                      </td>

                      {/* Order ID & Date */}
                      <td className="py-3.5 px-4">
                        <p className="font-mono font-bold text-slate-950 text-xs">
                          {order.orderId}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>

                      {/* Customer Snapshot */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{order.customerDetails?.name || 'Customer'}</p>
                        <p className="text-gray-500 font-mono text-[11px]">{order.customerDetails?.mobile}</p>
                        <p className="text-[10px] text-gray-400 truncate max-w-[160px]">
                          {order.customerDetails?.district || 'Dhaka'}
                        </p>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          {order.items?.map((item: any, i: number) => (
                            <p key={i} className="text-gray-700 truncate max-w-[180px]">
                              <span className="font-semibold text-slate-950">{item.quantity}x</span> {item.productName}
                              <span className="text-[10px] text-gray-400 font-mono"> ({item.sku})</span>
                            </p>
                          ))}
                        </div>
                      </td>

                      {/* Financials & COD Balance */}
                      <td className="py-3.5 px-4 text-right font-mono">
                        <p className="font-bold text-slate-950">৳{(order.totalAmount || 0).toLocaleString()}</p>
                        <div className="text-[10px] space-y-0.5 mt-0.5">
                          <p className="text-emerald-700 font-medium">
                            Paid: ৳{(order.paidAmount || (order.paymentMethod === 'COD' ? order.deliveryCharge : order.totalAmount) || 0).toLocaleString()}
                          </p>
                          <p className="text-amber-800 font-bold">
                            COD: ৳{(order.dueAmount !== undefined ? order.dueAmount : (order.paymentMethod === 'COD' ? order.subtotal : 0) || 0).toLocaleString()}
                          </p>
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4 text-center">
                        <select
                          value={order.status}
                          disabled={isUpdating}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider outline-none border transition ${
                            order.status === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : order.status === 'SHIPPED'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : order.status === 'COURIER_BOOKED'
                              ? 'bg-sky-50 text-sky-800 border-sky-300'
                              : order.status === 'CONFIRMED' || order.status === 'PROCESSING' || order.status === 'PACKED'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : order.status === 'CANCELLED' || order.status === 'RETURNED'
                              ? 'bg-red-50 text-red-800 border-red-300'
                              : 'bg-gray-100 text-gray-800 border-gray-300'
                          }`}
                        >
                          {STATUS_OPTIONS.filter((s) => s !== 'ALL').map((st) => (
                            <option key={st} value={st}>
                              {st.replace(/_/g, ' ')}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Courier Dispatch Cell */}
                      <td className="py-3.5 px-4 text-center">
                        {order.courier?.consignmentId ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 font-mono">
                              <Truck className="w-3 h-3 text-slate-700" />
                              {order.courier.provider}: {order.courier.consignmentId}
                            </span>

                            {order.courier?.settlementStatus && order.paymentMethod === 'COD' && (
                              <span className="block text-[8px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 uppercase">
                                COD: {order.courier.settlementStatus.replace(/_/g, ' ')}
                              </span>
                            )}

                            {order.courier?.provider === 'Pathao' && (
                              <button
                                onClick={() => handleSyncPathaoStatus(order._id)}
                                disabled={isUpdating}
                                className="block mx-auto text-[9px] text-blue-600 hover:text-blue-800 font-semibold"
                              >
                                Sync Status ↻
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setBookingOrder(order);
                              setShowPathaoModal(true);
                            }}
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-[10px] font-bold uppercase tracking-wider transition flex items-center gap-1 mx-auto"
                          >
                            <Truck className="w-3 h-3" />
                            <span>Book Courier</span>
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Print Dropdown */}
                          <button
                            onClick={() => handleOpenPrint([order], 'INVOICE')}
                            className="p-1.5 bg-gray-100 hover:bg-[#D4AF37] hover:text-slate-950 text-gray-700 rounded-lg transition"
                            title="Print Tax Invoice"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenPrint([order], 'SHIPPING_LABEL')}
                            className="p-1.5 bg-gray-100 hover:bg-slate-900 hover:text-white text-gray-700 rounded-lg transition"
                            title="Print Shipping Label"
                          >
                            <Tag className="w-3.5 h-3.5" />
                          </button>

                          {/* QR Code */}
                          <button
                            onClick={() => handleGenerateQr(order)}
                            className="p-1.5 bg-gray-100 hover:bg-slate-900 hover:text-white text-gray-700 rounded-lg transition"
                            title="Generate Dispatch QR"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>

                          {/* View Details Drawer */}
                          <button
                            onClick={() => {
                              setActiveOrder(order);
                              setShowDrawer(true);
                            }}
                            className="p-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
                            title="View Full Order Snapshot"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAILS DRAWER */}
      {showDrawer && activeOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl p-6 overflow-y-auto space-y-6 border-l border-gray-200 animate-slideLeft">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6D23]">
                  Order Snapshot
                </span>
                <h3 className="text-xl font-bold font-mono text-slate-950">{activeOrder.orderId}</h3>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                className="p-2 text-gray-400 hover:text-slate-900 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-1.5">
              <p className="font-bold uppercase tracking-wider text-[10px] text-gray-500">Customer Details</p>
              <p className="text-sm font-bold text-slate-900">{activeOrder.customerDetails?.name}</p>
              <p className="font-mono text-gray-700">Phone: {activeOrder.customerDetails?.mobile}</p>
              <p className="text-gray-600">Address: {activeOrder.customerDetails?.address}</p>
              <p className="text-gray-800 font-medium">District: {activeOrder.customerDetails?.district || 'Dhaka'}</p>
            </div>

            {/* Items with Unit Price & Cost Snapshot */}
            <div className="space-y-3">
              <p className="font-bold uppercase tracking-wider text-[10px] text-gray-500">Ordered Products</p>
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden">
                {activeOrder.items?.map((item: any, i: number) => (
                  <div key={i} className="p-3 bg-white flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{item.productName}</p>
                      <p className="text-[11px] text-gray-500 font-mono">
                        SKU: {item.sku} {item.variant ? `(${item.variant})` : ''}
                      </p>
                      <p className="text-[10px] text-gray-400">Unit COGS Cost: ৳{(item.costPrice || 0).toLocaleString()}</p>
                    </div>
                    <div className="text-right font-mono">
                      <p className="font-bold text-slate-900">
                        {item.quantity} × ৳{(item.unitPrice || 0).toLocaleString()}
                      </p>
                      <p className="text-[11px] text-gray-500 font-bold">
                        ৳{((item.unitPrice || 0) * (item.quantity || 1)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Ledger Breakdown */}
            <div className="p-4 bg-slate-950 text-white rounded-2xl space-y-2 text-xs font-mono">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal:</span>
                <span>৳{(activeOrder.subtotal || 0).toLocaleString()}</span>
              </div>
              {activeOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount:</span>
                  <span>-৳{activeOrder.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-300">
                <span>Delivery Fee:</span>
                <span>৳{(activeOrder.deliveryCharge || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#D4AF37] pt-2 border-t border-gray-800">
                <span>Total Amount:</span>
                <span>৳{(activeOrder.totalAmount || 0).toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-dashed border-gray-800 flex justify-between text-amber-300 font-bold">
                <span>Cash Due on Delivery:</span>
                <span>৳{(activeOrder.dueAmount !== undefined ? activeOrder.dueAmount : activeOrder.subtotal || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Print & Action Buttons in Drawer */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => handleOpenPrint([activeOrder], 'INVOICE')}
                className="py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-[#D4AF37]" />
                Tax Invoice
              </button>

              <button
                onClick={() => handleOpenPrint([activeOrder], 'PACKING_SLIP')}
                className="py-2.5 bg-gray-100 text-slate-900 font-bold rounded-xl text-xs hover:bg-gray-200 transition flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                Packing Slip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR MODAL */}
      {showQrModal && qrOrder && (
        <QrModal
          isOpen={showQrModal}
          onClose={() => {
            setShowQrModal(false);
            setQrOrder(null);
          }}
          title={`Order Dispatch • ${qrOrder.orderId}`}
          subtitle={`Customer: ${qrOrder.customerDetails?.name || 'Customer'} • Phone: ${qrOrder.customerDetails?.mobile || 'N/A'}`}
          badge="SECURE ONE-TIME FULFILLMENT QR"
          payload={qrPayload || `AV1:F:${qrOrder._id}`}
          displayCode={qrOrder.orderId}
          filenamePrefix={`AVELORA-Order-${qrOrder.orderId}`}
          purposeDescription="Secure one-time fulfillment QR token. When scanned at the dispatch station, enables instant status fulfillment with cryptographic double-scan protection."
        />
      )}

      {/* PATHAO BOOKING MODAL */}
      {showPathaoModal && bookingOrder && (
        <PathaoBookingModal
          order={bookingOrder}
          isOpen={showPathaoModal}
          onClose={() => {
            setShowPathaoModal(false);
            setBookingOrder(null);
          }}
          onSuccess={() => {
            fetchOrders();
          }}
        />
      )}

      {/* PRINT MANAGER MODAL */}
      {showPrintModal && (
        <PrintManagerModal
          orders={printOrdersList}
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          defaultMode={printMode}
        />
      )}
    </div>
  );
}
