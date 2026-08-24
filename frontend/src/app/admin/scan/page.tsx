'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Camera,
  Upload,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Truck,
  Package,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  Loader2,
  X,
  History,
  Check,
} from 'lucide-react';
import { API_BASE_URL, authFetch } from '../../../utils/api-config';

export default function AdminQrScannerPage() {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'manual' | 'history'>('camera');
  const [cameraActive, setCameraActive] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);

  // Verification & Order State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedResult, setVerifiedResult] = useState<any>(null);
  const [verifyError, setVerifyError] = useState<string>('');

  // Fulfillment State
  const [isFulfilling, setIsFulfilling] = useState(false);
  const [fulfilledData, setFulfilledData] = useState<any>(null);

  // Manual Input State
  const [manualCode, setManualCode] = useState('');

  // Scan Audit History
  const [scanEvents, setScanEvents] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch Video Devices
  useEffect(() => {
    const getDevices = async () => {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoInputs = devices.filter((d) => d.kind === 'videoinput');
          setVideoDevices(videoInputs);
          if (videoInputs.length > 0 && !selectedDeviceId) {
            // Prefer rear environment camera
            const backCamera = videoInputs.find(
              (d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'),
            );
            setSelectedDeviceId(backCamera ? backCamera.deviceId : videoInputs[0].deviceId);
          }
        } catch (e) {
          console.error('Error enumerating video devices:', e);
        }
      }
    };
    getDevices();
  }, [selectedDeviceId]);

  // 2. Start / Stop ZXing Camera Reader
  useEffect(() => {
    let isMounted = true;

    if (activeTab !== 'camera' || !cameraActive || !videoRef.current) {
      if (controlsRef.current) {
        try {
          controlsRef.current.stop();
        } catch {}
        controlsRef.current = null;
      }
      return;
    }

    const startScanner = async () => {
      try {
        const { BrowserQRCodeReader } = await import('@zxing/browser');
        const codeReader = new BrowserQRCodeReader();

        const constraints: MediaStreamConstraints = {
          audio: false,
          video: selectedDeviceId
            ? { deviceId: { exact: selectedDeviceId } }
            : { facingMode: { ideal: 'environment' } },
        };

        const controls = await codeReader.decodeFromConstraints(
          constraints,
          videoRef.current!,
          (result, error) => {
            if (isMounted && result) {
              const text = result.getText();
              if (text && !isVerifying && !verifiedResult && !fulfilledData) {
                handleVerifyQr(text);
              }
            }
          },
        );

        if (isMounted) {
          controlsRef.current = controls;
          setHasCameraPermission(true);
        }
      } catch (err: any) {
        console.error('Camera initialization error:', err);
        if (isMounted) {
          setHasCameraPermission(false);
          setVerifyError('Camera access denied or device unavailable. Please allow camera permissions or upload a photo.');
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (controlsRef.current) {
        try {
          controlsRef.current.stop();
        } catch {}
        controlsRef.current = null;
      }
    };
  }, [activeTab, cameraActive, selectedDeviceId]);

  // 3. Verify Scanned QR Payload (No State Mutation)
  const handleVerifyQr = async (rawPayload: string) => {
    setIsVerifying(true);
    setVerifyError('');
    setVerifiedResult(null);
    setFulfilledData(null);

    // Pause camera stream during verification
    if (controlsRef.current) {
      try {
        controlsRef.current.stop();
      } catch {}
      controlsRef.current = null;
    }

    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/qr/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw: rawPayload.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'QR code is invalid, expired, or already fulfilled');
      }

      setVerifiedResult({ ...data, rawPayload });
    } catch (err: any) {
      setVerifyError(err.message || 'Failed to verify QR code');
    } finally {
      setIsVerifying(false);
    }
  };

  // 4. Staff Confirms and Executes Order Status Fulfillment
  const handleFulfillOrder = async (action: string) => {
    if (!verifiedResult?.rawPayload) return;

    setIsFulfilling(true);
    setVerifyError('');

    // Generate unique idempotency key for this fulfillment attempt
    const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/qr/fulfill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          raw: verifiedResult.rawPayload,
          action,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to fulfill order transition');
      }

      setFulfilledData(data);
      setVerifiedResult(null);
    } catch (err: any) {
      setVerifyError(err.message || 'Error processing fulfillment');
    } finally {
      setIsFulfilling(false);
    }
  };

  // 5. Decode from Uploaded Photo File
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsVerifying(true);
    setVerifyError('');

    try {
      const { BrowserQRCodeReader } = await import('@zxing/browser');
      const codeReader = new BrowserQRCodeReader();
      const imgUrl = URL.createObjectURL(file);
      const result = await codeReader.decodeFromImageUrl(imgUrl);
      URL.revokeObjectURL(imgUrl);

      if (result) {
        await handleVerifyQr(result.getText());
      } else {
        setVerifyError('No recognizable QR code found in the uploaded image.');
      }
    } catch (err) {
      setVerifyError('Could not decode QR code from image. Please ensure good lighting or use manual lookup.');
    } finally {
      setIsVerifying(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 6. Reset Scanner to Scan Next Order
  const handleResetScanner = () => {
    setVerifiedResult(null);
    setFulfilledData(null);
    setVerifyError('');
    setManualCode('');
    if (activeTab === 'camera') {
      setCameraActive(true);
    }
  };

  // 7. Load Scan History
  const loadScanHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/qr/events?limit=30`);
      if (res.ok) {
        const data = await res.json();
        setScanEvents(data);
      }
    } catch (e) {
      console.error('Error fetching scan events:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#C5A059]/10 text-[#C5A059]">
              <QrCode className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white font-serif-luxury tracking-wide">
              Warehouse QR Scanner & Fulfillment
            </h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Zero-friction fulfillment, shipping dispatch, and immutable scan audit logging
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#151C2C] p-1 rounded-xl border border-gray-800 self-start">
          <button
            onClick={() => {
              setActiveTab('camera');
              setCameraActive(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'camera'
                ? 'bg-[#C5A059] text-slate-950 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Camera</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('upload');
              setCameraActive(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'upload'
                ? 'bg-[#C5A059] text-slate-950 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('manual');
              setCameraActive(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'manual'
                ? 'bg-[#C5A059] text-slate-950 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Manual</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              setCameraActive(false);
              loadScanHistory();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'history'
                ? 'bg-[#C5A059] text-slate-950 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Log</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {verifyError && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 flex items-start gap-3 text-red-200">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <p className="text-sm font-semibold">Scanning Notice</p>
            <p className="text-xs text-red-300/90">{verifyError}</p>
          </div>
          <button onClick={() => setVerifyError('')} className="text-red-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Camera View / Photo Uploader */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative rounded-2xl bg-[#090D16] border border-gray-800 overflow-hidden shadow-2xl min-h-[380px] flex flex-col items-center justify-center p-4">
            {/* 1. Camera Tab */}
            {activeTab === 'camera' && (
              <div className="w-full flex flex-col items-center justify-center space-y-4">
                {!cameraActive ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059] flex items-center justify-center mx-auto">
                      <Camera className="w-8 h-8" />
                    </div>
                    <p className="text-sm text-gray-300 font-medium">Ready to Scan Shipping Labels</p>
                    <button
                      onClick={() => setCameraActive(true)}
                      className="px-6 py-2.5 rounded-full bg-[#C5A059] hover:bg-[#b08b3a] text-slate-950 font-bold text-xs uppercase tracking-widest transition shadow-lg"
                    >
                      Start Camera Scanner
                    </button>
                  </div>
                ) : (
                  <div className="relative w-full aspect-[4/3] max-w-md mx-auto rounded-xl overflow-hidden bg-black border border-gray-700">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      autoPlay
                    />

                    {/* Scanning Reticle Frame */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-56 h-56 border-2 border-[#C5A059] rounded-2xl relative shadow-[0_0_30px_rgba(197,160,89,0.3)]">
                        {/* Animated Laser Line */}
                        <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#E6CA85] to-transparent animate-pulse" />
                        <div className="absolute -top-3 left-4 bg-black/80 px-2 py-0.5 rounded text-[10px] text-[#C5A059] font-mono uppercase tracking-widest border border-[#C5A059]/30">
                          Align QR Code
                        </div>
                      </div>
                    </div>

                    {isVerifying && (
                      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-3">
                        <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin" />
                        <p className="text-xs uppercase tracking-widest font-semibold text-[#E6CA85]">
                          Verifying Token Authority...
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Camera Selector Dropdown */}
                {videoDevices.length > 1 && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>Camera:</span>
                    <select
                      value={selectedDeviceId}
                      onChange={(e) => setSelectedDeviceId(e.target.value)}
                      className="bg-[#151C2C] border border-gray-700 rounded-lg px-2.5 py-1 text-white text-xs outline-none"
                    >
                      {videoDevices.map((d, i) => (
                        <option key={d.deviceId || i} value={d.deviceId}>
                          {d.label || `Camera ${i + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* 2. Photo Upload Tab */}
            {activeTab === 'upload' && (
              <div className="w-full max-w-md py-10 text-center space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-700 hover:border-[#C5A059] rounded-2xl p-8 cursor-pointer transition flex flex-col items-center justify-center space-y-3 bg-[#111624]/60"
                >
                  <div className="w-14 h-14 rounded-full bg-[#C5A059]/10 text-[#C5A059] flex items-center justify-center">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">Snap photo or upload QR image</p>
                    <p className="text-xs text-gray-400">Supports PNG, JPG, WEBP formats</p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Manual Lookup Tab */}
            {activeTab === 'manual' && (
              <div className="w-full max-w-md py-8 space-y-4">
                <div className="text-center space-y-1">
                  <p className="text-sm font-semibold text-white">Manual Token or Order Reference Lookup</p>
                  <p className="text-xs text-gray-400">Enter raw QR token or Reference ID (e.g. AV1:F:... or AVE-20260824-...)</p>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (manualCode.trim()) handleVerifyQr(manualCode.trim());
                  }}
                  className="space-y-3"
                >
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="AV1:F:xxxx... or AVE-20260824-xxxxx"
                    className="w-full px-4 py-3 bg-[#151C2C] border border-gray-700 rounded-xl text-white font-mono text-xs focus:border-[#C5A059] outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!manualCode.trim() || isVerifying}
                    className="w-full py-3 bg-[#C5A059] hover:bg-[#b08b3a] disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-widest rounded-xl transition flex items-center justify-center gap-2"
                  >
                    {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span>Lookup & Verify</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Right: Verification Card & Fulfillment Controls */}
        <div className="lg:col-span-5 space-y-4">
          {/* State 1: Awaiting Scan */}
          {!verifiedResult && !fulfilledData && (
            <div className="rounded-2xl bg-[#111624] border border-gray-800 p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-gray-800/80 text-gray-400 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Scanner Ready</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Scan any package QR label. The system will cryptographically verify the token and present order summary before executing any status changes.
                </p>
              </div>
            </div>
          )}

          {/* State 2: Verified Order Summary -> Awaiting Staff Confirmation */}
          {verifiedResult && verifiedResult.orderSummary && (
            <div className="rounded-2xl bg-[#111624] border border-[#C5A059]/40 p-6 space-y-5 shadow-xl animate-fadeIn">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-widest text-[#E6CA85]">
                    Verified Token
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-white bg-black/40 px-2.5 py-1 rounded border border-gray-800">
                  {verifiedResult.orderSummary.orderId}
                </span>
              </div>

              {/* Customer & Location */}
              <div className="space-y-1">
                <p className="text-xs text-gray-400">Recipient</p>
                <p className="text-sm font-bold text-white">{verifiedResult.orderSummary.customerName}</p>
                <p className="text-xs text-gray-300">{verifiedResult.orderSummary.customerDistrict} Division</p>
              </div>

              {/* Status & Payment Badges */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-black/40 border border-gray-800 space-y-0.5">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Current State</p>
                  <p className="text-xs font-bold text-[#E6CA85]">{verifiedResult.orderSummary.status}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-gray-800 space-y-0.5">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Payment Status</p>
                  <p className="text-xs font-bold text-white">
                    {verifiedResult.orderSummary.paymentStatus} ({verifiedResult.orderSummary.paymentMethod})
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 pt-1 border-t border-gray-800/80">
                <p className="text-[11px] font-semibold text-gray-400">
                  Package Items ({verifiedResult.orderSummary.itemsCount}):
                </p>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {verifiedResult.orderSummary.items.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs p-2 rounded-lg bg-black/20 border border-gray-800"
                    >
                      <span className="text-gray-200 truncate max-w-[200px]">
                        {item.name} <span className="text-gray-400">({item.variant})</span>
                      </span>
                      <span className="font-mono font-bold text-[#C5A059]">×{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Snapshot */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/30 text-xs">
                <span className="text-gray-300">Total / Cash Due on Delivery:</span>
                <span className="font-mono font-bold text-base text-[#E6CA85]">
                  ৳{verifiedResult.orderSummary.dueAmount > 0 ? verifiedResult.orderSummary.dueAmount : verifiedResult.orderSummary.totalAmount}
                </span>
              </div>

              {/* Staff Action Buttons */}
              <div className="pt-2 space-y-2">
                {verifiedResult.allowedActions?.includes('MARK_SHIPPED') && (
                  <button
                    onClick={() => handleFulfillOrder('MARK_SHIPPED')}
                    disabled={isFulfilling}
                    className="w-full py-3.5 rounded-xl bg-[#C5A059] hover:bg-[#b08b3a] text-slate-950 font-bold text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-lg hover:shadow-[#C5A059]/20"
                  >
                    {isFulfilling ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Truck className="w-4 h-4" />
                    )}
                    <span>Confirm Dispatch (Mark as Shipped)</span>
                  </button>
                )}

                {verifiedResult.allowedActions?.includes('MARK_DELIVERED') && (
                  <button
                    onClick={() => handleFulfillOrder('MARK_DELIVERED')}
                    disabled={isFulfilling}
                    className="w-full py-3.5 rounded-xl bg-green-500 hover:bg-green-600 text-slate-950 font-bold text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-lg"
                  >
                    {isFulfilling ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>Confirm Final Delivery (Delivered)</span>
                  </button>
                )}

                <button
                  onClick={handleResetScanner}
                  className="w-full py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-xs transition"
                >
                  Cancel / Scan Another
                </button>
              </div>
            </div>
          )}

          {/* State 3: Success Confirmation Card */}
          {fulfilledData && (
            <div className="rounded-2xl bg-green-950/30 border border-green-700/60 p-6 text-center space-y-4 animate-scaleUp">
              <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto border border-green-500/40">
                <Check className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Order Fulfilled Successfully!</h3>
                <p className="text-xs text-green-300 font-mono">
                  {fulfilledData.orderId} $\rightarrow$ Status: <span className="font-bold">{fulfilledData.newStatus}</span>
                </p>
                <p className="text-[10px] text-gray-400 font-mono mt-1">
                  Audit Event ID: {fulfilledData.eventId}
                </p>
              </div>

              <div className="pt-3">
                <button
                  onClick={handleResetScanner}
                  className="w-full py-3 rounded-xl bg-[#C5A059] hover:bg-[#b08b3a] text-slate-950 font-bold text-xs uppercase tracking-widest transition flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Scan Next Package</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tab 4: Scan Audit History */}
      {activeTab === 'history' && (
        <div className="rounded-2xl bg-[#111624] border border-gray-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h3 className="text-base font-bold text-white">Immutable Scan Audit Log</h3>
            <button
              onClick={loadScanHistory}
              disabled={loadingHistory}
              className="flex items-center gap-1 text-xs text-[#C5A059] hover:underline"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
              <span>Refresh Log</span>
            </button>
          </div>

          {loadingHistory ? (
            <div className="py-8 text-center text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#C5A059]" />
            </div>
          ) : scanEvents.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">No scan events recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-black/30 text-gray-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Event ID</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Transition</th>
                    <th className="py-2.5 px-3">Staff</th>
                    <th className="py-2.5 px-3">Source</th>
                    <th className="py-2.5 px-3">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {scanEvents.map((evt: any) => (
                    <tr key={evt._id} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-gray-400">{evt.eventId}</td>
                      <td className="py-2.5 px-3 font-semibold text-white">{evt.action}</td>
                      <td className="py-2.5 px-3">
                        <span className="text-gray-400">{evt.previousStatus || 'N/A'}</span> $\rightarrow${' '}
                        <span className="font-bold text-[#E6CA85]">{evt.newStatus}</span>
                      </td>
                      <td className="py-2.5 px-3">{evt.actorId?.name || evt.actorRole}</td>
                      <td className="py-2.5 px-3 font-mono text-[10px]">{evt.source}</td>
                      <td className="py-2.5 px-3 text-gray-400">
                        {new Date(evt.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
