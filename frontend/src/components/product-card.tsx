'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/cart-context';
import { ShoppingBag, Zap, Check } from 'lucide-react';

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
      stockQuantity?: number;
      stock?: number;
    }>;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { addItem, clearCart } = useCart();
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const selectedVariant = product.variants?.[selectedVariantIndex] || {
    sku: `SKU-${product.slug}`,
    color: '',
    size: '',
    price: product.salePrice,
    stockQuantity: 10,
    stock: 10,
  };

  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80';
  const hoverImage = product.images?.[1] || mainImage;

  const currentPrice = selectedVariant.price > 0 ? selectedVariant.price : product.salePrice;
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
      quantity: 1,
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
      quantity: 1,
      maxStock: variantStock,
    });

    router.push('/checkout');
  };

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-[#D4AF37]/60 transition-all duration-300 hover:shadow-xl flex flex-col justify-between"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden block">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={isHovered ? hoverImage : mainImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

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
      </div>

      {/* Product Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#997B21]">
            {product.categoryId?.name || 'Avelora Collection'}
          </span>
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-[#C5A059] transition font-serif-luxury mt-0.5">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Variants Pill Bar if available */}
        {product.variants && product.variants.length > 1 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            {product.variants.slice(0, 4).map((variant, idx) => (
              <button
                key={variant.sku}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedVariantIndex(idx);
                }}
                className={`text-[10px] px-2 py-0.5 rounded border font-medium transition ${
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
          <span className={`text-[10px] font-semibold ${isOutOfStock ? 'text-red-500' : 'text-emerald-600'}`}>
            {isOutOfStock ? 'Out of Stock' : 'In Stock'}
          </span>
        </div>

        {/* Action Buttons: Buy Now & Add to Bag */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`py-2 px-2 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
              added
                ? 'bg-emerald-600 text-white'
                : isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border'
                : 'bg-white border border-gray-300 hover:border-slate-900 text-gray-800'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" /> Add to Bag
              </>
            )}
          </button>

          <button
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className={`py-2 px-2 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all shadow-sm ${
              isOutOfStock
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-slate-950 hover:bg-[#C5A059] text-white hover:text-slate-950'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
