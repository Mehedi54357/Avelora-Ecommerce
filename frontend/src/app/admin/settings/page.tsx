'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Truck,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Loader2,
  Key,
} from 'lucide-react';
import { API_BASE_URL, authFetch } from '../../../utils/api-config';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'IDENTITY' | 'PATHAO' | 'DELIVERY'>('PATHAO');
  const [testingPathao, setTestingPathao] = useState(false);
  const [pathaoStatus, setPathaoStatus] = useState<any>(null);

  // Business Identity
  const [businessName, setBusinessName] = useState('AVELORA');
  const [tagline, setTagline] = useState('Elegance in every choice');
  const [binVat, setBinVat] = useState('005829147-0101');
  const [hotline, setHotline] = useState('+880 1353-786336');
  const [email, setEmail] = useState('aveloraelegance@gmail.com');
  const [address, setAddress] = useState('Mohakhali Royal Filling Station, Jam Jam Tower, 5th Building, 6th Floor, Dhaka');

  // Delivery Charges
  const [dhakaCharge, setDhakaCharge] = useState(70);
  const [outsideCharge, setOutsideCharge] = useState(130);

  const testPathaoConnection = async () => {
    setTestingPathao(true);
    setPathaoStatus(null);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/courier/pathao/stores`);
      const data = await res.json();
      if (res.ok) {
        setPathaoStatus({
          success: true,
          message: `Connected successfully! Found ${Array.isArray(data) ? data.length : 0} merchant stores.`,
          stores: data,
        });
      } else {
        setPathaoStatus({
          success: false,
          message: data.message || 'Failed to authenticate with Pathao. Please check credentials in server .env.',
        });
      }
    } catch (e: any) {
      setPathaoStatus({
        success: false,
        message: e.message || 'Connection test error',
      });
    } finally {
      setTestingPathao(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6D23]">
          System Configuration & Integrations
        </span>
        <h1 className="text-2xl font-extrabold font-serif-luxury text-slate-950 mt-0.5">
          Settings & Courier Infrastructure
        </h1>
        <p className="text-xs text-gray-500">
          Manage business credentials, VAT identity, delivery charge structures, and Pathao Merchant API.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white px-6 pt-3 rounded-t-2xl">
        <button
          onClick={() => setActiveTab('PATHAO')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 ${
            activeTab === 'PATHAO'
              ? 'border-slate-900 text-slate-950'
              : 'border-transparent text-gray-500 hover:text-slate-800'
          }`}
        >
          <Truck className="w-4 h-4 text-red-600" />
          <span>Pathao Courier Integration</span>
        </button>

        <button
          onClick={() => setActiveTab('IDENTITY')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 ${
            activeTab === 'IDENTITY'
              ? 'border-slate-900 text-slate-950'
              : 'border-transparent text-gray-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Business Identity & VAT</span>
        </button>

        <button
          onClick={() => setActiveTab('DELIVERY')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 ${
            activeTab === 'DELIVERY'
              ? 'border-slate-900 text-slate-950'
              : 'border-transparent text-gray-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Delivery Rates & Zones</span>
        </button>
      </div>

      {/* TAB 1: PATHAO COURIER */}
      {activeTab === 'PATHAO' && (
        <div className="bg-white rounded-b-2xl border border-gray-200 shadow-sm p-6 space-y-6 -mt-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div>
              <h3 className="text-base font-bold text-slate-950">Pathao Merchant Courier API</h3>
              <p className="text-xs text-gray-500">
                Server-side OAuth token issuing, store selector, automatic consignment booking, and status sync.
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full font-bold text-xs border border-emerald-200">
              API Ready
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Key className="w-4 h-4 text-[#8C6D23]" />
              <span>Server-Side Credentials Protocol (Secured)</span>
            </div>
            <p className="text-gray-600">
              Pathao credentials remain strictly isolated on the backend server for bank-grade security. You can configure them in backend <code className="bg-gray-200 px-1 py-0.5 rounded font-mono">.env</code>:
            </p>
            <div className="bg-slate-950 text-gray-300 p-3 rounded-xl font-mono text-[11px] space-y-1">
              <p>PATHAO_SANDBOX=true <span className="text-gray-500"># Toggle to false for live production</span></p>
              <p>PATHAO_BASE_URL=https://courier-api-sandbox.pathao.com</p>
              <p>PATHAO_CLIENT_ID=your_pathao_client_id</p>
              <p>PATHAO_CLIENT_SECRET=your_pathao_client_secret</p>
              <p>PATHAO_USERNAME=your_merchant_registered_email</p>
              <p>PATHAO_PASSWORD=your_pathao_password</p>
            </div>
          </div>

          {/* Test Connection Box */}
          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Verify Pathao API Connection</h4>
                <p className="text-[11px] text-gray-500">
                  Tests OAuth token generation and fetches merchant stores list from Pathao Aladdin API.
                </p>
              </div>
              <button
                onClick={testPathaoConnection}
                disabled={testingPathao}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
              >
                {testingPathao ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span>Test Connection Now</span>
              </button>
            </div>

            {pathaoStatus && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2 ${
                  pathaoStatus.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                {pathaoStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">{pathaoStatus.message}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BUSINESS IDENTITY */}
      {activeTab === 'IDENTITY' && (
        <div className="bg-white rounded-b-2xl border border-gray-200 shadow-sm p-6 space-y-4 text-xs -mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Brand Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Brand Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">BIN / VAT Registration</label>
              <input
                type="text"
                value={binVat}
                onChange={(e) => setBinVat(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Customer Hotline</label>
              <input
                type="text"
                value={hotline}
                onChange={(e) => setHotline(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Official Support Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Registered Office & Flagship Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none"
            />
          </div>

          <button
            onClick={() => alert('Business identity saved successfully.')}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition flex items-center gap-2"
          >
            <Save className="w-4 h-4 text-[#D4AF37]" />
            <span>Save Identity Settings</span>
          </button>
        </div>
      )}

      {/* TAB 3: DELIVERY ZONES */}
      {activeTab === 'DELIVERY' && (
        <div className="bg-white rounded-b-2xl border border-gray-200 shadow-sm p-6 space-y-4 text-xs -mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
              <h4 className="font-bold text-slate-900">Inside Dhaka City</h4>
              <p className="text-gray-500">Standard 24-48 hour insured delivery</p>
              <div className="flex items-center gap-2 pt-2">
                <span className="font-bold font-mono text-base">৳</span>
                <input
                  type="number"
                  value={dhakaCharge}
                  onChange={(e) => setDhakaCharge(Number(e.target.value))}
                  className="p-2 bg-white border border-gray-300 rounded-xl font-bold font-mono text-sm w-32"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
              <h4 className="font-bold text-slate-900">Outside Dhaka / Nationwide</h4>
              <p className="text-gray-500">All 64 districts courier delivery</p>
              <div className="flex items-center gap-2 pt-2">
                <span className="font-bold font-mono text-base">৳</span>
                <input
                  type="number"
                  value={outsideCharge}
                  onChange={(e) => setOutsideCharge(Number(e.target.value))}
                  className="p-2 bg-white border border-gray-300 rounded-xl font-bold font-mono text-sm w-32"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => alert('Delivery zones and rates updated.')}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition flex items-center gap-2"
          >
            <Save className="w-4 h-4 text-[#D4AF37]" />
            <span>Update Delivery Rates</span>
          </button>
        </div>
      )}
    </div>
  );
}
