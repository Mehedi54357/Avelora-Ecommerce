'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
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
  Edit2,
  History,
  AlertTriangle,
  Download,
  Printer,
  ChevronLeft,
  Search,
  Package,
  Layers,
  FileSpreadsheet,
  FileText,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { API_BASE_URL, authFetch } from '../../../../utils/api-config';

export default function CapitalAndAssetsPage() {
  const [activeTab, setActiveTab] = useState<'investments' | 'treasury'>('investments');
  const [summary, setSummary] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [productInvestments, setProductInvestments] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters for Product Investments
  const [filterRange, setFilterRange] = useState<'all' | 'today' | '7d' | 'this_month' | 'custom'>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Capital Event Modal
  const [showCapitalModal, setShowCapitalModal] = useState(false);
  const [txType, setTxType] = useState('OWNER_CAPITAL_IN');
  const [txAmount, setTxAmount] = useState(50000);
  const [txSource, setTxSource] = useState('Owner');
  const [txAccount, setTxAccount] = useState('Bank Account');
  const [txRef, setTxRef] = useState('');
  const [txNotes, setTxNotes] = useState('');
  const [submittingCapital, setSubmittingCapital] = useState(false);

  // Add Product Investment Modal State
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [investMode, setInvestMode] = useState<'existing' | 'new'>('existing');
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedSku, setSelectedSku] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [newVariantDetails, setNewVariantDetails] = useState('');
  const [newSku, setNewSku] = useState('');
  const [invDate, setInvDate] = useState(new Date().toISOString().slice(0, 10));
  const [invQty, setInvQty] = useState<number>(40);
  const [invPurchasePrice, setInvPurchasePrice] = useState<number>(182);

  // Direct Cost Fields (all manual, defaults 0, never auto-populated)
  const [boxCost, setBoxCost] = useState<number>(0);
  const [transportCost, setTransportCost] = useState<number>(0);
  const [polyCost, setPolyCost] = useState<number>(0);
  const [stickerCost, setStickerCost] = useState<number>(0);
  const [tagCost, setTagCost] = useState<number>(0);
  const [otherCost, setOtherCost] = useState<number>(0);

  const [paymentAccount, setPaymentAccount] = useState('Bank');
  const [invNotes, setInvNotes] = useState('');
  const [submittingInvest, setSubmittingInvest] = useState(false);

  // Edit / Correction Modal State
  const [editingInvest, setEditingInvest] = useState<any>(null);
  const [editQty, setEditQty] = useState<number>(0);
  const [editPurchasePrice, setEditPurchasePrice] = useState<number>(0);
  const [editBoxCost, setEditBoxCost] = useState<number>(0);
  const [editTransportCost, setEditTransportCost] = useState<number>(0);
  const [editPolyCost, setEditPolyCost] = useState<number>(0);
  const [editStickerCost, setEditStickerCost] = useState<number>(0);
  const [editTagCost, setEditTagCost] = useState<number>(0);
  const [editOtherCost, setEditOtherCost] = useState<number>(0);
  const [editReason, setEditReason] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Audit History Modal State
  const [auditInvest, setAuditInvest] = useState<any>(null);

  // Stock Adjustment (Damage / Lost) Modal State
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustProductId, setAdjustProductId] = useState('');
  const [adjustSku, setAdjustSku] = useState('');
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [adjustReason, setAdjustReason] = useState<'DAMAGED' | 'LOST' | 'EXPIRED' | 'INVENTORY_DISCREPANCY'>('DAMAGED');
  const [adjustNotes, setAdjustNotes] = useState('');
  const [submittingAdjust, setSubmittingAdjust] = useState(false);

  // Print / Report Modal State
  const [showPrintModal, setShowPrintModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      let invUrl = `${API_BASE_URL}/api/admin/capital/product-investments?`;
      if (filterRange === 'today') {
        const t = new Date().toISOString().slice(0, 10);
        invUrl += `from=${t}&to=${t}&`;
      } else if (filterRange === '7d') {
        const d = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().slice(0, 10);
        invUrl += `from=${d}&`;
      } else if (filterRange === 'this_month') {
        const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
        invUrl += `from=${start}&`;
      } else if (filterRange === 'custom') {
        if (fromDate) invUrl += `from=${fromDate}&`;
        if (toDate) invUrl += `to=${toDate}&`;
      }
      if (searchQuery) {
        invUrl += `search=${encodeURIComponent(searchQuery)}&`;
      }

      const [sumRes, anaRes, txRes, piRes, prodRes] = await Promise.all([
        authFetch(`${API_BASE_URL}/api/admin/capital/summary`),
        authFetch(`${API_BASE_URL}/api/admin/finance/analytics`),
        authFetch(`${API_BASE_URL}/api/admin/capital/transactions`),
        authFetch(invUrl),
        authFetch(`${API_BASE_URL}/api/products?limit=150`),
      ]);

      if (sumRes.ok) setSummary(await sumRes.json());
      if (anaRes.ok) setAnalytics(await anaRes.json());
      if (txRes.ok) setTransactions(await txRes.json());
      if (piRes.ok) setProductInvestments(await piRes.json());
      if (prodRes.ok) {
        const pData = await prodRes.json();
        setProducts(pData.products || pData || []);
      }
    } catch (e) {
      console.error('Error fetching capital data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterRange, fromDate, toDate]);

  // Selected Product in Modal
  const currentSelectedProduct = useMemo(() => {
    return products.find((p) => p._id === selectedProductId) || null;
  }, [products, selectedProductId]);

  const currentSelectedVariant = useMemo(() => {
    if (!currentSelectedProduct) return null;
    return currentSelectedProduct.variants?.find((v: any) => v.sku === selectedSku) || currentSelectedProduct.variants?.[0] || null;
  }, [currentSelectedProduct, selectedSku]);

  // Fast Product Search in Modal
  const filteredExistingProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const q = productSearch.trim().toLowerCase();
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.variants?.some((v: any) => v.sku?.toLowerCase().includes(q)),
    );
  }, [products, productSearch]);

  // Duplicate Protection: check similar products when creating new
  const potentialMatches = useMemo(() => {
    if (!newProductName.trim()) return [];
    const q = newProductName.trim().toLowerCase();
    return products.filter((p) => p.name?.toLowerCase().includes(q)).slice(0, 3);
  }, [products, newProductName]);

  // Dynamic Live Cost Calculations
  const additionalDirectCostPerUnit = useMemo(() => {
    return (
      (Number(boxCost) || 0) +
      (Number(transportCost) || 0) +
      (Number(polyCost) || 0) +
      (Number(stickerCost) || 0) +
      (Number(tagCost) || 0) +
      (Number(otherCost) || 0)
    );
  }, [boxCost, transportCost, polyCost, stickerCost, tagCost, otherCost]);

  const actualProductCostPerUnit = useMemo(() => {
    return (Number(invPurchasePrice) || 0) + additionalDirectCostPerUnit;
  }, [invPurchasePrice, additionalDirectCostPerUnit]);

  const totalInvestmentAmount = useMemo(() => {
    return actualProductCostPerUnit * (Number(invQty) || 0);
  }, [actualProductCostPerUnit, invQty]);

  // Edit Dynamic Cost Calculations
  const editAddCost = useMemo(() => {
    return (
      (Number(editBoxCost) || 0) +
      (Number(editTransportCost) || 0) +
      (Number(editPolyCost) || 0) +
      (Number(editStickerCost) || 0) +
      (Number(editTagCost) || 0) +
      (Number(editOtherCost) || 0)
    );
  }, [editBoxCost, editTransportCost, editPolyCost, editStickerCost, editTagCost, editOtherCost]);

  const editActualCost = useMemo(() => {
    return (Number(editPurchasePrice) || 0) + editAddCost;
  }, [editPurchasePrice, editAddCost]);

  const editTotal = useMemo(() => {
    return editActualCost * (Number(editQty) || 0);
  }, [editActualCost, editQty]);

  // Handle Save Capital Event
  const handleSaveTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAmount || txAmount <= 0) return;

    setSubmittingCapital(true);
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
        setShowCapitalModal(false);
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
      setSubmittingCapital(false);
    }
  };

  // Handle Save Product Investment
  const handleSaveProductInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (investMode === 'existing') {
      if (!selectedProductId || !selectedSku) {
        alert('Please select both a Product and a Variant SKU.');
        return;
      }
    } else {
      if (!newProductName.trim()) {
        alert('Please enter a Product Name for this investment.');
        return;
      }
    }

    if (invQty <= 0) {
      alert('Quantity must be greater than zero.');
      return;
    }
    if (invPurchasePrice < 0) {
      alert('Purchase price cannot be negative.');
      return;
    }

    setSubmittingInvest(true);
    try {
      const payload: any = {
        date: invDate,
        quantity: Number(invQty),
        purchasePrice: Number(invPurchasePrice),
        boxCost: Number(boxCost) || 0,
        transportCost: Number(transportCost) || 0,
        polyCost: Number(polyCost) || 0,
        stickerCost: Number(stickerCost) || 0,
        tagCost: Number(tagCost) || 0,
        otherCost: Number(otherCost) || 0,
        paymentAccount,
        notes: invNotes,
      };

      if (investMode === 'existing') {
        payload.productId = selectedProductId;
        payload.variantSku = selectedSku;
      } else {
        payload.isNewProduct = true;
        payload.productName = newProductName.trim();
        payload.variantSku = newSku.trim() || `AVE-${Math.floor(1000 + Math.random() * 9000)}`;
        payload.variantDetails = newVariantDetails.trim();
      }

      const res = await authFetch(`${API_BASE_URL}/api/admin/capital/product-investments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowInvestModal(false);
        // Reset manual cost fields to 0 (per strict rule: NEVER auto-populate previous amounts)
        setBoxCost(0);
        setTransportCost(0);
        setPolyCost(0);
        setStickerCost(0);
        setTagCost(0);
        setOtherCost(0);
        setInvNotes('');
        setNewProductName('');
        setNewVariantDetails('');
        setNewSku('');
        setProductSearch('');
        fetchData();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to save product investment');
      }
    } catch (e: any) {
      alert(e.message || 'Error creating investment');
    } finally {
      setSubmittingInvest(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (inv: any) => {
    setEditingInvest(inv);
    setEditQty(inv.quantity);
    setEditPurchasePrice(inv.purchasePrice);
    setEditBoxCost(inv.boxCost || 0);
    setEditTransportCost(inv.transportCost || 0);
    setEditPolyCost(inv.polyCost || 0);
    setEditStickerCost(inv.stickerCost || 0);
    setEditTagCost(inv.tagCost || 0);
    setEditOtherCost(inv.otherCost || 0);
    setEditReason('');
  };

  // Save Edit / Correction
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editReason.trim()) {
      alert('Please enter a clear Reason for Correction for audit compliance.');
      return;
    }

    setSubmittingEdit(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/capital/product-investments/${editingInvest._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: editQty,
          purchasePrice: editPurchasePrice,
          boxCost: editBoxCost,
          transportCost: editTransportCost,
          polyCost: editPolyCost,
          stickerCost: editStickerCost,
          tagCost: editTagCost,
          otherCost: editOtherCost,
          reason: editReason,
        }),
      });

      if (res.ok) {
        setEditingInvest(null);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to save correction');
      }
    } catch (e: any) {
      alert(e.message || 'Error updating investment');
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Delete Investment
  const handleDeleteInvestment = async (id: string, invId: string) => {
    if (!confirm(`Are you sure you want to delete Investment #${invId}? Stock added from this entry will be reversed.`)) return;
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/capital/product-investments/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to delete investment');
      }
    } catch (e: any) {
      alert(e.message || 'Error deleting investment');
    }
  };

  // Handle Stock Loss Adjustment (Damage / Lost)
  const handleSaveStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustProductId || !adjustSku) {
      alert('Please select both a Product and Variant SKU.');
      return;
    }
    if (adjustQty <= 0) {
      alert('Write-off quantity must be at least 1.');
      return;
    }

    setSubmittingAdjust(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/capital/stock-adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: adjustProductId,
          variantSku: adjustSku,
          quantity: Number(adjustQty),
          reason: adjustReason,
          notes: adjustNotes,
        }),
      });

      if (res.ok) {
        setShowAdjustModal(false);
        setAdjustNotes('');
        alert('Stock write-off completed. Financial loss recognized and audit log updated.');
        fetchData();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to adjust stock');
      }
    } catch (e: any) {
      alert(e.message || 'Error adjusting stock');
    } finally {
      setSubmittingAdjust(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    let url = `${API_BASE_URL}/api/admin/capital/product-investments/export?`;
    if (filterRange === 'today') {
      const t = new Date().toISOString().slice(0, 10);
      url += `from=${t}&to=${t}&`;
    } else if (filterRange === '7d') {
      const d = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().slice(0, 10);
      url += `from=${d}&`;
    } else if (filterRange === 'this_month') {
      const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
      url += `from=${start}&`;
    } else if (filterRange === 'custom') {
      if (fromDate) url += `from=${fromDate}&`;
      if (toDate) url += `to=${toDate}&`;
    }
    if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
    window.open(url, '_blank');
  };

  if (loading && !summary && productInvestments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" />
        <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">
          Compiling Capital, Product Costing & Inventory Balances...
        </p>
      </div>
    );
  }

  const s = analytics?.summary || {};
  const inventoryCost = s.inventoryValueAtCost || 0;
  const liquidCash = s.cashCollected || 0;
  const codReceivable = s.codReceivable || 0;
  const totalAssets = inventoryCost + liquidCash + codReceivable;

  const totalInvestSum = productInvestments.reduce((acc, cur) => acc + (cur.totalInvestment || 0), 0);
  const totalUnitsSum = productInvestments.reduce((acc, cur) => acc + (cur.quantity || 0), 0);

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Link
              href="/admin/finance"
              className="inline-flex items-center gap-1 text-gray-600 hover:text-slate-900 font-bold transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Finance & Accounting</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-slate-900 font-semibold">Capital & Investment</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6D23]">
            Universal Product Costing & Owner Equity Engine
          </span>
          <h1 className="text-2xl font-extrabold font-serif-luxury text-slate-950 mt-0.5">
            Capital & Product Investment
          </h1>
          <p className="text-xs text-gray-500">
            Realized inventory acquisition costing, direct packaging capitalization, WAC tracking, and treasury position.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Add Product Investment (Gold Button) */}
          <button
            onClick={() => {
              if (products.length > 0 && !selectedProductId) {
                setSelectedProductId(products[0]._id);
                setSelectedSku(products[0].variants?.[0]?.sku || '');
              }
              setShowInvestModal(true);
            }}
            className="px-4 py-2.5 bg-[#0F172A] hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-2 border border-[#D4AF37]/40"
          >
            <Plus className="w-4 h-4 text-[#D4AF37]" />
            <span>Add Product Investment</span>
          </button>

          {/* Damaged / Lost Stock Adjustment */}
          <button
            onClick={() => {
              if (products.length > 0 && !adjustProductId) {
                setAdjustProductId(products[0]._id);
                setAdjustSku(products[0].variants?.[0]?.sku || '');
              }
              setShowAdjustModal(true);
            }}
            className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            <span>Stock Loss Write-Off</span>
          </button>

          {/* Capital Event */}
          <button
            onClick={() => setShowCapitalModal(true)}
            className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <Landmark className="w-3.5 h-3.5 text-slate-600" />
            <span>Treasury Capital</span>
          </button>

          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* "WHERE YOUR MONEY IS" ASSET HERO COCKPIT */}
      <div className="space-y-4 print:hidden">
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

      {/* SECTION TABS */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 print:hidden">
        <button
          onClick={() => setActiveTab('investments')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            activeTab === 'investments'
              ? 'bg-slate-950 text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Boxes className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Product Purchase Investments ({productInvestments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('treasury')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            activeTab === 'treasury'
              ? 'bg-slate-950 text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Landmark className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Owner Equity & Treasury Capital ({transactions.length})</span>
        </button>
      </div>

      {/* TAB 1: PRODUCT PURCHASE INVESTMENTS */}
      {activeTab === 'investments' && (
        <div className="space-y-6">
          {/* Controls Bar: Filters, Search, Export */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 print:hidden">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'All Time' },
                { id: 'today', label: 'Today' },
                { id: '7d', label: 'Last 7 Days' },
                { id: 'this_month', label: 'This Month' },
                { id: 'custom', label: 'Custom Range' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterRange(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    filterRange === f.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}

              {filterRange === 'custom' && (
                <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-200 text-xs ml-2">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="bg-transparent text-slate-800 outline-none text-xs font-mono"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="bg-transparent text-slate-800 outline-none text-xs font-mono"
                  />
                </div>
              )}
            </div>

            {/* Search & Export Buttons */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search product, SKU, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none"
                />
              </div>

              <button
                onClick={handleExportCsv}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                title="Download CSV"
              >
                <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="hidden sm:inline">CSV</span>
              </button>

              <button
                onClick={() => setShowPrintModal(true)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-slate-900 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                title="Print Report"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print / PDF</span>
              </button>
            </div>
          </div>

          {/* Investment Summary Pill */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-[#1e1a12] text-white p-4 rounded-2xl flex flex-wrap justify-between items-center gap-4 border border-amber-500/20">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-bold">
                Filtered Product Investment Summary
              </span>
              <p className="text-xl font-bold font-mono text-white mt-0.5">
                ৳{totalInvestSum.toLocaleString()}
                <span className="text-xs font-normal text-gray-400 ml-2">
                  across {totalUnitsSum.toLocaleString()} total units ({productInvestments.length} purchase records)
                </span>
              </p>
            </div>

            <div className="text-xs text-gray-400 font-mono">
              <span>All direct costs (Box, Poly, Shipping, Sticker, Tag) capitalized into unit asset</span>
            </div>
          </div>

          {/* Table: Product Investment History */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900">Product Investment History</h3>
                <p className="text-xs text-gray-500">Universal costing register with manual packaging breakdown and live WAC</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3.5">Date & ID</th>
                    <th className="p-3.5">Product & SKU</th>
                    <th className="p-3.5 text-center">Qty</th>
                    <th className="p-3.5 text-right">Purchase Price</th>
                    <th className="p-3.5 text-center">Direct Costs Breakdown</th>
                    <th className="p-3.5 text-right">Add'l Cost</th>
                    <th className="p-3.5 text-right">Actual Cost/Unit</th>
                    <th className="p-3.5 text-right font-bold text-slate-900">Total Investment</th>
                    <th className="p-3.5 text-center">Remaining Stock</th>
                    <th className="p-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-sans">
                  {productInvestments.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-gray-400">
                        No product investments recorded for the selected filter.
                      </td>
                    </tr>
                  ) : (
                    productInvestments.map((inv: any) => {
                      const addCost = inv.additionalCostPerUnit || 0;
                      const hasAudit = Array.isArray(inv.auditHistory) && inv.auditHistory.length > 1;

                      return (
                        <tr key={inv._id} className="hover:bg-slate-50/80 transition">
                          <td className="p-3.5 font-mono">
                            <span className="block font-bold text-slate-900">
                              {new Date(inv.date).toISOString().slice(0, 10)}
                            </span>
                            <span className="text-[10px] text-gray-400">#{inv.investmentId}</span>
                          </td>

                          <td className="p-3.5">
                            <div className="flex items-center gap-2.5">
                              {inv.productImage ? (
                                <img
                                  src={inv.productImage}
                                  alt=""
                                  className="w-9 h-9 rounded-lg object-cover border border-gray-200"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                  <Package className="w-4 h-4" />
                                </div>
                              )}
                              <div>
                                <span className="font-bold text-slate-900 block truncate max-w-[180px]">
                                  {inv.productName}
                                </span>
                                <span className="text-[10px] text-gray-500 font-mono">
                                  {inv.variantSku} {inv.variantDetails ? `• ${inv.variantDetails}` : ''}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5 text-center font-mono font-bold text-slate-900">
                            {inv.quantity} pcs
                          </td>

                          <td className="p-3.5 text-right font-mono">
                            ৳{inv.purchasePrice.toLocaleString()}
                          </td>

                          {/* Direct Cost breakdown chips */}
                          <td className="p-3.5 text-center">
                            <div className="flex flex-wrap items-center justify-center gap-1 max-w-[200px] mx-auto text-[10px] font-mono">
                              {inv.boxCost > 0 && (
                                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200" title="Box Cost">
                                  Box ৳{inv.boxCost}
                                </span>
                              )}
                              {inv.transportCost > 0 && (
                                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200" title="Transport / Courier">
                                  Ship ৳{inv.transportCost}
                                </span>
                              )}
                              {inv.polyCost > 0 && (
                                <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-200" title="Poly Bag">
                                  Poly ৳{inv.polyCost}
                                </span>
                              )}
                              {inv.stickerCost > 0 && (
                                <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-200" title="Sticker">
                                  Stk ৳{inv.stickerCost}
                                </span>
                              )}
                              {inv.tagCost > 0 && (
                                <span className="px-1.5 py-0.5 bg-rose-50 text-rose-700 rounded border border-rose-200" title="Tag / Nar">
                                  Tag ৳{inv.tagCost}
                                </span>
                              )}
                              {inv.otherCost > 0 && (
                                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded" title="Other">
                                  Oth ৳{inv.otherCost}
                                </span>
                              )}
                              {addCost === 0 && (
                                <span className="text-gray-400 text-[10px]">None (৳0)</span>
                              )}
                            </div>
                          </td>

                          <td className="p-3.5 text-right font-mono text-gray-600">
                            +৳{addCost.toLocaleString()}
                          </td>

                          <td className="p-3.5 text-right font-mono font-bold text-slate-900 bg-amber-50/50">
                            ৳{inv.actualCostPerUnit.toLocaleString()}
                          </td>

                          <td className="p-3.5 text-right font-mono font-black text-slate-950 text-sm">
                            ৳{inv.totalInvestment.toLocaleString()}
                          </td>

                          <td className="p-3.5 text-center font-mono">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">
                              {inv.liveStock ?? inv.remainingStock ?? 0} pcs
                            </span>
                          </td>

                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Edit Button */}
                              <button
                                onClick={() => openEditModal(inv)}
                                className="p-1.5 text-gray-500 hover:text-slate-900 hover:bg-gray-100 rounded-lg transition"
                                title="Edit / Correct Investment Entry"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Audit Trail Button */}
                              <button
                                onClick={() => setAuditInvest(inv)}
                                className={`p-1.5 rounded-lg transition ${
                                  hasAudit
                                    ? 'text-amber-600 hover:bg-amber-50 font-bold'
                                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                                }`}
                                title="Audit History"
                              >
                                <History className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDeleteInvestment(inv._id, inv.investmentId)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Delete Investment Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* TAB 2: TREASURY & OWNER EQUITY TRANSACTIONS */}
      {activeTab === 'treasury' && (
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
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Source / Account</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4">Reference & Notes</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      No capital transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((t: any) => {
                    const isPositive =
                      t.type === 'OWNER_CAPITAL_IN' || t.type === 'LOAN_IN';
                    return (
                      <tr key={t._id} className="hover:bg-gray-50 transition">
                        <td className="p-4 text-gray-500">
                          {new Date(t.date).toISOString().slice(0, 10)}
                        </td>
                        <td className="p-4 font-sans font-bold">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] ${
                              isPositive
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {t.type.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-4 font-sans">
                          <span className="font-bold text-slate-900 block">{t.source}</span>
                          <span className="text-[10px] text-gray-400">{t.account}</span>
                        </td>
                        <td
                          className={`p-4 text-right font-black ${
                            isPositive ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {isPositive ? '+' : '-'}৳{t.amount.toLocaleString()}
                        </td>
                        <td className="p-4 font-sans text-gray-500">
                          {t.reference && <span className="font-mono text-slate-800 mr-2">[{t.reference}]</span>}
                          {t.notes || '—'}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={async () => {
                              if (!confirm('Are you sure you want to remove this capital transaction?')) return;
                              await authFetch(`${API_BASE_URL}/api/admin/capital/transactions/${t._id}`, { method: 'DELETE' });
                              fetchData();
                            }}
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
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD PRODUCT PURCHASE INVESTMENT                                  */}
      {/* ========================================================================= */}
      {showInvestModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 my-8">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6D23]">
                  Direct Product Costing & Inventory Restock
                </span>
                <h3 className="text-xl font-bold font-serif-luxury text-slate-950 mt-0.5">
                  Record Product Purchase Investment
                </h3>
              </div>
              <button
                onClick={() => setShowInvestModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductInvestment} className="space-y-4 text-xs">
              {/* Mode Toggle: Existing Product vs New Manual Product */}
              <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setInvestMode('existing')}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs transition ${
                    investMode === 'existing'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-gray-600 hover:text-slate-900'
                  }`}
                >
                  Search Existing Product
                </button>
                <button
                  type="button"
                  onClick={() => setInvestMode('new')}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                    investMode === 'new'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-gray-600 hover:text-slate-900'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>+ Add New Product / Manual Name</span>
                </button>
              </div>

              {/* Mode A: Select Existing Product */}
              {investMode === 'existing' && (
                <div className="space-y-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Search & Select Product *</label>
                      <input
                        type="text"
                        placeholder="Type to filter products..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full mb-1.5 p-2 bg-white border border-gray-300 rounded-lg outline-none text-xs"
                      />
                      <select
                        value={selectedProductId}
                        onChange={(e) => {
                          const pId = e.target.value;
                          setSelectedProductId(pId);
                          const prod = products.find((p) => p._id === pId);
                          setSelectedSku(prod?.variants?.[0]?.sku || '');
                        }}
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-xl outline-none text-slate-900 font-medium text-xs"
                        required
                      >
                        {filteredExistingProducts.length === 0 ? (
                          <option value="">No matching products found</option>
                        ) : (
                          filteredExistingProducts.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.name} {p.status === 'DRAFT' ? '(Draft - Investment Ready)' : ''}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Select Variant / SKU *</label>
                      <select
                        value={selectedSku}
                        onChange={(e) => setSelectedSku(e.target.value)}
                        className="w-full p-2.5 bg-white border border-gray-300 rounded-xl outline-none text-slate-900 font-mono text-xs mt-6 sm:mt-8"
                        required
                      >
                        {currentSelectedProduct?.variants?.map((v: any) => (
                          <option key={v.sku} value={v.sku}>
                            {v.sku} — {v.color || ''} {v.size || ''} (Stock: {v.stockQuantity || 0}, WAC: ৳{v.weightedAverageCost || v.costPrice || 0})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Mode B: Add New Product / Manual Name */}
              {investMode === 'new' && (
                <div className="space-y-3 p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200/80">
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-900">
                      Product Name (নতুন প্রোডাক্টের নাম) *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Original Dubai Cherry Premium Hijab or Reshmi Velvet Churi"
                      value={newProductName}
                      onChange={(e) => setNewProductName(e.target.value)}
                      className="w-full p-2.5 bg-white border border-gray-300 rounded-xl outline-none text-slate-900 font-semibold"
                      required
                    />
                    <span className="text-[10px] text-gray-500 block">
                      This product identity will immediately be created and available for customer details in Product Add/Edit.
                    </span>
                  </div>

                  {/* Duplicate Protection Warning */}
                  {potentialMatches.length > 0 && (
                    <div className="p-2.5 bg-amber-100/90 rounded-xl border border-amber-300 text-[11px] text-amber-900 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                        <span>Matching Product Already Found in Catalog:</span>
                      </div>
                      <div className="space-y-1">
                        {potentialMatches.map((m) => (
                          <div key={m._id} className="flex items-center justify-between bg-white/80 p-1.5 rounded-lg border border-amber-200">
                            <div>
                              <span className="font-bold text-slate-900">{m.name}</span>
                              <span className="text-gray-500 ml-2 font-mono">
                                (Stock: {m.variants?.reduce((s: number, v: any) => s + (v.stockQuantity || 0), 0) || 0} pcs)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedProductId(m._id);
                                setSelectedSku(m.variants?.[0]?.sku || '');
                                setInvestMode('existing');
                              }}
                              className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold transition"
                            >
                              Select Existing
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Color / Variant Tag (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Olive, Standard, or Maroon"
                        value={newVariantDetails}
                        onChange={(e) => setNewVariantDetails(e.target.value)}
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Initial SKU (Optional)</label>
                      <input
                        type="text"
                        placeholder="Auto-generated if blank (e.g. AVE-5421)"
                        value={newSku}
                        onChange={(e) => setNewSku(e.target.value)}
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Date, Quantity, Unit Purchase Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Investment Date *</label>
                  <input
                    type="date"
                    value={invDate}
                    onChange={(e) => setInvDate(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Purchase Quantity (Units) *</label>
                  <input
                    type="number"
                    min="1"
                    value={invQty}
                    onChange={(e) => setInvQty(Math.max(1, parseInt(e.target.value) || 0))}
                    placeholder="e.g. 40"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl outline-none font-mono text-sm font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Purchase Price / Unit (BDT) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={invPurchasePrice}
                    onChange={(e) => setInvPurchasePrice(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="e.g. 182"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl outline-none font-mono text-sm font-bold text-slate-950"
                    required
                  />
                </div>
              </div>

              {/* Direct Packaging & Transport Cost Heads (Manual Entry - Not Auto-Populated) */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-[#8C6D23]" />
                    Direct Packaging & Inbound Shipping Costs / Unit
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    Enter 0 if not applicable (Product-specific)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Box Cost (৳)</label>
                    <input
                      type="number"
                      min="0"
                      value={boxCost}
                      onChange={(e) => setBoxCost(Math.max(0, parseFloat(e.target.value) || 0))}
                      placeholder="0"
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Courier / Transport (৳)</label>
                    <input
                      type="number"
                      min="0"
                      value={transportCost}
                      onChange={(e) => setTransportCost(Math.max(0, parseFloat(e.target.value) || 0))}
                      placeholder="0"
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Poly Cost (৳)</label>
                    <input
                      type="number"
                      min="0"
                      value={polyCost}
                      onChange={(e) => setPolyCost(Math.max(0, parseFloat(e.target.value) || 0))}
                      placeholder="0"
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Sticker Cost (৳)</label>
                    <input
                      type="number"
                      min="0"
                      value={stickerCost}
                      onChange={(e) => setStickerCost(Math.max(0, parseFloat(e.target.value) || 0))}
                      placeholder="0"
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Tag / Nar Cost (৳)</label>
                    <input
                      type="number"
                      min="0"
                      value={tagCost}
                      onChange={(e) => setTagCost(Math.max(0, parseFloat(e.target.value) || 0))}
                      placeholder="0"
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Other Direct Packaging (৳)</label>
                    <input
                      type="number"
                      min="0"
                      value={otherCost}
                      onChange={(e) => setOtherCost(Math.max(0, parseFloat(e.target.value) || 0))}
                      placeholder="0"
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* LIVE DYNAMIC CALCULATION PREVIEW COCKPIT */}
              <div className="p-4 bg-slate-950 text-white rounded-2xl space-y-3 border border-amber-500/30">
                <div className="flex justify-between items-center text-[11px] text-gray-400">
                  <span className="text-[#D4AF37] font-bold uppercase tracking-wider">
                    Instant Costing Calculation
                  </span>
                  <span className="font-mono text-emerald-400">Zero P&L Double-Counting</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-gray-800">
                    <span className="text-[10px] text-gray-400 block">Purchase Price</span>
                    <p className="text-base font-bold font-mono text-white">৳{invPurchasePrice}</p>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-xl border border-gray-800">
                    <span className="text-[10px] text-gray-400 block">+ Direct Pack/Ship</span>
                    <p className="text-base font-bold font-mono text-amber-300">+৳{additionalDirectCostPerUnit}</p>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-xl border border-[#D4AF37]/50">
                    <span className="text-[10px] text-[#D4AF37] font-bold block">Actual Cost / Unit</span>
                    <p className="text-lg font-black font-mono text-[#D4AF37]">৳{actualProductCostPerUnit}</p>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-xl border border-emerald-500/40">
                    <span className="text-[10px] text-emerald-300 font-bold block">Total Investment</span>
                    <p className="text-lg font-black font-mono text-emerald-400">
                      ৳{totalInvestmentAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-gray-400 font-mono flex items-center justify-between pt-1">
                  <span>
                    Formula: (৳{invPurchasePrice} + ৳{additionalDirectCostPerUnit}) × {invQty} units = ৳{totalInvestmentAmount.toLocaleString()}
                  </span>
                  <span>
                    Stock Addition: +{invQty} units
                  </span>
                </div>
              </div>

              {/* Payment Account & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Funded From Account</label>
                  <select
                    value={paymentAccount}
                    onChange={(e) => setPaymentAccount(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl outline-none"
                  >
                    <option value="Bank">Bank Account (Working Capital)</option>
                    <option value="Cash">Cash in Hand / Showroom Register</option>
                    <option value="bKash Merchant">bKash Merchant Account</option>
                    <option value="Owner Capital">Direct Owner Personal Capital</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Notes / Supplier Batch</label>
                  <input
                    type="text"
                    value={invNotes}
                    onChange={(e) => setInvNotes(e.target.value)}
                    placeholder="e.g. Dubai supplier shipment batch #4"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowInvestModal(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingInvest}
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-2 border border-[#D4AF37]/50"
                >
                  {submittingInvest ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                      <span>Saving Investment...</span>
                    </>
                  ) : (
                    <span>Confirm & Save Product Investment</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT / CORRECTION + AUDIT LOG                                    */}
      {/* ========================================================================= */}
      {editingInvest && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-4 my-8">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
                  Strict Audit Compliance Guard
                </span>
                <h3 className="text-lg font-bold font-serif-luxury text-slate-950">
                  Correct Investment #{editingInvest.investmentId}
                </h3>
              </div>
              <button
                onClick={() => setEditingInvest(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl">
                <span className="font-bold text-slate-900 block">{editingInvest.productName}</span>
                <span className="text-gray-500 font-mono text-[11px]">
                  SKU: {editingInvest.variantSku} • Original Total: ৳{editingInvest.totalInvestment.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Quantity (Units)</label>
                  <input
                    type="number"
                    min="1"
                    value={editQty}
                    onChange={(e) => setEditQty(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Purchase Price / Unit (৳)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editPurchasePrice}
                    onChange={(e) => setEditPurchasePrice(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl font-mono font-bold"
                    required
                  />
                </div>
              </div>

              {/* Direct Costs */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">Box (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={editBoxCost}
                    onChange={(e) => setEditBoxCost(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">Transport (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={editTransportCost}
                    onChange={(e) => setEditTransportCost(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">Poly (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={editPolyCost}
                    onChange={(e) => setEditPolyCost(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">Sticker (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={editStickerCost}
                    onChange={(e) => setEditStickerCost(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">Tag (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={editTagCost}
                    onChange={(e) => setEditTagCost(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">Other (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={editOtherCost}
                    onChange={(e) => setEditOtherCost(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* Revised Totals */}
              <div className="p-3 bg-slate-900 text-white rounded-xl flex justify-between items-center font-mono">
                <div>
                  <span className="text-[10px] text-gray-400 block">Revised Actual Cost/Unit</span>
                  <span className="text-sm font-bold text-[#D4AF37]">৳{editActualCost}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block">Revised Total Investment</span>
                  <span className="text-sm font-bold text-emerald-400">৳{editTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Mandatory Reason for Audit Log */}
              <div>
                <label className="block font-bold text-slate-900 mb-1">
                  Reason for Correction (Mandatory Audit Trail) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Corrected invoice unit price after final supplier bill"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="w-full p-2.5 bg-amber-50 border border-amber-300 rounded-xl outline-none text-slate-900"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingInvest(null)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-800 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="flex-1 py-2.5 bg-slate-900 text-white font-bold rounded-xl"
                >
                  {submittingEdit ? 'Saving Correction...' : 'Save & Log Correction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: AUDIT HISTORY TRAIL VIEWER                                       */}
      {/* ========================================================================= */}
      {auditInvest && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold font-serif-luxury text-slate-950">
                  Audit History: #{auditInvest.investmentId}
                </h3>
              </div>
              <button
                onClick={() => setAuditInvest(null)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {auditInvest.auditHistory?.length === 0 ? (
                <p className="text-xs text-gray-400">No modification records found.</p>
              ) : (
                auditInvest.auditHistory?.map((a: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1"
                  >
                    <div className="flex justify-between items-center text-[10px] text-gray-400">
                      <span className="font-bold text-slate-800">{a.changedBy || 'ADMIN'}</span>
                      <span className="font-mono">{new Date(a.date).toLocaleString()}</span>
                    </div>
                    <p className="font-bold text-slate-900 text-[11px]">
                      Field: <span className="text-[#8C6D23]">{a.fieldChanged}</span>
                    </p>
                    <div className="flex items-center gap-2 text-gray-600 font-mono text-[10px]">
                      <span className="line-through text-red-500">{a.previousValue}</span>
                      <span>→</span>
                      <span className="font-bold text-emerald-600">{a.newValue}</span>
                    </div>
                    {a.reason && (
                      <p className="text-[11px] text-gray-500 italic mt-1 bg-white p-1.5 rounded border border-gray-100">
                        "{a.reason}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setAuditInvest(null)}
              className="w-full py-2 bg-slate-900 text-white font-bold rounded-xl text-xs"
            >
              Close Audit Trail
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: STOCK LOSS ADJUSTMENT (DAMAGED / LOST)                           */}
      {/* ========================================================================= */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-bold font-serif-luxury text-slate-950">
                  Damaged / Lost Stock Adjustment
                </h3>
              </div>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStockAdjustment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Select Product *</label>
                <select
                  value={adjustProductId}
                  onChange={(e) => {
                    const pId = e.target.value;
                    setAdjustProductId(pId);
                    const prod = products.find((p) => p._id === pId);
                    setAdjustSku(prod?.variants?.[0]?.sku || '');
                  }}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl"
                  required
                >
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Select Variant / SKU *</label>
                <select
                  value={adjustSku}
                  onChange={(e) => setAdjustSku(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl font-mono"
                  required
                >
                  {products
                    .find((p) => p._id === adjustProductId)
                    ?.variants?.map((v: any) => (
                      <option key={v.sku} value={v.sku}>
                        {v.sku} — {v.color || ''} {v.size || ''} (Current Stock: {v.stockQuantity || 0} pcs)
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Adjustment Reason *</label>
                  <select
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl font-bold"
                  >
                    <option value="DAMAGED">DAMAGED (Defective / Broken)</option>
                    <option value="LOST">LOST (Discrepancy / Missing)</option>
                    <option value="EXPIRED">EXPIRED / Shop Soiled</option>
                    <option value="INVENTORY_DISCREPANCY">Count Correction Discrepancy</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Quantity to Write Off *</label>
                  <input
                    type="number"
                    min="1"
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl font-mono font-bold text-red-600 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Incident Notes / Cause</label>
                <input
                  type="text"
                  placeholder="e.g. Broken packaging carton during courier transit"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl"
                />
              </div>

              <div className="p-3 bg-red-50 text-red-800 rounded-xl border border-red-200 text-[11px]">
                <p className="font-bold">Accounting Rule Notice:</p>
                <p>
                  Writing off {adjustQty} units will deduct sellable stock immediately and reflect as damage loss in Business Performance & P&L.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-800 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdjust}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition"
                >
                  {submittingAdjust ? 'Processing Write-Off...' : 'Confirm Stock Write-Off'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: PRINTABLE REPORT MODAL                                           */}
      {/* ========================================================================= */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl p-6 sm:p-10 space-y-6 my-8">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <h3 className="text-lg font-bold font-serif-luxury text-slate-950">
                Investment Report Print & PDF Preview
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Print / Save as PDF</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Clean Printable Sheet */}
            <div id="printable-investment-report" className="space-y-6 p-6 border border-gray-200 rounded-2xl bg-white font-sans text-xs">
              <div className="flex justify-between items-start pb-4 border-b-2 border-slate-950">
                <div>
                  <h2 className="text-3xl font-extrabold tracking-[0.2em] text-[#0F172A] font-serif-luxury">
                    AVELORA
                  </h2>
                  <p className="text-[9px] tracking-[0.3em] text-[#8C6D23] uppercase font-bold mt-0.5">
                    Product Investment & Capital Valuation Register
                  </p>
                  <p className="text-xs text-gray-500 mt-2 font-mono">
                    Report Generated: {new Date().toLocaleString()} • Filter: {filterRange.toUpperCase()}
                  </p>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-gray-100 rounded text-xs font-bold uppercase tracking-wider text-slate-800">
                    EXECUTIVE AUDIT
                  </span>
                  <p className="text-xs text-gray-400 font-mono mt-1">Currency: BDT (৳)</p>
                </div>
              </div>

              {/* Grand Total Summary Box */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 font-mono">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase block">Total Investment</span>
                  <span className="text-lg font-black text-slate-950">৳{totalInvestSum.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase block">Total Purchased Units</span>
                  <span className="text-lg font-black text-slate-950">{totalUnitsSum.toLocaleString()} pcs</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase block">Total Batches</span>
                  <span className="text-lg font-black text-slate-950">{productInvestments.length}</span>
                </div>
              </div>

              {/* Table of Investments */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-950 text-[10px] uppercase font-bold text-slate-800">
                    <th className="py-2">Date</th>
                    <th className="py-2">Investment ID</th>
                    <th className="py-2">Product Name</th>
                    <th className="py-2">SKU</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Purchase (৳)</th>
                    <th className="py-2 text-right">Pack/Ship (৳)</th>
                    <th className="py-2 text-right">Actual Cost (৳)</th>
                    <th className="py-2 text-right">Total (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-mono text-[11px]">
                  {productInvestments.map((inv: any) => (
                    <tr key={inv._id}>
                      <td className="py-2 text-gray-600">{new Date(inv.date).toISOString().slice(0, 10)}</td>
                      <td className="py-2">{inv.investmentId}</td>
                      <td className="py-2 font-sans font-bold text-slate-900">{inv.productName}</td>
                      <td className="py-2 text-gray-500">{inv.variantSku}</td>
                      <td className="py-2 text-center">{inv.quantity}</td>
                      <td className="py-2 text-right">৳{inv.purchasePrice}</td>
                      <td className="py-2 text-right">৳{inv.additionalCostPerUnit}</td>
                      <td className="py-2 text-right font-bold text-slate-900">৳{inv.actualCostPerUnit}</td>
                      <td className="py-2 text-right font-black text-slate-950">৳{inv.totalInvestment.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RECORD TREASURY CAPITAL EVENT                                      */}
      {/* ========================================================================= */}
      {showCapitalModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <h3 className="text-base font-bold font-serif-luxury text-slate-950">Record Treasury Capital Event</h3>
              <button onClick={() => setShowCapitalModal(false)} className="p-1 text-gray-400">
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
                  onClick={() => setShowCapitalModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-800 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCapital}
                  className="flex-1 py-2.5 bg-slate-900 text-white font-bold rounded-xl"
                >
                  {submittingCapital ? 'Recording...' : 'Save Capital Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
