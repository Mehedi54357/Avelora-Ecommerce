'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  Shield,
  Sparkles,
  Check,
} from 'lucide-react';
import { API_BASE_URL } from '../../../utils/api-config';

type AuthScreen = 'LOGIN' | 'OTP' | 'FORGOT_PASSWORD';

export default function AdminLoginPage() {
  const [screen, setScreen] = useState<AuthScreen>('LOGIN');

  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);

  // OTP Challenge States
  const [challengeId, setChallengeId] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendCountdown, setResendCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Forgot Password States
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetChallengeId, setResetChallengeId] = useState('');
  const [forgotStep, setForgotStep] = useState<'ENTER_EMAIL' | 'ENTER_CODE'>('ENTER_EMAIL');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // UI Feedback States
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown for OTP resend
  useEffect(() => {
    let timer: any;
    if (screen === 'OTP' && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [screen, resendCountdown]);

  // Handle Step 1: Login Submission (Email + Password)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.requiresOtp) {
          // Transition to OTP verification screen
          setChallengeId(data.challengeId);
          setMaskedEmail(data.maskedEmail || email);
          setResendCountdown(30);
          setCanResend(false);
          setOtpDigits(['', '', '', '', '', '']);
          setScreen('OTP');
          if (data.message) setNotice(data.message);
          setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
        } else if (data.token) {
          // Direct login for roles without OTP
          localStorage.setItem('admin_token', data.token);
          window.location.href = '/admin';
        }
      } else {
        setError(data.message || 'Invalid email or password.');
      }
    } catch (err: any) {
      setError('Unable to connect to authentication server. Please verify backend availability.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2: OTP Verification Submission
  const handleOtpSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setError('');
    setNotice('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          challengeId,
          otpCode: fullOtp,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.token) {
          localStorage.setItem('admin_token', data.token);
        }
        window.location.href = '/admin';
      } else {
        setError(data.message || 'Invalid or expired verification code.');
      }
    } catch (err: any) {
      setError('Verification failed. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Input Navigation & Paste
  const handleOtpChange = (index: number, val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    if (!clean) {
      const newDigits = [...otpDigits];
      newDigits[index] = '';
      setOtpDigits(newDigits);
      return;
    }

    // Handle full paste
    if (clean.length > 1) {
      const pasted = clean.slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pasted.forEach((d, i) => {
        if (i < 6) newDigits[i] = d;
      });
      setOtpDigits(newDigits);
      const targetIdx = Math.min(pasted.length, 5);
      otpInputRefs.current[targetIdx]?.focus();
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = clean.slice(-1);
    setOtpDigits(newDigits);

    if (index < 5 && clean) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP Resend
  const handleResendOtp = async () => {
    if (!canResend || loading) return;
    setError('');
    setNotice('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.challengeId) setChallengeId(data.challengeId);
        setResendCountdown(30);
        setCanResend(false);
        setOtpDigits(['', '', '', '', '', '']);
        setNotice(data.message || 'A new verification code has been dispatched.');
        otpInputRefs.current[0]?.focus();
      } else {
        setError(data.message || 'Failed to resend code. Please try again.');
      }
    } catch (err: any) {
      setError('Failed to resend verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password Request
  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });

      const data = await res.json();
      if (data.challengeId) setResetChallengeId(data.challengeId);
      setForgotStep('ENTER_CODE');
      setNotice(data.message || 'If registered, reset instructions have been sent.');
    } catch (err: any) {
      setError('Unable to send reset request.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Reset Submission
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 12) {
      setError('Password must be at least 12 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          resetCode: resetCode.trim(),
          newPassword,
          challengeId: resetChallengeId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setForgotSuccess(true);
        setTimeout(() => {
          setScreen('LOGIN');
          setForgotSuccess(false);
          setForgotStep('ENTER_EMAIL');
          setNotice('Password reset successfully. Please sign in.');
        }, 2000);
      } else {
        setError(data.message || 'Failed to reset password.');
      }
    } catch (err: any) {
      setError('Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Password Strength Checker
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-gray-200' };
    let score = 0;
    if (pass.length >= 12) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pass)) score += 1;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { score, label: 'Good', color: 'bg-amber-500' };
    return { score: 5, label: 'Strong', color: 'bg-emerald-500' };
  };

  const pwdStrength = getPasswordStrength(newPassword);

  return (
    <div className="min-h-screen bg-[#070A11] flex items-center justify-center p-0 lg:p-6 selection:bg-[#C5A059]/30">
      <div className="w-full max-w-6xl min-h-screen lg:min-h-[700px] bg-[#0E131F] lg:rounded-3xl shadow-2xl border border-white/5 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: BRAND EXPERIENCE (DESKTOP ~55%)                                */}
        {/* ========================================================================= */}
        <div className="hidden lg:flex lg:col-span-7 bg-[#080B13] p-12 lg:p-16 flex-col justify-between relative overflow-hidden border-r border-white/5">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#C5A059]/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-900/10 rounded-full blur-[90px] pointer-events-none" />

          {/* Top: Brand Header */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 120 90" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M 60 8 L 36 74 L 46 74 L 52 56 L 68 56 L 74 74 L 84 74 Z M 55 46 L 60 25 L 65 46 Z"
                  fill="#FAFAF8"
                />
                <path
                  d="M 28 58 Q 50 38 72 49 Q 84 54 94 48 Q 80 58 68 53 Q 48 46 28 58 Z"
                  fill="#C5A059"
                />
                <path
                  d="M 36 63 Q 54 48 74 56 Q 84 60 92 54 Q 80 62 70 59 Q 52 53 36 63 Z"
                  fill="#9E7B34"
                />
                <path d="M 85 45 Q 92 34 94 24 Q 85 32 85 45 Z" fill="#FAFAF8" />
                <path d="M 88 47 Q 98 42 104 32 Q 95 38 88 47 Z" fill="#FAFAF8" />
                <path d="M 89 50 Q 102 52 106 44 Q 97 47 89 50 Z" fill="#FAFAF8" />
                <path d="M 82 46 Q 85 36 86 28 Q 79 36 82 46 Z" fill="#C5A059" />
                <path d="M 85 52 Q 94 53 98 48 Q 91 50 85 52 Z" fill="#C5A059" />
              </svg>
              <div>
                <span className="font-serif-luxury text-2xl tracking-[0.22em] text-[#FAFAF8] block font-bold">
                  AVELORA
                </span>
                <span className="text-[9px] tracking-[0.35em] text-[#C5A059] uppercase block font-semibold">
                  ELEGANCE
                </span>
              </div>
            </div>
          </div>

          {/* Middle: Editorial Showcase */}
          <div className="relative z-10 my-auto py-12 max-w-lg">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059] text-[11px] font-semibold tracking-wider uppercase mb-6">
              <Shield className="w-3.5 h-3.5" />
              Administration Portal
            </span>
            <h1 className="font-serif-luxury text-3xl xl:text-4xl text-[#FAFAF8] leading-tight font-medium tracking-tight">
              Elegance in every detail. <br />
              <span className="text-[#C5A059] font-normal italic">Precision in every operation.</span>
            </h1>
            <p className="text-gray-400 text-sm mt-4 leading-relaxed">
              Enterprise management cockpit for executive intelligence, automated multi-method fulfillment, authoritative financial ledgers, and catalog governance.
            </p>
          </div>

          {/* Bottom: Secure Access Notice */}
          <div className="relative z-10 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
              <span className="font-medium tracking-wide">SECURE ADMINISTRATION</span>
            </div>
            <span>Protected Access &bull; Encrypted 2FA</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: LOGIN / OTP / FORGOT PASSWORD CARD (WARM IVORY / OFF-WHITE) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 bg-[#FAFAF8] p-8 sm:p-12 xl:p-14 flex flex-col justify-between text-slate-900">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between pb-6 border-b border-gray-200/80 mb-6">
            <div className="flex items-center gap-2.5">
              <svg viewBox="0 0 120 90" className="w-8 h-8" xmlns="http://www.w3.org/2000/svg">
                <path d="M 60 8 L 36 74 L 46 74 L 52 56 L 68 56 L 74 74 L 84 74 Z M 55 46 L 60 25 L 65 46 Z" fill="#111827" />
                <path d="M 28 58 Q 50 38 72 49 Q 84 54 94 48 Q 80 58 68 53 Q 48 46 28 58 Z" fill="#C5A059" />
              </svg>
              <div>
                <span className="font-serif-luxury text-lg tracking-[0.2em] text-slate-950 font-bold block">AVELORA</span>
                <span className="text-[8px] tracking-[0.3em] text-[#997B21] uppercase block font-bold">Admin Portal</span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-full text-[10px] font-bold text-gray-700 uppercase">
              2FA Protected
            </span>
          </div>

          <div className="my-auto max-w-md w-full mx-auto">
            {/* Alerts */}
            {error && (
              <div className="mb-6 p-3.5 bg-red-50/90 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2.5 shadow-sm animate-shake">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                <span className="font-medium leading-relaxed">{error}</span>
              </div>
            )}

            {notice && (
              <div className="mb-6 p-3.5 bg-amber-50/80 border border-[#C5A059]/40 text-amber-900 rounded-xl text-xs flex items-start gap-2.5 shadow-sm">
                <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#C5A059]" />
                <span className="font-medium leading-relaxed">{notice}</span>
              </div>
            )}

            {/* ================================================================= */}
            {/* SCREEN 1: LOGIN (EMAIL + PASSWORD)                                */}
            {/* ================================================================= */}
            {screen === 'LOGIN' && (
              <div>
                <div className="mb-8">
                  <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
                    Welcome Back
                  </h2>
                  <p className="text-gray-500 text-xs sm:text-sm mt-1.5">
                    Sign in to manage AVELORA Elegance
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700">
                      Admin Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="aveloraelegance@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 text-xs text-slate-900 font-medium placeholder-gray-400 focus:outline-none focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 transition shadow-sm"
                      />
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setScreen('FORGOT_PASSWORD');
                          setError('');
                          setNotice('');
                          setForgotEmail(email);
                        }}
                        className="text-[11px] font-semibold text-[#997B21] hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 bg-white rounded-xl border border-gray-200 text-xs text-slate-900 font-medium placeholder-gray-400 focus:outline-none focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 transition shadow-sm"
                      />
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 text-gray-400 hover:text-gray-600 absolute right-3 top-2.5 transition"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={rememberDevice}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      className="w-4 h-4 text-[#C5A059] border-gray-300 rounded focus:ring-[#C5A059]"
                    />
                    <label htmlFor="remember" className="text-xs text-gray-600 font-medium cursor-pointer select-none">
                      Remember this device
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-slate-950 hover:bg-[#C5A059] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 mt-4 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#C5A059]" />
                        <span>Validating Credentials...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In Securely</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* ================================================================= */}
            {/* SCREEN 2: EMAIL OTP VERIFICATION                                  */}
            {/* ================================================================= */}
            {screen === 'OTP' && (
              <div>
                <div className="mb-6">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#C5A059]/10 text-[#997B21] text-[10px] font-bold tracking-wider uppercase mb-3">
                    <ShieldCheck className="w-3.5 h-3.5" /> Step 2: Verification Required
                  </span>
                  <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
                    Verify Your Identity
                  </h2>
                  <p className="text-gray-500 text-xs sm:text-sm mt-1.5 leading-relaxed">
                    We&apos;ve dispatched a 6-digit security code to your registered email:
                  </p>
                  <p className="font-mono text-xs font-bold text-slate-800 mt-1 bg-gray-100 py-1.5 px-3 rounded-lg border border-gray-200 inline-block">
                    {maskedEmail}
                  </p>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-3 text-center">
                      Enter 6-Digit Verification Code
                    </label>
                    <div className="flex justify-between gap-2 sm:gap-3">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => {
                            otpInputRefs.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e.key)}
                          className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-black font-mono rounded-xl bg-white border-2 border-gray-200 focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 focus:outline-none transition text-slate-950 shadow-sm"
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpDigits.join('').length !== 6}
                    className="w-full py-3.5 bg-slate-950 hover:bg-[#C5A059] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#C5A059]" />
                        <span>Verifying Security Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify &amp; Enter Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-gray-200/80">
                    <button
                      type="button"
                      onClick={() => {
                        setScreen('LOGIN');
                        setError('');
                        setNotice('');
                      }}
                      className="text-gray-500 hover:text-slate-900 font-semibold flex items-center gap-1.5 transition"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                    </button>

                    <button
                      type="button"
                      disabled={!canResend || loading}
                      onClick={handleResendOtp}
                      className={`font-bold transition ${
                        canResend ? 'text-[#997B21] hover:underline cursor-pointer' : 'text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {canResend ? 'Resend Code Now' : `Resend Code in (${String(resendCountdown).padStart(2, '0')}s)`}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ================================================================= */}
            {/* SCREEN 3: FORGOT PASSWORD                                         */}
            {/* ================================================================= */}
            {screen === 'FORGOT_PASSWORD' && (
              <div>
                <div className="mb-6">
                  <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
                    Reset Password
                  </h2>
                  <p className="text-gray-500 text-xs sm:text-sm mt-1.5">
                    {forgotStep === 'ENTER_EMAIL'
                      ? 'Enter your registered administrator email to receive a password reset token.'
                      : 'Enter the verification code and choose a new secure password.'}
                  </p>
                </div>

                {forgotSuccess ? (
                  <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 animate-fadeIn">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <p className="text-sm font-bold text-emerald-900">Password Reset Complete!</p>
                    <p className="text-xs text-emerald-700">Redirecting to login portal...</p>
                  </div>
                ) : forgotStep === 'ENTER_EMAIL' ? (
                  <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700">
                        Registered Admin Email
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          placeholder="aveloraelegance@gmail.com"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 text-xs text-slate-900 font-medium placeholder-gray-400 focus:outline-none focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 shadow-sm"
                        />
                        <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-slate-950 hover:bg-[#C5A059] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-4 cursor-pointer"
                    >
                      {loading ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-[#C5A059]" />
                      ) : (
                        <span>Send Reset Instructions</span>
                      )}
                    </button>

                    <div className="pt-3 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setScreen('LOGIN');
                          setError('');
                          setNotice('');
                        }}
                        className="text-xs font-semibold text-gray-500 hover:text-slate-900 flex items-center justify-center gap-1 mx-auto"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700">
                        6-Digit Reset Code
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="• • • • • •"
                        maxLength={6}
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200 text-center font-mono text-lg font-bold text-slate-900 focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700">
                        New Password (Min 12 Characters)
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          placeholder="••••••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 bg-white rounded-xl border border-gray-200 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#C5A059]"
                        />
                        <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="p-1 text-gray-400 hover:text-gray-600 absolute right-3 top-2"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Password Strength Indicator */}
                      {newPassword && (
                        <div className="pt-1.5 space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-semibold text-gray-500">
                            <span>Password Strength:</span>
                            <span className={pwdStrength.score === 5 ? 'text-emerald-600' : pwdStrength.score >= 3 ? 'text-amber-600' : 'text-red-600'}>
                              {pwdStrength.label}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden flex gap-1">
                            {[1, 2, 3, 4, 5].map((step) => (
                              <div
                                key={step}
                                className={`h-full flex-1 transition-all duration-300 ${
                                  step <= pwdStrength.score ? pwdStrength.color : 'bg-transparent'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 bg-slate-950 hover:bg-[#C5A059] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-4 cursor-pointer"
                    >
                      {loading ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-[#C5A059]" />
                      ) : (
                        <span>Update Password &amp; Sign In</span>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Bottom Security Footer */}
          <div className="pt-8 mt-auto text-center border-t border-gray-200/80 text-[11px] text-gray-400">
            <span>🔒 Protected Administration Portal &bull; AVELORA Elegance</span>
          </div>
        </div>
      </div>
    </div>
  );
}
