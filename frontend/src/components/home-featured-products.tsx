'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import ProductCard from './product-card';
import { API_BASE_URL } from '../utils/api-config';

interface HomeFeaturedProductsProps {
  initialProducts?: any[];
}

export default function HomeFeaturedProducts({ initialProducts = [] }: HomeFeaturedProductsProps) {
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);

  useEffect(() => {
    // If initialProducts was empty from SSR, fetch from client immediately
    let isMounted = true;
    fetch(`${API_BASE_URL}/api/products?limit=100`)
      .then((res) => (res.ok ? res.json() : { products: [] }))
      .then((data) => {
        if (isMounted && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        }
      })
      .catch((err) => {
        console.error('Failed to load homepage products on client:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#C5A059]">
            Hand-Selected Pieces
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif-luxury mt-1">
            Featured Trending Releases
          </h2>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0F172A] hover:text-[#C5A059] transition"
        >
          <span>View All Collections</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#C5A059] mx-auto" />
          <p className="text-xs text-gray-500 font-medium">Curating luxury pieces for you...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 p-8 space-y-3">
          <Sparkles className="w-8 h-8 text-[#C5A059] mx-auto" />
          <h3 className="text-base font-bold font-serif-luxury text-gray-900 uppercase tracking-wider">
            New Collections Arriving Soon
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Our master artisans are hand-crafting new pieces. Check back shortly or explore our department collections above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 min-[375px]:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {products.map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
