'use client';

import React from 'react';
import { X, Printer, ShieldCheck } from 'lucide-react';

interface InvoiceModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function InvoiceModal({ order, isOpen, onClose }: InvoiceModalProps) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden border border-gray-200">
        {/* Modal Top Actions (Hidden when printing) */}
        <div className="p-4 bg-[#0B0F19] text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E6CA85]">
              AVELORA Official Tax Invoice
            </span>
            <span className="text-xs text-gray-400 font-mono">#{order.orderId}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C5A059] text-slate-950 hover:bg-[#b58f44] text-xs font-bold uppercase tracking-wider rounded transition"
            >
              <Printer className="w-4 h-4" /> Print / PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div id="printable-invoice" className="p-8 sm:p-12 space-y-8 bg-white text-gray-900">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-8 border-b-2 border-gray-900 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold tracking-[0.25em] text-[#0F172A] font-serif-luxury">
                  AVELORA
                </span>
              </div>
              <p className="text-[10px] tracking-[0.3em] text-[#C5A059] uppercase font-semibold">
                Elegance in every choice
              </p>
              <p className="text-xs text-gray-500 mt-2">www.avelora.com • concierge@avelora.com</p>
              <p className="text-xs text-gray-500">Gulshan 2, Dhaka 1212, Bangladesh</p>
            </div>

            <div className="sm:text-right">
              <span className="inline-block px-3 py-1 bg-gray-100 rounded text-xs font-bold uppercase tracking-wider text-gray-800 mb-1">
                INVOICE
              </span>
              <p className="text-base font-bold font-mono text-gray-900">{order.orderId}</p>
              <p className="text-xs text-gray-500">
                Date: {new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', { dateStyle: 'medium' })}
              </p>
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mt-1">
                Status: {order.status} • Payment: {order.paymentStatus}
              </p>
            </div>
          </div>

          {/* Customer & Shipping Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#FAFAF8] p-6 rounded-lg border border-gray-200">
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#C5A059] mb-1">
                Billed / Shipped To:
              </h4>
              <p className="text-sm font-bold text-gray-900">{order.customerDetails?.name}</p>
              <p className="text-xs text-gray-700 mt-0.5">Phone: {order.customerDetails?.mobile}</p>
              <p className="text-xs text-gray-600 mt-0.5 whitespace-pre-line">
                {order.customerDetails?.address}
              </p>
              <p className="text-xs font-semibold text-gray-800 mt-1">
                District: {order.customerDetails?.district || 'Dhaka'}
              </p>
            </div>

            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#C5A059] mb-1">
                Payment & Order Details:
              </h4>
              <p className="text-xs text-gray-700">Payment Method: <span className="font-semibold">{order.paymentMethod}</span></p>
              <p className="text-xs text-gray-700 mt-0.5">Delivery Service: <span className="font-semibold">AVELORA Express Insured</span></p>
              {order.notes && (
                <p className="text-xs text-gray-500 mt-2 italic bg-white p-2 rounded border border-gray-100">
                  Note: "{order.notes}"
                </p>
              )}
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-300 text-[11px] uppercase tracking-wider text-gray-600 bg-gray-50">
                  <th className="py-3 px-4">Item & Description</th>
                  <th className="py-3 px-4">SKU / Variant</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {order.items?.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-gray-900 font-serif-luxury text-sm">{item.productName}</p>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">
                      {item.sku} {item.variant ? `(${item.variant})` : ''}
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-gray-800">{item.quantity}</td>
                    <td className="py-3.5 px-4 text-right font-mono">৳{(item.unitPrice || 0).toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right font-bold font-mono text-gray-900">
                      ৳{((item.unitPrice || 0) * (item.quantity || 1)).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Calculation Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pt-4 border-t border-gray-200 gap-6">
            <div className="text-xs text-gray-500 max-w-xs space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4" /> 100% Genuine Luxury Product
              </div>
              <p>For any concierge inquiries or exchanges, reach out with your Order ID.</p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-semibold font-mono">৳{(order.subtotal || 0).toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Promotional Discount:</span>
                  <span className="font-mono">-৳{order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge:</span>
                <span className="font-semibold font-mono">৳{(order.deliveryCharge || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t-2 border-gray-900">
                <span>Total Amount:</span>
                <span className="text-base text-[#0F172A] font-mono">৳{(order.totalAmount || 0).toLocaleString()}</span>
              </div>
              
              {/* Payment Split in Invoice */}
              <div className="pt-2 mt-2 border-t border-dashed border-gray-300 space-y-1 text-xs">
                <div className="flex justify-between text-emerald-800 font-semibold">
                  <span>Advance Paid ({order.paymentProvider || order.paymentMethod}):</span>
                  <span className="font-mono">৳{(order.paidAmount || (order.paymentMethod === 'COD' ? order.deliveryCharge : order.totalAmount) || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-amber-800 font-semibold">
                  <span>Cash Due on Delivery:</span>
                  <span className="font-mono">৳{(order.dueAmount || (order.paymentMethod === 'COD' ? order.subtotal : 0) || 0).toLocaleString()}</span>
                </div>
                {order.transactionId && (
                  <p className="text-[10px] text-gray-500 font-mono pt-0.5">
                    TrxID: {order.transactionId} {order.senderMobile ? `• From: ${order.senderMobile}` : ''}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-8 border-t border-gray-100 text-[11px] text-gray-400">
            <p className="font-serif-luxury italic text-sm text-gray-700">"Elegance In Every Choice"</p>
            <p className="mt-1">Thank you for choosing AVELORA. Handcrafted with passion and delivered with care.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
