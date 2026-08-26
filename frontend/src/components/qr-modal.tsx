'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Printer,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Lock,
  QrCode as QrIcon,
} from 'lucide-react';
import {
  generateQrDataUrl,
  downloadQrImage,
  buildProductQrUrl,
} from '../utils/qr-generator';

export interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: string;
  payload: string; // The raw QR payload or target URL
  displayCode?: string; // e.g. "PRD-A81K" or "AVE-2026-001"
  filenamePrefix?: string; // e.g. "AVELORA-Product-PRD-A81K"
  purposeDescription?: string;
}

export default function QrModal({
  isOpen,
  onClose,
  title,
  subtitle,
  badge = 'AVELORA SECURE QR',
  payload,
  displayCode,
  filenamePrefix = 'avelora-qr',
  purposeDescription,
}: QrModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [downloading, setDownloading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const isFulfillmentSecret = payload?.startsWith('AV1:F:');

  const generateQr = async () => {
    if (!payload || payload.trim() === '') {
      setError('Invalid or empty QR payload');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Generate crisp 1024px data URL
      const dataUrl = await generateQrDataUrl(payload, {
        width: 1024,
        margin: 2,
      });
      setQrDataUrl(dataUrl);
    } catch (err: any) {
      console.error('Error generating QR code:', err);
      setError(err.message || 'Failed to render QR Code');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      generateQr();
    } else {
      setQrDataUrl('');
      setError('');
      setCopied(false);
    }
  }, [isOpen, payload]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!qrDataUrl) return;
    setDownloading(true);
    try {
      const filename = `${filenamePrefix}-QR.png`;
      await downloadQrImage(qrDataUrl, filename);
    } catch (err: any) {
      alert(`Download failed: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopy = () => {
    if (!payload || isFulfillmentSecret) return;
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - QR Label</title>
          <style>
            @page { size: auto; margin: 10mm; }
            body { font-family: system-ui, -apple-system, sans-serif; text-align: center; padding: 20px; color: #0f172a; }
            .card { max-width: 320px; margin: 0 auto; border: 2px solid #0f172a; border-radius: 16px; padding: 24px; }
            .brand { font-size: 18px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 2px; }
            .tagline { font-size: 8px; font-weight: 700; letter-spacing: 0.25em; text-transform: uppercase; color: #8C6D23; margin-bottom: 16px; }
            .qr-img { width: 220px; height: 220px; margin: 0 auto; display: block; }
            .code { font-family: monospace; font-size: 13px; font-weight: 700; background: #f1f5f9; padding: 4px 12px; border-radius: 9999px; display: inline-block; margin-top: 12px; border: 1px solid #cbd5e1; }
            .item-title { font-size: 14px; font-weight: 700; margin-top: 12px; }
            .url { font-size: 10px; color: #64748b; margin-top: 8px; word-break: break-all; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="brand">AVELORA</div>
            <div class="tagline">Elegance In Every Choice</div>
            <img class="qr-img" src="${qrDataUrl}" alt="QR" />
            ${displayCode ? `<div class="code">${displayCode}</div>` : ''}
            <div class="item-title">${title}</div>
            ${!isFulfillmentSecret ? `<div class="url">${payload}</div>` : '<div class="url">Internal Staff Verification Only</div>'}
          </div>
          <script>
            window.onload = () => { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-200 p-6 sm:p-8 space-y-5 relative">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C6D23] bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              {badge}
            </span>
            <h3 className="text-lg font-bold font-serif-luxury text-slate-950 mt-1.5 line-clamp-1">
              {title}
            </h3>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-slate-900 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Display Area */}
        <div className="space-y-4 text-center">
          {loading ? (
            <div className="py-16 text-center text-gray-400 bg-gray-50 rounded-2xl border border-gray-100">
              <Loader2 className="w-10 h-10 animate-spin mx-auto text-[#D4AF37]" />
              <p className="text-xs font-medium text-gray-600 mt-3">Rendering High-Resolution Vector QR...</p>
            </div>
          ) : error ? (
            <div className="py-12 px-4 text-center bg-red-50 rounded-2xl border border-red-200 space-y-3">
              <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
              <p className="text-xs font-bold text-red-800">{error}</p>
              <button
                onClick={generateQr}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Generation</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* QR Image Box */}
              <div className="p-5 bg-white border-2 border-dashed border-[#D4AF37]/50 rounded-2xl inline-block shadow-sm relative group">
                <img
                  src={qrDataUrl}
                  alt={title}
                  className="w-56 h-56 mx-auto object-contain block rounded-lg select-none"
                  style={{ imageRendering: 'pixelated' }}
                />
                {displayCode && (
                  <div className="mt-3 text-center">
                    <span className="font-mono text-xs font-bold text-slate-950 bg-gray-100 px-3.5 py-1 rounded-full border border-gray-300 shadow-inner">
                      {displayCode}
                    </span>
                  </div>
                )}
              </div>

              {/* Purpose & Link Snapshot */}
              <div className="text-xs text-gray-600 space-y-2 bg-gray-50 p-3.5 rounded-2xl border border-gray-200 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-gray-500">
                    {isFulfillmentSecret ? 'Internal Token Type:' : 'Target URL:'}
                  </span>
                  {!isFulfillmentSecret ? (
                    <button
                      onClick={handleCopy}
                      className="text-[11px] text-[#8C6D23] font-bold hover:underline flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full">
                      <Lock className="w-3 h-3 text-slate-600" /> Secret Protected
                    </span>
                  )}
                </div>
                <p className="font-mono text-[11px] text-slate-900 bg-white p-2 rounded-xl border border-gray-200 break-all select-all">
                  {isFulfillmentSecret
                    ? `AV1:F:••••••••••••••••••••••••• [OPAQUE ONE-TIME FULFILLMENT SECRET]`
                    : payload}
                </p>
                {purposeDescription && (
                  <p className="text-[11px] text-gray-500 pt-1 border-t border-gray-200">
                    {purposeDescription}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleDownload}
                  disabled={downloading || !qrDataUrl}
                  className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  {downloading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                  ) : (
                    <Download className="w-4 h-4 text-[#D4AF37]" />
                  )}
                  <span>{downloading ? 'Downloading...' : 'Download PNG'}</span>
                </button>

                <button
                  onClick={handlePrint}
                  disabled={!qrDataUrl}
                  className="py-3 px-4 rounded-xl bg-[#D4AF37] hover:bg-[#b58f44] text-slate-950 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Label</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
