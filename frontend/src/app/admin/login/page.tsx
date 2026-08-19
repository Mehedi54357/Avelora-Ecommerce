'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../../../utils/api-config';
import { AveloraLogo } from '../../../components/navbar';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.token) {
          localStorage.setItem('admin_token', data.token);
        }
        // Redirect directly to the authenticated admin dashboard
        window.location.href = '/admin/dashboard';
      } else {
        setError(data.message || 'Invalid administrator email or password.');
      }
    } catch (err: any) {
      setError('Unable to connect to backend server. Please verify backend service availability.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#D4AF37]/30 z-10 animate-fadeIn">
        {/* Brand Header */}
        <div className="bg-slate-950 p-8 text-center border-b border-[#D4AF37]/20 relative">
          <div className="flex justify-center mb-2">
            <svg viewBox="0 0 120 90" className="w-12 h-12" xmlns="http://www.w3.org/2000/svg">
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
          </div>

          <h1 className="text-2xl font-bold font-serif-luxury tracking-[0.25em] text-white">
            AVELORA
          </h1>
          <p className="text-[9px] uppercase tracking-[0.3em] text-[#C5A059] font-semibold mt-0.5">
            Admin Management Gateway
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5 text-xs">
              <label className="font-bold uppercase tracking-wider text-gray-700">
                Admin Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="admin@avelora.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059] text-xs text-gray-900 bg-gray-50/50 font-medium"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold uppercase tracking-wider text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059] text-xs text-gray-900 bg-gray-50/50"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-slate-950 hover:bg-[#C5A059] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition duration-300 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In To Cockpit'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Help */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-[11px] text-gray-500 space-y-1">
            <p className="font-semibold text-gray-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" /> Seeded Admin Credentials:
            </p>
            <p className="font-mono text-gray-600">Email: <strong>admin@avelora.com</strong></p>
            <p className="font-mono text-gray-600">Password: <strong>admin123</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
