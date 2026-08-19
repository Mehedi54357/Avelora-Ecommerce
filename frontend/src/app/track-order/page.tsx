'use client';

import React, { useState, useEffect } from 'react';
import InvoiceModal from '../../components/invoice-modal';
import { API_BASE_URL } from '../../utils/api-config';
import {
  Compass,
  Search,
  Check,
  AlertCircle,
  Printer,
  ShieldCheck,
  RotateCcw,
  Phone,
  Hash,
  Lock,
} from 'lucide-react';

const ORDER_STEPS = [
  { key: 'PENDING', label: 'Order Placed', desc: 'Received & stock reserved' },
  { key: 'CONFIRMED', label: 'Confirmed', desc: 'Order verified by atelier' },
  { key: 'PROCESSING', label: 'Packaging', desc: 'Packed in signature luxury gift box' },
  { key: 'SHIPPED', label: 'In Transit', desc: 'Dispatched with express courier' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Safely delivered to patron' },
];

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [mobile, setMobile] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlOrderId = params.get('orderId');
      const urlMobile = params.get('mobile');
      if (urlOrderId) setOrderId(urlOrderId);
      if (urlMobile) setMobile(urlMobile);
      if (urlOrderId && urlMobile) {
        fetchOrder(urlOrderId, urlMobile);
      }
    }
  }, []);

  const fetchOrder = async (targetOrderId: string, targetMobile: string) => {
    if (!targetOrderId.trim() || !targetMobile.trim()) {
      setError('Please provide both your Order ID and registered Mobile Number.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: targetOrderId.trim(),
          mobile: targetMobile.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'No matching order found with the provided details.');
      }
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Failed to locate order.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderId, mobile);
  };

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'PENDING': return 0;
      case 'CONFIRMED': return 1;
      case 'PROCESSING': return 2;
      case 'SHIPPED': return 3;
      case 'DELIVERED': return 4;
      default: return 0;
    }
  };

  const currentStep = order ? getStepIndex(order.status) : 0;
  const isCancelled = order?.status === 'CANCELLED';
  const isReturned = order?.status === 'RETURNED' || order?.status === 'RETURN_REQUESTED';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#D4AF37]/10 text-[#997B21] text-[10px] font-bold uppercase tracking-widest border border-[#D4AF37]/30">
          <Compass className="w-3.5 h-3.5" />
          <span>Real-Time Dispatch Tracking</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif-luxury text-gray-900">
          Track Your AVELORA Order
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
          For enhanced privacy & security, enter both your <strong>Order Reference ID</strong> and <strong>Recipient Mobile Number</strong>.
        </p>
      </div>

      {/* Secure Search Form (Order ID + Mobile Number) */}
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-md space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1 text-left">
            <label className="block text-xs font-bold uppercase text-gray-700">
              Order Reference ID *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. AVE-20260817-12345"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059] text-xs font-mono text-gray-900 bg-gray-50/50"
              />
              <Hash className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="space-y-1 text-left">
            <label className="block text-xs font-bold uppercase text-gray-700">
              Recipient Mobile Number *
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                placeholder="e.g. 01700000000"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059] text-xs text-gray-900 bg-gray-50/50"
              />
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Authenticated Secure Verification</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 bg-slate-950 hover:bg-[#C5A059] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition shadow disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Track Dispatch'}
          </button>
        </div>
      </form>

      {error && (
        <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs sm:text-sm text-center font-medium">
          {error}
        </div>
      )}

      {/* Live Order Timeline and Breakdown */}
      {order && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 sm:p-10 space-y-8 animate-fadeIn">
          {/* Order Meta Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-100 gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#997B21]">
                Verified Patron Order
              </span>
              <h2 className="text-xl font-bold font-mono text-gray-900">{order.orderId}</h2>
              <p className="text-xs text-gray-500">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowInvoice(true)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-[#C5A059]" /> View Invoice
              </button>
              <div className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                isCancelled ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {order.status}
              </div>
            </div>
          </div>

          {/* Progress Timeline */}
          {isCancelled ? (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center text-red-800 space-y-1">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="font-bold text-sm uppercase">Order Cancelled</p>
              <p className="text-xs">This order has been cancelled and reserved stock has been released.</p>
            </div>
          ) : isReturned ? (
            <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-center text-amber-800 space-y-1">
              <RotateCcw className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <p className="font-bold text-sm uppercase">Return Status: {order.status}</p>
              <p className="text-xs">Our concierge team is processing your item return request.</p>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800">
                Delivery Timeline Progress:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {ORDER_STEPS.map((step, idx) => {
                  const isCompleted = idx <= currentStep;
                  const isCurrent = idx === currentStep;

                  return (
                    <div
                      key={step.key}
                      className={`p-4 rounded-xl border text-center flex flex-col items-center justify-between space-y-2 transition-all ${
                        isCurrent
                          ? 'border-slate-900 bg-slate-900 text-white shadow-lg scale-105'
                          : isCompleted
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                          : 'border-gray-200 bg-gray-50 text-gray-400'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCurrent
                            ? 'bg-[#C5A059] text-slate-950'
                            : isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                      </div>
                      <div>
                        <p className={`text-xs font-bold uppercase tracking-wider ${isCurrent ? 'text-white' : ''}`}>
                          {step.label}
                        </p>
                        <p className={`text-[10px] mt-0.5 ${isCurrent ? 'text-gray-300' : 'text-gray-500'}`}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ordered Item Snapshots */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800">
              Preserved Items Snapshot:
            </h3>
            <div className="divide-y divide-gray-100">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.productImage || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=150&q=80'}
                      alt={item.productName}
                      className="w-12 h-14 object-cover rounded border border-gray-200"
                    />
                    <div>
                      <p className="text-xs font-bold text-gray-900 font-serif-luxury text-sm">{item.productName}</p>
                      <p className="text-[11px] text-gray-500">
                        {item.variant ? item.variant : ''} • SKU: {item.sku}
                      </p>
                      <p className="text-[10px] text-gray-400">Qty: {item.quantity} × ৳{item.unitPrice?.toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="text-xs font-bold font-mono text-gray-900">
                    ৳{((item.unitPrice || 0) * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Total Summary */}
            <div className="bg-[#FAFAF8] p-4 rounded-xl border border-gray-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-mono font-semibold">৳{order.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge ({order.customerDetails?.district || 'Dhaka'})</span>
                <span className="font-mono font-semibold">৳{order.deliveryCharge?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total Amount Payable</span>
                <span className="font-mono text-base text-[#0F172A]">৳{order.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      <InvoiceModal
        order={order}
        isOpen={showInvoice}
        onClose={() => setShowInvoice(false)}
      />
    </div>
  );
}
