'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../../context/cart-context';
import InvoiceModal from '../../components/invoice-modal';
import PaymentGatewayModal from '../../components/payment-gateway-modal';
import { API_BASE_URL } from '../../utils/api-config';
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  User,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle2,
  Lock,
  Building,
  Info,
} from 'lucide-react';

const BD_DISTRICTS = [
  'Dhaka (ঢাকা)',
  'Chattogram (চট্টগ্রাম)',
  'Gazipur (গাজীপুর)',
  'Narayanganj (নারায়ণগঞ্জ)',
  'Cumilla (কুমিল্লা)',
  'Sylhet (সিলেট)',
  'Rajshahi (রাজশাহী)',
  'Khulna (খুলনা)',
  'Barishal (বরিশাল)',
  'Rangpur (রংপুর)',
  'Mymensingh (ময়মনসিংহ)',
  'Bogra (বগুড়া)',
  'Cox\'s Bazar (কক্সবাজার)',
  'Other District (অন্যান্য জেলা)',
];

export default function CheckoutPage() {
  const { cart, cartSubtotal, getSubtotal, clearCart } = useCart();
  const subtotal = cartSubtotal !== undefined ? cartSubtotal : (typeof getSubtotal === 'function' ? getSubtotal() : 0);

  // Customer Information (Screenshot 2)
  const [orderFor, setOrderFor] = useState<'Self' | 'Gift'>('Self');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [district, setDistrict] = useState('Dhaka (ঢাকা)');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'HOME' | 'PICKUP'>('HOME');

  // Payment Options (Screenshot 3): 'COD' (Advance delivery fee) vs 'FULL_MOBILE_BANKING'
  const [paymentOption, setPaymentOption] = useState<'COD' | 'FULL_MOBILE_BANKING'>('COD');

  // Modals & Process State
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isDhaka = district.toLowerCase().includes('dhaka');
  const deliveryCharge = isDhaka ? 70 : 130;
  const totalAmount = subtotal + deliveryCharge;

  // Advance payable now vs Cash Due on delivery
  const payableNow = paymentOption === 'COD' ? deliveryCharge : totalAmount;
  const dueOnDelivery = paymentOption === 'COD' ? subtotal : 0;

  // 1. Customer clicks Confirm Order button on checkout page
  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (cart.length === 0) {
      setError('আপনার শপিং ব্যাগ খালি। অনুগ্রহ করে পণ্য যুক্ত করুন।');
      return;
    }
    if (!name.trim()) {
      setError('আপনার নাম লিখুন');
      return;
    }
    if (!mobile.trim() || mobile.length < 11) {
      setError('সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন (যেমন: 01XXXXXXXXX)');
      return;
    }
    if (!address.trim()) {
      setError('আপনার পূর্ণ ডেলিভারি ঠিকানা লিখুন');
      return;
    }

    // Open Interactive Payment Gateway Modal
    setIsGatewayOpen(true);
  };

  // 2. Gateway completion callback (bKash / Nagad PIN verified or TrxID submitted)
  const handleGatewaySuccess = async (paymentData: {
    method: string;
    provider: string;
    senderMobile: string;
    transactionId: string;
    paidAmount: number;
  }) => {
    setIsGatewayOpen(false);
    setSubmitting(true);
    setError('');

    const payload = {
      customer: {
        name: name.trim(),
        mobile: mobile.trim(),
        district: district.split(' ')[0],
        address: address.trim(),
        orderFor,
        deliveryMethod,
      },
      items: cart.map((item) => ({
        productId: item.productId,
        variantSku: item.sku || (item as any).variant?.sku || 'STD',
        quantity: item.quantity,
      })),
      notes: notes.trim(),
      paymentMethod: paymentOption === 'COD' ? 'COD' : paymentData.provider?.toUpperCase() || 'BKASH',
      paymentProvider: paymentData.provider || 'bKash',
      senderMobile: paymentData.senderMobile || mobile,
      transactionId: paymentData.transactionId || `TRX${Date.now().toString().slice(-6)}`,
      paidAmount: paymentData.paidAmount,
      dueAmount: dueOnDelivery,
      isAdvancePaid: true,
      deliveryCharge,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to place order');
      }

      const orderData = await res.json();
      setConfirmedOrder(orderData);
      clearCart();
      setIsInvoiceOpen(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'অর্ডার সাবমিট করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0 && !confirmedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-serif-luxury text-gray-900">আপনার শপিং ব্যাগ খালি</h2>
        <p className="text-xs text-gray-500">অর্ডার করতে অনুগ্রহ করে ক্যাটালগ থেকে পছন্দের পণ্য যুক্ত করুন।</p>
        <div className="pt-4">
          <Link
            href="/products"
            className="px-6 py-3 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#C5A059] transition shadow"
          >
            কালেকশন দেখুন (Browse Collections)
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn space-y-6">
      {/* Breadcrumbs & Quick Back Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white px-5 py-3 rounded-2xl border border-gray-200/80 shadow-sm text-xs">
        <nav className="flex items-center gap-2 text-gray-500 font-medium py-1">
          <Link href="/" className="hover:text-[#C5A059] transition text-gray-700 font-semibold">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <Link href="/products" className="hover:text-[#C5A059] transition text-gray-700 font-semibold">
            Collections
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-900 font-bold">Checkout</span>
        </nav>

        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Shopping</span>
        </Link>
      </div>

      {/* Top Header */}
      <div className="text-center space-y-1.5 mb-8">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#997B21]">
          Fast & Secure Checkout
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif-luxury text-gray-900">
          কাস্টমার ও ডেলিভারি তথ্য (Order Checkout)
        </h1>
      </div>

      <form onSubmit={handleInitiatePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Customer Information & Delivery Method (Matches Screenshot 2) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Customer Information Box */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <User className="w-4 h-4 text-[#997B21]" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Customer Information (গ্রাহকের তথ্য)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Order For */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Order For *</label>
                <select
                  value={orderFor}
                  onChange={(e: any) => setOrderFor(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="Self">Self (নিজের জন্য)</option>
                  <option value="Gift">Gift (উপহার হিসেবে)</option>
                </select>
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Name (আপনার নাম) *</label>
                <input
                  type="text"
                  required
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs text-gray-900 focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Phone (মোবাইল নম্বর) *</label>
                <input
                  type="tel"
                  required
                  placeholder="01XXXXXXXXX"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-mono font-medium text-gray-900 focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              {/* District */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">District (জেলা) *</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#C5A059]"
                >
                  {BD_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Full Address */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Full Address (পূর্ণ ঠিকানা) *</label>
              <textarea
                required
                rows={2}
                placeholder="House / Road / Building / Upazilla / Thana"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-xs text-gray-900 focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            {/* Order Notes */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Order Notes (ঐচ্ছিক)</label>
              <input
                type="text"
                placeholder="Any special delivery instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-xs text-gray-700 focus:outline-none"
              />
            </div>
          </div>

          {/* 2. Delivery Method Box */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Truck className="w-4 h-4 text-[#997B21]" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Delivery Method (ডেলিভারি মাধ্যম)
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label
                className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition ${
                  deliveryMethod === 'HOME'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-bold'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryMethod"
                  checked={deliveryMethod === 'HOME'}
                  onChange={() => setDeliveryMethod('HOME')}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs">Home Delivery</span>
              </label>

              <label
                className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition ${
                  deliveryMethod === 'PICKUP'
                    ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-bold'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryMethod"
                  checked={deliveryMethod === 'PICKUP'}
                  onChange={() => setDeliveryMethod('PICKUP')}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs">Pickup Point</span>
              </label>
            </div>

            {/* Courier Notice Info (Matches Screenshot 2) */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-2 text-[11px] text-amber-900">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                শুধুমাত্র জেলা/উপজেলা শহরের ৫ কিলোমিটারের মধ্যে হোম ডেলিভারি করা যাবে।
              </span>
            </div>
          </div>

          {/* 3. Payment Options Selection (Matches Screenshot 3) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <ShieldCheck className="w-4 h-4 text-[#997B21]" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Payment Options (পেমেন্ট অপশন)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Cash on Delivery with Advance Delivery Fee */}
              <label
                className={`p-4 rounded-xl border-2 cursor-pointer transition space-y-2 relative ${
                  paymentOption === 'COD'
                    ? 'border-slate-900 bg-slate-50/80 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentOption"
                      checked={paymentOption === 'COD'}
                      onChange={() => setPaymentOption('COD')}
                      className="w-4 h-4 text-slate-900"
                    />
                    <span className="text-xs font-bold text-gray-900">Cash on Delivery</span>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded">
                    অগ্রিম ৳{deliveryCharge}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 pl-6 leading-relaxed">
                  অর্ডার কনফার্ম করতে শুধু ডেলিভারি চার্জ (৳{deliveryCharge}) বিকাশে/নগদে দিন। বাকি <strong>৳{subtotal.toLocaleString()}</strong> পণ্য পেয়ে পরিশোধ করবেন।
                </p>
              </label>

              {/* Option 2: Full Mobile Banking Payment */}
              <label
                className={`p-4 rounded-xl border-2 cursor-pointer transition space-y-2 relative ${
                  paymentOption === 'FULL_MOBILE_BANKING'
                    ? 'border-slate-900 bg-slate-50/80 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentOption"
                      checked={paymentOption === 'FULL_MOBILE_BANKING'}
                      onChange={() => setPaymentOption('FULL_MOBILE_BANKING')}
                      className="w-4 h-4 text-slate-900"
                    />
                    <span className="text-xs font-bold text-gray-900">Mobile Banking (Full)</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-bold rounded">
                    ১০০% পরিশোধ
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 pl-6 leading-relaxed">
                  সম্পূর্ণ টাকা (৳{totalAmount.toLocaleString()}) একবারে বিকাশ/নগদে পরিশোধ করুন। ডেলিভারির সময় কোনো টাকা দিতে হবে না।
                </p>
              </label>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Order Summary & Confirm Button */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-sm space-y-5 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Order Summary (অর্ডার সামারি)
              </h3>
              <span className="text-xs text-gray-500">{cart.length} pieces</span>
            </div>

            {/* Cart Items List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => {
                const sku = item.sku || (item as any).variant?.sku || `item-${Math.random()}`;
                const title = item.name || (item as any).title || 'Product';
                const color = item.color || (item as any).variant?.color || '';
                const size = item.size || (item as any).variant?.size || '';
                const image = item.image || (item as any).images?.[0] || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=100&q=80';

                return (
                  <div key={sku} className="flex items-center gap-3 text-xs">
                    <img
                      src={image}
                      alt={title}
                      className="w-12 h-14 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{title}</p>
                      {(color || size) && (
                        <p className="text-[11px] text-gray-500 font-mono">
                          {color} {color && size ? '•' : ''} {size}
                        </p>
                      )}
                      <p className="text-[11px] text-gray-700 mt-0.5">
                        Qty: {item.quantity} × ৳{item.price.toLocaleString()}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-gray-900">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 pt-3 border-t border-gray-100 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>পণ্য মূল্য (Bag Subtotal):</span>
                <span className="font-mono font-semibold">৳{subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>ডেলিভারি চার্জ ({isDhaka ? 'ঢাকা শহর' : 'ঢাকার বাইরে'}):</span>
                <span className="font-mono font-semibold">৳{deliveryCharge}</span>
              </div>

              <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t">
                <span>সর্বমোট বিল (Total):</span>
                <span className="font-mono text-base text-slate-950">৳{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Advance vs Due Split Box */}
            <div className="p-4 bg-[#FAF7F0] rounded-xl border border-[#D4AF37]/30 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-emerald-800">
                <span>এখন পরিশোধ (Payable Now):</span>
                <span className="font-mono text-sm">৳{payableNow.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-amber-900">
                <span>ডেলিভারির সময় বাকি (Cash on Delivery Due):</span>
                <span className="font-mono text-sm">৳{dueOnDelivery.toLocaleString()}</span>
              </div>
            </div>

            {/* Submit / Confirm Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-[#C5A059] hover:bg-[#b08b3a] text-slate-950 font-bold text-xs uppercase tracking-[0.15em] rounded-xl transition-all shadow-lg hover:shadow-[#D4AF37]/30 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              <span>
                {paymentOption === 'COD'
                  ? `অর্ডার কনফার্ম করুন (অগ্রিম ডেলিভারি চার্জ ৳${deliveryCharge})`
                  : `অর্ডার কনফার্ম করুন (৳${totalAmount.toLocaleString()} পেমেন্ট)`}
              </span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 pt-1">
              <Lock className="w-3 h-3 text-[#C5A059]" />
              <span>Official SSLCommerz & bKash 256-Bit Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </form>

      {/* Interactive Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={isGatewayOpen}
        onClose={() => setIsGatewayOpen(false)}
        amount={payableNow}
        invoiceId={`INV-${Date.now().toString().slice(-6)}`}
        customerMobile={mobile}
        isCODAdvance={paymentOption === 'COD'}
        onSuccess={handleGatewaySuccess}
      />

      {/* Invoice Modal */}
      <InvoiceModal
        order={confirmedOrder}
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
      />
    </div>
  );
}
