'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Printer,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  AlertCircle,
  Copy,
  Check,
  Lock,
  Unlock,
  Package,
  MapPin,
  Phone,
  User,
  Calendar,
  CreditCard,
  Building2,
  Receipt,
  FileText,
  ArrowLeft,
  Store,
  ExternalLink,
} from 'lucide-react';
import { API_BASE_URL, authFetch } from '../../../../utils/api-config';

interface OrderQrClientProps {
  token: string;
}

export default function OrderQrClient({ token }: OrderQrClientProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authorizationType, setAuthorizationType] = useState<'ADMIN' | 'CUSTOMER' | 'ANONYMOUS'>('ANONYMOUS');
  const [mobileInput, setMobileInput] = useState('');
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [printMode, setPrintMode] = useState<'A4' | 'THERMAL'>('A4');
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchOrderDetails = async (phoneVerification?: string) => {
    try {
      if (phoneVerification) {
        setVerifyingPhone(true);
        setVerifyError(null);
      } else {
        setLoading(true);
        setError(null);
      }

      const res = await authFetch(`${API_BASE_URL}/api/qr/orders/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token.trim(),
          mobile: phoneVerification ? phoneVerification.trim() : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Unable to resolve order details.');
      }

      setOrder(data.order);
      setIsAuthorized(Boolean(data.isAuthorized));
      setAuthorizationType(data.authorizationType || 'ANONYMOUS');

      if (phoneVerification && !data.isAuthorized) {
        setVerifyError('The phone number entered does not match the order recipient.');
      } else if (phoneVerification && data.isAuthorized) {
        setVerifyError(null);
      }
    } catch (err: any) {
      if (phoneVerification) {
        setVerifyError(err.message || 'Verification failed. Please check phone number.');
      } else {
        setError(err.message || 'Unable to load order details.');
      }
    } finally {
      setLoading(false);
      setVerifyingPhone(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrderDetails();
    }
  }, [token]);

  const handlePhoneVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileInput.trim()) {
      setVerifyError('Please enter your 11-digit mobile number.');
      return;
    }
    fetchOrderDetails(mobileInput.trim());
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-gray-200 shadow-xl max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-center mx-auto text-[#997B21] animate-pulse">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-serif-luxury text-gray-900 tracking-wider">
              AVELORA ELEGANCE
            </h2>
            <p className="text-xs text-gray-500 uppercase tracking-widest">
              Verifying Order Authentication...
            </p>
          </div>
          <div className="w-48 h-1 bg-gray-100 rounded-full mx-auto overflow-hidden">
            <div className="w-1/2 h-full bg-[#C5A059] rounded-full animate-[shimmer_1.5s_infinite]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-red-100 shadow-xl max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold font-serif-luxury text-gray-900">
            Order Record Not Found
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            {error || 'The scanned QR code token or Order reference is invalid or has expired.'}
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/track-order"
              className="w-full py-3 bg-[#0B0F19] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black transition"
            >
              Track by Order ID & Phone
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 text-gray-600 text-xs font-semibold hover:text-gray-900 transition"
            >
              Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { customer, financials, items } = order;
  const isShowroom = order.fulfillmentMethod === 'SHOWROOM_PICKUP';

  return (
    <div className="min-h-screen bg-[#F4F4F0] text-gray-900 py-4 sm:py-8 px-2 sm:px-6 lg:px-8">
      {/* ========================================================================= */}
      {/* 1. TOP ACTION BAR (Hidden when printing)                                  */}
      {/* ========================================================================= */}
      <div className="max-w-4xl mx-auto mb-4 sm:mb-6 print:hidden space-y-3">
        {/* Navigation & Brand Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/90 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
              title="Return to Storefront"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="text-[10px] tracking-[0.25em] text-[#997B21] font-bold uppercase block">
                Order Verification Portal
              </span>
              <h1 className="text-base sm:text-lg font-bold font-serif-luxury text-gray-900 leading-none">
                AVELORA ELEGANCE
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Share / Copy Link */}
            <button
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center gap-1.5 transition"
              title="Copy verification link"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-gray-500" />
                  <span className="hidden sm:inline">Copy Link</span>
                </>
              )}
            </button>

            {/* Print Mode Switcher */}
            <div className="bg-gray-100 p-1 rounded-xl flex items-center text-xs font-semibold">
              <button
                onClick={() => setPrintMode('A4')}
                className={`px-2.5 py-1.5 rounded-lg transition ${
                  printMode === 'A4'
                    ? 'bg-white text-gray-900 shadow-xs font-bold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                A4 Invoice
              </button>
              <button
                onClick={() => setPrintMode('THERMAL')}
                className={`px-2.5 py-1.5 rounded-lg transition ${
                  printMode === 'THERMAL'
                    ? 'bg-white text-gray-900 shadow-xs font-bold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                80mm POS
              </button>
            </div>

            {/* Print Order Button (Prominent & High-Contrast) */}
            <button
              onClick={handlePrint}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#b08b3a] text-slate-950 text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Order</span>
            </button>
          </div>
        </div>

        {/* Customer Privacy Verification Banner (Only if unauthorized anonymous scanner) */}
        {!isAuthorized && (
          <div className="bg-amber-50/90 border border-amber-200/90 p-4 rounded-2xl space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800 flex-shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-bold text-amber-950">
                  Privacy Protected View (Customer Details Masked)
                </h3>
                <p className="text-xs text-amber-800 leading-relaxed">
                  To protect recipient privacy, full residential delivery addresses and mobile numbers are hidden.
                  If you are the patron who placed this order, enter your registered mobile number below to unlock full customer details.
                </p>
              </div>
            </div>

            <form onSubmit={handlePhoneVerify} className="flex flex-wrap items-center gap-2 pt-1">
              <div className="relative flex-1 min-w-[200px]">
                <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="Enter 11-digit mobile (e.g. 017XXXXXXXX)"
                  value={mobileInput}
                  onChange={(e) => setMobileInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-amber-300 text-xs text-gray-900 font-mono focus:outline-none focus:border-[#C5A059]"
                />
              </div>
              <button
                type="submit"
                disabled={verifyingPhone}
                className="px-4 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>{verifyingPhone ? 'Verifying...' : 'Unlock Full Details'}</span>
              </button>
              <Link
                href="/admin"
                className="text-[11px] text-amber-900 font-semibold underline hover:text-black ml-auto"
              >
                Staff Login
              </Link>
            </form>

            {verifyError && (
              <p className="text-xs text-red-600 font-medium pl-1">{verifyError}</p>
            )}
          </div>
        )}

        {/* Authorization Confirmation Badge */}
        {isAuthorized && (
          <div className="bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs text-emerald-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">
                {authorizationType === 'ADMIN'
                  ? 'Authorized Atelier Staff Clearance (Full Order Details Active)'
                  : 'Verified Patron Access (Customer Details Unlocked)'}
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-700">Verified</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. PRINTABLE DOCUMENT WORKSPACE                                           */}
      {/* ========================================================================= */}
      <div className="max-w-4xl mx-auto">
        {/* ======================================================================= */}
        {/* LAYOUT A: STANDARD INVOICE (A4 LUXURY FORMAT)                           */}
        {/* ======================================================================= */}
        {printMode === 'A4' && (
          <div
            id="printable-invoice"
            className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-gray-200 shadow-lg space-y-6 sm:space-y-8 print:p-0 print:border-none print:shadow-none print:rounded-none"
          >
            {/* 1. Atelier Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 sm:pb-8 border-b-2 border-gray-900 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[0.25em] text-[#0F172A] font-serif-luxury">
                    AVELORA
                  </h2>
                </div>
                <p className="text-[10px] tracking-[0.35em] text-[#997B21] uppercase font-bold mt-1">
                  Elegance In Every Choice
                </p>
                <div className="text-xs text-gray-500 mt-2.5 space-y-0.5">
                  <p>
                    BIN / VAT Registration:{' '}
                    <span className="font-mono font-bold text-gray-800">005829147-0101</span>
                  </p>
                  <p>Hotline: +880 1353-786336 • aveloraelegance@gmail.com</p>
                  <p>Mohakhali Royal Filling Station, Jam Jam Tower, 5th Building, 6th Floor, Dhaka</p>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:text-right w-full sm:w-auto justify-between sm:justify-end">
                {order.qrCodeDataUrl && (
                  <div className="p-2 bg-white border border-gray-300 rounded-xl text-center shadow-xs">
                    <img
                      src={order.qrCodeDataUrl}
                      alt="Order Verification QR"
                      className="w-20 h-20 sm:w-24 sm:h-24 mx-auto"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <span className="text-[7px] font-mono text-gray-500 block uppercase mt-1">
                      Scan to Verify
                    </span>
                  </div>
                )}
                <div className="space-y-1">
                  <span className="inline-block px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-800">
                    TAX INVOICE
                  </span>
                  <p className="text-base sm:text-lg font-bold font-mono text-gray-900">
                    #{order.orderId}
                  </p>
                  <p className="text-xs text-gray-500">
                    Date:{' '}
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                    Status: {order.status}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Customer & Fulfillment Details (Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 bg-[#FAFAF8] p-5 sm:p-6 rounded-2xl border border-gray-200 text-xs">
              {/* Customer Box */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[#997B21] font-bold uppercase tracking-wider text-[11px] pb-1 border-b border-gray-200">
                  <User className="w-3.5 h-3.5" />
                  <span>Customer & Delivery Details:</span>
                </div>
                <div className="space-y-1 pt-1">
                  <p className="text-sm font-bold text-gray-900">{customer?.name}</p>
                  <p className="text-gray-700 font-mono">
                    <span className="text-gray-500">Mobile:</span> {customer?.mobile}
                  </p>
                  {customer?.altMobile && (
                    <p className="text-gray-600 font-mono">
                      <span className="text-gray-500">Alt Phone:</span> {customer.altMobile}
                    </p>
                  )}
                  {customer?.email && (
                    <p className="text-gray-600">
                      <span className="text-gray-500">Email:</span> {customer.email}
                    </p>
                  )}
                  <p className="text-gray-700 leading-relaxed pt-1">
                    <span className="text-gray-500">Delivery Address:</span> {customer?.address}
                  </p>
                  <p className="text-gray-800 font-semibold">
                    District: {customer?.district || 'Dhaka'}{' '}
                    {customer?.division ? `• Division: ${customer.division}` : ''}
                    {customer?.upazila ? ` • Upazila: ${customer.upazila}` : ''}
                  </p>
                  {customer?.notes && (
                    <p className="text-xs text-gray-600 italic bg-white p-2.5 rounded-lg border border-gray-200 mt-2">
                      Customer Note: "{customer.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Order & Dispatch Box */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[#997B21] font-bold uppercase tracking-wider text-[11px] pb-1 border-b border-gray-200">
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Order & Payment Breakdown:</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Unique Order ID:</span>
                    <span className="font-mono font-bold text-gray-900">{order.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivery Method:</span>
                    <span className="font-semibold text-gray-800">{order.deliveryMethodLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment Method:</span>
                    <span className="font-semibold text-gray-900">
                      {order.paymentProvider || order.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment Status:</span>
                    <span className="font-bold text-emerald-800 uppercase tracking-wider">
                      {order.paymentStatus}
                    </span>
                  </div>
                  {order.senderMobile && (
                    <div className="flex justify-between font-mono">
                      <span className="text-gray-500">Sender Mobile:</span>
                      <span className="text-gray-800">{order.senderMobile}</span>
                    </div>
                  )}
                  {order.transactionId && (
                    <div className="flex justify-between font-mono">
                      <span className="text-gray-500">Transaction ID:</span>
                      <span className="font-bold text-gray-900">{order.transactionId}</span>
                    </div>
                  )}
                  {order.courier && (
                    <div className="pt-2 border-t border-gray-200 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Courier Partner:</span>
                        <span className="font-bold text-gray-900">{order.courier.provider || 'Pathao Express'}</span>
                      </div>
                      {order.courier.consignmentId && (
                        <div className="flex justify-between font-mono">
                          <span className="text-gray-500">Consignment ID:</span>
                          <span className="font-bold text-gray-900">{order.courier.consignmentId}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Product Breakdown Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-gray-900 uppercase tracking-wider text-gray-700 bg-gray-50">
                    <th className="py-3 px-4 font-bold">Item Description</th>
                    <th className="py-3 px-4 font-bold font-mono">SKU / Variant</th>
                    <th className="py-3 px-4 font-bold text-center">Qty</th>
                    <th className="py-3 px-4 font-bold text-right">Unit Price</th>
                    <th className="py-3 px-4 font-bold text-right">Line Total (BDT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items?.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {item.productImage && (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-10 h-10 object-cover rounded-lg border border-gray-200 print:hidden"
                            />
                          )}
                          <div>
                            <p className="font-bold text-gray-900 font-serif-luxury text-sm">
                              {item.productName}
                            </p>
                            {(item.color || item.size) && (
                              <p className="text-[11px] text-gray-500">
                                {item.color ? `Color: ${item.color} ` : ''}
                                {item.size ? `• Size: ${item.size}` : ''}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-600 text-[11px]">
                        {item.sku} {item.variant ? `(${item.variant})` : ''}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-gray-700">
                        ৳{Number(item.unitPrice).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900">
                        ৳{Number(item.lineTotal).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. Payment & Financial Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pt-4 border-t border-gray-200 gap-6">
              <div className="text-xs text-gray-500 max-w-sm space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>100% Genuine Luxury Handcrafted Guarantee</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  For concierge inquiries, returns, or adjustments, please contact our atelier hotline with your Unique Order ID.
                </p>
              </div>

              <div className="w-full sm:w-80 space-y-2 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Bag Subtotal:</span>
                  <span className="font-mono font-semibold">৳{financials?.subtotal.toLocaleString()}</span>
                </div>

                {financials?.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount:</span>
                    <span className="font-mono">-৳{financials?.discount.toLocaleString()}</span>
                  </div>
                )}

                {financials?.couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Discount {financials?.couponCode ? `(${financials.couponCode})` : ''}:</span>
                    <span className="font-mono">-৳{financials?.couponDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charge:</span>
                  <span className="font-mono font-semibold">
                    {isShowroom ? 'FREE (৳0)' : `৳${(financials?.deliveryCharge || 0).toLocaleString()}`}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t-2 border-gray-900">
                  <span>Grand Total:</span>
                  <span className="font-mono text-base text-slate-950">
                    ৳{financials?.totalAmount.toLocaleString()}
                  </span>
                </div>

                {/* Paid & Due Breakdown */}
                <div className="pt-2 border-t border-dashed border-gray-300 space-y-1 text-xs">
                  <div className="flex justify-between text-emerald-800 font-semibold">
                    <span>Amount Paid (Advance):</span>
                    <span className="font-mono">৳{(financials?.paidAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-amber-900 font-bold bg-amber-100/60 p-1.5 rounded-lg">
                    <span>
                      {isShowroom ? 'Cash Due on Pickup:' : 'Outstanding Amount (Cash Due on Delivery):'}
                    </span>
                    <span className="font-mono text-sm">৳{(financials?.dueAmount || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Footer Authenticity Note */}
            <div className="text-center pt-8 border-t border-gray-200 text-xs text-gray-400 space-y-1">
              <p className="font-serif-luxury italic text-sm text-gray-700">"Elegance In Every Choice"</p>
              <p className="text-[10px]">Thank you for selecting AVELORA. Handcrafted with passion and delivered with care.</p>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* LAYOUT B: THERMAL RECEIPT (80mm POS PRINTER FRIENDLY)                   */}
        {/* ======================================================================= */}
        {printMode === 'THERMAL' && (
          <div
            id="printable-thermal"
            className="w-full max-w-[80mm] mx-auto bg-white p-4 rounded-xl border border-gray-300 shadow-md text-slate-950 font-mono text-[11px] leading-tight space-y-3 print:p-0 print:border-none print:shadow-none print:max-w-none print:w-full"
          >
            <div className="text-center space-y-1 pb-2 border-b border-dashed border-gray-400">
              <h2 className="text-xl font-bold font-serif-luxury tracking-widest">AVELORA</h2>
              <p className="text-[8px] uppercase tracking-wider text-gray-600">Elegance In Every Choice</p>
              <p className="text-[9px]">Hotline: +880 1353-786336</p>
              <p className="text-[8px]">Mohakhali Jam Jam Tower, Dhaka</p>
              <div className="pt-1">
                <span className="inline-block px-2 py-0.5 bg-black text-white text-[9px] font-bold">
                  ORDER INVOICE #{order.orderId}
                </span>
              </div>
              <p className="text-[9px] text-gray-600 pt-0.5">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Thermal QR */}
            {order.qrCodeDataUrl && (
              <div className="text-center py-1">
                <img
                  src={order.qrCodeDataUrl}
                  alt="Order QR"
                  className="w-24 h-24 mx-auto"
                  style={{ imageRendering: 'pixelated' }}
                />
                <span className="text-[7px] text-gray-500 block uppercase">Scan to Verify</span>
              </div>
            )}

            {/* Customer Details */}
            <div className="space-y-0.5 pb-2 border-b border-dashed border-gray-400 text-[10px]">
              <p className="font-bold uppercase">Customer:</p>
              <p className="font-bold">{customer?.name}</p>
              <p>Phone: {customer?.mobile}</p>
              <p className="leading-tight">Address: {customer?.address}</p>
              <p>District: {customer?.district}</p>
              {customer?.notes && <p className="italic">Note: {customer.notes}</p>}
            </div>

            {/* Items */}
            <div className="space-y-1 pb-2 border-b border-dashed border-gray-400">
              <div className="flex justify-between font-bold text-[10px] pb-1 border-b border-gray-200">
                <span>ITEM</span>
                <span>TOTAL</span>
              </div>
              {items?.map((item: any, i: number) => (
                <div key={i} className="space-y-0.5">
                  <div className="flex justify-between">
                    <span className="font-bold">{item.productName}</span>
                    <span>৳{item.lineTotal.toLocaleString()}</span>
                  </div>
                  <div className="text-[9px] text-gray-600 flex justify-between">
                    <span>
                      {item.quantity} x ৳{item.unitPrice.toLocaleString()} {item.variant ? `(${item.variant})` : ''}
                    </span>
                    <span>{item.sku}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="space-y-1 text-[11px] pb-2 border-b-2 border-black">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>৳{financials?.subtotal.toLocaleString()}</span>
              </div>
              {financials?.discount > 0 && (
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-৳{financials.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span>৳{(financials?.deliveryCharge || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-black">
                <span>GRAND TOTAL:</span>
                <span>৳{financials?.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>Paid (Advance):</span>
                <span>৳{(financials?.paidAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-dashed border-gray-400">
                <span>DUE TO COLLECT:</span>
                <span>৳{(financials?.dueAmount || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="text-center text-[9px] space-y-0.5 pt-1 text-gray-600">
              <p className="font-bold">Payment Method: {order.paymentMethod}</p>
              <p>Thank you for choosing AVELORA.</p>
              <p className="text-[7px]">www.avelora.com</p>
            </div>
          </div>
        )}
      </div>

      {/* Scoped Media Print Styling */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          #printable-invoice,
          #printable-thermal {
            box-shadow: none !important;
            border: none !important;
          }
          @page {
            size: ${printMode === 'THERMAL' ? '80mm auto' : 'auto'};
            margin: ${printMode === 'THERMAL' ? '2mm' : '8mm'};
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
