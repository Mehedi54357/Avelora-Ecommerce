'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../../context/cart-context';
import InvoiceModal from '../../components/invoice-modal';
import {
  ShieldCheck,
  Truck,
  ShoppingBag,
  CheckCircle,
  CreditCard,
  Phone,
  MapPin,
  User,
  ArrowRight,
  Printer,
  Compass,
} from 'lucide-react';

const BANGLADESH_DISTRICTS = [
  'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh',
  'Comilla', 'Gazipur', 'Narayanganj', 'Bogra', 'Cox\'s Bazar', 'Jessore', 'Dinajpur', 'Feni',
  'Tangail', 'Jamalpur', 'Pabna', 'Noakhali', 'Brahmanbaria', 'Kushtia', 'Faridpur', 'Other District'
];

export default function CheckoutPage() {
  const { cart, cartSubtotal, clearCart } = useCart();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'bKash' | 'Nagad'>('COD');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  const isDhaka = district.toLowerCase().includes('dhaka');
  const deliveryCharge = isDhaka ? 70 : 130;
  const grandTotal = cartSubtotal + deliveryCharge;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (cart.length === 0) {
      setError('Your shopping bag is empty.');
      return;
    }

    if (!name.trim() || !mobile.trim() || !address.trim()) {
      setError('Please provide your complete name, mobile number, and delivery address.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        customerDetails: {
          name: name.trim(),
          mobile: mobile.trim(),
          address: address.trim(),
          district,
        },
        items: cart.map((item) => ({
          productId: item.productId,
          sku: item.sku,
          quantity: item.quantity,
        })),
        paymentMethod,
        deliveryCharge,
        notes,
      };

      const res = await fetch('http://localhost:3001/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to place order. Please try again.');
      }

      setCompletedOrder(data);
      clearCart();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please verify stock and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // If order was successfully placed
  if (completedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8 animate-fadeIn">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-lg animate-bounce">
          <CheckCircle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#C5A059]">
            Order Confirmed
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif-luxury text-gray-900">
            Thank You For Your Patronage
          </h1>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Your order has been safely placed. We are preparing your pieces in our signature luxury gift packaging.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-md text-left space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-100 gap-2">
            <div>
              <p className="text-xs text-gray-500 font-medium">Order Reference ID</p>
              <p className="text-xl font-mono font-bold text-gray-900">{completedOrder.orderId}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Total Payable</p>
              <p className="text-xl font-mono font-bold text-[#0F172A]">
                ৳{completedOrder.totalAmount?.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-600 pt-2">
            <div>
              <p className="font-bold text-gray-900">Recipient:</p>
              <p>{completedOrder.customerDetails?.name}</p>
              <p>{completedOrder.customerDetails?.mobile}</p>
              <p className="mt-1">{completedOrder.customerDetails?.address}, {completedOrder.customerDetails?.district}</p>
            </div>
            <div>
              <p className="font-bold text-gray-900">Payment & Delivery:</p>
              <p>Method: <span className="font-semibold text-gray-800">{completedOrder.paymentMethod}</span></p>
              <p>Status: <span className="font-semibold text-amber-600">{completedOrder.status}</span></p>
              <p className="mt-1 text-emerald-600 font-semibold">Includes Signature AVELORA Bag</p>
            </div>
          </div>
        </div>

        {/* Next Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setShowInvoice(true)}
            className="w-full sm:w-auto px-6 py-3.5 bg-white border border-gray-300 text-gray-800 font-bold text-xs uppercase tracking-wider rounded-full hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4 text-[#C5A059]" /> View / Print Tax Invoice
          </button>

          <Link
            href={`/track-order?orderId=${completedOrder.orderId}`}
            className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 text-white font-bold text-xs uppercase tracking-widest rounded-full hover:bg-[#C5A059] transition shadow flex items-center justify-center gap-2"
          >
            <Compass className="w-4 h-4" /> Live Order Tracking
          </Link>
        </div>

        {/* Invoice Modal */}
        <InvoiceModal
          order={completedOrder}
          isOpen={showInvoice}
          onClose={() => setShowInvoice(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center space-y-2 mb-10">
        <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#C5A059]">
          Secure Checkout
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif-luxury text-gray-900">
          Complete Your Order
        </h1>
        <p className="text-xs text-gray-500">Fast one-page checkout • No account registration required</p>
      </div>

      {error && (
        <div className="max-w-4xl mx-auto mb-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs sm:text-sm font-medium">
          {error}
        </div>
      )}

      {cart.length === 0 ? (
        <div className="max-w-md mx-auto text-center py-16 bg-white rounded-2xl border border-gray-200 p-8 space-y-4">
          <ShoppingBag className="w-12 h-12 text-[#C5A059] mx-auto" />
          <h2 className="text-lg font-bold font-serif-luxury text-gray-900">Your Shopping Bag is Empty</h2>
          <p className="text-xs text-gray-500">Add pieces to your bag before proceeding to checkout.</p>
          <Link
            href="/products"
            className="inline-block px-6 py-3 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-[#C5A059] transition"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Delivery & Payment Details */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Customer Information */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-sm space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <User className="w-4 h-4 text-[#C5A059]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                  1. Shipping & Recipient Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mahfuzur Rahman"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#C5A059] text-xs text-gray-900 bg-gray-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 01700000000"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#C5A059] text-xs text-gray-900 bg-gray-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase">
                    District / Region *
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#C5A059] text-xs font-semibold text-gray-900 bg-white"
                  >
                    {BANGLADESH_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d} {d.toLowerCase() === 'dhaka' ? '(৳70 Delivery)' : '(৳130 Delivery)'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase">
                    Full Delivery Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="House, Road, Area, Landmark"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#C5A059] text-xs text-gray-900 bg-gray-50/50"
                  />
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <label className="block text-xs font-bold text-gray-700 uppercase">
                  Order Special Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Special instructions for delivery or gift notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#C5A059] text-xs text-gray-900 bg-gray-50/50"
                />
              </div>
            </div>

            {/* 2. Payment Method Selector */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-sm space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <CreditCard className="w-4 h-4 text-[#C5A059]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                  2. Select Payment Method
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Cash On Delivery */}
                <label
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    paymentMethod === 'COD'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                      : 'border-gray-200 hover:border-gray-400 bg-white text-gray-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="sr-only"
                  />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider">Cash on Delivery</span>
                    <p className={`text-[10px] mt-1 ${paymentMethod === 'COD' ? 'text-gray-300' : 'text-gray-500'}`}>
                      Pay upon delivery after inspection
                    </p>
                  </div>
                  <span className={`text-[10px] font-semibold mt-3 ${paymentMethod === 'COD' ? 'text-[#E6CA85]' : 'text-emerald-600'}`}>
                    Available Nationwide
                  </span>
                </label>

                {/* bKash */}
                <label
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    paymentMethod === 'bKash'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                      : 'border-gray-200 hover:border-gray-400 bg-white text-gray-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="bKash"
                    checked={paymentMethod === 'bKash'}
                    onChange={() => setPaymentMethod('bKash')}
                    className="sr-only"
                  />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider">bKash Payment</span>
                    <p className={`text-[10px] mt-1 ${paymentMethod === 'bKash' ? 'text-gray-300' : 'text-gray-500'}`}>
                      Direct Mobile Banking
                    </p>
                  </div>
                  <span className={`text-[10px] font-semibold mt-3 ${paymentMethod === 'bKash' ? 'text-[#E6CA85]' : 'text-pink-600'}`}>
                    Merchant / Send Money
                  </span>
                </label>

                {/* Nagad */}
                <label
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    paymentMethod === 'Nagad'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                      : 'border-gray-200 hover:border-gray-400 bg-white text-gray-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="Nagad"
                    checked={paymentMethod === 'Nagad'}
                    onChange={() => setPaymentMethod('Nagad')}
                    className="sr-only"
                  />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider">Nagad Payment</span>
                    <p className={`text-[10px] mt-1 ${paymentMethod === 'Nagad' ? 'text-gray-300' : 'text-gray-500'}`}>
                      Digital Postal Service
                    </p>
                  </div>
                  <span className={`text-[10px] font-semibold mt-3 ${paymentMethod === 'Nagad' ? 'text-[#E6CA85]' : 'text-orange-600'}`}>
                    Instant Mobile Pay
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-md space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 font-serif-luxury text-base pb-3 border-b border-gray-100">
                Order Summary ({cart.length} items)
              </h3>

              {/* Items List */}
              <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.sku} className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-16 object-cover rounded-md border border-gray-200 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate font-serif-luxury text-sm">{item.name}</p>
                      {(item.color || item.size) && (
                        <p className="text-[11px] text-gray-500">
                          {item.color} {item.color && item.size ? '•' : ''} {item.size}
                        </p>
                      )}
                      <p className="text-[11px] text-gray-400">Qty: {item.quantity} × ৳{item.price.toLocaleString()}</p>
                    </div>
                    <div className="text-right text-xs font-bold text-gray-900 font-mono">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Calculation Breakdown */}
              <div className="space-y-2 pt-4 border-t border-gray-100 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-gray-900 font-mono">৳{cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charge ({district})</span>
                  <span className="font-semibold text-gray-900 font-mono">৳{deliveryCharge}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-3 border-t border-gray-200">
                  <span>Grand Total</span>
                  <span className="text-lg text-[#0F172A] font-mono">৳{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-[#C5A059] hover:bg-[#b08b3a] text-slate-950 font-bold text-xs uppercase tracking-[0.2em] rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {submitting ? (
                  <span>Processing Order...</span>
                ) : (
                  <>
                    <span>Confirm Order (৳{grandTotal.toLocaleString()})</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 text-[11px] text-gray-500 justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>256-Bit SSL Encrypted • 100% Genuine Guaranteed</span>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
