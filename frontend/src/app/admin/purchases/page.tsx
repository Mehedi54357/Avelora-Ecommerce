'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  Boxes,
  Users,
  Search,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Loader2,
  X,
  FileSpreadsheet,
  Building2,
  Phone,
  Mail,
  MapPin,
  Trash2,
  Edit2,
  ArrowDownToLine,
} from 'lucide-react';
import { API_BASE_URL, authFetch } from '../../../utils/api-config';

export default function PurchasesAndSuppliersPage() {
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'SUPPLIERS'>('ORDERS');
  const [orders, setOrders] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [showPOModal, setShowPOModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [receivingId, setReceivingId] = useState<string | null>(null);

  // New PO Form State
  const [poSupplierId, setPoSupplierId] = useState('');
  const [poInvoiceNo, setPoInvoiceNo] = useState('');
  const [poItems, setPoItems] = useState<any[]>([
    { productId: '', sku: '', productName: '', quantity: 10, unitCost: 1000 },
  ]);
  const [poAdditionalCost, setPoAdditionalCost] = useState(0);
  const [poPaidAmount, setPoPaidAmount] = useState(0);
  const [poNotes, setPoNotes] = useState('');

  // Supplier Form State
  const [supName, setSupName] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supAddress, setSupAddress] = useState('');
  const [supContactPerson, setSupContactPerson] = useState('');
  const [supNotes, setSupNotes] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [poRes, supRes, prodRes] = await Promise.all([
        authFetch(`${API_BASE_URL}/api/admin/purchases/orders`),
        authFetch(`${API_BASE_URL}/api/admin/purchases/suppliers`),
        authFetch(`${API_BASE_URL}/api/admin/products`),
      ]);

      if (poRes.ok) setOrders(await poRes.json());
      if (supRes.ok) setSuppliers(await supRes.json());
      if (prodRes.ok) setProducts(await prodRes.json());
    } catch (e) {
      console.error('Error fetching purchases data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Receive Goods (GRN)
  const handleReceiveGoods = async (id: string, poNum: string) => {
    if (!confirm(`Are you sure you want to receive goods for ${poNum}? This will atomically increment stock and recalculate weighted-average cost.`)) {
      return;
    }

    setReceivingId(id);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/purchases/orders/${id}/receive`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Goods received successfully!');
        fetchData();
      } else {
        alert(data.message || 'Failed to receive goods');
      }
    } catch (e) {
      console.error('Error receiving goods:', e);
    } finally {
      setReceivingId(null);
    }
  };

  // Submit New PO
  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poSupplierId) {
      alert('Please select a supplier');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/purchases/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: poSupplierId,
          invoiceNumber: poInvoiceNo,
          items: poItems,
          additionalCost: Number(poAdditionalCost) || 0,
          paidAmount: Number(poPaidAmount) || 0,
          notes: poNotes,
        }),
      });

      if (res.ok) {
        setShowPOModal(false);
        setPoItems([{ productId: '', sku: '', productName: '', quantity: 10, unitCost: 1000 }]);
        setPoAdditionalCost(0);
        setPoPaidAmount(0);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to create purchase order');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Supplier Create / Update
  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName || !supPhone) {
      alert('Name and phone are required');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingSupplier
        ? `${API_BASE_URL}/api/admin/purchases/suppliers/${editingSupplier._id}`
        : `${API_BASE_URL}/api/admin/purchases/suppliers`;
      const method = editingSupplier ? 'PUT' : 'POST';

      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: supName,
          phone: supPhone,
          email: supEmail,
          address: supAddress,
          contactPerson: supContactPerson,
          notes: supNotes,
        }),
      });

      if (res.ok) {
        setShowSupplierModal(false);
        setEditingSupplier(null);
        setSupName('');
        setSupPhone('');
        setSupEmail('');
        setSupAddress('');
        setSupContactPerson('');
        setSupNotes('');
        fetchData();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to save supplier');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  // Add line item in PO
  const addPoItem = () => {
    setPoItems([...poItems, { productId: '', sku: '', productName: '', quantity: 1, unitCost: 0 }]);
  };

  const updatePoItem = (index: number, field: string, value: any) => {
    const updated = [...poItems];
    updated[index][field] = value;

    if (field === 'productId') {
      const prod = products.find((p) => p._id === value);
      if (prod) {
        updated[index].productName = prod.name;
        if (prod.variants && prod.variants.length > 0) {
          updated[index].sku = prod.variants[0].sku;
          updated[index].unitCost = prod.variants[0].costPrice || 0;
        }
      }
    }

    setPoItems(updated);
  };

  const removePoItem = (index: number) => {
    if (poItems.length === 1) return;
    setPoItems(poItems.filter((_, i) => i !== index));
  };

  const totalPoEstimatedCost =
    poItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitCost) || 0), 0) +
    (Number(poAdditionalCost) || 0);

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6D23]">
            Procurement & Vendor Ledger
          </span>
          <h1 className="text-2xl font-extrabold font-serif-luxury text-slate-950 mt-0.5">
            Purchases & Goods Receipt (GRN)
          </h1>
          <p className="text-xs text-gray-500">
            Supplier directory, purchase orders, and stock receipts with automatic perpetual weighted-average costing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'ORDERS' ? (
            <button
              onClick={() => setShowPOModal(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-[#D4AF37]" />
              <span>New Purchase Order</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingSupplier(null);
                setSupName('');
                setSupPhone('');
                setSupEmail('');
                setSupAddress('');
                setSupContactPerson('');
                setSupNotes('');
                setShowSupplierModal(true);
              }}
              className="px-4 py-2 bg-[#D4AF37] hover:bg-[#b58f44] text-slate-950 text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Supplier</span>
            </button>
          )}

          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white px-6 pt-3 rounded-t-2xl">
        <button
          onClick={() => setActiveTab('ORDERS')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 ${
            activeTab === 'ORDERS'
              ? 'border-slate-900 text-slate-950'
              : 'border-transparent text-gray-500 hover:text-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Purchase Orders & GRN ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SUPPLIERS')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 ${
            activeTab === 'SUPPLIERS'
              ? 'border-slate-900 text-slate-950'
              : 'border-transparent text-gray-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Supplier Directory ({suppliers.length})</span>
        </button>
      </div>

      {/* TAB 1: PURCHASE ORDERS & GRN */}
      {activeTab === 'ORDERS' && (
        <div className="bg-white rounded-b-2xl border border-gray-200 shadow-sm overflow-hidden -mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-600 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">PO Number & Date</th>
                  <th className="py-3.5 px-4">Supplier</th>
                  <th className="py-3.5 px-4">Items / SKUs</th>
                  <th className="py-3.5 px-4 text-right">Cost (BDT)</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Payment</th>
                  <th className="py-3.5 px-4 text-right">Action (GRN)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#D4AF37] mb-2" />
                      Loading purchase orders...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      No purchase orders recorded yet. Click "New Purchase Order" to begin.
                    </td>
                  </tr>
                ) : (
                  orders.map((po) => {
                    const isReceived = po.status === 'RECEIVED';
                    const isReceiving = receivingId === po._id;

                    return (
                      <tr key={po._id} className="hover:bg-gray-50/80 transition">
                        <td className="py-3.5 px-4">
                          <p className="font-mono font-bold text-slate-950 text-xs">{po.purchaseId}</p>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                            {new Date(po.createdAt).toLocaleDateString()}
                          </p>
                          {po.invoiceNumber && (
                            <p className="text-[10px] text-gray-500">Inv: {po.invoiceNumber}</p>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{po.supplierName}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5 max-w-[200px]">
                            {po.items?.map((item: any, i: number) => (
                              <p key={i} className="text-gray-700 truncate">
                                <span className="font-bold text-slate-950">{item.quantity}x</span> {item.productName} ({item.sku})
                              </p>
                            ))}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono">
                          <p className="font-bold text-slate-950">৳{(po.totalCost || 0).toLocaleString()}</p>
                          <div className="text-[10px] text-gray-500 space-y-0.5 mt-0.5">
                            <p>Paid: ৳{(po.paidAmount || 0).toLocaleString()}</p>
                            <p className="text-red-600 font-semibold">Due: ৳{(po.dueAmount || 0).toLocaleString()}</p>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isReceived
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                : 'bg-amber-50 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {isReceived ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            <span>{po.status}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="text-[10px] font-bold text-gray-700 uppercase">
                            {po.paymentStatus}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {isReceived ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                              Received {new Date(po.receivedAt).toLocaleDateString()}
                            </span>
                          ) : (
                            <button
                              onClick={() => handleReceiveGoods(po._id, po.purchaseId)}
                              disabled={isReceiving}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-1.5 ml-auto"
                            >
                              {isReceiving ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <ArrowDownToLine className="w-3.5 h-3.5" />
                              )}
                              <span>Receive Goods (GRN)</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SUPPLIERS DIRECTORY */}
      {activeTab === 'SUPPLIERS' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((s) => (
            <div
              key={s._id}
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4 hover:border-[#D4AF37] transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-950 font-serif-luxury">{s.name}</h3>
                  {s.contactPerson && (
                    <p className="text-xs text-gray-500 font-medium">Contact: {s.contactPerson}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setEditingSupplier(s);
                    setSupName(s.name);
                    setSupPhone(s.phone);
                    setSupEmail(s.email || '');
                    setSupAddress(s.address || '');
                    setSupContactPerson(s.contactPerson || '');
                    setSupNotes(s.notes || '');
                    setShowSupplierModal(true);
                  }}
                  className="p-1.5 text-gray-400 hover:text-slate-900 rounded-lg hover:bg-gray-100"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-gray-600">
                <p className="flex items-center gap-2 font-mono">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {s.phone}
                </p>
                {s.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    {s.email}
                  </p>
                )}
                {s.address && (
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {s.address}
                  </p>
                )}
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div>
                  <p className="text-[10px] text-gray-500">Purchased</p>
                  <p className="font-bold text-slate-900 mt-0.5">৳{(s.totalPurchased || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">Paid</p>
                  <p className="font-bold text-emerald-700 mt-0.5">৳{(s.totalPaid || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">Due</p>
                  <p className="font-bold text-red-700 mt-0.5">৳{(s.totalDue || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: CREATE PURCHASE ORDER */}
      {showPOModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 my-8">
            <div className="p-5 bg-slate-950 text-white flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold font-serif-luxury text-white">Create Purchase Order (PO)</h3>
                <p className="text-xs text-gray-400">Order inventory from approved suppliers</p>
              </div>
              <button onClick={() => setShowPOModal(false)} className="p-1 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="p-6 space-y-5 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Select Supplier *</label>
                  <select
                    value={poSupplierId}
                    onChange={(e) => setPoSupplierId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl outline-none"
                    required
                  >
                    <option value="">-- Choose Supplier --</option>
                    {suppliers.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Supplier Invoice Number</label>
                  <input
                    type="text"
                    value={poInvoiceNo}
                    onChange={(e) => setPoInvoiceNo(e.target.value)}
                    placeholder="e.g. INV-9982"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* Items Table in PO */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-gray-700">Order Line Items *</label>
                  <button
                    type="button"
                    onClick={addPoItem}
                    className="text-xs font-bold text-[#8C6D23] hover:underline"
                  >
                    + Add Another Item
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {poItems.map((item, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-4">
                        <select
                          value={item.productId}
                          onChange={(e) => updatePoItem(idx, 'productId', e.target.value)}
                          className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs"
                          required
                        >
                          <option value="">-- Select Product --</option>
                          {products.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-3">
                        <input
                          type="text"
                          placeholder="SKU"
                          value={item.sku}
                          onChange={(e) => updatePoItem(idx, 'sku', e.target.value)}
                          className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs font-mono"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => updatePoItem(idx, 'quantity', Number(e.target.value))}
                          className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0"
                          placeholder="Unit Cost"
                          value={item.unitCost}
                          onChange={(e) => updatePoItem(idx, 'unitCost', Number(e.target.value))}
                          className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs font-mono"
                          required
                        />
                      </div>

                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => removePoItem(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financials in PO */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Additional Shipping / Customs (BDT)</label>
                  <input
                    type="number"
                    value={poAdditionalCost}
                    onChange={(e) => setPoAdditionalCost(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Advance Paid to Supplier (BDT)</label>
                  <input
                    type="number"
                    value={poPaidAmount}
                    onChange={(e) => setPoPaidAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* Total PO Cost Display */}
              <div className="p-4 bg-slate-900 text-white rounded-xl flex justify-between items-center font-mono">
                <span>Total PO Acquisition Cost:</span>
                <span className="text-xl font-bold text-[#D4AF37]">৳{totalPoEstimatedCost.toLocaleString()}</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPOModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-800 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl"
                >
                  {submitting ? 'Creating PO...' : 'Create Purchase Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT SUPPLIER */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <h3 className="text-base font-bold font-serif-luxury text-slate-950">
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
              </h3>
              <button onClick={() => setShowSupplierModal(false)} className="p-1 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Supplier Company Name *</label>
                <input
                  type="text"
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={supContactPerson}
                    onChange={(e) => setSupContactPerson(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={supEmail}
                  onChange={(e) => setSupEmail(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Office / Factory Address</label>
                <input
                  type="text"
                  value={supAddress}
                  onChange={(e) => setSupAddress(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-800 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-slate-900 text-white font-bold rounded-xl"
                >
                  {submitting ? 'Saving...' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
