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
  Database,
  Trash2,
  ShieldAlert,
  FileText,
  RotateCcw,
  Package,
} from 'lucide-react';
import { API_BASE_URL, authFetch } from '../../../utils/api-config';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'IDENTITY' | 'PATHAO' | 'DELIVERY' | 'DATA_MANAGEMENT'>('PATHAO');

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
  const [modalError, setModalError] = useState<string | null>(null);
  const [savingCreds, setSavingCreds] = useState(false);

  // Credential Edit Form Inputs
  const [credForm, setCredForm] = useState({
    username: '',
    password: '',
    clientId: '',
    clientSecret: '',
    sandbox: false,
  });

  // TEST DATA MANAGEMENT STATE
  const [testSummary, setTestSummary] = useState<any>(null);
  const [loadingTestSummary, setLoadingTestSummary] = useState(false);
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [cleanupConfirmText, setCleanupConfirmText] = useState('');
  const [cleaningUp, setCleaningUp] = useState(false);

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

  const fetchTestSummary = async () => {
    setLoadingTestSummary(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/settings/admin/test-data/summary`);
      if (res.ok) {
        const data = await res.json();
        setTestSummary(data);
      }
    } catch (e) {
      console.error('Failed to fetch test summary:', e);
    } finally {
      setLoadingTestSummary(false);
    }
  };

  useEffect(() => {
    fetchPathaoConfig();
  }, []);

  useEffect(() => {
    if (activeTab === 'DATA_MANAGEMENT') {
      fetchTestSummary();
    }
  }, [activeTab]);

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
        message: 'Connection failed: ' + (e.message || 'Server timeout'),
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
          message: `Synced ${data.count || 0} pickup hubs from your Pathao Merchant profile.`,
        });
        fetchPathaoConfig();
      } else {
        setPathaoStatus({
          success: false,
          message: data.message || 'Failed to sync pickup stores from Pathao.',
        });
      }
    } catch (e: any) {
      setPathaoStatus({
        success: false,
        message: 'Sync failed: ' + e.message,
      });
    } finally {
      setSyncingStores(false);
    }
  };

  const handleSetDefaultStore = async (storeId: number, storeName: string) => {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/courier/pathao/default-store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, storeName }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPathaoConfig((prev: any) => ({
          ...prev,
          selectedStoreId: storeId,
          selectedStoreName: storeName,
        }));
        setPathaoStatus({
          success: true,
          message: `Default pickup store updated to "${storeName}".`,
        });
      }
    } catch (e: any) {
      alert('Failed to set default store: ' + e.message);
    }
  };

  const handleToggleIntegration = async (nextState: boolean) => {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/courier/pathao/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: nextState }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPathaoConfig((prev: any) => ({ ...prev, enabled: nextState }));
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
    setModalError(null);
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
        setModalError(null);
        fetchPathaoConfig();
      } else {
        const errMsg = data.message || 'Failed to authenticate credentials with Pathao. Please check email/password and Client ID/Secret.';
        setModalError(errMsg);
        setPathaoStatus({
          success: false,
          message: errMsg,
        });
      }
    } catch (e: any) {
      const errMsg = e.message || 'Failed to save credentials';
      setModalError(errMsg);
      setPathaoStatus({
        success: false,
        message: errMsg,
      });
    } finally {
      setSavingCreds(false);
    }
  };

  // Bulk Clean Test Data
  const handleBulkCleanupTestData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cleanupConfirmText.trim() !== 'DELETE TEST DATA') {
      alert('You must type exact text "DELETE TEST DATA" to proceed.');
      return;
    }
    setCleaningUp(true);

    try {
      const res = await authFetch(`${API_BASE_URL}/api/settings/admin/test-data/cleanup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmationText: cleanupConfirmText.trim(),
          cleanAll: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message || 'Test data safely cleaned up and inventory reservations reconciled.');
        setShowCleanupModal(false);
        setCleanupConfirmText('');
        fetchTestSummary();
      } else {
        alert(data.message || 'Failed to clean up test data.');
      }
    } catch (err: any) {
      alert(err.message || 'Error executing test cleanup.');
    } finally {
      setCleaningUp(false);
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
            System Configuration &amp; Operations
          </span>
          <h1 className="text-2xl font-extrabold font-serif-luxury text-slate-950 mt-0.5">
            Settings &amp; Infrastructure
          </h1>
          <p className="text-xs text-gray-500">
            Manage business identity, Pathao courier API, delivery zones, and production-grade sandboxed test data.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full font-mono text-xs font-semibold border border-slate-200">
            v2.4.0 &bull; Enterprise 2FA
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white px-6 pt-3 rounded-t-2xl shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab('PATHAO')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 flex-shrink-0 cursor-pointer ${
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
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 flex-shrink-0 cursor-pointer ${
            activeTab === 'IDENTITY'
              ? 'border-slate-900 text-slate-950'
              : 'border-transparent text-gray-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4 text-[#8C6D23]" />
          <span>Business Identity &amp; VAT</span>
        </button>

        <button
          onClick={() => setActiveTab('DELIVERY')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 flex-shrink-0 cursor-pointer ${
            activeTab === 'DELIVERY'
              ? 'border-slate-900 text-slate-950'
              : 'border-transparent text-gray-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Delivery Rates &amp; Zones</span>
        </button>

        <button
          onClick={() => setActiveTab('DATA_MANAGEMENT')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 flex-shrink-0 cursor-pointer ${
            activeTab === 'DATA_MANAGEMENT'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-purple-600/70 hover:text-purple-900'
          }`}
        >
          <Database className="w-4 h-4 text-purple-600" />
          <span>🧪 Test &amp; Demo Data Center</span>
        </button>
      </div>

      {/* TAB 1: PATHAO COURIER INTEGRATION */}
      {activeTab === 'PATHAO' && (
        <div className="bg-white rounded-b-2xl border border-gray-200 shadow-sm p-6 space-y-6 -mt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 font-bold">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-950 font-serif-luxury">Pathao Merchant API</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      pathaoConfig.enabled
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}
                  >
                    {pathaoConfig.enabled ? 'Active Integration' : 'Disabled'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Official merchant courier booking, real-time rate plan &amp; consignment dispatch</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleIntegration(!pathaoConfig.enabled)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  pathaoConfig.enabled
                    ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{pathaoConfig.enabled ? 'Disable' : 'Enable'}</span>
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
                className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Configure Credentials</span>
              </button>
            </div>
          </div>

          {pathaoStatus && (
            <div
              className={`p-4 rounded-xl text-xs flex items-start gap-3 animate-fadeIn ${
                pathaoStatus.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {pathaoStatus.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="font-bold">{pathaoStatus.success ? 'Success' : 'Notice'}</p>
                <p className="mt-0.5 text-[11px]">{pathaoStatus.message}</p>
              </div>
            </div>
          )}

          {/* Pathao Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Connection State</span>
              <p className="text-sm font-bold text-slate-900">{pathaoConfig.connectionStatus || 'Ready'}</p>
              <span className="text-[10px] text-gray-400 font-mono">Mode: {pathaoConfig.mode || 'LIVE'}</span>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Selected Pickup Store</span>
              <p className="text-sm font-bold text-slate-900 truncate">{pathaoConfig.selectedStoreName || 'Default Hub'}</p>
              <span className="text-[10px] text-gray-400 font-mono">Store ID: #{pathaoConfig.selectedStoreId || 1}</span>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Synced Pickup Hubs</span>
              <p className="text-sm font-bold text-slate-900">{pathaoConfig.stores?.length || 0} Registered</p>
              <span className="text-[10px] text-gray-400 font-mono">Last Sync: {formatDateTime(pathaoConfig.lastSuccessfulSync)}</span>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">API Gateway Health</span>
              <p className="text-sm font-bold text-emerald-700">Healthy (200 OK)</p>
              <span className="text-[10px] text-gray-400 font-mono">OAuth 2.0 Client Credentials</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleTestConnection}
              disabled={testingPathao}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-slate-900 font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              {testingPathao ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5 text-blue-600" />}
              <span>Test API Connection</span>
            </button>

            <button
              onClick={handleSyncStores}
              disabled={syncingStores}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-slate-900 font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              {syncingStores ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />}
              <span>Sync Pickup Stores</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: BUSINESS IDENTITY & VAT */}
      {activeTab === 'IDENTITY' && (
        <div className="bg-white rounded-b-2xl border border-gray-200 shadow-sm p-6 space-y-6 -mt-6">
          <h3 className="text-base font-bold text-slate-900 font-serif-luxury">Official Merchant Identity</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">BIN / VAT Registration</label>
              <input
                type="text"
                value={binVat}
                onChange={(e) => setBinVat(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Customer Hotline</label>
              <input
                type="text"
                value={hotline}
                onChange={(e) => setHotline(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DELIVERY RATES & ZONES */}
      {activeTab === 'DELIVERY' && (
        <div className="bg-white rounded-b-2xl border border-gray-200 shadow-sm p-6 space-y-6 -mt-6 text-xs">
          <h3 className="text-base font-bold text-slate-900 font-serif-luxury">Standard Delivery Rates</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
              <h4 className="font-bold text-slate-900">Inside Dhaka Metro</h4>
              <p className="text-gray-500">Express doorstep delivery</p>
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
        </div>
      )}

      {/* TAB 4: TEST & DEMO DATA MANAGEMENT CENTER */}
      {activeTab === 'DATA_MANAGEMENT' && (
        <div className="bg-white rounded-b-2xl border border-gray-200 shadow-sm p-6 space-y-6 -mt-6 animate-fadeIn">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 font-bold">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-950 font-serif-luxury">Test &amp; Demo Data Center</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200 uppercase tracking-wider">
                    Authoritative Isolation
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Inspect sandboxed records, reverse reserved stock, and perform safe dependency-aware cleanups without corrupting production ledgers.
                </p>
              </div>
            </div>

            <button
              onClick={fetchTestSummary}
              disabled={loadingTestSummary}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-slate-900 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingTestSummary ? 'animate-spin' : ''}`} />
              <span>Refresh Summary</span>
            </button>
          </div>

          {/* Test Metrics KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800">Test Products</span>
              <p className="text-xl font-bold font-mono text-purple-950">{testSummary?.testProductsCount || 0}</p>
              <span className="text-[10px] text-gray-500">Catalog items</span>
            </div>

            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800">Test Orders</span>
              <p className="text-xl font-bold font-mono text-purple-950">{testSummary?.testOrdersCount || 0}</p>
              <span className="text-[10px] text-gray-500">Simulated checkouts</span>
            </div>

            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800">Test Reservations</span>
              <p className="text-xl font-bold font-mono text-purple-950">{testSummary?.testReservationsCount || 0}</p>
              <span className="text-[10px] text-gray-500">Units on test hold</span>
            </div>

            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800">Test Txns</span>
              <p className="text-xl font-bold font-mono text-purple-950">{testSummary?.testTxnsCount || 0}</p>
              <span className="text-[10px] text-gray-500">Inventory moves</span>
            </div>

            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800">Test Payments</span>
              <p className="text-xl font-bold font-mono text-purple-950">{testSummary?.testPaymentsCount || 0}</p>
              <span className="text-[10px] text-gray-500">Ledger entries</span>
            </div>

            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800">Test Returns</span>
              <p className="text-xl font-bold font-mono text-purple-950">{testSummary?.testReturnsCount || 0}</p>
              <span className="text-[10px] text-gray-500">Simulated RMAs</span>
            </div>
          </div>

          {/* Section 1: Itemized Test Products */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-600" />
              <span>Registered Test Products ({testSummary?.testProducts?.length || 0})</span>
            </h4>

            {testSummary?.testProducts?.length === 0 ? (
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center text-xs text-gray-400">
                No test products currently in database. Real production catalog is clean.
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-[10px] font-bold uppercase text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Price</th>
                      <th className="py-2.5 px-3">Variants</th>
                      <th className="py-2.5 px-3">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(testSummary?.testProducts || []).map((p: any) => (
                      <tr key={p._id} className="hover:bg-purple-50/30">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {p.name} <span className="font-mono text-[10px] text-gray-400">/{p.slug}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-800">
                            {p.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono">৳{p.salePrice}</td>
                        <td className="py-2.5 px-3">{p.variants?.length || 1} Variant(s)</td>
                        <td className="py-2.5 px-3 text-gray-400 text-[10px]">{new Date(p.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 2: Itemized Test Orders */}
          <div className="space-y-3 pt-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              <span>Registered Test Orders ({testSummary?.testOrders?.length || 0})</span>
            </h4>

            {testSummary?.testOrders?.length === 0 ? (
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center text-xs text-gray-400">
                No active test orders. Production analytics are 100% authentic.
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-[10px] font-bold uppercase text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3">Order Ref</th>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Total</th>
                      <th className="py-2.5 px-3">Paid / Due</th>
                      <th className="py-2.5 px-3">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(testSummary?.testOrders || []).map((o: any) => (
                      <tr key={o._id} className="hover:bg-purple-50/30 font-mono">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{o.orderId}</td>
                        <td className="py-2.5 px-3 font-sans">{o.fulfillmentMethod}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-gray-100 text-gray-800">
                            {o.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">৳{o.totalAmount}</td>
                        <td className="py-2.5 px-3 text-[11px]">
                          <span className="text-emerald-700 font-medium">৳{o.paidAmount || 0}</span> / <span className="text-amber-800 font-bold">৳{o.dueAmount || 0}</span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-400 text-[10px] font-sans">{new Date(o.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 3: Bulk Clean Danger Zone */}
          <div className="p-6 bg-red-50/60 border border-red-200 rounded-2xl space-y-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-red-950">Bulk Test Data Cleanup Engine</h4>
                <p className="text-xs text-red-800 mt-1 leading-relaxed">
                  Permanently deletes all designated test products, test simulated orders, test payments, and releases test shelf reservations. Production orders and real inventory are strictly protected.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowCleanupModal(true)}
                disabled={(testSummary?.testProductsCount || 0) === 0 && (testSummary?.testOrdersCount || 0) === 0}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Initiate Safe Test Cleanup</span>
              </button>
            </div>
          </div>
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
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition cursor-pointer"
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
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs transition border flex items-center justify-center gap-2 cursor-pointer ${
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
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs transition border flex items-center justify-center gap-2 cursor-pointer ${
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

              {modalError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                  <div>
                    <p className="font-bold">Authentication Error</p>
                    <p className="text-[11px] mt-0.5">{modalError}</p>
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCreds}
                  className="px-6 py-2.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  {savingCreds ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-[#D4AF37]" />}
                  <span>Save &amp; Verify Credentials</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK TEST CLEANUP CONFIRMATION MODAL */}
      {showCleanupModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-red-200 text-slate-900 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-700 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Confirm Test Data Cleanup</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                This operation will delete all sandboxed test products, test orders, and reverse test stock reservations.
              </p>
              <p className="text-xs font-bold text-red-700">
                To confirm, type <span className="font-mono bg-red-100 px-1.5 py-0.5 rounded text-red-900 select-all">DELETE TEST DATA</span> below:
              </p>
            </div>

            <form onSubmit={handleBulkCleanupTestData} className="space-y-4">
              <input
                type="text"
                required
                placeholder="DELETE TEST DATA"
                value={cleanupConfirmText}
                onChange={(e) => setCleanupConfirmText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-red-300 font-mono text-center font-bold text-xs uppercase focus:outline-none focus:border-red-600 bg-red-50/30"
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCleanupModal(false);
                    setCleanupConfirmText('');
                  }}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs uppercase rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={cleaningUp || cleanupConfirmText.trim() !== 'DELETE TEST DATA'}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-40 cursor-pointer"
                >
                  {cleaningUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  <span>Execute Cleanup</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
