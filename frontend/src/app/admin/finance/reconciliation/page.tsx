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
  Check,
  X,
  Clock,
  ArrowRight,
  ExternalLink,
  Edit2,
  Plus,
  Search,
} from 'lucide-react';
import { API_BASE_URL, authFetch } from '../../../../utils/api-config';

export default function ReconciliationPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Single Order Modal State
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  // Form Fields for Single Reconciliation
  const [actualSettlement, setActualSettlement] = useState<number>(0);
  const [courierFee, setCourierFee] = useState<number>(0);
  const [returnFee, setReturnFee] = useState<number>(0);
  const [settlementAccount, setSettlementAccount] = useState('BRAC Bank A/C 1002938');
  const [transactionRef, setTransactionRef] = useState('');
  const [settlementDate, setSettlementDate] = useState(new Date().toISOString().slice(0, 10));
  const [settlementStatus, setSettlementStatus] = useState('SETTLED');
  const [settlementNotes, setSettlementNotes] = useState('');

  // Bulk Import Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [bulkBatchId, setBulkBatchId] = useState(`SETTLE-PATHAO-${Date.now().toString().slice(-6)}`);
  const [bulkAccount, setBulkAccount] = useState('BRAC Bank A/C 1002938');
  const [bulkTrxRef, setBulkTrxRef] = useState('');
  const [savingBulk, setSavingBulk] = useState(false);
  const [bulkResult, setBulkResult] = useState<any>(null);

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

  const handleOpenReconcile = (order: any) => {
    setSelectedOrder(order);
    const expected = order.expectedSettlement || (order.codCollected - order.courierFee);
    setActualSettlement(order.actualSettlement || expected);
    setCourierFee(order.courierFee || 0);
    setReturnFee(order.returnFee || 0);
    setSettlementAccount(order.bankAccount || 'BRAC Bank A/C 1002938');
    setTransactionRef(order.transactionRef || `TRX-${Date.now().toString().slice(-6)}`);
    setSettlementDate(order.settlementDate ? new Date(order.settlementDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));
    setSettlementStatus(order.settlementStatus === 'AWAITING_SETTLEMENT' ? 'SETTLED' : order.settlementStatus);
    setSettlementNotes(order.discrepancyNote || '');
    setIsModalOpen(true);
  };

  const handleSaveSingleReconciliation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setSavingOrder(true);

    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/finance/courier/reconcile-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder._id,
          actualSettlement: Number(actualSettlement),
          courierFee: Number(courierFee),
          returnFee: Number(returnFee),
          settlementAccount,
          transactionRef,
          settledAt: settlementDate,
          status: settlementStatus,
          notes: settlementNotes,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchReconciliation();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to save reconciliation');
      }
    } catch (e: any) {
      alert(e.message || 'Error saving reconciliation');
    } finally {
      setSavingOrder(false);
    }
  };

  const handleProcessBulkCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkCsvText.trim()) return;
    setSavingBulk(true);
    setBulkResult(null);

    // Parse CSV lines: OrderIdOrConsignment,COD,Fee,ReturnFee,NetRemitted
    const lines = bulkCsvText.trim().split('\n');
    const items: any[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || (i === 0 && line.toLowerCase().includes('order'))) continue; // skip header
      const parts = line.split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length >= 1) {
        items.push({
          orderIdOrConsignment: parts[0],
          codCollected: parts[1] ? Number(parts[1]) : undefined,
          courierFee: parts[2] ? Number(parts[2]) : undefined,
          returnFee: parts[3] ? Number(parts[3]) : 0,
          actualSettlement: parts[4] ? Number(parts[4]) : undefined,
          notes: parts[5] || 'CSV Batch Import',
        });
      }
    }

    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/finance/courier/bulk-reconcile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settlementBatchId: bulkBatchId,
          provider: 'Pathao',
          settlementAccount: bulkAccount,
          transactionRef: bulkTrxRef,
          settledAt: new Date(),
          items,
        }),
      });

      const resData = await res.json();
      if (res.ok) {
        setBulkResult(resData);
        fetchReconciliation();
      } else {
        alert(resData.message || 'Failed to process bulk reconciliation');
      }
    } catch (e: any) {
      alert(e.message || 'Error processing bulk CSV');
    } finally {
      setSavingBulk(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" />
        <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">
          Loading Courier COD Remittances & Reconciliation Ledgers...
        </p>
      </div>
    );
  }

  const k = data?.kpis || {};
  const orders: any[] = data?.orders || [];

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'ALL' || o.settlementStatus === statusFilter;
    const matchesSearch =
      search === '' ||
      o.orderId?.toLowerCase().includes(search.toLowerCase()) ||
      o.consignmentId?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerMobile?.includes(search);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6D23]">
            Finance & Remittance Audit
          </span>
          <h1 className="text-2xl font-extrabold font-serif-luxury text-slate-950 mt-0.5">
            Courier COD Reconciliation
          </h1>
          <p className="text-xs text-gray-500">
            Reconcile Pathao Courier COD disbursements, verify delivery fees, and detect remittance variances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setBulkResult(null);
              setIsBulkModalOpen(true);
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#D4AF37]" />
            <span>Import Pathao Statement CSV</span>
          </button>

          <button
            onClick={fetchReconciliation}
            disabled={loading}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-xs text-gray-500 font-bold">
            <span>Total COD Collected</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-950 font-mono">
            ৳{(k.totalDeliveredCodDue || 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400">{k.deliveredCodOrdersCount || 0} delivered parcels</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-xs text-gray-500 font-bold">
            <span>Settled in Bank</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 font-mono">
            ৳{(k.totalSettledAmount || 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400">Courier Fees: -৳{(k.totalCourierFees || 0).toLocaleString()}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-xs text-gray-500 font-bold">
            <span>Courier COD Receivable</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700 font-mono">
            ৳{(k.outstandingCodReceivable || 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400">Held by courier awaiting payout</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-1">
          <div className="flex justify-between items-center text-xs text-gray-500 font-bold">
            <span>Disputed Variance</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-black text-red-700 font-mono">
            ৳{(k.totalDisputedAmount || 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400">Under investigation</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Order ID, Consignment, Mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs focus:bg-white focus:outline-none focus:border-slate-900 font-mono"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'AWAITING_SETTLEMENT', 'PARTIALLY_SETTLED', 'SETTLED', 'DISPUTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Itemized Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-slate-900">COD Parcels Reconciliation Ledger</h3>
            <p className="text-xs text-gray-500">Showing {filteredOrders.length} records</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-3">Order & Customer</th>
                <th className="py-3 px-3">Consignment ID</th>
                <th className="py-3 px-3">Delivery Date</th>
                <th className="py-3 px-3 text-right">COD Due</th>
                <th className="py-3 px-3 text-right">Courier Fee</th>
                <th className="py-3 px-3 text-right">Expected</th>
                <th className="py-3 px-3 text-right">Actual Settled</th>
                <th className="py-3 px-3">Bank Account & Ref</th>
                <th className="py-3 px-3 text-right">Variance</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-gray-400 font-sans">
                    No COD orders matching current filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o: any) => {
                  const statusColors: any = {
                    SETTLED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                    AWAITING_SETTLEMENT: 'bg-amber-50 text-amber-800 border-amber-200',
                    PARTIALLY_SETTLED: 'bg-blue-50 text-blue-800 border-blue-200',
                    DISPUTED: 'bg-red-50 text-red-800 border-red-200',
                    NOT_APPLICABLE: 'bg-gray-100 text-gray-600 border-gray-200',
                  };

                  return (
                    <tr key={o._id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3 px-3 font-sans">
                        <p className="font-bold font-mono text-slate-900">{o.orderId}</p>
                        <p className="text-[11px] text-gray-500">{o.customerName} ({o.customerMobile || o.customerDistrict})</p>
                      </td>

                      <td className="py-3 px-3">
                        {o.consignmentId && o.consignmentId !== 'Pending Booking' ? (
                          <a
                            href={`https://pathao.com/courier/tracking/?consignment_id=${o.consignmentId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-[#8C6D23] hover:underline flex items-center gap-1"
                          >
                            <span>{o.consignmentId}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-gray-400 italic font-sans text-[10px]">Unbooked</span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-sans text-gray-600">
                        {o.deliveryDate ? new Date(o.deliveryDate).toLocaleDateString('en-GB') : <span className="text-gray-400 italic">In Transit</span>}
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        ৳{o.codCollected.toLocaleString()}
                      </td>

                      <td className="py-3 px-3 text-right text-red-600">
                        -৳{o.courierFee.toLocaleString()}
                      </td>

                      <td className="py-3 px-3 text-right font-semibold text-slate-800">
                        ৳{o.expectedSettlement.toLocaleString()}
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-emerald-700">
                        {o.settlementStatus === 'SETTLED' ? `৳${o.actualSettlement.toLocaleString()}` : <span className="text-gray-400 font-normal">Pending</span>}
                      </td>

                      <td className="py-3 px-3 font-sans text-[10px] text-gray-600">
                        {o.bankAccount ? (
                          <div>
                            <p className="font-semibold text-slate-800">{o.bankAccount}</p>
                            <p className="font-mono text-gray-500 text-[9px]">{o.transactionRef}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">—</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right font-bold">
                        {o.variance !== 0 ? (
                          <span className="text-red-600">৳{o.variance.toLocaleString()}</span>
                        ) : (
                          <span className="text-emerald-700">৳0</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center font-sans">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            statusColors[o.settlementStatus] || statusColors.AWAITING_SETTLEMENT
                          }`}
                        >
                          {o.settlementStatus.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center font-sans">
                        <button
                          onClick={() => handleOpenReconcile(o)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-[#8C6D23] text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 mx-auto shadow-sm"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Reconcile</span>
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

      {/* MODAL 1: SINGLE ORDER RECONCILIATION */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-200 p-6 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6D23]">
                  Settlement Verification
                </span>
                <h3 className="text-lg font-bold font-serif-luxury text-slate-950">
                  Reconcile {selectedOrder.orderId}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-slate-900 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSingleReconciliation} className="space-y-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-3 gap-2 text-center font-mono">
                <div>
                  <p className="text-[10px] text-gray-500 font-sans">COD Due</p>
                  <p className="text-sm font-bold text-slate-900">৳{selectedOrder.codCollected.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-sans">Courier Fee</p>
                  <p className="text-sm font-bold text-red-600">-৳{courierFee.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-sans">Expected Net</p>
                  <p className="text-sm font-bold text-emerald-700">
                    ৳{Math.max(0, selectedOrder.codCollected - courierFee - returnFee).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Actual Amount Received (BDT)*</label>
                  <input
                    type="number"
                    required
                    value={actualSettlement}
                    onChange={(e) => setActualSettlement(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-300 font-mono font-bold text-slate-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Actual Courier Fee (BDT)</label>
                  <input
                    type="number"
                    value={courierFee}
                    onChange={(e) => setCourierFee(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-300 font-mono focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Return / Other Fee (BDT)</label>
                  <input
                    type="number"
                    value={returnFee}
                    onChange={(e) => setReturnFee(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-300 font-mono focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Settlement Date*</label>
                  <input
                    type="date"
                    required
                    value={settlementDate}
                    onChange={(e) => setSettlementDate(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-300 font-mono focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Bank / Wallet Account*</label>
                  <select
                    value={settlementAccount}
                    onChange={(e) => setSettlementAccount(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-300 font-semibold focus:bg-white"
                  >
                    <option value="BRAC Bank A/C 1002938">BRAC Bank (Primary A/C)</option>
                    <option value="City Bank A/C 4820194">City Bank (Settlement A/C)</option>
                    <option value="bKash Merchant 01353786336">bKash Merchant Wallet</option>
                    <option value="Nagad Merchant 01353786336">Nagad Merchant Wallet</option>
                    <option value="Cash In Hand">Cash in Hand</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Transaction Ref / Slip No*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FT2608920194"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-300 font-mono focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Reconciliation Status*</label>
                  <select
                    value={settlementStatus}
                    onChange={(e) => setSettlementStatus(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-300 font-bold focus:bg-white text-slate-900"
                  >
                    <option value="SETTLED">SETTLED (Full Match)</option>
                    <option value="PARTIALLY_SETTLED">PARTIALLY SETTLED</option>
                    <option value="DISPUTED">DISPUTED (Fee Mismatch / Unpaid)</option>
                    <option value="AWAITING_SETTLEMENT">AWAITING SETTLEMENT</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Variance (Calculated)</label>
                  <div className="p-2.5 bg-gray-100 rounded-xl border border-gray-300 font-mono font-bold">
                    ৳{(Math.max(0, selectedOrder.codCollected - courierFee - returnFee) - actualSettlement).toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Audit / Discrepancy Note</label>
                <input
                  type="text"
                  placeholder="e.g. Verified against Pathao Remittance Invoice #49201"
                  value={settlementNotes}
                  onChange={(e) => setSettlementNotes(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-300 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingOrder}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition flex items-center gap-2 shadow-md disabled:opacity-50"
                >
                  {savingOrder ? <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" /> : <Check className="w-4 h-4 text-[#D4AF37]" />}
                  <span>Save Reconciliation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BULK CSV / STATEMENT IMPORT */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-200 p-6 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6D23]">
                  Bulk Remittance Statement
                </span>
                <h3 className="text-lg font-bold font-serif-luxury text-slate-950">
                  Import Pathao Settlement CSV
                </h3>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-slate-900 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bulkResult ? (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-950 text-base">Bulk Statement Reconciled Successfully!</h4>
                <p className="text-xs text-emerald-800 font-mono">
                  Batch: {bulkResult.batchId} • Reconciled Orders: {bulkResult.reconciledOrdersCount} • Net Remitted: ৳{bulkResult.totalNetRemitted?.toLocaleString()}
                </p>
                <button
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-6 py-2 bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleProcessBulkCsv} className="space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Batch Identifier*</label>
                    <input
                      type="text"
                      required
                      value={bulkBatchId}
                      onChange={(e) => setBulkBatchId(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-300 font-mono font-bold focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Bank Account*</label>
                    <select
                      value={bulkAccount}
                      onChange={(e) => setBulkAccount(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-300 font-semibold focus:bg-white"
                    >
                      <option value="BRAC Bank A/C 1002938">BRAC Bank</option>
                      <option value="City Bank A/C 4820194">City Bank</option>
                      <option value="bKash Merchant 01353786336">bKash Merchant</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Bank Deposit Ref</label>
                    <input
                      type="text"
                      placeholder="e.g. DEP-998811"
                      value={bulkTrxRef}
                      onChange={(e) => setBulkTrxRef(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 rounded-xl border border-gray-300 font-mono focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-gray-700">Paste Statement Data (CSV Format)*</label>
                    <span className="text-[10px] text-gray-400 font-mono">Format: OrderId,COD,CourierFee,ReturnFee,NetRemitted</span>
                  </div>
                  <textarea
                    rows={6}
                    required
                    placeholder={`AVE-20260824-001, 3500, 80, 0, 3420\nAVE-20260824-002, 4200, 80, 0, 4120`}
                    value={bulkCsvText}
                    onChange={(e) => setBulkCsvText(e.target.value)}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-300 font-mono text-[11px] focus:bg-white focus:outline-none focus:border-slate-900"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsBulkModalOpen(false)}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingBulk || !bulkCsvText.trim()}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition flex items-center gap-2 shadow-md disabled:opacity-50"
                  >
                    {savingBulk ? <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" /> : <FileSpreadsheet className="w-4 h-4 text-[#D4AF37]" />}
                    <span>Reconcile Bulk Statement</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
