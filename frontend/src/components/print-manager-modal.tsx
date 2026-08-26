'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  Eye,
  EyeOff,
  ShieldCheck,
  QrCode as QrIcon,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { generateQrDataUrl, getStorefrontBaseUrl } from '../utils/qr-generator';

export type PrintMode = 'INVOICE' | 'PACKING_SLIP' | 'SHIPPING_LABEL';

interface PrintManagerModalProps {
  orders: any[]; // Single order or array of orders
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: PrintMode;
}

export default function PrintManagerModal({
  orders,
  isOpen,
  onClose,
  defaultMode = 'INVOICE',
}: PrintManagerModalProps) {
  const [mode, setMode] = useState<PrintMode>(defaultMode);
  const [hidePricesInPacking, setHidePricesInPacking] = useState(true);
  const [trackingQrMap, setTrackingQrMap] = useState<Record<string, string>>({});
  const [fulfillmentQrMap, setFulfillmentQrMap] = useState<Record<string, string>>({});
  const [generatingQrs, setGeneratingQrs] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);

  // Strict separation: Pre-generate Customer Tracking QRs and Warehouse Fulfillment QRs
  useEffect(() => {
    if (!isOpen || !orders || orders.length === 0) return;

    let isMounted = true;
    setGeneratingQrs(true);

    const generateAllQrs = async () => {
      const base = getStorefrontBaseUrl();
      const trackMap: Record<string, string> = {};
      const fulfillMap: Record<string, string> = {};

      for (const order of orders) {
        const orderKey = order._id || order.orderId;

        // 1. Customer Tracking QR (For Invoice and Outward Shipping Label)
        const trackingPayload = `${base}/track-order?orderId=${encodeURIComponent(order.orderId || '')}`;
        try {
          trackMap[orderKey] = await generateQrDataUrl(trackingPayload, {
            width: 600,
            margin: 1,
          });
        } catch (e) {
          console.error('Failed to generate tracking QR for order:', order.orderId, e);
        }

        // 2. Staff Fulfillment QR (For Internal Warehouse Packing Slip Only)
        const fulfillmentPayload = `AV1:F:${order._id}`;
        try {
          fulfillMap[orderKey] = await generateQrDataUrl(fulfillmentPayload, {
            width: 600,
            margin: 1,
          });
        } catch (e) {
          console.error('Failed to generate warehouse fulfillment QR for order:', order.orderId, e);
        }
      }

      if (isMounted) {
        setTrackingQrMap(trackMap);
        setFulfillmentQrMap(fulfillMap);
        setGeneratingQrs(false);
      }
    };

    generateAllQrs();

    return () => {
      isMounted = false;
    };
  }, [isOpen, orders]);

  if (!isOpen || !orders || orders.length === 0) return null;

  const handlePrint = async () => {
    setIsPrinting(true);

    // Wait until all images in printable container are completely loaded in the browser
    const container = document.getElementById('printable-workspace');
    if (container) {
      const images = Array.from(container.getElementsByTagName('img'));
      await Promise.all(
        images.map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) {
                resolve(true);
              } else {
                img.onload = () => resolve(true);
                img.onerror = () => resolve(true);
              }
            }),
        ),
      );
    }

    setIsPrinting(false);
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 my-8">
        {/* Modal Top Control Bar (Hidden in Print) */}
        <div className="p-4 bg-[#0A0E17] text-white flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
              AVELORA Print Engine
            </span>
            <span className="text-xs text-gray-400 font-mono">
              ({orders.length} order{orders.length > 1 ? 's' : ''})
            </span>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-gray-800 text-xs">
            <button
              onClick={() => setMode('INVOICE')}
              className={`px-3 py-1 rounded-lg transition font-semibold ${
                mode === 'INVOICE' ? 'bg-[#D4AF37] text-slate-950 font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Tax Invoice
            </button>
            <button
              onClick={() => setMode('PACKING_SLIP')}
              className={`px-3 py-1 rounded-lg transition font-semibold ${
                mode === 'PACKING_SLIP' ? 'bg-[#D4AF37] text-slate-950 font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Packing Slip
            </button>
            <button
              onClick={() => setMode('SHIPPING_LABEL')}
              className={`px-3 py-1 rounded-lg transition font-semibold ${
                mode === 'SHIPPING_LABEL' ? 'bg-[#D4AF37] text-slate-950 font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Shipping Label
            </button>
          </div>

          {/* Extra options & Print trigger */}
          <div className="flex items-center gap-3">
            {mode === 'PACKING_SLIP' && (
              <button
                onClick={() => setHidePricesInPacking(!hidePricesInPacking)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-800 text-gray-300 rounded-lg text-xs font-medium hover:text-white"
              >
                {hidePricesInPacking ? <EyeOff className="w-3.5 h-3.5 text-[#D4AF37]" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{hidePricesInPacking ? 'Warehouse Mode (No Prices)' : 'Show Prices'}</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              disabled={generatingQrs || isPrinting}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#D4AF37] text-slate-950 hover:bg-[#b58f44] text-xs font-bold uppercase tracking-wider rounded-lg transition shadow-md disabled:opacity-50"
            >
              {generatingQrs || isPrinting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Printer className="w-4 h-4" />
              )}
              <span>{generatingQrs ? 'Loading QR...' : 'Print / Save PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div
          id="printable-workspace"
          className="p-6 sm:p-10 space-y-12 bg-white text-gray-900 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible"
        >
          {orders.map((order, orderIdx) => {
            const orderKey = order._id || order.orderId;
            const trackingQr = trackingQrMap[orderKey];
            const fulfillmentQr = fulfillmentQrMap[orderKey];

            return (
              <div key={orderKey || orderIdx} className="space-y-6 print:break-after-page">
                {/* ===================== MODE 1: TAX INVOICE (CUSTOMER-FACING) ===================== */}
                {mode === 'INVOICE' && (
                  <div className="space-y-6">
                    {/* Brand Header */}
                    <div className="flex justify-between items-start pb-6 border-b-2 border-gray-900">
                      <div>
                        <h2 className="text-3xl font-extrabold tracking-[0.25em] text-[#0F172A] font-serif-luxury">
                          AVELORA
                        </h2>
                        <p className="text-[9px] tracking-[0.3em] text-[#8C6D23] uppercase font-bold mt-0.5">
                          Elegance In Every Choice
                        </p>
                        <div className="text-xs text-gray-500 mt-2 space-y-0.5">
                          <p>BIN / VAT Registration: <span className="font-mono font-bold text-gray-700">005829147-0101</span></p>
                          <p>Hotline: +880 1353-786336 • aveloraelegance@gmail.com</p>
                          <p>Mohakhali Royal Filling Station, Jam Jam Tower, 5th Building, 6th Floor, Dhaka</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        {trackingQr && (
                          <div className="p-1.5 bg-white border border-gray-300 rounded-xl text-center shadow-sm">
                            <img
                              src={trackingQr}
                              alt="Customer Order Tracking QR"
                              className="w-20 h-20 mx-auto"
                              style={{ imageRendering: 'pixelated' }}
                            />
                            <span className="text-[8px] font-mono text-gray-500 block uppercase">Scan to Track</span>
                          </div>
                        )}
                        <div className="space-y-1">
                          <span className="inline-block px-3 py-1 bg-gray-100 rounded text-xs font-bold uppercase tracking-wider text-gray-800">
                            TAX INVOICE
                          </span>
                          <p className="text-lg font-bold font-mono text-gray-900">{order.orderId}</p>
                          <p className="text-xs text-gray-500">
                            Date: {new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                          </p>
                          <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                            Payment: {order.paymentStatus || 'PENDING'} • Method: {order.paymentMethod || 'COD'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Customer Information Box */}
                    <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
                      <div>
                        <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Customer / Billed To:</p>
                        <p className="text-sm font-bold text-gray-900 mt-1">{order.customerDetails?.name || 'Customer'}</p>
                        <p className="text-gray-700 font-mono mt-0.5">Phone: {order.customerDetails?.mobile}</p>
                        <p className="text-gray-600 mt-0.5">{order.customerDetails?.address}</p>
                        <p className="text-gray-800 font-medium mt-0.5">District: {order.customerDetails?.district || 'Dhaka'}</p>
                      </div>

                      <div>
                        <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Logistics & Dispatch:</p>
                        <p className="text-gray-800 mt-1">Courier: <span className="font-bold">{order.courier?.provider || 'Pathao Express'}</span></p>
                        {order.courier?.consignmentId && (
                          <p className="text-gray-700 font-mono mt-0.5">Consignment ID: <span className="font-bold">{order.courier.consignmentId}</span></p>
                        )}
                        {order.notes && (
                          <p className="text-gray-500 mt-1 italic">Note: "{order.notes}"</p>
                        )}
                      </div>
                    </div>

                    {/* Itemized Table */}
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b-2 border-gray-300 uppercase tracking-wider text-gray-600 bg-gray-50">
                          <th className="py-2.5 px-3">Item Description</th>
                          <th className="py-2.5 px-3 font-mono">SKU / Variant</th>
                          <th className="py-2.5 px-3 text-center">Qty</th>
                          <th className="py-2.5 px-3 text-right">Unit Price</th>
                          <th className="py-2.5 px-3 text-right">Total (BDT)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {order.items?.map((item: any, i: number) => (
                          <tr key={i}>
                            <td className="py-3 px-3">
                              <p className="font-bold text-gray-900">{item.productName}</p>
                            </td>
                            <td className="py-3 px-3 text-gray-500 font-mono">
                              {item.sku} {item.variant ? `(${item.variant})` : ''}
                            </td>
                            <td className="py-3 px-3 text-center font-bold">{item.quantity}</td>
                            <td className="py-3 px-3 text-right font-mono">৳{(item.unitPrice || 0).toLocaleString()}</td>
                            <td className="py-3 px-3 text-right font-bold font-mono">
                              ৳{((item.unitPrice || 0) * (item.quantity || 1)).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Financial Calculation */}
                    <div className="flex justify-between items-end pt-4 border-t border-gray-200 text-xs">
                      <div className="space-y-1 text-gray-500 max-w-sm">
                        <p className="flex items-center gap-1 font-semibold text-emerald-800">
                          <ShieldCheck className="w-4 h-4" /> 100% Authentic Luxury Apparel
                        </p>
                        <p className="text-[11px]">All items are strictly inspected for couture standards prior to packaging.</p>
                      </div>

                      <div className="w-64 space-y-1.5 text-right">
                        <div className="flex justify-between text-gray-600">
                          <span>Subtotal:</span>
                          <span className="font-mono">৳{(order.subtotal || 0).toLocaleString()}</span>
                        </div>
                        {order.couponDiscount > 0 && (
                          <div className="flex justify-between text-emerald-700">
                            <span>Coupon Discount:</span>
                            <span className="font-mono">-৳{order.couponDiscount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-gray-600">
                          <span>Delivery Charge:</span>
                          <span className="font-mono">৳{(order.deliveryCharge || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-gray-950 pt-2 border-t-2 border-gray-950">
                          <span>Total Payable:</span>
                          <span className="font-mono">৳{(order.totalAmount || 0).toLocaleString()}</span>
                        </div>

                        {/* Payment Split */}
                        <div className="pt-2 border-t border-dashed border-gray-300 space-y-1">
                          <div className="flex justify-between text-emerald-800 font-semibold">
                            <span>Advance Paid:</span>
                            <span className="font-mono">৳{(order.paidAmount || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-amber-800 font-bold">
                            <span>Cash Due on Delivery:</span>
                            <span className="font-mono text-sm">৳{(order.dueAmount !== undefined ? order.dueAmount : order.subtotal || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ===================== MODE 2: WAREHOUSE PACKING SLIP (INTERNAL STAFF USE ONLY) ===================== */}
                {mode === 'PACKING_SLIP' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b-2 border-gray-900">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 font-serif-luxury">AVELORA WAREHOUSE DISPATCH</h2>
                        <p className="text-xs text-gray-500 font-mono">PACKING SLIP / PICK LIST • INTERNAL USE</p>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        {fulfillmentQr && (
                          <div className="p-1 bg-white border-2 border-slate-900 rounded-lg text-center shadow-sm">
                            <img
                              src={fulfillmentQr}
                              alt="Internal Fulfillment QR"
                              className="w-16 h-16 mx-auto"
                              style={{ imageRendering: 'pixelated' }}
                            />
                            <span className="text-[7px] font-mono text-slate-900 font-bold block uppercase">Staff Dispatch Scan</span>
                          </div>
                        )}
                        <div>
                          <p className="text-xl font-bold font-mono text-gray-900">{order.orderId}</p>
                          <p className="text-xs text-gray-500">{new Date().toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Recipient & Courier info */}
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-bold text-gray-500 uppercase text-[10px]">Deliver To:</p>
                        <p className="text-sm font-bold text-gray-900 mt-1">{order.customerDetails?.name}</p>
                        <p className="text-gray-700 font-mono">{order.customerDetails?.mobile}</p>
                        <p className="text-gray-600 mt-1">{order.customerDetails?.address}, {order.customerDetails?.district}</p>
                      </div>
                      <div>
                        <p className="font-bold text-gray-500 uppercase text-[10px]">Courier Booking:</p>
                        <p className="text-gray-800 font-bold mt-1">{order.courier?.provider || 'Pathao Express'}</p>
                        {order.courier?.consignmentId && (
                          <p className="text-gray-700 font-mono">Consignment: {order.courier.consignmentId}</p>
                        )}
                        <p className="mt-2 text-amber-800 font-bold">
                          COD to Collect: ৳{(order.dueAmount !== undefined ? order.dueAmount : order.subtotal || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Picking Checklist */}
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b-2 border-gray-300 uppercase tracking-wider text-gray-600 bg-gray-50">
                          <th className="py-2.5 px-3 w-10 text-center">Check</th>
                          <th className="py-2.5 px-3">Item Name</th>
                          <th className="py-2.5 px-3 font-mono">SKU / Variant</th>
                          <th className="py-2.5 px-3 text-center">Quantity</th>
                          {!hidePricesInPacking && <th className="py-2.5 px-3 text-right">Unit Price</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {order.items?.map((item: any, i: number) => (
                          <tr key={i}>
                            <td className="py-3 px-3 text-center">
                              <div className="w-4 h-4 border-2 border-gray-400 rounded mx-auto"></div>
                            </td>
                            <td className="py-3 px-3 font-bold text-gray-900">{item.productName}</td>
                            <td className="py-3 px-3 font-mono text-gray-600">
                              {item.sku} {item.variant ? `(${item.variant})` : ''}
                            </td>
                            <td className="py-3 px-3 text-center font-bold text-base">{item.quantity}</td>
                            {!hidePricesInPacking && (
                              <td className="py-3 px-3 text-right font-mono">৳{(item.unitPrice || 0).toLocaleString()}</td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Warehouse Signatures */}
                    <div className="pt-8 border-t border-gray-200 flex justify-between text-xs text-gray-600">
                      <div>
                        <p className="border-b border-gray-400 pb-1 w-36"></p>
                        <p className="mt-1 font-semibold">Packed By (Inspector)</p>
                      </div>
                      <div>
                        <p className="border-b border-gray-400 pb-1 w-36"></p>
                        <p className="mt-1 font-semibold">Courier Handover Signature</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ===================== MODE 3: LUXURY SHIPPING LABEL (OUTWARD PARCEL TRACKING ONLY) ===================== */}
                {mode === 'SHIPPING_LABEL' && (
                  <div className="max-w-md mx-auto p-6 border-4 border-gray-900 rounded-2xl bg-white space-y-4 shadow-sm">
                    {/* Label Header */}
                    <div className="flex justify-between items-center pb-3 border-b-2 border-gray-900">
                      <div>
                        <h3 className="text-xl font-extrabold tracking-[0.2em] font-serif-luxury text-gray-900">AVELORA</h3>
                        <p className="text-[8px] tracking-[0.25em] text-[#8C6D23] uppercase font-bold">Express Insured Dispatch</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold uppercase text-gray-500">Provider</p>
                        <p className="text-sm font-bold font-mono text-gray-900">{order.courier?.provider || 'Pathao'}</p>
                      </div>
                    </div>

                    {/* Consignment & Customer Tracking QR Box */}
                    <div className="p-3 bg-gray-100 rounded-xl flex items-center justify-between gap-3 font-mono">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Order ID</p>
                        <p className="text-lg font-black text-gray-900 tracking-wider">{order.orderId}</p>
                        {order.courier?.consignmentId && (
                          <p className="text-xs font-bold text-gray-700 mt-0.5">Consignment #{order.courier.consignmentId}</p>
                        )}
                      </div>
                      {trackingQr && (
                        <div className="p-1 bg-white border border-gray-300 rounded-lg shadow-sm flex-shrink-0 text-center">
                          <img
                            src={trackingQr}
                            alt="Customer Parcel Tracking QR"
                            className="w-16 h-16"
                            style={{ imageRendering: 'pixelated' }}
                          />
                          <span className="text-[6px] font-mono text-gray-500 block uppercase">Track Parcel</span>
                        </div>
                      )}
                    </div>

                    {/* Recipient Details */}
                    <div className="space-y-1 text-xs">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Deliver To:</p>
                      <p className="text-base font-bold text-gray-900">{order.customerDetails?.name}</p>
                      <p className="text-sm font-bold font-mono text-gray-800">{order.customerDetails?.mobile}</p>
                      <p className="text-xs text-gray-700 whitespace-pre-line">{order.customerDetails?.address}</p>
                      <p className="text-xs font-bold text-gray-900">District: {order.customerDetails?.district || 'Dhaka'}</p>
                    </div>

                    {/* Bold COD Box */}
                    <div className="p-3 bg-slate-950 text-white rounded-xl text-center">
                      <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">
                        Cash to Collect on Delivery (COD)
                      </p>
                      <p className="text-2xl font-black font-mono text-white mt-0.5">
                        ৳{(order.dueAmount !== undefined ? order.dueAmount : order.subtotal || 0).toLocaleString()}
                      </p>
                    </div>

                    {/* Footer Return Address */}
                    <div className="text-[10px] text-gray-500 text-center pt-2 border-t border-gray-200">
                      <p className="font-semibold text-gray-700">If undelivered, return to:</p>
                      <p>AVELORA Concierge, Mohakhali Royal Filling Station, Jam Jam Tower, Dhaka</p>
                      <p>Hotline: +880 1353-786336</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
