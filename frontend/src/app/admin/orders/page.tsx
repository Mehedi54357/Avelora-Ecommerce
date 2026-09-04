'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import PrintManagerModal, { PrintMode } from '../../../components/print-manager-modal';
import PathaoBookingModal from '../../../components/pathao-booking-modal';
import QrModal from '../../../components/qr-modal';
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
  DollarSign,
  Trash2,
  ShieldAlert,
  UserCheck,
  ArrowRight,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  PhoneCall,
  Sparkles,
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

const PAYMENT_STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Payments' },
  { value: 'PAID', label: 'Paid' },
  { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
  { value: 'UNPAID', label: 'Unpaid' },
];

const DATE_RANGE_OPTIONS = [
  { value: 'ALL', label: 'All Time' },
  { value: 'TODAY', label: 'Today' },
  { value: 'YESTERDAY', label: 'Yesterday' },
  { value: '7D', label: 'Last 7 Days' },
  { value: '30D', label: 'Last 30 Days' },
  { value: 'THIS_MONTH', label: 'This Month' },
  { value: 'CUSTOM', label: 'Custom Range' },
];

// Highlight search matches
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!text) return null;
  if (!query || query.trim().length < 2) return <span>{text}</span>;

  const cleanQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${cleanQuery})`, 'gi'));

  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.trim().toLowerCase() ? (
          <mark key={i} className="bg-amber-200 text-slate-950 font-bold px-0.5 rounded-xs">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </span>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 1,
  });

  // Filters State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('ALL');
  const [dataModeFilter, setDataModeFilter] = useState('PRODUCTION');
  const [courierFilter, setCourierFilter] = useState('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Search input ref for keyboard shortcut (Ctrl + /)
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Direct Delivery & Customer Pickup Fulfillment Modal
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryTargetOrder, setDeliveryTargetOrder] = useState<any>(null);
  const [deliveryType, setDeliveryType] = useState<'DIRECT_HAND_DELIVERY' | 'CUSTOMER_PICKUP'>('DIRECT_HAND_DELIVERY');
  const [paymentReceivedNow, setPaymentReceivedNow] = useState(false);
  const [deliveryAmount, setDeliveryAmount] = useState<number>(0);
  const [deliveryPaymentMethod, setDeliveryPaymentMethod] = useState('Cash');
  const [deliveryTransactionRef, setDeliveryTransactionRef] = useState('');
  const [deliveryAccount, setDeliveryAccount] = useState('Cash On Hand');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [submittingDelivery, setSubmittingDelivery] = useState(false);

  // Record Manual Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentTargetOrder, setPaymentTargetOrder] = useState<any>(null);
  const [manualPayAmount, setManualPayAmount] = useState<number>(0);
  const [manualPayMethod, setManualPayMethod] = useState('Cash');
  const [manualPayRef, setManualPayRef] = useState('');
  const [manualPayAccount, setManualPayAccount] = useState('Cash On Hand');
  const [manualPayNotes, setManualPayNotes] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Return Processing Modal
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('Customer Changed Mind');
  const [refundAmount, setRefundAmount] = useState(0);
  const [restockInventory, setRestockInventory] = useState(true);
  const [processingReturn, setProcessingReturn] = useState(false);

  // Debounce search by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on search change
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Keyboard shortcut Ctrl + / or Cmd + / to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize filter state from URL if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlSearch = urlParams.get('search');
      const urlStatus = urlParams.get('status');
      const urlPayment = urlParams.get('paymentStatus');
      const urlFulfillment = urlParams.get('fulfillmentMethod');
      const urlDataMode = urlParams.get('dataMode');
      const urlCourier = urlParams.get('courier');
      const urlDateRange = urlParams.get('dateRange');
      const urlPage = urlParams.get('page');
      const urlLimit = urlParams.get('limit');

      if (urlSearch) setSearch(urlSearch);
      if (urlStatus) setStatusFilter(urlStatus);
      if (urlPayment) setPaymentStatusFilter(urlPayment);
      if (urlFulfillment) setFulfillmentFilter(urlFulfillment);
      if (urlDataMode) setDataModeFilter(urlDataMode);
      if (urlCourier) setCourierFilter(urlCourier);
      if (urlDateRange) setDateRangeFilter(urlDateRange);
      if (urlPage) setPage(Number(urlPage) || 1);
      if (urlLimit) setLimit(Number(urlLimit) || 50);
    }
  }, []);

  // Sync state to URL
  const syncUrlParams = useCallback(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (statusFilter && statusFilter !== 'ALL') params.set('status', statusFilter);
    if (paymentStatusFilter && paymentStatusFilter !== 'ALL') params.set('paymentStatus', paymentStatusFilter);
    if (fulfillmentFilter && fulfillmentFilter !== 'ALL') params.set('fulfillmentMethod', fulfillmentFilter);
    if (dataModeFilter && dataModeFilter !== 'PRODUCTION') params.set('dataMode', dataModeFilter);
    if (courierFilter && courierFilter !== 'ALL') params.set('courier', courierFilter);
    if (dateRangeFilter && dateRangeFilter !== 'ALL') params.set('dateRange', dateRangeFilter);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (page > 1) params.set('page', String(page));
    if (limit !== 50) params.set('limit', String(limit));

    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
  }, [
    debouncedSearch,
    statusFilter,
    paymentStatusFilter,
    fulfillmentFilter,
    dataModeFilter,
    courierFilter,
    dateRangeFilter,
    startDate,
    endDate,
    page,
    limit,
  ]);

  // Fetch Orders from Server
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'ALL') params.set('status', statusFilter);
      if (paymentStatusFilter && paymentStatusFilter !== 'ALL') params.set('paymentStatus', paymentStatusFilter);
      if (fulfillmentFilter && fulfillmentFilter !== 'ALL') params.set('fulfillmentMethod', fulfillmentFilter);
      if (dataModeFilter && dataModeFilter !== 'ALL') params.set('dataMode', dataModeFilter);
      if (courierFilter && courierFilter !== 'ALL') params.set('courier', courierFilter);
      if (dateRangeFilter && dateRangeFilter !== 'ALL') params.set('dateRange', dateRangeFilter);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (debouncedSearch) params.set('search', debouncedSearch);
      params.set('page', String(page));
      params.set('limit', String(limit));

      const res = await authFetch(`${API_BASE_URL}/api/orders/admin?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      }
    } catch (e) {
      console.error('Error fetching orders:', e);
    } finally {
      setLoading(false);
      syncUrlParams();
    }
  }, [
    statusFilter,
    paymentStatusFilter,
    fulfillmentFilter,
    dataModeFilter,
    courierFilter,
    dateRangeFilter,
    startDate,
    endDate,
    debouncedSearch,
    page,
    limit,
    syncUrlParams,
  ]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setStatusFilter('ALL');
    setPaymentStatusFilter('ALL');
    setFulfillmentFilter('ALL');
    setDataModeFilter('PRODUCTION');
    setCourierFilter('ALL');
    setDateRangeFilter('ALL');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const hasActiveFilters =
    debouncedSearch ||
    statusFilter !== 'ALL' ||
    paymentStatusFilter !== 'ALL' ||
    fulfillmentFilter !== 'ALL' ||
    dataModeFilter !== 'PRODUCTION' ||
    courierFilter !== 'ALL' ||
    dateRangeFilter !== 'ALL';

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/orders/admin/${id}/status`, {
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

  // Open Direct Delivery or Pickup Modal
  const openDeliveryModal = (order: any, type: 'DIRECT_HAND_DELIVERY' | 'CUSTOMER_PICKUP') => {
    setDeliveryTargetOrder(order);
    setDeliveryType(type);
    const remainingDue =
      order.dueAmount !== undefined ? order.dueAmount : Math.max(0, (order.totalAmount || 0) - (order.paidAmount || 0));
    setDeliveryAmount(remainingDue);
    setPaymentReceivedNow(false);
    setDeliveryPaymentMethod('Cash');
    setDeliveryTransactionRef('');
    setDeliveryAccount(type === 'DIRECT_HAND_DELIVERY' ? 'Cash On Hand' : 'Store Cash Register');
    setDeliveryNotes('');
    setShowDeliveryModal(true);
  };

  // Submit Direct Delivery / Pickup
  const handleConfirmDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryTargetOrder) return;
    setSubmittingDelivery(true);

    try {
      const endpoint =
        deliveryType === 'DIRECT_HAND_DELIVERY'
          ? `${API_BASE_URL}/api/orders/admin/${deliveryTargetOrder._id}/confirm-direct-delivery`
          : `${API_BASE_URL}/api/orders/admin/${deliveryTargetOrder._id}/confirm-customer-pickup`;

      const res = await authFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentReceived: paymentReceivedNow,
          amount: paymentReceivedNow ? Number(deliveryAmount) : 0,
          paymentMethod: deliveryPaymentMethod,
          transactionReference: deliveryTransactionRef,
          account: deliveryAccount,
          notes: deliveryNotes,
        }),
      });

      if (res.ok) {
        setShowDeliveryModal(false);
        fetchOrders();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to complete delivery confirmation.');
      }
    } catch (err: any) {
      alert(err.message || 'Error confirming delivery.');
    } finally {
      setSubmittingDelivery(false);
    }
  };

  // Open Manual Payment Recording Modal
  const openPaymentModal = (order: any) => {
    setPaymentTargetOrder(order);
    const remainingDue =
      order.dueAmount !== undefined ? order.dueAmount : Math.max(0, (order.totalAmount || 0) - (order.paidAmount || 0));
    setManualPayAmount(remainingDue);
    setManualPayMethod('Cash');
    setManualPayRef('');
    setManualPayAccount('Cash On Hand');
    setManualPayNotes('');
    setShowPaymentModal(true);
  };

  // Submit Manual Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentTargetOrder) return;
    setSubmittingPayment(true);

    try {
      const res = await authFetch(`${API_BASE_URL}/api/orders/admin/${paymentTargetOrder._id}/record-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(manualPayAmount),
          paymentMethod: manualPayMethod,
          transactionReference: manualPayRef,
          account: manualPayAccount,
          notes: manualPayNotes,
        }),
      });

      if (res.ok) {
        setShowPaymentModal(false);
        fetchOrders();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to record payment.');
      }
    } catch (err: any) {
      alert(err.message || 'Error recording payment.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Test Order Reset
  const handleResetTestOrder = async (id: string, orderId: string) => {
    if (
      !confirm(
        `Are you sure you want to RESET test order "${orderId}"? This will return its stock reservation to initial state.`,
      )
    )
      return;

    try {
      const res = await authFetch(`${API_BASE_URL}/api/orders/admin/${id}/reset-test`, {
        method: 'POST',
      });
      if (res.ok) {
        fetchOrders();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to reset test order.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to reset test order.');
    }
  };

  // Test Order Delete
  const handleDeleteTestOrder = async (id: string, orderId: string) => {
    if (!confirm(`Are you sure you want to permanently DELETE test order "${orderId}"?`)) return;

    try {
      const res = await authFetch(`${API_BASE_URL}/api/orders/admin/${id}/test`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchOrders();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to delete test order.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete test order.');
    }
  };

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
      const res = await authFetch(`${API_BASE_URL}/api/orders/admin/${activeOrder._id}/return`, {
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
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6D23]">
              AVELORA ERP Order Control
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#D4AF37]/10 text-[#8C6D23] border border-[#D4AF37]/30">
              Smart Search Engine
            </span>
          </div>
          <h1 className="text-2xl font-extrabold font-serif-luxury text-slate-950 mt-0.5">
            Orders Workspace ({pagination.total})
          </h1>
          <p className="text-xs text-gray-500">
            Intelligent Phone, Order ID, Consignment, and SKU search with multi-dimensional filtering.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs shadow-md">
              <span className="font-bold">{selectedIds.length} Selected</span>
              <button
                onClick={() => {
                  const selectedOrders = orders.filter((o) => selectedIds.includes(o._id));
                  handleOpenPrint(selectedOrders, 'INVOICE');
                }}
                className="px-2 py-1 bg-[#D4AF37] text-slate-950 font-bold rounded-lg text-[11px] hover:bg-[#b58f44] ml-2 cursor-pointer"
              >
                Batch Invoices
              </button>
              <button
                onClick={() => {
                  const selectedOrders = orders.filter((o) => selectedIds.includes(o._id));
                  handleOpenPrint(selectedOrders, 'SHIPPING_LABEL');
                }}
                className="px-2 py-1 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg text-[11px] cursor-pointer"
              >
                Labels
              </button>
            </div>
          )}

          <button
            onClick={fetchOrders}
            disabled={loading}
            className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Prominent Smart Search Box & Control Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        {/* Main Search Input */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search Order ID, Phone, Customer, Tracking ID, SKU (Ctrl + /)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-24 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 text-xs text-slate-900 bg-white font-medium shadow-inner transition"
            />
            <div className="absolute right-3 top-2.5 flex items-center gap-1.5">
              {loading && <Loader2 className="w-4 h-4 text-[#D4AF37] animate-spin" />}
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-md cursor-pointer transition"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-gray-100 border border-gray-200 rounded-md shadow-xs">
                Ctrl /
              </kbd>
            </div>
          </div>

          {/* Quick Data Mode & Filter Toggle */}
          <div className="flex items-center gap-2">
            {/* Data Mode Switcher */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs border border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setDataModeFilter('PRODUCTION');
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  dataModeFilter === 'PRODUCTION' ? 'bg-white text-slate-900 shadow-xs' : 'text-gray-500'
                }`}
              >
                Production
              </button>
              <button
                type="button"
                onClick={() => {
                  setDataModeFilter('TEST');
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  dataModeFilter === 'TEST' ? 'bg-purple-700 text-white shadow-xs' : 'text-purple-700'
                }`}
              >
                🧪 Test Only
              </button>
              <button
                type="button"
                onClick={() => {
                  setDataModeFilter('ALL');
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                  dataModeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-gray-500'
                }`}
              >
                All Data
              </button>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              type="button"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`md:hidden px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                hasActiveFilters
                  ? 'bg-[#D4AF37] text-slate-950 border-[#D4AF37]'
                  : 'bg-gray-100 text-gray-700 border-gray-200'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Desktop Filter Row / Mobile Drawer */}
        <div className={`${showMobileFilters ? 'block' : 'hidden md:block'} space-y-3 pt-2 border-t border-gray-100`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {/* Payment Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Payment Status
              </label>
              <select
                value={paymentStatusFilter}
                onChange={(e) => {
                  setPaymentStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-slate-900 font-medium focus:outline-none focus:border-[#D4AF37]"
              >
                {PAYMENT_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Fulfillment Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Fulfillment Method
              </label>
              <select
                value={fulfillmentFilter}
                onChange={(e) => {
                  setFulfillmentFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-slate-900 font-medium focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="ALL">All Methods</option>
                <option value="COURIER">Courier (Pathao)</option>
                <option value="DIRECT_HAND_DELIVERY">Direct Hand Delivery</option>
                <option value="CUSTOMER_PICKUP">Customer Pickup</option>
              </select>
            </div>

            {/* Courier Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Courier Provider
              </label>
              <select
                value={courierFilter}
                onChange={(e) => {
                  setCourierFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-slate-900 font-medium focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="ALL">All Couriers</option>
                <option value="Pathao">Pathao Express</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                Date Range
              </label>
              <select
                value={dateRangeFilter}
                onChange={(e) => {
                  setDateRangeFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-slate-900 font-medium focus:outline-none focus:border-[#D4AF37]"
              >
                {DATE_RANGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filters Button */}
            <div className="flex items-end">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="w-full py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear All Filters</span>
                </button>
              )}
            </div>
          </div>

          {/* Custom Date Inputs if CUSTOM selected */}
          {dateRangeFilter === 'CUSTOM' && (
            <div className="flex items-center gap-3 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-amber-900">From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs text-slate-900"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-amber-900">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs text-slate-900"
                />
              </div>
            </div>
          )}
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider transition cursor-pointer ${
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

      {/* Orders Table & Results */}
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
                    className="rounded border-gray-300 text-slate-900 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Order ID &amp; Type</th>
                <th className="py-3.5 px-4">Customer &amp; Contact</th>
                <th className="py-3.5 px-4">Items &amp; SKU</th>
                <th className="py-3.5 px-4 text-right">Financials &amp; Balance</th>
                <th className="py-3.5 px-4 text-center">Payment</th>
                <th className="py-3.5 px-4 text-center">Order Status</th>
                <th className="py-3.5 px-4 text-center">Fulfillment &amp; Dispatch</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-gray-500">
                    <Loader2 className="w-7 h-7 animate-spin mx-auto text-[#D4AF37] mb-2" />
                    <p className="font-semibold text-slate-900">Loading orders...</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-gray-500">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                        <Search className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-bold text-slate-950 font-serif-luxury">No matching orders found</h3>
                      <p className="text-xs text-gray-500">
                        {hasActiveFilters
                          ? `No orders match your current search "${search}" and active filter parameters.`
                          : 'No orders are currently available in the database.'}
                      </p>
                      {hasActiveFilters && (
                        <div className="flex items-center justify-center gap-2 pt-2">
                          <button
                            onClick={() => setSearch('')}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition cursor-pointer"
                          >
                            Clear Search
                          </button>
                          <button
                            onClick={handleResetFilters}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-[#D4AF37] hover:text-slate-950 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                          >
                            Reset All Filters
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const isSelected = selectedIds.includes(order._id);
                  const isUpdating = updatingId === order._id;
                  const isDelivered = order.status === 'DELIVERED';
                  const isTest = order.dataMode === 'TEST';
                  const method = order.fulfillmentMethod || 'COURIER';
                  const due =
                    order.dueAmount !== undefined
                      ? order.dueAmount
                      : Math.max(0, (order.totalAmount || 0) - (order.paidAmount || 0));

                  return (
                    <tr
                      key={order._id}
                      className={`hover:bg-gray-50/80 transition ${
                        isSelected ? 'bg-[#D4AF37]/5' : ''
                      } ${isTest ? 'bg-purple-50/20' : ''}`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(order._id)}
                          className="rounded border-gray-300 text-slate-900 cursor-pointer"
                        />
                      </td>

                      {/* Order ID, Date & Test Badge */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <p className="font-mono font-bold text-slate-950 text-xs">
                            <HighlightedText text={order.orderId} query={debouncedSearch} />
                          </p>
                          {isTest && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-100 text-purple-800 border border-purple-200 uppercase">
                              TEST
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString()} &bull;{' '}
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>

                      {/* Customer & Phone */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">
                          <HighlightedText text={order.customerDetails?.name || 'Customer'} query={debouncedSearch} />
                        </p>
                        <p className="text-gray-600 font-mono text-[11px] mt-0.5">
                          <HighlightedText text={order.customerDetails?.mobile || ''} query={debouncedSearch} />
                        </p>
                        <p className="text-[10px] text-gray-400 truncate max-w-[160px]">
                          {order.customerDetails?.district || 'Dhaka'}
                        </p>
                      </td>

                      {/* Items & SKU */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          {order.items?.map((item: any, i: number) => (
                            <p key={i} className="text-gray-700 truncate max-w-[180px]">
                              <span className="font-semibold text-slate-950">{item.quantity}x</span>{' '}
                              <HighlightedText text={item.productName} query={debouncedSearch} />
                              <span className="text-[10px] text-gray-400 font-mono">
                                {' '}(<HighlightedText text={item.sku} query={debouncedSearch} />)
                              </span>
                            </p>
                          ))}
                        </div>
                      </td>

                      {/* Financials & Balance */}
                      <td className="py-3.5 px-4 text-right font-mono">
                        <p className="font-bold text-slate-950">৳{(order.totalAmount || 0).toLocaleString()}</p>
                        <div className="text-[10px] space-y-0.5 mt-0.5">
                          <p className="text-emerald-700 font-medium">
                            Paid: ৳{(order.paidAmount || 0).toLocaleString()}
                          </p>
                          <p className={`font-bold ${due > 0 ? 'text-amber-800' : 'text-gray-400'}`}>
                            Due: ৳{due.toLocaleString()}
                          </p>
                        </div>
                      </td>

                      {/* Payment Status Badge */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            order.paymentStatus === 'PAID'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : order.paymentStatus === 'PARTIALLY_PAID'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {order.paymentStatus === 'PARTIALLY_PAID' ? 'PARTIAL' : order.paymentStatus || 'UNPAID'}
                        </span>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4 text-center">
                        <select
                          value={order.status}
                          disabled={isUpdating}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider outline-none border transition cursor-pointer ${
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

                      {/* Fulfillment Method Dispatch Cell */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="space-y-1">
                          {method === 'COURIER' && (
                            <>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                <Truck className="w-3 h-3 text-blue-600" />
                                Courier (Pathao)
                              </span>
                              {order.courier?.consignmentId ? (
                                <div className="space-y-0.5">
                                  <span className="font-mono text-[10px] font-bold text-gray-700 block">
                                    #<HighlightedText text={order.courier.consignmentId} query={debouncedSearch} />
                                  </span>
                                  <button
                                    onClick={() => handleSyncPathaoStatus(order._id)}
                                    disabled={isUpdating}
                                    className="text-[9px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer block mx-auto"
                                  >
                                    Sync ↻
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setBookingOrder(order);
                                    setShowPathaoModal(true);
                                  }}
                                  className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-[10px] font-bold uppercase tracking-wider transition flex items-center gap-1 mx-auto cursor-pointer"
                                >
                                  <Truck className="w-3 h-3" />
                                  <span>Book Courier</span>
                                </button>
                              )}
                            </>
                          )}

                          {method === 'DIRECT_HAND_DELIVERY' && (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                                <UserCheck className="w-3 h-3 text-purple-600" />
                                Hand Delivery
                              </span>
                              {!isDelivered ? (
                                <button
                                  onClick={() => openDeliveryModal(order, 'DIRECT_HAND_DELIVERY')}
                                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition block mx-auto cursor-pointer shadow-xs"
                                >
                                  Confirm Delivery
                                </button>
                              ) : (
                                <span className="text-[10px] text-emerald-700 font-bold block">✓ Delivered</span>
                              )}
                            </div>
                          )}

                          {method === 'CUSTOMER_PICKUP' && (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                                <Package className="w-3 h-3 text-teal-600" />
                                Store Pickup
                              </span>
                              {!isDelivered ? (
                                <button
                                  onClick={() => openDeliveryModal(order, 'CUSTOMER_PICKUP')}
                                  className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition block mx-auto cursor-pointer shadow-xs"
                                >
                                  Confirm Pickup
                                </button>
                              ) : (
                                <span className="text-[10px] text-emerald-700 font-bold block">✓ Picked Up</span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setActiveOrder(order);
                              setShowDrawer(true);
                            }}
                            title="View Order Details Drawer"
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenPrint([order], 'INVOICE')}
                            title="Print Invoice"
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleGenerateQr(order)}
                            title="Generate QR Tracking Label"
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition cursor-pointer"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          {due > 0 && (
                            <button
                              onClick={() => openPaymentModal(order)}
                              title="Record Payment / Due Balance"
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg transition cursor-pointer border border-amber-200"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>
                          )}

                          {isTest && (
                            <>
                              <button
                                onClick={() => handleResetTestOrder(order._id, order.orderId)}
                                title="Reset Test Order Stock"
                                className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTestOrder(order._id, order.orderId)}
                                title="Delete Test Order"
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Bar */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span>
              Showing {pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders
            </span>
            <div className="flex items-center gap-1 ml-2">
              <span className="text-[11px] text-gray-400">Rows:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 bg-white border border-gray-200 rounded-md text-xs"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page <= 1}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg font-mono font-bold text-slate-900">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Drawer Details Modal */}
      {showDrawer && activeOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={() => setShowDrawer(false)} />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-lg bg-white shadow-2xl p-6 overflow-y-auto space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h3 className="text-lg font-bold font-serif-luxury text-slate-950">
                    Order Details #{activeOrder.orderId}
                  </h3>
                  <p className="text-xs text-gray-500">Placed on {new Date(activeOrder.createdAt).toLocaleString()}</p>
                </div>
                <button onClick={() => setShowDrawer(false)} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Customer Details</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Name:</span>
                    <p className="font-semibold text-slate-900">{activeOrder.customerDetails?.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Phone:</span>
                    <p className="font-semibold font-mono text-slate-900">{activeOrder.customerDetails?.mobile}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400">Address:</span>
                    <p className="font-semibold text-slate-900">
                      {activeOrder.customerDetails?.address}, {activeOrder.customerDetails?.district}
                    </p>
                  </div>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Financial Breakdown</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal:</span>
                    <span className="font-mono font-bold">৳{(activeOrder.subtotal || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivery Charge:</span>
                    <span className="font-mono font-bold">৳{(activeOrder.deliveryCharge || 0).toLocaleString()}</span>
                  </div>
                  {activeOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount:</span>
                      <span className="font-mono font-bold">-৳{activeOrder.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-1.5 text-sm font-bold">
                    <span>Total Amount:</span>
                    <span className="font-mono text-slate-950">৳{(activeOrder.totalAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Paid:</span>
                    <span className="font-mono font-bold">৳{(activeOrder.paidAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-amber-800">
                    <span>Due:</span>
                    <span className="font-mono font-bold">
                      ৳
                      {(activeOrder.dueAmount !== undefined
                        ? activeOrder.dueAmount
                        : Math.max(0, (activeOrder.totalAmount || 0) - (activeOrder.paidAmount || 0))
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Purchased Items</h4>
                <div className="space-y-2">
                  {activeOrder.items?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-xl text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{item.productName}</p>
                        <p className="text-[11px] text-gray-500 font-mono">
                          SKU: {item.sku} &bull; Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        ৳{((item.unitPrice || 0) * (item.quantity || 1)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons in Drawer */}
              <div className="pt-4 border-t space-y-2">
                <button
                  onClick={() => {
                    handleOpenPrint([activeOrder], 'INVOICE');
                  }}
                  className="w-full py-2.5 bg-[#D4AF37] hover:bg-[#b58f44] text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Formal Invoice</span>
                </button>
                <button
                  onClick={() => {
                    setShowDrawer(false);
                    handleGenerateQr(activeOrder);
                  }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Issue Tracking QR Label</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Direct Delivery & Pickup Fulfillment Modal */}
      {showDeliveryModal && deliveryTargetOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6D23]">
                  {deliveryType === 'DIRECT_HAND_DELIVERY' ? 'Direct Doorstep Delivery' : 'Customer Store Pickup'}
                </span>
                <h3 className="text-lg font-bold text-slate-950 font-serif-luxury mt-0.5">
                  Confirm {deliveryType === 'DIRECT_HAND_DELIVERY' ? 'Delivery' : 'Pickup'} (#{deliveryTargetOrder.orderId})
                </h3>
              </div>
              <button onClick={() => setShowDeliveryModal(false)} className="p-1 hover:bg-gray-100 rounded-full cursor-pointer">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleConfirmDelivery} className="space-y-4">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900">
                <p className="font-bold">Independent Delivery &amp; Payment</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Confirming delivery sets Order Status to <strong>DELIVERED</strong>. You can choose whether payment is collected now or left as UNPAID/Due.
                </p>
              </div>

              {/* Payment toggle */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-900">Payment received now?</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentReceivedNow(true)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      paymentReceivedNow
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    ✓ Yes, Record Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentReceivedNow(false)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      !paymentReceivedNow
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    ✗ No (Deliver as Unpaid/Due)
                  </button>
                </div>
              </div>

              {/* Payment Fields if Yes */}
              {paymentReceivedNow && (
                <div className="space-y-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Amount Received (৳)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={deliveryAmount}
                      onChange={(e) => setDeliveryAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Payment Method</label>
                    <select
                      value={deliveryPaymentMethod}
                      onChange={(e) => setDeliveryPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs"
                    >
                      <option value="Cash">Cash</option>
                      <option value="bKash">bKash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Bank">Bank Transfer</option>
                      <option value="Card">Card / POS</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">TrxID / Reference (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. TRX-992211"
                      value={deliveryTransactionRef}
                      onChange={(e) => setDeliveryTransactionRef(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Delivery Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Handed over to customer at front door..."
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeliveryModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDelivery}
                  className="flex-1 py-2.5 bg-slate-950 hover:bg-[#D4AF37] hover:text-slate-950 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {submittingDelivery && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Confirm {deliveryType === 'DIRECT_HAND_DELIVERY' ? 'Delivery' : 'Pickup'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Payment Recording Modal */}
      {showPaymentModal && paymentTargetOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6D23]">Authoritative Payment Ledger</span>
                <h3 className="text-lg font-bold text-slate-950 font-serif-luxury mt-0.5">
                  Record Payment (#{paymentTargetOrder.orderId})
                </h3>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="p-1 hover:bg-gray-100 rounded-full cursor-pointer">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <div className="flex justify-between">
                  <span>Order Total:</span>
                  <span className="font-mono font-bold">৳{(paymentTargetOrder.totalAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Already Paid:</span>
                  <span className="font-mono font-bold">৳{(paymentTargetOrder.paidAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-amber-800 font-bold border-t border-emerald-200 pt-1">
                  <span>Outstanding Due:</span>
                  <span className="font-mono">
                    ৳
                    {(paymentTargetOrder.dueAmount !== undefined
                      ? paymentTargetOrder.dueAmount
                      : Math.max(0, (paymentTargetOrder.totalAmount || 0) - (paymentTargetOrder.paidAmount || 0))
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Amount Collecting Now (৳)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={manualPayAmount}
                  onChange={(e) => setManualPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-mono font-bold focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Payment Method</label>
                <select
                  value={manualPayMethod}
                  onChange={(e) => setManualPayMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs"
                >
                  <option value="Cash">Cash</option>
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Bank">Bank Transfer</option>
                  <option value="Card">Card / POS</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">TrxID / Reference (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. TRX-992211"
                  value={manualPayRef}
                  onChange={(e) => setManualPayRef(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Customer paid balance upon delivery"
                  value={manualPayNotes}
                  onChange={(e) => setManualPayNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="flex-1 py-2.5 bg-slate-950 hover:bg-[#D4AF37] hover:text-slate-950 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {submittingPayment && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Record ৳{manualPayAmount.toLocaleString()}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      <PathaoBookingModal
        isOpen={showPathaoModal}
        onClose={() => {
          setShowPathaoModal(false);
          setBookingOrder(null);
        }}
        order={bookingOrder}
        onSuccess={() => {
          fetchOrders();
        }}
      />

      <PrintManagerModal
        isOpen={showPrintModal}
        onClose={() => {
          setShowPrintModal(false);
          setPrintOrdersList([]);
        }}
        orders={printOrdersList}
        initialMode={printMode}
      />

      <QrModal
        isOpen={showQrModal}
        onClose={() => {
          setShowQrModal(false);
          setQrOrder(null);
        }}
        order={qrOrder}
        payload={qrPayload}
      />
    </div>
  );
}
