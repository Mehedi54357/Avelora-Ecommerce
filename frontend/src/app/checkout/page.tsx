'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../../context/cart-context';
import InvoiceModal from '../../components/invoice-modal';
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
  Check,
  PackageCheck,
} from 'lucide-react';

import {
  BANGLADESH_DIVISIONS,
  DivisionOption,
  DistrictOption,
  UpazilaOption,
} from '../../utils/bangladesh-geo-data';

export default function CheckoutPage() {
  const { cart, cartSubtotal, getSubtotal, clearCart } = useCart();
  const subtotal = cartSubtotal !== undefined ? cartSubtotal : (typeof getSubtotal === 'function' ? getSubtotal() : 0);

  // Customer Information
  const [orderFor, setOrderFor] = useState<'Self' | 'Gift'>('Self');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');

  // Cascading Address Selector: Division (8) -> District (64) -> Upazila / Thana
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('dhaka');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('dhaka');
  const [selectedUpazilaId, setSelectedUpazilaId] = useState<string>('mohakhali');
  const [detailedAddress, setDetailedAddress] = useState<string>('');

  const [notes, setNotes] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'HOME' | 'PICKUP'>('HOME');

  // Modals & Process State
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponDescription, setCouponDescription] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Derived Objects from Geo Data
  const currentDivision =
    BANGLADESH_DIVISIONS.find((d) => d.id === selectedDivisionId) || BANGLADESH_DIVISIONS[0];
  const availableDistricts = currentDivision.districts;
  const currentDistrict =
    availableDistricts.find((d) => d.id === selectedDistrictId) || availableDistricts[0] || BANGLADESH_DIVISIONS[0].districts[0];
  const availableUpazilas = currentDistrict.upazilas || [];
  const currentUpazila =
    availableUpazilas.find((u) => u.id === selectedUpazilaId) || availableUpazilas[0] || { id: 'sadar', name: 'Sadar', bnName: 'সদর' };

  // Cascading Handlers
  const handleDivisionChange = (divId: string) => {
    setSelectedDivisionId(divId);
    const divObj = BANGLADESH_DIVISIONS.find((d) => d.id === divId) || BANGLADESH_DIVISIONS[0];
    const firstDist = divObj.districts[0];
    if (firstDist) {
      setSelectedDistrictId(firstDist.id);
      if (firstDist.upazilas && firstDist.upazilas.length > 0) {
        setSelectedUpazilaId(firstDist.upazilas[0].id);
      }
    }
  };

  const handleDistrictChange = (distId: string) => {
    setSelectedDistrictId(distId);
    const distObj = availableDistricts.find((d) => d.id === distId);
    if (distObj && distObj.upazilas && distObj.upazilas.length > 0) {
      setSelectedUpazilaId(distObj.upazilas[0].id);
    }
  };

  const handleUpazilaChange = (upaId: string) => {
    setSelectedUpazilaId(upaId);
  };

  const isDhakaCity = selectedDistrictId === 'dhaka';
  const deliveryCharge = isDhakaCity ? 70 : 130;
  const totalAmount = Math.max(0, subtotal - couponDiscount + deliveryCharge);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setApplyingCoupon(true);
    setCouponError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          subtotal,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Invalid coupon code');
      }

      setCouponDiscount(data.discountAmount || 0);
      setCouponDescription(data.description || 'Coupon Applied');
      setCouponApplied(true);
    } catch (err: any) {
      setCouponError(err.message || 'Failed to apply coupon');
      setCouponDiscount(0);
      setCouponApplied(false);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponDescription('');
    setCouponError('');
    setCouponApplied(false);
  };

  // Direct Cash On Delivery Order Submission (No advance payment requirement)
  const handleDirectCODSubmit = async (e: React.FormEvent) => {
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
    if (!detailedAddress.trim()) {
      setError('আপনার বিস্তারিত বাড়ি / রোড / এরিয়া ঠিকানা লিখুন');
      return;
    }

    setSubmitting(true);

    const formattedFullAddress = `${detailedAddress.trim()}, ${currentUpazila.name}, ${currentDistrict.name}, ${currentDivision.name.replace(' Division', '')}`.replace(/^,\s*/, '');

    const payload = {
      customerDetails: {
        name: name.trim(),
        mobile: mobile.trim(),
        altMobile: '',
        division: currentDivision.name.replace(' Division', ''),
        district: currentDistrict.name,
        upazila: currentUpazila.name,
        address: formattedFullAddress,
      },
      items: cart.map((item) => ({
        productId: item.productId,
        sku: item.sku || (item as any).variant?.sku || 'STD',
        quantity: item.quantity,
      })),
      notes: notes.trim(),
      couponCode: couponApplied ? couponCode.trim().toUpperCase() : undefined,
      paymentMethod: 'COD',
      paymentProvider: 'COD',
      senderMobile: '',
      transactionId: '',
      paidAmount: 0,
      dueAmount: totalAmount,
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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 animate-fadeIn space-y-4 sm:space-y-6">
      {/* Breadcrumbs & Quick Back Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-2xl border border-gray-200/80 shadow-2xs text-xs">
        <nav className="flex items-center gap-1.5 sm:gap-2 text-gray-500 font-medium py-1 overflow-x-auto scrollbar-none">
          <Link href="/" className="hover:text-[#C5A059] transition text-gray-700 font-semibold flex-shrink-0">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <Link href="/products" className="hover:text-[#C5A059] transition text-gray-700 font-semibold flex-shrink-0">
            Collections
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="text-gray-900 font-bold flex-shrink-0">Checkout</span>
        </nav>

        <Link
          href="/products"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-[11px] sm:text-xs transition"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Back to Shopping</span>
        </Link>
      </div>

      {/* Top Header */}
      <div className="text-center space-y-1 mb-4 sm:mb-8">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#997B21]">
          Direct Cash On Delivery Checkout
        </span>
        <h1 className="text-xl sm:text-3xl font-bold font-serif-luxury text-gray-900">
          কাস্টমার ও ডেলিভারি তথ্য (Order Checkout)
        </h1>
      </div>

      <form onSubmit={handleDirectCODSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Customer Information & Delivery Method                       */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Customer Information Box */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/90 shadow-2xs space-y-4 sm:space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <User className="w-4 h-4 text-[#997B21]" />
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide">
                Customer Information (গ্রাহকের তথ্য)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Order For */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Order For *</label>
                <select
                  value={orderFor}
                  onChange={(e: any) => setOrderFor(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#C5A059] min-h-[44px]"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs text-gray-900 focus:outline-none focus:border-[#C5A059] min-h-[44px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Phone (মোবাইল নম্বর) *</label>
                <input
                  type="tel"
                  required
                  placeholder="01XXXXXXXXX"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-mono font-medium text-gray-900 focus:outline-none focus:border-[#C5A059] min-h-[44px]"
                />
              </div>
            </div>

            {/* Cascading 8 Divisions -> 64 Districts -> Upazilas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              {/* 1. Division Dropdown */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                  <span>Division *</span>
                  <span className="text-[10px] text-gray-400 font-normal">8 Divisions</span>
                </label>
                <select
                  value={selectedDivisionId}
                  onChange={(e) => handleDivisionChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#C5A059] min-h-[44px]"
                >
                  {BANGLADESH_DIVISIONS.map((div) => (
                    <option key={div.id} value={div.id}>
                      {div.name.replace(' Division', '')}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. District Dropdown */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                  <span>District *</span>
                  <span className="text-[10px] text-gray-400 font-normal">64 Districts</span>
                </label>
                <select
                  value={selectedDistrictId}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#C5A059] min-h-[44px]"
                >
                  {availableDistricts.map((dist) => (
                    <option key={dist.id} value={dist.id}>
                      {dist.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Upazila / Thana Dropdown */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                  <span>Thana / Upazila *</span>
                  <span className="text-[10px] text-gray-400 font-normal">{availableUpazilas.length} Thanas</span>
                </label>
                <select
                  value={selectedUpazilaId}
                  onChange={(e) => handleUpazilaChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#C5A059] min-h-[44px]"
                >
                  {availableUpazilas.map((upa) => (
                    <option key={upa.id} value={upa.id}>
                      {upa.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Delivery Charge Indicator Badge */}
            <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center justify-between text-xs flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#997B21]" />
                <span className="text-gray-700">
                  Location:{' '}
                  <strong className="text-gray-900 font-semibold">
                    {currentDistrict.name}, {currentDivision.name.replace(' Division', '')}
                  </strong>
                </span>
              </div>
              <span className="font-bold font-mono px-2 py-0.5 bg-white border border-gray-200 rounded-md text-emerald-800 text-xs">
                Delivery Charge: ৳{deliveryCharge} ({isDhakaCity ? 'Inside Dhaka' : 'Outside Dhaka'})
              </span>
            </div>

            {/* Detailed Street Address */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">
                Detailed Address (বাড়ি নং / ফ্ল্যাট / রোড / এরিয়া / হোল্ডিং নং) *
              </label>
              <textarea
                required
                rows={2}
                placeholder="যেমন: বাড়ি #১২, রোড #৪, ব্লক #সি, রয়েল ফিলিং স্টেশন সংলগ্ন..."
                value={detailedAddress}
                onChange={(e) => setDetailedAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-xs text-gray-900 focus:outline-none focus:border-[#C5A059]"
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
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Truck className="w-4 h-4 text-[#997B21]" />
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide">
                Delivery Method (ডেলিভারি মাধ্যম)
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <label
                className={`p-3 sm:p-3.5 rounded-xl border-2 cursor-pointer flex items-center gap-2.5 transition min-h-[44px] ${
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
                className={`p-3 sm:p-3.5 rounded-xl border-2 cursor-pointer flex items-center gap-2.5 transition min-h-[44px] ${
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

            {/* Courier Notice Info */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-2 text-[11px] text-amber-900">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                জেলা ও উপজেলা সদরে দ্রুততম সময়ে সরাসরি হোম ডেলিভারি পৌঁছে দেওয়া হবে।
              </span>
            </div>
          </div>

          {/* 3. Pure Cash on Delivery Payment Method Box (No advance requirement) */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <ShieldCheck className="w-4 h-4 text-[#997B21]" />
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide">
                Payment Method (পেমেন্ট পদ্ধতি)
              </h3>
            </div>

            {/* Pure Cash On Delivery Highlight Card */}
            <div className="p-4 sm:p-5 rounded-2xl border-2 border-slate-900 bg-slate-50/80 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    ক্যাশ অন ডেলিভারি (Cash on Delivery)
                  </span>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 text-[10px] font-extrabold uppercase tracking-wider rounded-full border border-emerald-300">
                  ১০০% পণ্য পেয়ে পরিশোধ
                </span>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed pl-7">
                অর্ডার নিশ্চিত করতে <strong>কোনো অগ্রিম পেমেন্ট করতে হবে না</strong>। ডেলিভারি ম্যানের কাছ থেকে পার্সেল বুঝে পেয়ে সম্পূর্ণ মূল্য <strong>৳{totalAmount.toLocaleString()}</strong> নগদ পরিশোধ করবেন।
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Order Summary & Direct Confirm Button                       */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200/90 shadow-2xs space-y-4 sm:space-y-5 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide">
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

            {/* Coupon Code Input */}
            <div className="pt-2 border-t border-gray-100">
              {!couponApplied ? (
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code (যেমন: EID20)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono uppercase focus:outline-none focus:border-[#C5A059] min-h-[40px]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim() || applyingCoupon}
                      className="px-4 py-2 bg-slate-900 hover:bg-[#C5A059] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition disabled:opacity-50 min-h-[40px]"
                    >
                      {applyingCoupon ? '...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-red-500">{couponError}</p>}
                </div>
              ) : (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                  <div>
                    <span className="font-mono font-bold">{couponCode}</span>
                    <span className="text-[11px] text-emerald-700 ml-1.5">({couponDescription})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-red-500 hover:text-red-700 font-bold text-xs underline ml-2"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 pt-3 border-t border-gray-100 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>পণ্য মূল্য (Bag Subtotal):</span>
                <span className="font-mono font-semibold">৳{subtotal.toLocaleString()}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>কুপন ডিসকাউন্ট (Coupon Discount):</span>
                  <span className="font-mono">-৳{couponDiscount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>ডেলিভারি চার্জ ({isDhakaCity ? 'ঢাকা শহর' : 'ঢাকার বাইরে'}):</span>
                <span className="font-mono font-semibold">৳{deliveryCharge}</span>
              </div>

              <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t">
                <span>সর্বমোট বিল (Total):</span>
                <span className="font-mono text-base text-slate-950">৳{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* 100% Cash On Delivery Summary Callout */}
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                <PackageCheck className="w-4 h-4 text-emerald-700" />
                <span>ডেলিভারির সময় প্রদেয় (Pay on Delivery):</span>
              </div>
              <p className="text-base font-bold font-mono text-emerald-950 pl-5">
                ৳{totalAmount.toLocaleString()}
              </p>
              <p className="text-[10px] text-emerald-800 pl-5">
                কোনো অগ্রিম পেমেন্ট নেই। পার্সেল পেয়ে সম্পূর্ণ টাকা দিন।
              </p>
            </div>

            {/* Direct Order Confirm Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-[#C5A059] hover:bg-[#b08b3a] text-slate-950 font-bold text-xs uppercase tracking-[0.15em] rounded-xl transition-all shadow-lg hover:shadow-[#D4AF37]/30 flex items-center justify-center gap-2 group disabled:opacity-50 min-h-[48px]"
            >
              <span>
                {submitting
                  ? 'অর্ডার প্রসেস হচ্ছে...'
                  : `অর্ডার কনফার্ম করুন (৳${totalAmount.toLocaleString()} Cash on Delivery)`}
              </span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 pt-1">
              <Lock className="w-3 h-3 text-[#C5A059]" />
              <span>100% Verified Cash on Delivery with Live SMS & Call Confirmation</span>
            </div>
          </div>
        </div>
      </form>

      {/* Invoice Modal */}
      <InvoiceModal
        order={confirmedOrder}
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
      />
    </div>
  );
}
