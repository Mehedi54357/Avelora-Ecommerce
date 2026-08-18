'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../context/cart-context';
import { ShoppingBag, Eye, Check } from 'lucide-react';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    images: string[];
    originalPrice: number;
    discountPercentage?: number;
    salePrice: number;
    categoryId?: { name: string; slug: string } | any;
    variants: Array<{
      sku: string;
      color?: string;
      size?: string;
      price: number;
      stock: number;
    }>;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const selectedVariant = product.variants?.[selectedVariantIndex] || {
    sku: `SKU-${product.slug}`,
    color: '',
    size: '',
    price: product.salePrice,
    stock: 10,
  };

  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80';
  const hoverImage = product.images?.[1] || mainImage;

  const currentPrice = selectedVariant.price > 0 ? selectedVariant.price : product.salePrice;
  const isOutOfStock = selectedVariant.stock === 0;

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
      quantity: 1,
      maxStock: selectedVariant.stock,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      className="group relative bg-white rounded-xl overflow-hidden border border-gray-100/80 hover:border-[#D4AF37]/50 transition-all duration-300 hover:shadow-xl flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <Link href={`/products/${product.slug}`} className="relative aspect-[4/5] bg-gray-50 overflow-hidden block">
        <img
          src={isHovered ? hoverImage : mainImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Discount Badge */}
        {product.discountPercentage && product.discountPercentage > 0 ? (
          <div className="absolute top-3 left-3 bg-[#0B0F19] text-[#E6CA85] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#D4AF37]/30 shadow-sm">
            {product.discountPercentage}% OFF
          </div>
        ) : null}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 border border-white/40 rounded-full">
              Sold Out
            </span>
          </div>
        )}

        {/* Quick View Button overlay on hover */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg transition-all ${
              added
                ? 'bg-emerald-600 text-white'
                : isOutOfStock
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-[#C5A059]'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" /> Quick Add
              </>
            )}
          </button>
        </div>
      </Link>

      {/* Product Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#997B21]">
            {product.categoryId?.name || 'Exclusive'}
          </span>
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-[#C5A059] transition font-serif-luxury text-base mt-0.5">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Variants Pill Bar if available */}
        {product.variants && product.variants.length > 1 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {product.variants.slice(0, 4).map((variant, idx) => (
              <button
                key={variant.sku}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedVariantIndex(idx);
                }}
                className={`text-[10px] px-2 py-0.5 rounded border transition ${
                  selectedVariantIndex === idx
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-gray-200 text-gray-600 hover:border-gray-400 bg-gray-50'
                }`}
              >
                {variant.color || variant.size || `Opt ${idx + 1}`}
              </button>
            ))}
          </div>
        )}

        {/* Pricing */}
        <div className="flex items-baseline justify-between pt-1 border-t border-gray-100">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-gray-900 font-serif-luxury">
              ৳{currentPrice.toLocaleString()}
            </span>
            {product.originalPrice > currentPrice && (
              <span className="text-xs text-gray-400 line-through">
                ৳{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">In Stock</span>
        </div>
      </div>
    </div>
  );
}
