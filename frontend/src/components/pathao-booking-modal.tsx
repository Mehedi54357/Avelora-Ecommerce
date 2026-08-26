'use client';

import React, { useState, useEffect } from 'react';
import { X, Truck, Check, AlertCircle, Loader2, DollarSign, MapPin, Building2, Package } from 'lucide-react';
import { API_BASE_URL, authFetch } from '../utils/api-config';

interface PathaoBookingModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PathaoBookingModal({
  order,
  isOpen,
  onClose,
  onSuccess,
}: PathaoBookingModalProps) {
  const [activeTab, setActiveTab] = useState<'PATHAO' | 'MANUAL'>('PATHAO');

  // Pathao State
  const [stores, setStores] = useState<any[]>([]);
  const [selectedStore, setSelectedStore] = useState<number | ''>('');
  const [cities, setCities] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<number | ''>('');
  const [zones, setZones] = useState<any[]>([]);
  const [selectedZone, setSelectedZone] = useState<number | ''>('');
  const [areas, setAreas] = useState<any[]>([]);
  const [selectedArea, setSelectedArea] = useState<number | ''>('');
  const [itemWeight, setItemWeight] = useState<number>(0.5);
  const [specialInstruction, setSpecialInstruction] = useState<string>('Handle with care - Luxury Apparel');

  const [loadingStores, setLoadingStores] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingZones, setLoadingZones] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);

  const [pricePlanEstimate, setPricePlanEstimate] = useState<any>(null);
  const [estimatingPrice, setEstimatingPrice] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Manual Courier State
  const [manualProvider, setManualProvider] = useState('Steadfast');
  const [manualConsignmentId, setManualConsignmentId] = useState('');
  const [manualTrackingUrl, setManualTrackingUrl] = useState('');
  const [manualCharge, setManualCharge] = useState(order?.deliveryCharge || 70);

  // Fetch initial stores and cities when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setErrorMessage('');
    const loadInitialData = async () => {
      setLoadingStores(true);
      setLoadingCities(true);
      try {
        const [storesRes, citiesRes] = await Promise.all([
          authFetch(`${API_BASE_URL}/api/admin/courier/pathao/stores`),
          authFetch(`${API_BASE_URL}/api/admin/courier/pathao/cities`),
        ]);

        if (storesRes.ok) {
          const storesData = await storesRes.json();
          setStores(storesData || []);
          if (storesData && storesData.length > 0) {
            setSelectedStore(storesData[0].store_id || storesData[0].id);
          }
        }

        if (citiesRes.ok) {
          const citiesData = await citiesRes.json();
          setCities(citiesData || []);
          // Default to Dhaka City (id 1) if present
          const dhaka = (citiesData || []).find((c: any) => c.city_name?.toLowerCase().includes('dhaka'));
          if (dhaka) {
            setSelectedCity(dhaka.city_id);
          }
        }
      } catch (err: any) {
        console.error('Error loading Pathao init data:', err);
      } finally {
        setLoadingStores(false);
        setLoadingCities(false);
      }
    };

    loadInitialData();
  }, [isOpen]);

  // When city changes, load zones
  useEffect(() => {
    if (!selectedCity) {
      setZones([]);
      setSelectedZone('');
      return;
    }

    const loadZones = async () => {
      setLoadingZones(true);
      try {
        const res = await authFetch(`${API_BASE_URL}/api/admin/courier/pathao/cities/${selectedCity}/zones`);
        if (res.ok) {
          const data = await res.json();
          setZones(data || []);
          if (data && data.length > 0) {
            setSelectedZone(data[0].zone_id);
          }
        }
      } catch (e) {
        console.error('Error loading zones:', e);
      } finally {
        setLoadingZones(false);
      }
    };

    loadZones();
  }, [selectedCity]);

  // When zone changes, load areas & estimate price
  useEffect(() => {
    if (!selectedZone) {
      setAreas([]);
      setSelectedArea('');
      return;
    }

    const loadAreas = async () => {
      setLoadingAreas(true);
      try {
        const res = await authFetch(`${API_BASE_URL}/api/admin/courier/pathao/zones/${selectedZone}/areas`);
        if (res.ok) {
          const data = await res.json();
          setAreas(data || []);
        }
      } catch (e) {
        console.error('Error loading areas:', e);
      } finally {
        setLoadingAreas(false);
      }
    };

    loadAreas();

    // Price plan estimate
    if (selectedStore && selectedCity && selectedZone) {
      setEstimatingPrice(true);
      authFetch(`${API_BASE_URL}/api/admin/courier/pathao/price-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: Number(selectedStore),
          recipient_city: Number(selectedCity),
          recipient_zone: Number(selectedZone),
          item_weight: Number(itemWeight) || 0.5,
        }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setPricePlanEstimate(data);
        })
        .catch((e) => console.error('Price estimation error:', e))
        .finally(() => setEstimatingPrice(false));
    }
  }, [selectedZone, selectedStore, selectedCity, itemWeight]);

  if (!isOpen || !order) return null;

  const amountToCollect = order.paymentMethod === 'COD'
    ? (order.dueAmount !== undefined ? order.dueAmount : order.subtotal)
    : (order.paymentStatus === 'PAID' ? 0 : order.totalAmount);

  // Submit Pathao Booking
  const handleBookPathao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStore || !selectedCity || !selectedZone) {
      setErrorMessage('Please select a store, city, and zone.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/courier/pathao/orders/${order._id}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: Number(selectedStore),
          recipientCity: Number(selectedCity),
          recipientZone: Number(selectedZone),
          recipientArea: selectedArea ? Number(selectedArea) : undefined,
          itemWeight: Number(itemWeight) || 0.5,
          specialInstruction,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to book order with Pathao Courier');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while booking with Pathao Courier');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Manual Booking Fallback
  const handleSaveManualCourier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualConsignmentId.trim()) {
      setErrorMessage('Please enter a consignment ID or tracking number.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await authFetch(`${API_BASE_URL}/api/admin/orders/${order._id}/courier`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: manualProvider,
          consignmentId: manualConsignmentId.trim(),
          trackingUrl: manualTrackingUrl.trim(),
          charge: Number(manualCharge) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save courier info');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving manual courier details');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 animate-scaleUp">
        {/* Header */}
        <div className="p-5 bg-[#0A0E17] text-white flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl border border-[#D4AF37]/30">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif-luxury text-white">
                Book Courier Dispatch
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                Order #{order.orderId} • COD Amount: ৳{amountToCollect.toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dispatch Provider Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-5 pt-3">
          <button
            onClick={() => { setActiveTab('PATHAO'); setErrorMessage(''); }}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 ${
              activeTab === 'PATHAO'
                ? 'border-[#D4AF37] text-slate-950 bg-white rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            Pathao Courier API (Live)
          </button>

          <button
            onClick={() => { setActiveTab('MANUAL'); setErrorMessage(''); }}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition flex items-center gap-2 ${
              activeTab === 'MANUAL'
                ? 'border-[#D4AF37] text-slate-950 bg-white rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-slate-800'
            }`}
          >
            Manual Courier Fallback
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="m-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* PATHAO TAB */}
        {activeTab === 'PATHAO' && (
          <form onSubmit={handleBookPathao} className="p-6 space-y-4 text-xs">
            {/* Recipient Snapshot */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p className="font-bold text-slate-900 text-xs">Recipient: {order.customerDetails?.name} ({order.customerDetails?.mobile})</p>
              <p className="text-gray-600">{order.customerDetails?.address}, {order.customerDetails?.district}</p>
            </div>

            {/* Merchant Store Selector */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">Select Merchant Pickup Store *</label>
              {loadingStores ? (
                <div className="flex items-center gap-2 text-gray-400 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading stores...
                </div>
              ) : stores.length > 0 ? (
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl font-medium text-slate-900 focus:border-[#D4AF37] outline-none"
                  required
                >
                  {stores.map((s: any) => (
                    <option key={s.store_id || s.id} value={s.store_id || s.id}>
                      {s.store_name || s.name} ({s.store_address || s.address || 'Default Store'})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px]">
                  No Pathao stores found or sandbox credentials not yet active. Use fallback tab or configure credentials in Settings.
                </div>
              )}
            </div>

            {/* City & Zone Selector Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Destination City *</label>
                {loadingCities ? (
                  <div className="flex items-center gap-2 text-gray-400 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading cities...
                  </div>
                ) : (
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl font-medium text-slate-900 focus:border-[#D4AF37] outline-none"
                    required
                  >
                    <option value="">-- Select City --</option>
                    {cities.map((c: any) => (
                      <option key={c.city_id} value={c.city_id}>
                        {c.city_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Destination Zone *</label>
                {loadingZones ? (
                  <div className="flex items-center gap-2 text-gray-400 py-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading zones...
                  </div>
                ) : (
                  <select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl font-medium text-slate-900 focus:border-[#D4AF37] outline-none"
                    required
                  >
                    <option value="">-- Select Zone --</option>
                    {zones.map((z: any) => (
                      <option key={z.zone_id} value={z.zone_id}>
                        {z.zone_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Area Selector (Optional) & Weight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Area (Optional)</label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value ? Number(e.target.value) : '')}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl font-medium text-slate-900 focus:border-[#D4AF37] outline-none"
                >
                  <option value="">-- Select Area --</option>
                  {areas.map((a: any) => (
                    <option key={a.area_id} value={a.area_id}>
                      {a.area_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Parcel Weight (KG)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={itemWeight}
                  onChange={(e) => setItemWeight(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-xl font-medium text-slate-900 focus:border-[#D4AF37] outline-none"
                />
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block font-bold text-gray-700 mb-1">Courier Instructions</label>
              <input
                type="text"
                value={specialInstruction}
                onChange={(e) => setSpecialInstruction(e.target.value)}
                placeholder="e.g. Call before delivery, handle luxury garment box"
                className="w-full p-2.5 bg-white border border-gray-300 rounded-xl font-medium text-slate-900 focus:border-[#D4AF37] outline-none"
              />
            </div>

            {/* Live Pricing Summary Box */}
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center">
              <div>
                <p className="text-emerald-900 font-bold">COD Amount to Collect</p>
                <p className="text-xl font-black font-mono text-emerald-950">৳{amountToCollect.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Estimated Delivery Fee</p>
                <p className="text-base font-bold font-mono text-gray-900">
                  {estimatingPrice ? (
                    <span className="text-gray-400">Calculating...</span>
                  ) : pricePlanEstimate?.price ? (
                    `৳${pricePlanEstimate.price}`
                  ) : (
                    `৳${order.deliveryCharge || 70}`
                  )}
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Booking with Pathao...</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4" />
                    <span>Confirm & Book with Pathao</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* MANUAL COURIER TAB */}
        {activeTab === 'MANUAL' && (
          <form onSubmit={handleSaveManualCourier} className="p-6 space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Courier Provider *</label>
              <select
                value={manualProvider}
                onChange={(e) => setManualProvider(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-300 rounded-xl font-medium text-slate-900 outline-none"
              >
                <option value="Steadfast">Steadfast Courier</option>
                <option value="Paperfly">Paperfly</option>
                <option value="RedX">RedX Logistics</option>
                <option value="Sundarban">Sundarban Courier</option>
                <option value="In-House">In-House / Dedicated Rider</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Consignment ID / Waybill Number *</label>
              <input
                type="text"
                value={manualConsignmentId}
                onChange={(e) => setManualConsignmentId(e.target.value)}
                placeholder="e.g. STDF-9823140"
                className="w-full p-2.5 bg-white border border-gray-300 rounded-xl font-medium text-slate-900 outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Live Tracking URL (Optional)</label>
              <input
                type="url"
                value={manualTrackingUrl}
                onChange={(e) => setManualTrackingUrl(e.target.value)}
                placeholder="https://steadfast.com.bd/t/..."
                className="w-full p-2.5 bg-white border border-gray-300 rounded-xl font-medium text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Courier Freight Charge (BDT)</label>
              <input
                type="number"
                value={manualCharge}
                onChange={(e) => setManualCharge(Number(e.target.value))}
                className="w-full p-2.5 bg-white border border-gray-300 rounded-xl font-medium text-slate-900 outline-none"
              />
            </div>

            <div className="pt-3 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Save Courier Details</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
