'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/cart-context';
import { ShoppingCart, Zap, Check, Plus, Minus, Tag } from 'lucide-react';
import { evaluatePricing } from '../utils/pricing';

// Color name to hex map helper
const COLOR_MAP: Record<string, string> = {
  black: '#0F172A',
  kalo: '#0F172A',
  white: '#FFFFFF',
  shada: '#FFFFFF',
  beige: '#E8D8C8',
  nude: '#CDB49B',
  olive: '#556B2F',
  olivegreen: '#556B2F',
  'dusty pink': '#E08B9B',
  pink: '#EC4899',
  gulabi: '#EC4899',
  maroon: '#58111A',
  red: '#DC2626',
  lal: '#DC2626',
  'navy blue': '#1B2A4A',
  navy: '#1B2A4A',
  blue: '#2563EB',
  neel: '#2563EB',
  grey: '#64748B',
  gray: '#64748B',
  purple: '#6B21A8',
  beguni: '#6B21A8',
  gold: '#C5A059',
  golden: '#C5A059',
  sonali: '#C5A059',
  orange: '#EA580C',
  komola: '#EA580C',
  yellow: '#EAB308',
  holud: '#EAB308',
  green: '#16A34A',
  shobuj: '#16A34A',
  cyan: '#06B6D4',
  magenta: '#D946EF',
  brown: '#78350F',
};

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    images: string[];
    originalPrice: number;
    discountPercentage?: number;
    salePrice: number;
    badge?: string;
    categoryId?: { name: string; slug: string } | any;
    variants: Array<{
      sku: string;
      color?: string;
      colorHex?: string;
      size?: string;
      price: number;
      stockQuantity?: number;
      stock?: number;
    }>;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { addItem, clearCart } = useCart();
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const pricing = useMemo(() => evaluatePricing(product), [product]);

  const selectedVariant = product.variants?.[selectedVariantIndex] || {
    sku: `SKU-${product.slug}`,
    color: '',
    colorHex: '#0F172A',
    size: '',
    price: pricing.effectivePrice,
    stockQuantity: 10,
    stock: 10,
  };

  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80';
  const hoverImage = product.images?.[1] || mainImage;

  const currentPrice = selectedVariant.price > 0 ? selectedVariant.price : pricing.effectivePrice;
  const hasActiveDiscount = pricing.hasDiscount && (selectedVariant.price <= 0 || selectedVariant.price === pricing.effectivePrice);
  const variantStock = selectedVariant.stockQuantity !== undefined ? selectedVariant.stockQuantity : (selectedVariant.stock ?? 10);
  const isOutOfStock = variantStock === 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    addItem({
      productId: product._id,
      sku: selectedVariant.sku,
      name: product.name,
      image: mainImage,
      color: selectedVariant.color,
      size: selectedVariant.size,
      price: currentPrice,
      originalPrice: product.originalPrice,
      quantity,
      maxStock: variantStock,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    clearCart();
    addItem({
      productId: product._id,
      sku: selectedVariant.sku,
      name: product.name,
      image: mainImage,
      color: selectedVariant.color,
      size: selectedVariant.size,
      price: currentPrice,
      originalPrice: product.originalPrice,
      quantity,
      maxStock: variantStock,
    });

    router.push('/checkout');
  };

  // Extract color swatches
  const colorList = (product.variants || []).filter((v) => v.color && v.color.trim() !== '');

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-[#D4AF37]/60 transition-all duration-300 hover:shadow-xl flex flex-col justify-between h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden block">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={isHovered ? hoverImage : mainImage}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Discount / Best Seller Badge */}
        {hasActiveDiscount ? (
          <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-[#556B2F] text-[#F4F1EA] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-[#6B8E23] shadow-sm flex items-center gap-1">
            <Tag className="w-2.5 h-2.5" />
            <span>{pricing.discountPercentage}% OFF</span>
          </div>
        ) : product.badge ? (
          <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-[#4A5D23] text-[#F4F1EA] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md shadow-sm">
            {product.badge}
          </div>
        ) : null}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest px-2.5 sm:px-3 py-1 sm:py-1.5 border border-white/40 rounded-full">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-3 sm:p-4 md:p-5 flex-1 flex flex-col justify-between space-y-2.5 sm:space-y-3">
        <div>
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#997B21] block truncate">
            {product.categoryId?.name || 'Avelora Collection'}
          </span>
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-[#C5A059] transition font-serif-luxury mt-0.5">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Round Color Swatches */}
        {colorList.length > 0 && (
          <div className="space-y-1 pt-0.5">
            <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
              <span className="text-gray-500 font-medium truncate max-w-[120px]">
                Color: <strong className="text-gray-900 font-bold">{selectedVariant.color || 'Standard'}</strong>
              </span>
              {colorList.length > 5 && (
                <Link href={`/products/${product.slug}`} className="text-[9px] sm:text-[10px] text-[#997B21] font-bold hover:underline flex-shrink-0">
                  +{colorList.length - 5}
                </Link>
              )}
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              {colorList.slice(0, 6).map((variant, idx) => {
                const isSelected = selectedVariantIndex === idx;
                const lower = (variant.color || '').toLowerCase().trim();
                const hexColor = variant.colorHex || COLOR_MAP[lower] || '#0F172A';
                const isWhite = hexColor.toUpperCase() === '#FFFFFF' || hexColor.toLowerCase() === '#fff';

                return (
                  <button
                    key={variant.sku || idx}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedVariantIndex(idx);
                    }}
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full transition-all flex items-center justify-center border shadow-2xs ${
                      isSelected
                        ? 'ring-2 ring-slate-900 ring-offset-1 scale-110 border-white'
                        : 'hover:scale-110 border-gray-300'
                    }`}
                    style={{ backgroundColor: hexColor }}
                    title={variant.color}
                    aria-label={`Select color ${variant.color}`}
                  >
                    {isSelected && (
                      <Check className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${isWhite ? 'text-black' : 'text-white'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Pricing & Stock */}
        <div className="flex items-baseline justify-between pt-1 border-t border-gray-100 flex-wrap gap-1">
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-sm sm:text-base font-bold text-gray-900 font-serif-luxury">
              ৳{currentPrice.toLocaleString()}
            </span>
            {product.originalPrice > currentPrice && (
              <span className="text-[10px] sm:text-xs text-gray-400 line-through font-mono">
                ৳{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          <span className={`text-[9px] sm:text-[10px] font-semibold ${isOutOfStock ? 'text-red-500' : 'text-emerald-600'}`}>
            {isOutOfStock ? 'Out of Stock' : 'In Stock'}
          </span>
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-500">Qty</span>
          <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 h-7 sm:h-8 w-20 sm:w-24 shadow-2xs">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuantity(Math.max(1, quantity - 1));
              }}
              disabled={isOutOfStock || quantity <= 1}
              className="px-1.5 sm:px-2 h-full hover:bg-gray-200 text-gray-600 transition flex items-center justify-center disabled:opacity-40 min-w-[24px]"
              aria-label="Decrease quantity"
            >
              <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </button>
            <span className="flex-1 text-center text-[11px] sm:text-xs font-bold text-gray-900">{quantity}</span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuantity(Math.min(variantStock, quantity + 1));
              }}
              disabled={isOutOfStock || quantity >= variantStock}
              className="px-1.5 sm:px-2 h-full hover:bg-gray-200 text-gray-600 transition flex items-center justify-center disabled:opacity-40 min-w-[24px]"
              aria-label="Increase quantity"
            >
              <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </button>
          </div>
        </div>

        {/* Action Buttons: ADD TO CART & BUY NOW */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 pt-1">
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`py-2 px-1.5 sm:px-2 rounded-xl text-[10px] sm:text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all min-h-[36px] ${
              added
                ? 'bg-emerald-600 text-white'
                : isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border'
                : 'bg-white border-2 border-slate-900 hover:bg-slate-900 hover:text-white text-gray-900'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3 h-3" /> <span className="truncate">Added</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3 h-3 flex-shrink-0" /> <span className="truncate">Add</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className={`py-2 px-1.5 sm:px-2 rounded-xl text-[10px] sm:text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all shadow-sm min-h-[36px] ${
              isOutOfStock
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[#C5A059] hover:bg-[#b08b3a] text-slate-950 font-bold shadow'
            }`}
          >
            <Zap className="w-3 h-3 fill-current flex-shrink-0" />
            <span className="truncate">Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
