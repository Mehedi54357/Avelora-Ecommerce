'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '../../../context/cart-context';
import BadgeStrip from '../../../components/badge-strip';
import { API_BASE_URL } from '../../../utils/api-config';
import {
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  Zap,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { addItem, clearCart, setIsCartOpen } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/api/products/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Product not found');
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        if (data.variants?.length > 0) {
          setSelectedVariantIndex(0);
        }
      })
      .catch((err) => {
        console.error(err);
        setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-pulse space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-[4/5] bg-gray-200 rounded-2xl" />
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-24 bg-gray-200 rounded w-full" />
            <div className="h-12 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Piece Not Found</h2>
        <p className="text-gray-500 mb-6">The requested luxury item may have been relocated or archived.</p>
        <button
          onClick={() => router.push('/products')}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#C5A059] transition"
        >
          Explore All Pieces
        </button>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
  ];

  const selectedVariant = product.variants?.[selectedVariantIndex] || {
    sku: `SKU-${product.slug}`,
    color: '',
    size: '',
    price: product.salePrice,
    stockQuantity: 10,
    stock: 10,
  };

  const currentPrice = selectedVariant.price || product.salePrice || product.originalPrice;
  const availableStock = selectedVariant.stockQuantity ?? (selectedVariant.stock ?? 10);
  const isOutOfStock = availableStock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem({
      productId: product._id,
      sku: selectedVariant.sku,
      name: product.name,
      image: images[0],
      color: selectedVariant.color,
      size: selectedVariant.size,
      price: currentPrice,
      originalPrice: product.originalPrice,
      quantity,
      maxStock: availableStock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    clearCart();
    addItem({
      productId: product._id,
      sku: selectedVariant.sku,
      name: product.name,
      image: images[0],
      color: selectedVariant.color,
      size: selectedVariant.size,
      price: currentPrice,
      originalPrice: product.originalPrice,
      quantity,
      maxStock: availableStock,
    });
    setIsCartOpen(false);
    router.push('/checkout');
  };

  return (
    <div className="space-y-16 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="text-xs text-gray-500 mb-8 flex items-center gap-2">
          <button onClick={() => router.push('/')} className="hover:text-gray-900">Home</button>
          <span>/</span>
          <button onClick={() => router.push('/products')} className="hover:text-gray-900">Collections</button>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16 items-start">
          {/* Left: Multi-Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 shadow-md">
              <img
                src={images[selectedImageIndex] || images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.discountPercentage > 0 && (
                <div className="absolute top-4 left-4 bg-slate-900 text-[#E6CA85] text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-[#D4AF37]/30 shadow-md">
                  {product.discountPercentage}% OFF
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-24 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedImageIndex === idx ? 'border-[#C5A059] shadow-md scale-105' : 'border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details & Purchase Actions */}
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#997B21]">
                {product.categoryId?.name || 'Exclusive Luxury Collection'}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold font-serif-luxury text-gray-900 mt-1 leading-tight">
                {product.name}
              </h1>
              <p className="text-xs text-gray-400 font-mono mt-1">SKU: {selectedVariant.sku}</p>
            </div>

            {/* Price Row */}
            <div className="flex items-baseline gap-4 py-3 border-y border-gray-100">
              <span className="text-3xl font-bold text-gray-900 font-serif-luxury">
                ৳{currentPrice.toLocaleString()}
              </span>
              {product.originalPrice > currentPrice && (
                <span className="text-lg text-gray-400 line-through">
                  ৳{product.originalPrice.toLocaleString()}
                </span>
              )}
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                Tax Included • Free Gift Box
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 leading-relaxed font-light">
              {product.description || 'Exquisitely created using the finest materials and meticulous craftsmanship. Hand-finished for pure elegance.'}
            </p>

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4 pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-800">
                  Select Variant / Option:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {product.variants.map((v: any, idx: number) => {
                    const isSelected = selectedVariantIndex === idx;
                    return (
                      <button
                        key={v.sku}
                        onClick={() => setSelectedVariantIndex(idx)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                            : 'border-gray-200 hover:border-gray-400 bg-white text-gray-800'
                        }`}
                      >
                        <div className="text-xs font-bold truncate">
                          {v.color || ''} {v.size ? `(${v.size})` : ''}
                        </div>
                        <div className={`text-[11px] font-mono mt-1 ${isSelected ? 'text-[#E6CA85]' : 'text-gray-500'}`}>
                          ৳{v.price.toLocaleString()}
                        </div>
                        <div className={`text-[10px] mt-0.5 ${v.stock > 0 ? (isSelected ? 'text-emerald-300' : 'text-emerald-600') : 'text-red-400'}`}>
                          {v.stock > 0 ? `${v.stock} in stock` : 'Out of stock'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-800">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isOutOfStock}
                    className="p-2 hover:bg-gray-100 text-gray-600 transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-bold text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(selectedVariant.stock || 99, quantity + 1))}
                    disabled={isOutOfStock}
                    className="p-2 hover:bg-gray-100 text-gray-600 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`w-full py-4 px-6 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-md transition-all ${
                    added
                      ? 'bg-emerald-600 text-white'
                      : isOutOfStock
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Bag
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> Add to Bag
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`w-full py-4 px-6 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all ${
                    isOutOfStock
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#C5A059] hover:bg-[#b08b3a] text-slate-950 hover:shadow-[#D4AF37]/30'
                  }`}
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>⚡ Buy Now</span>
                </button>
              </div>
            </div>

            {/* Shipping & Delivery Guarantee Highlights */}
            <div className="bg-[#FAFAF8] p-5 rounded-2xl border border-gray-200 space-y-3 text-xs text-gray-600">
              <div className="flex items-center gap-3">
                <Truck className="w-4 h-4 text-[#C5A059] flex-shrink-0" />
                <span>
                  <strong>Dhaka Express:</strong> ৳70 (Same/Next Day) • <strong>Outside Dhaka:</strong> ৳130 (2-3 Days)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-[#C5A059] flex-shrink-0" />
                <span>Signature AVELORA shopping bag & luxury box included.</span>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="w-4 h-4 text-[#C5A059] flex-shrink-0" />
                <span>Hassle-free 7-day exchange on all unworn & unsealed pieces.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BadgeStrip />
    </div>
  );
}
