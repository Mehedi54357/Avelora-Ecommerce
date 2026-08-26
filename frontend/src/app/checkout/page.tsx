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

import {
  BANGLADESH_DIVISIONS,
  DivisionOption,
  DistrictOption,
  UpazilaOption,
  UnionOption,
  getUnionsForUpazila,
} from '../../utils/bangladesh-geo-data';

export default function CheckoutPage() {
  const { cart, cartSubtotal, getSubtotal, clearCart } = useCart();
  const subtotal = cartSubtotal !== undefined ? cartSubtotal : (typeof getSubtotal === 'function' ? getSubtotal() : 0);

  // Customer Information
  const [orderFor, setOrderFor] = useState<'Self' | 'Gift'>('Self');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  
  // Cascading Address Selector: Division (8) -> District (64) -> Upazila / Thana -> Union / Ward
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('dhaka');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('dhaka');
  const [selectedUpazilaId, setSelectedUpazilaId] = useState<string>('mohakhali');
  const [selectedUnionId, setSelectedUnionId] = useState<string>('sadar-ward');
  const [customUnionName, setCustomUnionName] = useState<string>('');
  const [detailedAddress, setDetailedAddress] = useState<string>('');
  
  const [notes, setNotes] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'HOME' | 'PICKUP'>('HOME');

  // Payment Options: 'COD' (Advance delivery fee) vs 'FULL_MOBILE_BANKING'
  const [paymentOption, setPaymentOption] = useState<'COD' | 'FULL_MOBILE_BANKING'>('COD');

  // Modals & Process State
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
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
  
  const availableUnions = getUnionsForUpazila(currentUpazila);
  const currentUnion =
    availableUnions.find((u) => u.id === selectedUnionId) || availableUnions[0];

  // Cascading Handlers
  const handleDivisionChange = (divId: string) => {
    setSelectedDivisionId(divId);
    const divObj = BANGLADESH_DIVISIONS.find((d) => d.id === divId) || BANGLADESH_DIVISIONS[0];
    const firstDist = divObj.districts[0];
    if (firstDist) {
      setSelectedDistrictId(firstDist.id);
      if (firstDist.upazilas && firstDist.upazilas.length > 0) {
        const firstUpa = firstDist.upazilas[0];
        setSelectedUpazilaId(firstUpa.id);
        const unions = getUnionsForUpazila(firstUpa);
        if (unions.length > 0) {
          setSelectedUnionId(unions[0].id);
        }
      }
    }
  };

  const handleDistrictChange = (distId: string) => {
    setSelectedDistrictId(distId);
    const distObj = availableDistricts.find((d) => d.id === distId);
    if (distObj && distObj.upazilas && distObj.upazilas.length > 0) {
      const firstUpa = distObj.upazilas[0];
      setSelectedUpazilaId(firstUpa.id);
      const unions = getUnionsForUpazila(firstUpa);
      if (unions.length > 0) {
        setSelectedUnionId(unions[0].id);
      }
    }
  };

  const handleUpazilaChange = (upaId: string) => {
    setSelectedUpazilaId(upaId);
    const upaObj = availableUpazilas.find((u) => u.id === upaId);
    const unions = getUnionsForUpazila(upaObj);
    if (unions.length > 0) {
      setSelectedUnionId(unions[0].id);
    }
  };

  const isDhakaCity = selectedDistrictId === 'dhaka';
  const deliveryCharge = isDhakaCity ? 70 : 130;
  const totalAmount = Math.max(0, subtotal - couponDiscount + deliveryCharge);

  // Advance payable now vs Cash Due on delivery
  const payableNow = paymentOption === 'COD' ? deliveryCharge : totalAmount;
  const dueOnDelivery = paymentOption === 'COD' ? Math.max(0, subtotal - couponDiscount) : 0;

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
    if (!detailedAddress.trim()) {
      setError('আপনার বিস্তারিত বাড়ি / রোড / এরিয়া ঠিকানা লিখুন');
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

    const unionDisplayName = selectedUnionId === 'custom' && customUnionName.trim()
      ? customUnionName.trim()
      : (currentUnion?.bnName || currentUnion?.name || '');

    const formattedFullAddress = `${detailedAddress.trim()}${unionDisplayName ? `, ${unionDisplayName}` : ''}, ${currentUpazila.bnName} (${currentUpazila.name}), ${currentDistrict.bnName} (${currentDistrict.name}), ${currentDivision.bnName}`.replace(/^,\s*/, '');

    const payload = {
      customerDetails: {
        name: name.trim(),
        mobile: mobile.trim(),
        altMobile: '',
        division: currentDivision.name,
        district: currentDistrict.name,
        upazila: currentUpazila.name,
        union: unionDisplayName,
        address: formattedFullAddress,
      },
      items: cart.map((item) => ({
        productId: item.productId,
        sku: item.sku || (item as any).variant?.sku || 'STD',
        quantity: item.quantity,
      })),
      notes: notes.trim(),
      couponCode: couponApplied ? couponCode.trim().toUpperCase() : undefined,
      paymentMethod: paymentOption === 'COD' ? 'COD' : paymentData.provider?.toUpperCase() || 'BKASH',
      paymentProvider: paymentData.provider || 'bKash',
      senderMobile: paymentData.senderMobile || mobile,
      transactionId: paymentData.transactionId || `TRX${Date.now().toString().slice(-6)}`,
      paidAmount: paymentData.paidAmount,
      dueAmount: dueOnDelivery,
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
            </div>

            {/* Cascading 8 Divisions -> 64 Districts -> Upazilas -> Unions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
              {/* 1. Division Dropdown */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                  <span>Division (বিভাগ) *</span>
                  <span className="text-[10px] text-gray-400 font-normal">8 Divisions</span>
                </label>
                <select
                  value={selectedDivisionId}
                  onChange={(e) => handleDivisionChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#C5A059]"
                >
                  {BANGLADESH_DIVISIONS.map((div) => (
                    <option key={div.id} value={div.id}>
                      {div.bnName} ({div.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. District Dropdown */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                  <span>District (জেলা) *</span>
                  <span className="text-[10px] text-gray-400 font-normal">64 Districts</span>
                </label>
                <select
                  value={selectedDistrictId}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#C5A059]"
                >
                  {availableDistricts.map((dist) => (
                    <option key={dist.id} value={dist.id}>
                      {dist.bnName} ({dist.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Upazila / Thana Dropdown */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                  <span>Thana / Upazila (থানা) *</span>
                  <span className="text-[10px] text-gray-400 font-normal">{availableUpazilas.length} Thanas</span>
                </label>
                <select
                  value={selectedUpazilaId}
                  onChange={(e) => handleUpazilaChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#C5A059]"
                >
                  {availableUpazilas.map((upa) => (
                    <option key={upa.id} value={upa.id}>
                      {upa.bnName} ({upa.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Union / Ward / Area Dropdown */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                  <span>Union / Ward (ইউনিয়ন) *</span>
                  <span className="text-[10px] text-gray-400 font-normal">{availableUnions.length} Areas</span>
                </label>
                <select
                  value={selectedUnionId}
                  onChange={(e) => setSelectedUnionId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#C5A059]"
                >
                  {availableUnions.map((union) => (
                    <option key={union.id} value={union.id}>
                      {union.bnName} ({union.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Union / Ward / Village Input if selected 'custom' */}
            {selectedUnionId === 'custom' && (
              <div className="space-y-1 animate-fadeIn">
                <label className="text-xs font-bold text-[#997B21]">
                  আপনার ইউনিয়ন / ওয়ার্ড / গ্রামের নাম লিখুন *
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ৩নং ফতেহপুর ইউনিয়ন বা ওয়ার্ড #৫..."
                  value={customUnionName}
                  onChange={(e) => setCustomUnionName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#C5A059] bg-amber-50/30 text-xs font-medium text-gray-900 focus:outline-none"
                />
              </div>
            )}

            {/* Delivery Charge Indicator Badge */}
            <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#997B21]" />
                <span className="text-gray-700">
                  ডেলিভারি লোকেশন:{' '}
                  <strong className="text-gray-900 font-semibold">
                    {currentDistrict.bnName}, {currentDivision.bnName}
                  </strong>
                </span>
              </div>
              <span className="font-bold font-mono px-2 py-0.5 bg-white border border-gray-200 rounded-md text-emerald-800">
                ডেলিভারি চার্জ: ৳{deliveryCharge} ({isDhakaCity ? 'ঢাকা সিটি' : 'ঢাকার বাইরে'})
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
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono uppercase focus:outline-none focus:border-[#C5A059]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim() || applyingCoupon}
                      className="px-4 py-2 bg-slate-900 hover:bg-[#C5A059] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition disabled:opacity-50"
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
