'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '../../../context/cart-context';
import { API_BASE_URL } from '../../../utils/api-config';
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

  // Match icon from explicit name or fallback based on position/theme
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

  // Fallback pattern matching 5 reference slots if icon string isn't specified
  switch (index % 5) {
    case 0:
      return <Feather className="w-4 h-4 text-gray-700" />; // Soft & Comfortable
    case 1:
      return <Layers className="w-4 h-4 text-gray-700" />;  // Premium Fabric
    case 2:
      return <Wind className="w-4 h-4 text-gray-700" />;    // Lightweight & Breathable
    case 3:
      return <Waves className="w-4 h-4 text-gray-700" />;   // Elegant Drape
    case 4:
    default:
      return <CheckCircle2 className="w-4 h-4 text-gray-700" />; // Easy to Style
  }
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { addItem, clearCart, setIsCartOpen, totalItems } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

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

  const images = useMemo(() => {
    if (product?.images && product.images.length > 0) {
      return product.images;
    }
    return ['https://images.unsplash.com/photo-1611591475152-478311399767?auto=format&fit=crop&w=1000&q=85'];
  }, [product]);

  const selectedVariant = product?.variants?.[selectedVariantIndex] || {
    sku: `SKU-${product?.slug || 'AVE'}`,
    color: 'Olive',
    size: 'Standard',
    price: product?.salePrice || product?.originalPrice || 0,
    stockQuantity: 10,
    stock: 10,
  };

  const currentPrice = selectedVariant.price || product?.salePrice || product?.originalPrice || 0;
  const originalPrice = product?.originalPrice || currentPrice;
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

  const handleSelectColor = (index: number) => {
    setSelectedVariantIndex(index);
    const variant = product?.variants?.[index];
    if (variant?.image) {
      const imgIdx = images.findIndex((img: string) => img === variant.image);
      if (imgIdx !== -1) {
        setSelectedImageIndex(imgIdx);
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
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    if (thumbnailContainerRef.current) {
      thumbnailContainerRef.current.scrollBy({ left: -80, behavior: 'smooth' });
    }
  };

  const handleNextThumbnail = () => {
    setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    if (thumbnailContainerRef.current) {
      thumbnailContainerRef.current.scrollBy({ left: 80, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 animate-pulse space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
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
    <div className="bg-white min-h-screen pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      {/* 1. Elegant Breadcrumb & Quick Back Navigation Bar */}
      <div className="border-b border-gray-100 bg-[#FAFAF8]/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between text-xs">
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
                  className="hover:text-[#C5A059] transition text-gray-700 font-semibold"
                >
                  {product.categoryId.name}
                </Link>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="text-[#997B21] font-bold truncate max-w-[200px]">
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-gray-100 text-gray-700 font-semibold border border-gray-200 shadow-2xs transition flex-shrink-0 ml-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to</span>
            <span>{product.categoryId?.name || 'Catalog'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Product Showcase Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ========================================================================= */}
          {/* LEFT COLUMN: Main Gallery Image + Thumbnail Carousel                      */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 space-y-4">
            {/* Primary Main Image Frame */}
            <div className="relative aspect-[4/5] max-h-[620px] rounded-3xl overflow-hidden bg-gray-50 border border-gray-200/90 shadow-md group">
              <img
                src={images[selectedImageIndex] || images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Top-Left: BEST SELLER Badge */}
              {badgeText && (
                <div className="absolute top-4 left-4 bg-[#4A5D23] text-[#F4F1EA] text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg shadow-md border border-[#607930]">
                  {badgeText}
                </div>
              )}

              {/* Bottom-Right: Magnifier Zoom Button */}
              <button
                onClick={() => setIsZoomOpen(true)}
                className="absolute bottom-4 right-4 p-2.5 rounded-full bg-white/95 hover:bg-white text-slate-900 shadow-md border border-gray-200 transition-transform active:scale-95"
                title="Zoom image"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnail Slider Strip (Matches Image 5 with < and > arrows) */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handlePrevThumbnail}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-700 transition flex-shrink-0 border border-gray-200"
                  title="Previous image"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div
                  ref={thumbnailContainerRef}
                  className="flex items-center gap-2.5 overflow-x-auto scrollbar-none py-1 flex-1 scroll-smooth"
                >
                  {images.map((img: string, idx: number) => {
                    const isSelected = selectedImageIndex === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                          isSelected
                            ? 'border-slate-900 ring-2 ring-slate-900/20 shadow-md scale-105'
                            : 'border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleNextThumbnail}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-700 transition flex-shrink-0 border border-gray-200"
                  title="Next image"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: Title, Reviews, Price, Dynamic 5 Features with Icons       */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 space-y-5 sm:space-y-6">
            {/* Header Details */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif-luxury text-gray-900 leading-tight">
                {product.name}
              </h1>

              {/* Subtitle / Color */}
              <p className="text-base sm:text-lg font-medium text-gray-600">
                {selectedColorName}
              </p>

              {/* Star Rating & Reviews */}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current text-amber-500" />
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-800">{ratingValue}</span>
                <span className="text-xs text-gray-500">({reviewsCount} Reviews)</span>
              </div>
            </div>

            {/* Price & Promo */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-bold font-serif-luxury text-gray-900">
                  ৳{currentPrice.toLocaleString()}
                </span>
                {originalPrice > currentPrice && (
                  <span className="text-lg sm:text-xl text-gray-400 line-through">
                    ৳{originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Free Delivery Promo Bar */}
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200/80 w-fit">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
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

            {/* Dynamic 5 Feature Points with Distinct Icons (Matches Image 5) */}
            <div className="space-y-4 py-1">
              {featuresList.map((feature: any, index: number) => (
                <div key={index} className="flex items-start gap-3.5">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100/90 border border-gray-200/90 flex items-center justify-center text-gray-700 flex-shrink-0 mt-0.5 shadow-2xs">
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
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-900 block">
                  COLOR:{' '}
                  <span className="font-semibold text-gray-600 font-sans uppercase">
                    {selectedVariant.color || 'Standard'}
                  </span>
                </label>

                <div className="flex flex-wrap items-center gap-2.5">
                  {colorVariants.map((c: any) => {
                    const isSelected = selectedVariantIndex === c.index;
                    const isWhite = c.hex === '#FFFFFF' || c.hex?.toLowerCase() === '#fff';
                    return (
                      <button
                        key={c.sku || c.index}
                        onClick={() => handleSelectColor(c.index)}
                        className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-full transition-all flex items-center justify-center border ${
                          isSelected
                            ? 'ring-2 ring-offset-2 ring-slate-900 scale-110 shadow-sm border-white'
                            : 'hover:scale-105 border-gray-300'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={`${c.name} (৳${c.price})`}
                      >
                        {isSelected && (
                          <Check
                            className={`w-4 h-4 ${isWhite ? 'text-black' : 'text-white'}`}
                          />
                        )}
                      </button>
                    );
                  })}
                  {colorVariants.length > 8 && (
                    <span className="text-xs text-gray-500 font-semibold pl-1">
                      + More
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Quantity Selector & 3 Horizontal Trust Badges */}
            <div className="space-y-4 pt-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Quantity */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700">QUANTITY</span>
                  <div className="flex items-center border border-gray-300 rounded-xl bg-white h-11 w-32 shadow-2xs">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={isOutOfStock}
                      className="px-3 h-full hover:bg-gray-100 text-gray-600 transition flex items-center justify-center"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="flex-1 text-center text-sm font-bold text-gray-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(selectedVariant.stock || 99, quantity + 1))}
                      disabled={isOutOfStock}
                      className="px-3 h-full hover:bg-gray-100 text-gray-600 transition flex items-center justify-center"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 3 Horizontal Trust Badges */}
                <div className="flex-1 bg-gray-50/90 rounded-2xl border border-gray-200/80 p-2.5 sm:p-3 grid grid-cols-3 gap-2 text-center text-[10px] sm:text-[11px] text-gray-700">
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

              {/* Action Buttons: ADD TO CART and BUY NOW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`w-full py-3.5 sm:py-4 px-6 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-2 transition-all shadow-xs ${
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
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`w-full py-3.5 sm:py-4 px-6 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md ${
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
          </div>
        </div>

        {/* 3. Bottom Dark Luxury Trust Banner (Matches Image 5) */}
        <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-gray-800 shadow-xl grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="space-y-1.5 flex flex-col items-center">
            <Users className="w-6 h-6 text-[#C5A059]" />
            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-200">Trusted by</h5>
            <p className="text-[11px] text-gray-400">10,000+ Customers</p>
          </div>

          <div className="space-y-1.5 flex flex-col items-center">
            <Truck className="w-6 h-6 text-[#C5A059]" />
            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-200">Fast Delivery</h5>
            <p className="text-[11px] text-gray-400">All Over Bangladesh</p>
          </div>

          <div className="space-y-1.5 flex flex-col items-center">
            <Award className="w-6 h-6 text-[#C5A059]" />
            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-200">Premium Quality</h5>
            <p className="text-[11px] text-gray-400">You Can Trust</p>
          </div>

          <div className="space-y-1.5 flex flex-col items-center">
            <Headphones className="w-6 h-6 text-[#C5A059]" />
            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-200">Customer Support</h5>
            <p className="text-[11px] text-gray-400">Always Here For You</p>
          </div>
        </div>
      </main>

      {/* 4. Fullscreen Zoom Modal */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
            title="Close Zoom"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl">
            <img
              src={images[selectedImageIndex] || images[0]}
              alt={product.name}
              className="w-full h-full object-contain max-h-[85vh]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
