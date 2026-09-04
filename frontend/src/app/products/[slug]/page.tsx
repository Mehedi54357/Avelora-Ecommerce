'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '../../../context/cart-context';
import { API_BASE_URL } from '../../../utils/api-config';
import { evaluatePricing } from '../../../utils/pricing';
import {
  ShoppingCart,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  Plus,
  Minus,
  Sparkles,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Zap,
  Star,
  Search,
  Maximize2,
  Tag,
  Feather,
  Layers,
  Wind,
  Waves,
  CheckCircle2,
  Award,
  Crown,
  Users,
  Headphones,
  X,
  Share2,
} from 'lucide-react';

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

// Helper to render distinct icon for each feature highlight
function FeatureIcon({ iconName, index }: { iconName?: string; index: number }) {
  const icon = (iconName || '').toLowerCase().trim();

  if (icon === 'feather' || icon === 'leaf' || icon === 'heart' || icon === 'soft') {
    return <Feather className="w-4 h-4 text-gray-700" />;
  }
  if (icon === 'layers' || icon === 'fabric' || icon === 'quality' || icon === 'material') {
    return <Layers className="w-4 h-4 text-gray-700" />;
  }
  if (icon === 'wind' || icon === 'breathable' || icon === 'air' || icon === 'lightweight') {
    return <Wind className="w-4 h-4 text-gray-700" />;
  }
  if (icon === 'waves' || icon === 'drape' || icon === 'flow' || icon === 'finish' || icon === 'glossy') {
    return <Waves className="w-4 h-4 text-gray-700" />;
  }
  if (icon === 'check' || icon === 'checkcircle' || icon === 'style' || icon === 'occasion' || icon === 'star') {
    return <CheckCircle2 className="w-4 h-4 text-gray-700" />;
  }
  if (icon === 'award' || icon === 'crown' || icon === 'shield') {
    return <Award className="w-4 h-4 text-gray-700" />;
  }

  switch (index % 5) {
    case 0:
      return <Feather className="w-4 h-4 text-gray-700" />;
    case 1:
      return <Layers className="w-4 h-4 text-gray-700" />;
    case 2:
      return <Wind className="w-4 h-4 text-gray-700" />;
    case 3:
      return <Waves className="w-4 h-4 text-gray-700" />;
    case 4:
    default:
      return <CheckCircle2 className="w-4 h-4 text-gray-700" />;
  }
}

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
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Fetch product data
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

  // Deterministic Gallery Images Fallback & Authoritative Ordering
  const images = useMemo(() => {
    if (product?.productImages && Array.isArray(product.productImages) && product.productImages.length > 0) {
      const sorted = [...product.productImages].sort((a: any, b: any) => {
        if (a.isPrimary) return -1;
        if (b.isPrimary) return 1;
        return (a.sortOrder || 0) - (b.sortOrder || 0);
      });
      return sorted.map((img: any) => (typeof img === 'string' ? img : img.url)).filter(Boolean);
    }

    if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images.filter(Boolean);
    }

    return ['https://images.unsplash.com/photo-1611591475152-478311399767?auto=format&fit=crop&w=1000&q=85'];
  }, [product]);

  // Authoritative Pricing Evaluation
  const pricing = useMemo(() => evaluatePricing(product), [product]);

  const selectedVariant = product?.variants?.[selectedVariantIndex] || {
    sku: `SKU-${product?.slug || 'AVE'}`,
    color: 'Olive',
    size: 'Standard',
    price: pricing.effectivePrice,
    stockQuantity: 10,
    stock: 10,
  };

  const currentPrice = selectedVariant.price > 0 ? selectedVariant.price : pricing.effectivePrice;
  const originalPrice = product?.originalPrice || currentPrice;
  const hasActiveDiscount = pricing.hasDiscount && (selectedVariant.price <= 0 || selectedVariant.price === pricing.effectivePrice);
  const availableStock = selectedVariant.stockQuantity ?? (selectedVariant.stock ?? 10);
  const isOutOfStock = availableStock <= 0;

  // Extract color swatches from variants
  const colorVariants = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return [];
    return product.variants.map((v: any, index: number) => {
      const colorName = v.color?.trim() || `Option ${index + 1}`;
      const lower = colorName.toLowerCase();
      const colorHex = v.colorHex || COLOR_MAP[lower] || '#0F172A';
      return {
        index,
        sku: v.sku,
        name: colorName,
        hex: colorHex,
        price: v.price,
        stock: v.stockQuantity ?? (v.stock ?? 10),
        image: v.image,
      };
    });
  }, [product]);

  // Dynamic 5 Feature Points with Distinct Icons
  const featuresList = useMemo(() => {
    if (product?.features && product.features.length > 0) {
      return product.features;
    }

    const catName = (product?.categoryId?.name || '').toLowerCase();
    const dept = (product?.categoryId?.department || '').toLowerCase();

    if (catName.includes('hijab')) {
      return [
        { title: 'Soft & Comfortable', subtitle: 'Gentle on skin', icon: 'feather' },
        { title: 'Premium Ceri Fabric', subtitle: 'High quality material', icon: 'layers' },
        { title: 'Lightweight & Breathable', subtitle: 'All day comfort', icon: 'wind' },
        { title: 'Elegant Drape', subtitle: 'Perfect fall & flow', icon: 'waves' },
        { title: 'Easy to Style', subtitle: 'Hijab friendly fabric', icon: 'check' },
      ];
    }

    if (catName.includes('churi') || catName.includes('bangle') || catName.includes('jewel')) {
      return [
        { title: 'Soft & Comfortable', subtitle: 'Gentle on skin and non-irritating', icon: 'feather' },
        { title: 'Premium Artisan Quality', subtitle: 'Crafted from finest materials', icon: 'layers' },
        { title: 'Lightweight & Breathable', subtitle: 'Designed for effortless all-day wear', icon: 'wind' },
        { title: 'Glossy & Elegant Finish', subtitle: 'Flawless look that enhances beauty', icon: 'waves' },
        { title: 'Perfect For Every Occasion', subtitle: 'Festivals, parties, weddings & daily styling', icon: 'check' },
      ];
    }

    if (dept === 'men') {
      return [
        { title: '100% Genuine Leather', subtitle: 'Handcrafted artisan premium finish', icon: 'award' },
        { title: 'Orthopedic Cushioned Insole', subtitle: 'Supreme all-day step comfort', icon: 'feather' },
        { title: 'Anti-Skid Rubber Outsole', subtitle: 'Maximum traction and road grip', icon: 'layers' },
        { title: 'Breathable Leather Lining', subtitle: 'Prevents moisture and odor buildup', icon: 'wind' },
        { title: 'Bespoke Luxury Packaging', subtitle: 'Includes protective dust bag & shoe horn', icon: 'crown' },
      ];
    }

    return [
      { title: 'Soft & Comfortable', subtitle: 'Gentle on skin and non-irritating', icon: 'feather' },
      { title: 'Premium Artisan Quality', subtitle: 'Crafted from finest materials', icon: 'layers' },
      { title: 'Lightweight & Breathable', subtitle: 'Designed for effortless all-day wear', icon: 'wind' },
      { title: 'Glossy & Elegant Finish', subtitle: 'Flawless look that enhances beauty', icon: 'waves' },
      { title: 'Perfect For Every Occasion', subtitle: 'Festivals, parties, weddings & daily styling', icon: 'check' },
    ];
  }, [product]);

  // Scroll active thumbnail smoothly into view
  const scrollThumbnailIntoView = useCallback((index: number) => {
    const el = thumbnailRefs.current[index];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, []);

  const handleSelectThumbnail = (index: number) => {
    setSelectedImageIndex(index);
    scrollThumbnailIntoView(index);
  };

  const handleSelectColor = (index: number) => {
    setSelectedVariantIndex(index);
    const variant = product?.variants?.[index];

    let targetImageUrl = variant?.image;
    if (!targetImageUrl && product?.productImages) {
      const match = product.productImages.find(
        (img: any) => (img.variantColor || '').toLowerCase() === (variant?.color || '').toLowerCase(),
      );
      if (match) targetImageUrl = match.url;
    }

    if (targetImageUrl) {
      const imgIdx = images.findIndex((img: string) => img === targetImageUrl);
      if (imgIdx !== -1) {
        setSelectedImageIndex(imgIdx);
        scrollThumbnailIntoView(imgIdx);
      }
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem({
      productId: product._id,
      sku: selectedVariant.sku,
      name: product.name,
      image: images[0],
      color: selectedVariant.color || '',
      size: selectedVariant.size || '',
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
      color: selectedVariant.color || '',
      size: selectedVariant.size || '',
      price: currentPrice,
      originalPrice: product.originalPrice,
      quantity,
      maxStock: availableStock,
    });
    setIsCartOpen(false);
    router.push('/checkout');
  };

  const handlePrevThumbnail = () => {
    const nextIdx = selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1;
    setSelectedImageIndex(nextIdx);
    scrollThumbnailIntoView(nextIdx);
  };

  const handleNextThumbnail = () => {
    const nextIdx = selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0;
    setSelectedImageIndex(nextIdx);
    scrollThumbnailIntoView(nextIdx);
  };

  // Boundary-aware mouse wheel scrolling for thumbnail gallery
  const handleThumbnailWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const container = thumbnailContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const maxScroll = scrollWidth - clientWidth;

    if (maxScroll > 0) {
      const isAtStart = scrollLeft <= 0;
      const isAtEnd = scrollLeft >= maxScroll - 1;

      if ((e.deltaY < 0 && !isAtStart) || (e.deltaY > 0 && !isAtEnd)) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    }
  };

  // Keyboard navigation inside Zoom Lightbox
  useEffect(() => {
    if (!isZoomOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsZoomOpen(false);
      } else if (e.key === 'ArrowLeft') {
        setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === 'ArrowRight') {
        setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomOpen, images.length]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 animate-pulse space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <div className="aspect-[4/5] bg-gray-200 rounded-3xl" />
          <div className="space-y-5">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-5 bg-gray-200 rounded w-1/3" />
            <div className="h-10 bg-gray-200 rounded w-1/2" />
            <div className="space-y-3 pt-4">
              <div className="h-12 bg-gray-100 rounded-xl" />
              <div className="h-12 bg-gray-100 rounded-xl" />
              <div className="h-12 bg-gray-100 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
        <h2 className="text-2xl font-bold font-serif-luxury text-gray-900">Piece Not Found</h2>
        <p className="text-gray-500 text-xs max-w-sm">The requested luxury item may have been relocated or archived.</p>
        <button
          onClick={() => router.push('/products')}
          className="px-6 py-2.5 bg-slate-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#C5A059] transition shadow"
        >
          Explore All Pieces
        </button>
      </div>
    );
  }

  const badgeText = product.badge || 'BEST SELLER';
  const ratingValue = product.rating || 4.8;
  const reviewsCount = product.reviewsCount || 256;
  const selectedColorName = selectedVariant.color || product.subtitle || 'Olive';

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: images,
    description: product.description || product.subtitle || `${product.name} - Luxury Modest Fashion by AVELORA`,
    sku: selectedVariant.sku,
    brand: {
      '@type': 'Brand',
      name: 'AVELORA',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BDT',
      price: currentPrice,
      availability: availableStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'AVELORA',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: ratingValue,
      reviewCount: reviewsCount,
    },
  };

  return (
    <div className="bg-white min-h-screen pb-28 md:pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      {/* 1. Elegant Breadcrumb & Quick Back Navigation Bar */}
      <div className="border-b border-gray-100 bg-[#FAFAF8]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs">
          <nav className="flex items-center gap-2 text-gray-500 font-medium overflow-x-auto scrollbar-none py-1">
            <Link href="/" className="hover:text-[#C5A059] transition text-gray-700 font-semibold flex items-center gap-1">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <Link href="/products" className="hover:text-[#C5A059] transition text-gray-700 font-semibold">
              All Catalog
            </Link>
            {product.categoryId?.name && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <Link
                  href={`/products?category=${product.categoryId.slug || ''}`}
                  className="hover:text-[#C5A059] transition text-gray-700 font-semibold truncate max-w-[150px]"
                >
                  {product.categoryId.name}
                </Link>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="text-[#997B21] font-bold truncate max-w-[150px] sm:max-w-[200px]">
              {product.name}
            </span>
          </nav>

          <button
            onClick={() => {
              if (product.categoryId?.slug) {
                router.push(`/products?category=${product.categoryId.slug}`);
              } else if (product.categoryId?.department) {
                router.push(`/products?department=${product.categoryId.department}`);
              } else {
                router.push('/products');
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-gray-100 text-gray-700 font-semibold border border-gray-200 shadow-2xs transition flex-shrink-0 ml-2 text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to</span>
            <span className="truncate max-w-[100px]">{product.categoryId?.name || 'Catalog'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Product Showcase Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-10 space-y-10 sm:space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
          {/* ========================================================================= */}
          {/* LEFT COLUMN: Main Gallery Image + Horizontal Thumbnail Gallery            */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 space-y-3 sm:space-y-4">
            {/* Primary Main Image Frame */}
            <div
              onClick={() => setIsZoomOpen(true)}
              className="relative aspect-[4/5] max-h-[520px] sm:max-h-[620px] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#FAFAF8] border border-gray-200/90 shadow-md group cursor-zoom-in"
            >
              <img
                key={selectedImageIndex}
                src={images[selectedImageIndex] || images[0]}
                alt={product.name}
                fetchPriority="high"
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 image-crossfade"
              />

              {/* Top-Left: Discount Badge (Priority) or Best Seller Badge */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col gap-1.5">
                {hasActiveDiscount && (
                  <div className="bg-[#556B2F] text-[#F4F1EA] text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg shadow-md border border-[#6B8E23] flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    <span>{pricing.discountPercentage}% OFF</span>
                  </div>
                )}
                {badgeText && !hasActiveDiscount && (
                  <div className="bg-[#4A5D23] text-[#F4F1EA] text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-lg shadow-md border border-[#607930]">
                    {badgeText}
                  </div>
                )}
              </div>

              {/* Bottom-Right: Magnifier Zoom Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsZoomOpen(true);
                }}
                className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 p-2 sm:p-2.5 rounded-full bg-white/95 hover:bg-white text-slate-900 shadow-md border border-gray-200 transition-transform active:scale-95 flex items-center gap-1 text-xs font-semibold"
                title="Zoom image (Inspect high-res)"
                aria-label="Enlarge image"
              >
                <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline text-[11px] font-bold">Zoom</span>
              </button>
            </div>

            {/* Unlimited Horizontal Thumbnail Slider Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-1.5 sm:gap-2 pt-0.5 sm:pt-1">
                <button
                  type="button"
                  onClick={handlePrevThumbnail}
                  className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 text-gray-700 transition flex-shrink-0 border border-gray-200 shadow-2xs"
                  title="Previous image"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div
                  ref={thumbnailContainerRef}
                  onWheel={handleThumbnailWheel}
                  className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto scrollbar-none py-1 flex-1 scroll-smooth"
                  tabIndex={0}
                  aria-label="Product image thumbnails"
                >
                  {images.map((img: string, idx: number) => {
                    const isSelected = selectedImageIndex === idx;
                    return (
                      <button
                        key={idx}
                        ref={(el) => {
                          thumbnailRefs.current[idx] = el;
                        }}
                        type="button"
                        onClick={() => handleSelectThumbnail(idx)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSelectThumbnail(idx);
                          }
                        }}
                        aria-label={`Thumbnail ${idx + 1} of ${images.length}`}
                        aria-current={isSelected ? 'true' : 'false'}
                        className={`relative w-14 h-16 sm:w-20 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 focus:outline-none ${
                          isSelected
                            ? 'border-[#C5A059] ring-2 ring-[#C5A059]/50 shadow-md scale-105'
                            : 'border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${product.name} thumbnail ${idx + 1}`}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleNextThumbnail}
                  className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 text-gray-700 transition flex-shrink-0 border border-gray-200 shadow-2xs"
                  title="Next image"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: Mobile Order Verified (Title, Rating, Price, Features, CTA) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-6">
            {/* Category / Collection Tag */}
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#997B21] block">
                {product.categoryId?.name || 'Avelora Collection'}
              </span>
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold font-serif-luxury text-gray-900 leading-tight mt-0.5">
                {product.name}
              </h1>

              {/* Subtitle / Color */}
              <p className="text-sm sm:text-base font-medium text-gray-600 mt-0.5">
                {selectedColorName}
              </p>

              {/* Star Rating & Reviews */}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-amber-500" />
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-800">{ratingValue}</span>
                <span className="text-xs text-gray-500">({reviewsCount} Reviews)</span>
              </div>
            </div>

            {/* Price & Authoritative Discount Presentation */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-2.5 sm:gap-3 flex-wrap">
                <span className="text-2xl sm:text-4xl font-bold font-serif-luxury text-gray-900">
                  ৳{currentPrice.toLocaleString()}
                </span>
                {hasActiveDiscount && (
                  <>
                    <span className="text-base sm:text-xl text-gray-400 line-through font-mono">
                      ৳{originalPrice.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                      {pricing.discountPercentage}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Discount Savings Banner */}
              {hasActiveDiscount && pricing.savingAmount > 0 && (
                <div className="text-xs font-bold text-[#4A5D23] bg-[#556B2F]/10 border border-[#556B2F]/30 px-3 py-1.5 rounded-lg w-fit">
                  ✨ You Save ৳{pricing.savingAmount.toLocaleString()} ({pricing.discountPercentage}% OFF)
                </div>
              )}

              {/* Free Delivery Promo Bar */}
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200/80 w-fit">
                <Tag className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>
                  <strong>GOOD NEWS!</strong> Free Delivery on orders over ৳999
                </span>
              </div>

              {/* Stock Status */}
              <div className="text-xs font-semibold text-gray-600 pt-0.5">
                Stock:{' '}
                <span className={isOutOfStock ? 'text-red-600 font-bold' : 'text-emerald-700 font-bold'}>
                  {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                </span>
              </div>
            </div>

            <div className="w-full h-px bg-gray-200" />

            {/* Dynamic 5 Feature Points with Distinct Icons */}
            <div className="space-y-3 sm:space-y-4 py-1">
              {featuresList.map((feature: any, index: number) => (
                <div key={index} className="flex items-start gap-3 sm:gap-3.5">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100/90 border border-gray-200/90 flex items-center justify-center text-gray-700 flex-shrink-0 mt-0.5 shadow-2xs">
                    <FeatureIcon iconName={feature.icon} index={index} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900">{feature.title}</h4>
                    <p className="text-[11px] sm:text-xs text-gray-500">{feature.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full h-px bg-gray-200" />

            {/* Color Swatches Palette */}
            {colorVariants.length > 0 && (
              <div className="space-y-2.5 sm:space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-900 block">
                  COLOR:{' '}
                  <span className="font-semibold text-gray-600 font-sans uppercase">
                    {selectedVariant.color || 'Standard'}
                  </span>
                </label>

                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                  {colorVariants.map((c: any) => {
                    const isSelected = selectedVariantIndex === c.index;
                    const isWhite = c.hex === '#FFFFFF' || c.hex?.toLowerCase() === '#fff';
                    return (
                      <button
                        key={c.sku || c.index}
                        onClick={() => handleSelectColor(c.index)}
                        className={`relative w-7 h-7 sm:w-9 sm:h-9 rounded-full transition-all flex items-center justify-center border ${
                          isSelected
                            ? 'ring-2 ring-offset-2 ring-slate-900 scale-110 shadow-sm border-white'
                            : 'hover:scale-105 border-gray-300'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={`${c.name} (৳${c.price > 0 ? c.price : currentPrice})`}
                        aria-label={`Select color ${c.name}`}
                      >
                        {isSelected && (
                          <Check
                            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWhite ? 'text-black' : 'text-white'}`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector & 3 Horizontal Trust Badges */}
            <div className="space-y-3 sm:space-y-4 pt-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                {/* Quantity */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700">QUANTITY</span>
                  <div className="flex items-center border border-gray-300 rounded-xl bg-white h-10 sm:h-11 w-28 sm:w-32 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={isOutOfStock}
                      className="px-2.5 sm:px-3 h-full hover:bg-gray-100 text-gray-600 transition flex items-center justify-center min-w-[36px]"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="flex-1 text-center text-xs sm:text-sm font-bold text-gray-900">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(selectedVariant.stock || 99, quantity + 1))}
                      disabled={isOutOfStock}
                      className="px-2.5 sm:px-3 h-full hover:bg-gray-100 text-gray-600 transition flex items-center justify-center min-w-[36px]"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 3 Horizontal Trust Badges */}
                <div className="flex-1 bg-gray-50/90 rounded-2xl border border-gray-200/80 p-2 sm:p-3 grid grid-cols-3 gap-1.5 sm:gap-2 text-center text-[10px] sm:text-[11px] text-gray-700">
                  <div className="flex flex-col items-center justify-center border-r border-gray-200/80 pr-1">
                    <RotateCcw className="w-3.5 h-3.5 text-gray-600 mb-0.5" />
                    <span className="font-bold">Easy Return</span>
                    <span className="text-[9px] text-gray-400">7 Days Return</span>
                  </div>
                  <div className="flex flex-col items-center justify-center border-r border-gray-200/80 px-1">
                    <Truck className="w-3.5 h-3.5 text-gray-600 mb-0.5" />
                    <span className="font-bold">Cash on Delivery</span>
                    <span className="text-[9px] text-gray-400">Available</span>
                  </div>
                  <div className="flex flex-col items-center justify-center pl-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-gray-600 mb-0.5" />
                    <span className="font-bold">Secure Payment</span>
                    <span className="text-[9px] text-gray-400">100% Secure</span>
                  </div>
                </div>
              </div>

              {/* Desktop/Tablet In-Page Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-2 transition-all shadow-xs min-h-[46px] ${
                    added
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : isOutOfStock
                      ? 'bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white border-[#556B2F] text-[#4A5D23] hover:bg-[#4A5D23] hover:text-white'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" /> ADD TO CART
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md min-h-[46px] ${
                    isOutOfStock
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#556B2F] hover:bg-[#435524] text-white hover:shadow-lg'
                  }`}
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>BUY NOW</span>
                </button>
              </div>
            </div>

            {/* Description & Artisan Notes */}
            {product.description && (
              <div className="space-y-2 pt-3 border-t border-gray-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  Description & Artisan Details
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Bottom Dark Luxury Trust Banner */}
        <div className="bg-slate-950 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-800 shadow-xl grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 text-center">
          <div className="space-y-1.5 flex flex-col items-center">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#C5A059]" />
            <h5 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-200">Trusted by</h5>
            <p className="text-[10px] sm:text-[11px] text-gray-400">10,000+ Customers</p>
          </div>

          <div className="space-y-1.5 flex flex-col items-center">
            <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-[#C5A059]" />
            <h5 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-200">Fast Delivery</h5>
            <p className="text-[10px] sm:text-[11px] text-gray-400">All Over Bangladesh</p>
          </div>

          <div className="space-y-1.5 flex flex-col items-center">
            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-[#C5A059]" />
            <h5 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-200">Premium Quality</h5>
            <p className="text-[10px] sm:text-[11px] text-gray-400">You Can Trust</p>
          </div>

          <div className="space-y-1.5 flex flex-col items-center">
            <Headphones className="w-5 h-5 sm:w-6 sm:h-6 text-[#C5A059]" />
            <h5 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-200">Customer Support</h5>
            <p className="text-[10px] sm:text-[11px] text-gray-400">Always Here For You</p>
          </div>
        </div>
      </main>

      {/* 4. Sticky Mobile Bottom Action Bar (Mobile Only: < md) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-3 sm:px-4 py-2.5 pb-[calc(0.65rem+env(safe-area-inset-bottom))] shadow-2xl flex items-center gap-2.5">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`flex-1 py-3 px-2 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-2 transition min-h-[44px] ${
            added
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : isOutOfStock
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              : 'bg-white border-[#556B2F] text-[#4A5D23] active:bg-[#4A5D23] active:text-white'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>{added ? 'Added' : 'Add to Cart'}</span>
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          className={`flex-1 py-3 px-2 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-md min-h-[44px] ${
            isOutOfStock
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-[#556B2F] active:bg-[#435524] text-white shadow'
          }`}
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Buy Now (৳{currentPrice.toLocaleString()})</span>
        </button>
      </div>

      {/* 5. Fullscreen Luxury Zoom Lightbox Modal */}
      {isZoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-6 animate-fadeIn"
          onClick={() => setIsZoomOpen(false)}
        >
          {/* Top Control Bar */}
          <div className="w-full max-w-6xl flex items-center justify-between text-white z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-serif-luxury text-[#E6CA85] truncate max-w-[200px]">
                {product.name}
              </span>
              <span className="text-xs text-gray-400">
                ({selectedImageIndex + 1} / {images.length})
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="p-2 sm:p-2.5 bg-white/10 hover:bg-white/25 text-white rounded-full transition shadow-md min-w-[40px] min-h-[40px] flex items-center justify-center"
              title="Close Zoom (ESC)"
              aria-label="Close Lightbox"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Center Image Display with Prev/Next Controls */}
          <div
            className="relative flex-1 w-full max-w-5xl flex items-center justify-center p-2"
            onClick={(e) => e.stopPropagation()}
          >
            {images.length > 1 && (
              <button
                type="button"
                onClick={handlePrevThumbnail}
                className="absolute left-1 sm:left-4 p-2.5 sm:p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition border border-white/20 z-10 min-w-[44px] min-h-[44px] flex items-center justify-center"
                title="Previous Image (Left Arrow)"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}

            <div className="max-h-[70vh] sm:max-h-[75vh] max-w-full overflow-hidden rounded-2xl flex items-center justify-center">
              <img
                src={images[selectedImageIndex] || images[0]}
                alt={product.name}
                className="max-h-[70vh] sm:max-h-[75vh] w-auto object-contain select-none shadow-2xl image-crossfade"
              />
            </div>

            {images.length > 1 && (
              <button
                type="button"
                onClick={handleNextThumbnail}
                className="absolute right-1 sm:right-4 p-2.5 sm:p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition border border-white/20 z-10 min-w-[44px] min-h-[44px] flex items-center justify-center"
                title="Next Image (Right Arrow)"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip Inside Lightbox */}
          {images.length > 1 && (
            <div
              className="w-full max-w-3xl flex items-center justify-center gap-2 overflow-x-auto scrollbar-none py-2 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img: string, idx: number) => {
                const isSelected = selectedImageIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-12 h-14 sm:w-16 sm:h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      isSelected
                        ? 'border-[#C5A059] scale-110 shadow-lg'
                        : 'border-white/30 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
