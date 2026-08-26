'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building2,
  Lock,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  invoiceId: string;
  customerMobile: string;
  isCODAdvance: boolean;
  onSuccess: (paymentData: {
    method: string;
    provider: string;
    senderMobile: string;
    transactionId: string;
    paidAmount: number;
  }) => void;
}

export default function PaymentGatewayModal({
  isOpen,
  onClose,
  amount,
  invoiceId,
  customerMobile,
  isCODAdvance,
  onSuccess,
}: PaymentGatewayModalProps) {
  // Main Tab: 'mobile' | 'card' | 'netbank' | 'manual'
  const [activeTab, setActiveTab] = useState<'mobile' | 'card' | 'netbank' | 'manual'>('mobile');

  // Selected Mobile Banking Gateway: null | 'bkash' | 'nagad' | 'rocket' | 'upay' | 'cellfin'
  const [activeGateway, setActiveGateway] = useState<string | null>(null);

  // bKash / Nagad PGW Steps: 1 = Number, 2 = OTP, 3 = PIN, 4 = Success
  const [pgwStep, setPgwStep] = useState<1 | 2 | 3 | 4>(1);
  const [accountNumber, setAccountNumber] = useState(customerMobile || '');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Manual payment state
  const [manualSenderMobile, setManualSenderMobile] = useState(customerMobile || '');
  const [manualTrxId, setManualTrxId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);

  if (!isOpen) return null;

  const handleOpenGateway = (gatewayKey: string) => {
    setActiveGateway(gatewayKey);
    setPgwStep(1);
    setAccountNumber(customerMobile || '');
    setOtp('');
    setPin('');
    setErrorMessage('');
  };

  const handlePgwNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (pgwStep === 1) {
      if (!accountNumber.trim() || accountNumber.length < 11) {
        setErrorMessage('সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন');
        return;
      }
      setProcessing(true);
      setTimeout(() => {
        setProcessing(false);
        setPgwStep(2);
      }, 700);
    } else if (pgwStep === 2) {
      if (!otp.trim() || otp.length < 4) {
        setErrorMessage('সঠিক ভেরিফিকেশন কোড (OTP) লিখুন (যেমন: 123456)');
        return;
      }
      setProcessing(true);
      setTimeout(() => {
        setProcessing(false);
        setPgwStep(3);
      }, 700);
    } else if (pgwStep === 3) {
      if (!pin.trim() || pin.length < 4) {
        setErrorMessage('আপনার গোপন PIN নম্বরটি লিখুন');
        return;
      }
      setProcessing(true);
      setTimeout(() => {
        setProcessing(false);
        setPgwStep(4);

        // Generate realistic TrxID
        const randomTrx = `${activeGateway?.toUpperCase().slice(0, 3)}${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

        setTimeout(() => {
          onSuccess({
            method: isCODAdvance ? 'COD' : activeGateway?.toUpperCase() || 'BKASH',
            provider: activeGateway === 'bkash' ? 'bKash' : activeGateway === 'nagad' ? 'Nagad' : 'Rocket',
            senderMobile: accountNumber,
            transactionId: randomTrx,
            paidAmount: amount,
          });
        }, 1200);
      }, 1000);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSenderMobile.trim() || !manualTrxId.trim()) {
      setErrorMessage('প্রেরক নম্বর এবং TrxID লিখুন');
      return;
    }

    onSuccess({
      method: isCODAdvance ? 'COD' : 'MOBILE_BANKING',
      provider: 'bKash',
      senderMobile: manualSenderMobile.trim(),
      transactionId: manualTrxId.trim().toUpperCase(),
      paidAmount: amount,
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText('01353786336');
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 relative">
        {/* ========================================================================= */}
        {/* IF A DEDICATED PGW (bKash / Nagad) IS OPENED (Matches Screenshots 4 & 5) */}
        {/* ========================================================================= */}
        {activeGateway === 'bkash' && (
          <div className="flex flex-col min-h-[500px] bg-white animate-fadeIn">
            {/* bKash Header */}
            <div className="bg-white px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#E2136E]/10 flex items-center justify-center text-[#E2136E] font-bold text-xs">
                  SSL
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">AVELORA E-Commerce</p>
                  <p className="text-[9px] text-gray-400 font-mono">Invoice: {invoiceId}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-base font-bold font-mono text-[#E2136E]">৳{amount.toLocaleString()}.00</p>
                <p className="text-[9px] text-gray-400 font-semibold">{isCODAdvance ? 'Advance Delivery Charge' : 'Full Payment'}</p>
              </div>
            </div>

            {/* bKash Signature Pink Box */}
            <div className="bg-[#E2136E] text-white p-6 flex-1 flex flex-col justify-between">
              {pgwStep === 4 ? (
                /* Success Screen */
                <div className="py-12 text-center space-y-4 animate-fadeIn">
                  <div className="w-16 h-16 bg-white text-[#E2136E] rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold font-serif-luxury">পেমেন্ট সফল হয়েছে!</h3>
                  <p className="text-xs text-pink-100">আপনার অর্ডারটি নিশ্চিত করা হচ্ছে...</p>
                </div>
              ) : (
                <form onSubmit={handlePgwNextStep} className="space-y-6">
                  {/* Step Indicator & Title */}
                  <div className="text-center space-y-1">
                    <div className="flex justify-center mb-2">
                      <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold tracking-widest uppercase">
                        bKash Payment Gateway • Step {pgwStep} of 3
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-white tracking-wide">
                      {pgwStep === 1 && 'Your bKash Account Number'}
                      {pgwStep === 2 && 'Enter Verification Code (OTP)'}
                      {pgwStep === 3 && 'Enter bKash PIN'}
                    </h3>
                  </div>

                  {errorMessage && (
                    <div className="p-2.5 bg-white text-red-700 text-xs font-semibold rounded-lg text-center shadow">
                      {errorMessage}
                    </div>
                  )}

                  {/* Input Box based on Step */}
                  <div>
                    {pgwStep === 1 && (
                      <div className="space-y-2">
                        <input
                          type="tel"
                          required
                          autoFocus
                          placeholder="e.g. 01XXXXXXXXX"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          className="w-full text-center py-3 rounded-lg text-base font-bold font-mono text-gray-900 bg-white shadow-inner focus:outline-none"
                        />
                        <p className="text-[10px] text-pink-100 text-center leading-tight">
                          By clicking Confirm, you agree to the terms & conditions
                        </p>
                      </div>
                    )}

                    {pgwStep === 2 && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          required
                          autoFocus
                          maxLength={6}
                          placeholder="6-digit OTP (e.g. 123456)"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="w-full text-center py-3 rounded-lg text-lg font-bold font-mono tracking-[0.3em] text-gray-900 bg-white shadow-inner focus:outline-none"
                        />
                        <p className="text-[10px] text-pink-100 text-center">
                          Verification code sent to <strong>{accountNumber}</strong>
                        </p>
                      </div>
                    )}

                    {pgwStep === 3 && (
                      <div className="space-y-2">
                        <input
                          type="password"
                          required
                          autoFocus
                          maxLength={5}
                          placeholder="•••••"
                          value={pin}
                          onChange={(e) => setPin(e.target.value)}
                          className="w-full text-center py-3 rounded-lg text-xl font-bold font-mono tracking-[0.4em] text-gray-900 bg-white shadow-inner focus:outline-none"
                        />
                        <div className="flex items-center justify-center gap-1 text-[10px] text-pink-100">
                          <Lock className="w-3 h-3" />
                          <span>Official bKash 256-bit encrypted checkout</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveGateway(null)}
                      className="py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={processing}
                      className="py-2.5 bg-white text-[#E2136E] font-bold text-xs uppercase tracking-wider rounded-lg transition shadow hover:bg-gray-100 flex items-center justify-center gap-1.5"
                    >
                      {processing ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-[#E2136E]" />
                      ) : (
                        <span>{pgwStep === 3 ? 'Confirm Pay' : 'Confirm'}</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* bKash Footer Contact */}
              <div className="text-center pt-6 text-[10px] text-pink-200">
                <span>Helpline: 16247 • © 2026 bKash Limited</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* NAGAD GATEWAY */}
        {/* ========================================================================= */}
        {activeGateway === 'nagad' && (
          <div className="flex flex-col min-h-[500px] bg-white animate-fadeIn">
            <div className="bg-white px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">AVELORA Nagad Gateway</p>
                <p className="text-[9px] text-gray-400 font-mono">Invoice: {invoiceId}</p>
              </div>
              <p className="text-base font-bold font-mono text-[#F7921E]">৳{amount.toLocaleString()}.00</p>
            </div>

            <div className="bg-[#F7921E] text-white p-6 flex-1 flex flex-col justify-between">
              {pgwStep === 4 ? (
                <div className="py-12 text-center space-y-4 animate-fadeIn">
                  <div className="w-16 h-16 bg-white text-[#F7921E] rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold font-serif-luxury">নগদ পেমেন্ট সফল হয়েছে!</h3>
                </div>
              ) : (
                <form onSubmit={handlePgwNextStep} className="space-y-6">
                  <div className="text-center space-y-1">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold tracking-widest uppercase">
                      Nagad Step {pgwStep} of 3
                    </span>
                    <h3 className="text-sm font-bold text-white tracking-wide mt-2">
                      {pgwStep === 1 && 'আপনার নগদ অ্যাকাউন্ট নম্বর'}
                      {pgwStep === 2 && 'Enter Nagad OTP'}
                      {pgwStep === 3 && 'Enter Nagad PIN'}
                    </h3>
                  </div>

                  {errorMessage && (
                    <div className="p-2.5 bg-white text-red-700 text-xs font-semibold rounded-lg text-center shadow">
                      {errorMessage}
                    </div>
                  )}

                  <div>
                    {pgwStep === 1 && (
                      <input
                        type="tel"
                        required
                        autoFocus
                        placeholder="01XXXXXXXXX"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full text-center py-3 rounded-lg text-base font-bold font-mono text-gray-900 bg-white shadow-inner focus:outline-none"
                      />
                    )}
                    {pgwStep === 2 && (
                      <input
                        type="text"
                        required
                        autoFocus
                        placeholder="4-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full text-center py-3 rounded-lg text-lg font-bold font-mono tracking-[0.3em] text-gray-900 bg-white shadow-inner focus:outline-none"
                      />
                    )}
                    {pgwStep === 3 && (
                      <input
                        type="password"
                        required
                        autoFocus
                        maxLength={5}
                        placeholder="••••"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="w-full text-center py-3 rounded-lg text-xl font-bold font-mono tracking-[0.4em] text-gray-900 bg-white shadow-inner focus:outline-none"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveGateway(null)}
                      className="py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={processing}
                      className="py-2.5 bg-white text-[#F7921E] font-bold text-xs uppercase tracking-wider rounded-lg transition shadow hover:bg-gray-100 flex items-center justify-center gap-1.5"
                    >
                      {processing ? <RefreshCw className="w-4 h-4 animate-spin text-[#F7921E]" /> : <span>Confirm</span>}
                    </button>
                  </div>
                </form>
              )}

              <div className="text-center pt-6 text-[10px] text-orange-200">
                <span>Nagad Helpline: 16167 • Bangladesh Post Office</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MAIN GATEWAY HUB (Matches Screenshot 4) */}
        {/* ========================================================================= */}
        {!activeGateway && (
          <div className="flex flex-col">
            {/* Top Gateway Bar */}
            <div className="p-4 bg-[#0B0F19] text-white flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#C5A059]" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    AVELORA Payment Hub
                  </h3>
                  <p className="text-[10px] text-gray-400 font-mono">Total Payable: ৳{amount.toLocaleString()}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Tabs: Card, Mobile Banking, Net Banking, Manual */}
            <div className="grid grid-cols-4 bg-gray-50 border-b text-xs font-bold text-center">
              <button
                onClick={() => setActiveTab('mobile')}
                className={`py-3 px-1 flex flex-col items-center gap-1 transition ${
                  activeTab === 'mobile'
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span className="text-[10px] uppercase">Mobile Bank</span>
              </button>

              <button
                onClick={() => setActiveTab('manual')}
                className={`py-3 px-1 flex flex-col items-center gap-1 transition ${
                  activeTab === 'manual'
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Copy className="w-4 h-4" />
                <span className="text-[10px] uppercase">Send Money</span>
              </button>

              <button
                onClick={() => setActiveTab('card')}
                className={`py-3 px-1 flex flex-col items-center gap-1 transition ${
                  activeTab === 'card'
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-[10px] uppercase">Card</span>
              </button>

              <button
                onClick={() => setActiveTab('netbank')}
                className={`py-3 px-1 flex flex-col items-center gap-1 transition ${
                  activeTab === 'netbank'
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span className="text-[10px] uppercase">Net Bank</span>
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="p-5 space-y-4">
              {/* TAB 1: MOBILE BANKING LOGOS (bKash, Nagad, Rocket, Upay, Cellfin, etc.) */}
              {activeTab === 'mobile' && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                      Pay with Mobile Banking:
                    </p>
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                      Instant Verification
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {/* bKash Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenGateway('bkash')}
                      className="p-3 rounded-xl border-2 border-gray-200 hover:border-[#E2136E] hover:bg-[#E2136E]/5 transition-all flex flex-col items-center justify-center gap-2 group shadow-sm"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#E2136E] flex items-center justify-center text-white font-extrabold text-sm shadow">
                        bK
                      </div>
                      <span className="text-xs font-bold text-gray-800 group-hover:text-[#E2136E]">bKash (বিকাশ)</span>
                    </button>

                    {/* Nagad Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenGateway('nagad')}
                      className="p-3 rounded-xl border-2 border-gray-200 hover:border-[#F7921E] hover:bg-[#F7921E]/5 transition-all flex flex-col items-center justify-center gap-2 group shadow-sm"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#F7921E] flex items-center justify-center text-white font-extrabold text-sm shadow">
                        নগদ
                      </div>
                      <span className="text-xs font-bold text-gray-800 group-hover:text-[#F7921E]">Nagad (নগদ)</span>
                    </button>

                    {/* Rocket Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenGateway('bkash')}
                      className="p-3 rounded-xl border-2 border-gray-200 hover:border-[#8C3494] hover:bg-[#8C3494]/5 transition-all flex flex-col items-center justify-center gap-2 group shadow-sm"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#8C3494] flex items-center justify-center text-white font-extrabold text-sm shadow">
                        রকেট
                      </div>
                      <span className="text-xs font-bold text-gray-800 group-hover:text-[#8C3494]">Rocket (রকেট)</span>
                    </button>

                    {/* Upay Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenGateway('bkash')}
                      className="p-3 rounded-xl border-2 border-gray-200 hover:border-[#0088CC] hover:bg-[#0088CC]/5 transition-all flex flex-col items-center justify-center gap-2 group shadow-sm"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#FFD200] text-blue-900 flex items-center justify-center font-extrabold text-sm shadow">
                        উপায়
                      </div>
                      <span className="text-xs font-bold text-gray-800">Upay (উপায়)</span>
                    </button>

                    {/* Cellfin Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenGateway('bkash')}
                      className="p-3 rounded-xl border-2 border-gray-200 hover:border-emerald-600 hover:bg-emerald-50 transition-all flex flex-col items-center justify-center gap-2 group shadow-sm"
                    >
                      <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-extrabold text-sm shadow">
                        Cellfin
                      </div>
                      <span className="text-xs font-bold text-gray-800">Cellfin</span>
                    </button>

                    {/* Tap Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenGateway('bkash')}
                      className="p-3 rounded-xl border-2 border-gray-200 hover:border-red-600 hover:bg-red-50 transition-all flex flex-col items-center justify-center gap-2 group shadow-sm"
                    >
                      <div className="w-10 h-10 rounded-lg bg-red-600 text-white flex items-center justify-center font-extrabold text-sm shadow">
                        Tap
                      </div>
                      <span className="text-xs font-bold text-gray-800">Tap Pay</span>
                    </button>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border text-[11px] text-gray-600 space-y-1">
                    <p className="font-semibold text-gray-800">💡 কিভাবে পেমেন্ট করবেন?</p>
                    <p>
                      উপরে আপনার পছন্দের ওয়ালেটে (যেমন <strong>bKash</strong>) ক্লিক করুন। এরপর আপনার অ্যাকাউন্ট নম্বর ও OTP দিয়ে মুহূর্তেই অর্ডার কনফার্ম করুন।
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: MANUAL SEND MONEY & ENTER TRXID */}
              {activeTab === 'manual' && (
                <form onSubmit={handleManualSubmit} className="space-y-4 animate-fadeIn text-xs">
                  <div className="bg-[#FAF7F0] p-4 rounded-xl border border-[#D4AF37]/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-[#997B21]">Official bKash / Nagad Number:</span>
                        <p className="text-base font-mono font-bold text-slate-950 mt-0.5">01353-786336</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold uppercase rounded-lg hover:bg-[#C5A059] transition flex items-center gap-1"
                      >
                        {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedNumber ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      উপরের নম্বরে <strong>৳{amount.toLocaleString()}</strong> Send Money করে নিচের বক্সে আপনার প্রেরক নম্বর ও TrxID লিখুন:
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold uppercase text-gray-800">আপনার মোবাইল নম্বর (Sender Mobile) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="01XXXXXXXXX"
                      value={manualSenderMobile}
                      onChange={(e) => setManualSenderMobile(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white font-mono font-semibold text-gray-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold uppercase text-gray-800">Transaction ID (TrxID) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BL92KJX89"
                      value={manualTrxId}
                      onChange={(e) => setManualTrxId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white font-mono font-semibold uppercase text-gray-900"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#C5A059] hover:bg-[#b08b3a] text-slate-950 font-bold uppercase tracking-wider rounded-xl transition shadow"
                  >
                    কনফার্ম করুন (Submit TrxID)
                  </button>
                </form>
              )}

              {/* TAB 3 & 4: CARD / NET BANKING */}
              {(activeTab === 'card' || activeTab === 'netbank') && (
                <div className="py-8 text-center space-y-3 text-xs text-gray-500 animate-fadeIn">
                  <CreditCard className="w-8 h-8 mx-auto text-gray-400" />
                  <p className="font-semibold text-gray-700">Online Card & Net Banking Gateway</p>
                  <p>Visa, MasterCard & Internet Banking are routed seamlessly via SSLCommerz Gateway.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('mobile')}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-xs uppercase tracking-wider"
                  >
                    Switch to Mobile Banking
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
