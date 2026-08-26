import React from 'react';
import { redirect, notFound } from 'next/navigation';
import { API_BASE_URL } from '../../../../utils/api-config';

interface ProductQrResolverProps {
  params: Promise<{
    code: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function ProductQrResolverPage({ params }: ProductQrResolverProps) {
  const resolvedParams = await params;
  const code = resolvedParams.code?.trim();
  if (!code) {
    notFound();
  }

  let targetSlug = '';

  try {
    const res = await fetch(`${API_BASE_URL}/api/qr/products/${encodeURIComponent(code)}`, {
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      if (data.slug) {
        targetSlug = data.slug;
      }
    }
  } catch (error) {
    console.error('Error resolving product QR code:', error);
  }

  if (targetSlug) {
    redirect(`/products/${targetSlug}`);
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md p-8 rounded-2xl bg-white border border-[#D4AF37]/30 shadow-xl space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-[#C5A059]/10 text-[#C5A059] flex items-center justify-center font-bold text-xl">
          QR
        </div>
        <h1 className="text-xl font-bold text-slate-900 font-serif-luxury">Product Code Recognized</h1>
        <p className="text-sm text-gray-600">
          The requested product code <span className="font-mono font-bold text-[#C5A059]">"{code}"</span> is currently being updated in our catalog.
        </p>
        <a
          href="/products"
          className="inline-block px-6 py-2.5 rounded-full bg-[#C5A059] text-slate-950 font-bold text-xs uppercase tracking-widest hover:bg-[#b08b3a] transition"
        >
          Explore All Products
        </a>
      </div>
    </div>
  );
}
