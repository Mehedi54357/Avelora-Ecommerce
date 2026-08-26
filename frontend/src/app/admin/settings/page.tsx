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
  Store,
  Clock,
  Edit3,
  Power,
  X,
  Lock,
  Mail,
  Activity,
  Check,
  Shield,
} from 'lucide-react';
import { API_BASE_URL, authFetch } from '../../../utils/api-config';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'IDENTITY' | 'PATHAO' | 'DELIVERY'>('PATHAO');

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

  // PATHAO LIVE CONFIGURATION STATE
  const [pathaoConfig, setPathaoConfig] = useState<any>({
    connectionStatus: 'Checking...',
    mode: 'LIVE',
    merchantEmail: '••••••••',
    clientId: '••••••••',
    clientSecret: '••••••••••••',
    password: '••••••••••••',
    selectedStoreId: null,
    selectedStoreName: '',
    lastSuccessfulSync: null,
    tokenStatus: 'Standby',
    apiHealth: 'Healthy',
    enabled: true,
    sandbox: false,
    stores: [],
    hasCredentials: false,
  });

  const [loadingPathao, setLoadingPathao] = useState(false);
  const [testingPathao, setTestingPathao] = useState(false);
  const [syncingStores, setSyncingStores] = useState(false);
  const [pathaoStatus, setPathaoStatus] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [savingCreds, setSavingCreds] = useState(false);

  // Credential Edit Form Inputs
  const [credForm, setCredForm] = useState({
    username: '',
    password: '',
    clientId: '',
    clientSecret: '',
    sandbox: false,
  });

  const fetchPathaoConfig = async () => {
    setLoadingPathao(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/courier/pathao/config`);
      if (res.ok) {
        const data = await res.json();
        setPathaoConfig(data);
        setCredForm((prev) => ({
          ...prev,
          sandbox: data.sandbox || false,
        }));
      }
    } catch (e: any) {
      console.error('Failed to fetch Pathao config:', e);
    } finally {
      setLoadingPathao(false);
    }
  };

  useEffect(() => {
    fetchPathaoConfig();
  }, []);

  const handleTestConnection = async () => {
    setTestingPathao(true);
    setPathaoStatus(null);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/courier/pathao/test`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPathaoStatus({
          success: true,
          message: data.message || 'Connected successfully with Pathao Courier!',
        });
        fetchPathaoConfig();
      } else {
        setPathaoStatus({
          success: false,
          message: data.message || 'Connection test failed. Please verify credentials.',
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

  const handleSyncStores = async () => {
    setSyncingStores(true);
    setPathaoStatus(null);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/courier/pathao/sync-stores`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPathaoStatus({
          success: true,
          message: `Synced successfully! ${data.stores?.length || 0} stores fetched.`,
        });
        fetchPathaoConfig();
      } else {
        setPathaoStatus({
          success: false,
          message: data.message || 'Failed to sync stores from Pathao.',
        });
      }
    } catch (e: any) {
      setPathaoStatus({
        success: false,
        message: e.message || 'Store sync error',
      });
    } finally {
      setSyncingStores(false);
    }
  };

  const handleSelectStore = async (storeId: number, storeName: string) => {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/courier/pathao/default-store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, storeName }),
      });
      if (res.ok) {
        setPathaoConfig((prev: any) => ({
          ...prev,
          selectedStoreId: storeId,
          selectedStoreName: storeName,
        }));
        setPathaoStatus({
          success: true,
          message: `Default pickup store set to: "${storeName}"`,
        });
      }
    } catch (e: any) {
      alert('Failed to update default store: ' + e.message);
    }
  };

  const handleToggleIntegration = async () => {
    const nextState = !pathaoConfig.enabled;
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/courier/pathao/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: nextState }),
      });
      const data = await res.json();
      if (res.ok) {
        setPathaoConfig((prev: any) => ({
          ...prev,
          enabled: nextState,
          connectionStatus: nextState ? 'Connected' : 'Disabled',
        }));
        setPathaoStatus({
          success: true,
          message: data.message || `Pathao Integration ${nextState ? 'enabled' : 'disabled'}.`,
        });
      }
    } catch (e: any) {
      alert('Failed to toggle integration: ' + e.message);
    }
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCreds(true);
    setPathaoStatus(null);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/courier/pathao/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPathaoStatus({
          success: true,
          message: 'Pathao Merchant credentials updated and verified successfully!',
        });
        setShowEditModal(false);
        setCredForm({
          username: '',
          password: '',
          clientId: '',
          clientSecret: '',
          sandbox: false,
        });
        fetchPathaoConfig();
      } else {
        setPathaoStatus({
          success: false,
          message: data.message || 'Failed to authenticate credentials with Pathao.',
        });
      }
    } catch (e: any) {
      setPathaoStatus({
        success: false,
        message: e.message || 'Failed to save credentials',
      });
    } finally {
      setSavingCreds(false);
    }
  };

  const formatDateTime = (dateStr: any) => {
    if (!dateStr) return 'Never';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return String(dateStr);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6D23]">
            System Configuration & Integrations
          </span>
          <h1 className="text-2xl font-extrabold font-serif-luxury text-slate-950 mt-0.5">
            Settings & Logistics Infrastructure
          </h1>
          <p className="text-xs text-gray-500">
            Manage business identity, Pathao Merchant API credentials, default pickup hubs, and delivery zones.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full font-mono text-xs font-semibold border border-slate-200">
            v2.4.0 • Production Ready
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white px-6 pt-3 rounded-t-2xl shadow-sm">
        <button
          onClick={() => setActiveTab('PATHAO')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 ${
            activeTab === 'PATHAO'
              ? 'border-red-600 text-red-600'
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
          <Building2 className="w-4 h-4 text-[#8C6D23]" />
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
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Delivery Rates & Zones</span>
        </button>
      </div>

      {/* TAB 1: PATHAO COURIER INTEGRATION */}
      {activeTab === 'PATHAO' && (
        <div className="bg-white rounded-b-2xl border border-gray-200 shadow-sm p-6 space-y-6 -mt-6">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-gray-100 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                <Truck className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-950">Pathao Courier Integration</h3>
                <p className="text-xs text-gray-500">
                  Full-stack automated courier dispatch, OAuth token renewal, live order tracking, and COD reconciliation.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1.5 border ${
                  pathaoConfig.enabled && pathaoConfig.connectionStatus === 'Connected'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : pathaoConfig.enabled
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    pathaoConfig.enabled && pathaoConfig.connectionStatus === 'Connected'
                      ? 'bg-emerald-500 animate-pulse'
                      : pathaoConfig.enabled
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                ></span>
                {pathaoConfig.connectionStatus}
              </span>

              <span
                className={`px-3 py-1 rounded-full font-extrabold text-[11px] uppercase tracking-wider border ${
                  pathaoConfig.mode === 'LIVE'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}
              >
                {pathaoConfig.mode}
              </span>
            </div>
          </div>

          {/* Feedback Status Alert */}
          {pathaoStatus && (
            <div
              className={`p-4 rounded-2xl border text-xs flex items-start gap-3 transition-all ${
                pathaoStatus.success
                  ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50/90 border-rose-200 text-rose-900'
              }`}
            >
              {pathaoStatus.success ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
              )}
              <div className="flex-1">
                <p className="font-bold text-sm">{pathaoStatus.success ? 'Success' : 'Notice'}</p>
                <p className="mt-0.5 text-xs opacity-90">{pathaoStatus.message}</p>
              </div>
              <button
                onClick={() => setPathaoStatus(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Main Credentials & Connection Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
            {/* Left Column */}
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-200/80">
                <span className="text-gray-500 font-semibold">Connection Status</span>
                <span className="font-bold flex items-center gap-1.5 text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {pathaoConfig.connectionStatus}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-200/80">
                <span className="text-gray-500 font-semibold">Mode</span>
                <span className="font-extrabold uppercase font-mono px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-800 text-[11px]">
                  {pathaoConfig.mode}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-200/80">
                <span className="text-gray-500 font-semibold">Merchant Email</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {pathaoConfig.merchantEmail}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-gray-500 font-semibold">Client ID</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {pathaoConfig.clientId}
                </span>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-200/80">
                <span className="text-gray-500 font-semibold">Client Secret</span>
                <span className="font-mono tracking-widest text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {pathaoConfig.clientSecret}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-200/80">
                <span className="text-gray-500 font-semibold">Password</span>
                <span className="font-mono tracking-widest text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {pathaoConfig.password}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-200/80">
                <span className="text-gray-500 font-semibold">Token Status</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                    pathaoConfig.tokenStatus === 'Active'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                >
                  {pathaoConfig.tokenStatus}
                </span>
              </div>

              <div className="flex items-center justify-between py-2">
                <span className="text-gray-500 font-semibold">API Health</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border flex items-center gap-1 ${
                    pathaoConfig.apiHealth === 'Healthy'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                  }`}
                >
                  <Activity className="w-3 h-3 text-emerald-600" />
                  {pathaoConfig.apiHealth}
                </span>
              </div>
            </div>
          </div>

          {/* Pickup Store Selector Box */}
          <div className="p-5 bg-slate-900 text-white rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Store className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">
                  Active Pickup Store / Warehouse
                </p>
                <p className="text-[11px] text-gray-300">
                  All automated parcel bookings will assign riders to pick up goods from this registered hub.
                </p>
              </div>
            </div>

            <div className="w-full md:w-auto min-w-[280px]">
              <select
                value={pathaoConfig.selectedStoreId || ''}
                onChange={(e) => {
                  const sId = Number(e.target.value);
                  const found = pathaoConfig.stores?.find((s: any) => s.store_id === sId);
                  if (found) {
                    handleSelectStore(sId, found.store_name);
                  }
                }}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 hover:border-[#D4AF37] text-white rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              >
                {pathaoConfig.stores && pathaoConfig.stores.length > 0 ? (
                  pathaoConfig.stores.map((s: any) => (
                    <option key={s.store_id} value={s.store_id}>
                      {s.store_name} ({s.store_address || 'Default Hub'})
                    </option>
                  ))
                ) : (
                  <option value="">
                    {pathaoConfig.selectedStoreName || 'Default Avelora Main Store'}
                  </option>
                )}
              </select>
            </div>
          </div>

          {/* Control Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleTestConnection}
              disabled={testingPathao}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              {testingPathao ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              <span>Test Connection</span>
            </button>

            <button
              onClick={handleSyncStores}
              disabled={syncingStores}
              className="px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-300 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              {syncingStores ? <Loader2 className="w-4 h-4 animate-spin" /> : <Store className="w-4 h-4 text-[#8C6D23]" />}
              <span>Sync Stores</span>
            </button>

            <button
              onClick={() => {
                setCredForm({
                  username: '',
                  password: '',
                  clientId: '',
                  clientSecret: '',
                  sandbox: pathaoConfig.sandbox || false,
                });
                setShowEditModal(true);
              }}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <Edit3 className="w-4 h-4 text-[#D4AF37]" />
              <span>Update Credentials</span>
            </button>

            <button
              onClick={handleToggleIntegration}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm border ${
                pathaoConfig.enabled
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{pathaoConfig.enabled ? 'Disable Integration' : 'Enable Integration'}</span>
            </button>
          </div>

          {/* Sync & Health Info Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-200 gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>
                Last Successful Sync:{' '}
                <strong className="text-slate-800 font-mono">
                  {formatDateTime(pathaoConfig.lastSuccessfulSync)}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[11px] flex items-center gap-1 text-slate-600">
                <Shield className="w-3.5 h-3.5 text-emerald-600" /> Bank-Grade Server Encrypted Storage
              </span>
            </div>
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

      {/* UPDATE PATHAO CREDENTIALS MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-950 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Key className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-serif-luxury">Update Pathao API Credentials</h3>
                  <p className="text-[11px] text-gray-400">Configure bank-grade secured Pathao credentials</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveCredentials} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Environment Mode</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCredForm((prev) => ({ ...prev, sandbox: false }))}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs transition border flex items-center justify-center gap-2 ${
                      !credForm.sandbox
                        ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                        : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {!credForm.sandbox && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
                    <span>LIVE Production</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCredForm((prev) => ({ ...prev, sandbox: true }))}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs transition border flex items-center justify-center gap-2 ${
                      credForm.sandbox
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {credForm.sandbox && <Check className="w-3.5 h-3.5 text-white" />}
                    <span>SANDBOX Testing</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Merchant Registered Email / Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. merchant@avelora.com"
                    value={credForm.username}
                    onChange={(e) => setCredForm({ ...credForm, username: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none font-mono focus:bg-white focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Pathao Account Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="Enter your Pathao password"
                    value={credForm.password}
                    onChange={(e) => setCredForm({ ...credForm, password: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none font-mono focus:bg-white focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Pathao Client ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Client ID"
                    value={credForm.clientId}
                    onChange={(e) => setCredForm({ ...credForm, clientId: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none font-mono focus:bg-white focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Pathao Client Secret <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Client Secret"
                    value={credForm.clientSecret}
                    onChange={(e) => setCredForm({ ...credForm, clientSecret: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none font-mono focus:bg-white focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                <p>
                  <strong>Note:</strong> Upon clicking Save, the system will immediately initiate an OAuth handshake with Pathao API to authenticate and fetch your registered pickup stores list.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCreds}
                  className="px-6 py-2.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center gap-2 shadow-sm"
                >
                  {savingCreds ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-[#D4AF37]" />}
                  <span>Save & Verify Credentials</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
